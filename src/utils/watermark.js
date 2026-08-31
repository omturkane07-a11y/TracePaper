import { PDFDocument } from "pdf-lib";

// ============================================================
// TRACEPAPER WATERMARK CONFIGURATION
// ============================================================

const WATERMARK_KEY = "TracePaper-Watermark";
const WATERMARK_VERSION = "1.0";

const PRODUCER = "TracePaper Enterprise Security System";
const CREATOR = "TracePaper Enterprise Security System";
const AUTHOR = "TracePaper";

// ============================================================
// CREATE UNIQUE FINGERPRINT
// ============================================================

function createFingerprint(traceId) {
  if (!traceId) {
    throw new Error("Trace ID is required.");
  }

  const uniqueId =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  return `${traceId}|${uniqueId}`;
}

// ============================================================
// EMBED WATERMARK
// ============================================================

export async function embedWatermark(file, traceId) {
  if (!file) {
    throw new Error("No PDF file selected.");
  }

  if (
    file.type !== "application/pdf" &&
    !file.name?.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error("Please upload a PDF question paper.");
  }

  if (!traceId) {
    throw new Error("Trace ID is required.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // --------------------------------------------------------
    // CREATE FINGERPRINT
    // --------------------------------------------------------

    const fingerprint = createFingerprint(traceId);

    // --------------------------------------------------------
    // TRACEPAPER METADATA
    // --------------------------------------------------------

    pdfDoc.setTitle(`TracePaper Secure Paper - ${traceId}`);

    /*
     * IMPORTANT:
     * Put all important security information inside Subject.
     * This avoids depending only on Keywords.
     */
    pdfDoc.setSubject(
      `${WATERMARK_KEY}|Version:${WATERMARK_VERSION}|TraceID:${traceId}|Fingerprint:${fingerprint}`
    );

    /*
     * Also store the same information in Keywords.
     */
    pdfDoc.setKeywords([
      WATERMARK_KEY,
      `Version:${WATERMARK_VERSION}`,
      `TraceID:${traceId}`,
      `Fingerprint:${fingerprint}`,
    ]);

    pdfDoc.setProducer(PRODUCER);
    pdfDoc.setCreator(CREATOR);
    pdfDoc.setAuthor(AUTHOR);

    pdfDoc.setModificationDate(new Date());

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
    });

    console.log("=================================");
    console.log("TRACEPAPER WATERMARK EMBEDDED");
    console.log("Trace ID:", traceId);
    console.log("Fingerprint:", fingerprint);
    console.log("Watermark Key:", WATERMARK_KEY);
    console.log("Version:", WATERMARK_VERSION);
    console.log("Producer:", PRODUCER);
    console.log("Creator:", CREATOR);
    console.log("Author:", AUTHOR);
    console.log("=================================");

    return {
      pdfBytes,
      traceId,
      fingerprint,
      watermarkKey: WATERMARK_KEY,
      watermarkVersion: WATERMARK_VERSION,
    };
  } catch (error) {
    console.error("TracePaper watermark embedding failed:", error);

    throw new Error(
      "Unable to embed TracePaper security metadata into the PDF."
    );
  }
}

// ============================================================
// VERIFY WATERMARK
// ============================================================

export async function verifyWatermark(file) {
  if (!file) {
    throw new Error("Please upload a PDF.");
  }

  if (
    file.type !== "application/pdf" &&
    !file.name?.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error("Only PDF files are supported.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // ========================================================
    // READ METADATA
    // ========================================================

    const title = pdfDoc.getTitle() || "";
    const subject = pdfDoc.getSubject() || "";
    const keywords = pdfDoc.getKeywords() || "";
    const producer = pdfDoc.getProducer() || "";
    const creator = pdfDoc.getCreator() || "";
    const author = pdfDoc.getAuthor() || "";

    console.log("=================================");
    console.log("TRACEPAPER WATERMARK VERIFICATION");
    console.log("Title:", title);
    console.log("Subject:", subject);
    console.log("Keywords:", keywords);
    console.log("Producer:", producer);
    console.log("Creator:", creator);
    console.log("Author:", author);
    console.log("=================================");

    // ========================================================
    // NORMALIZE ALL METADATA
    // ========================================================

    const metadataText = `${subject} | ${keywords}`;

    // ========================================================
    // WATERMARK KEY
    // ========================================================

    const hasWatermarkKey =
      metadataText.includes(WATERMARK_KEY);

    // ========================================================
    // TRACE ID
    // ========================================================

    let traceId = null;

    const traceMatch = metadataText.match(
      /TraceID:([^|,]+)/i
    );

    if (traceMatch) {
      traceId = traceMatch[1].trim();
    }

    // ========================================================
    // FINGERPRINT
    // ========================================================

    let fingerprint = null;

    const fingerprintMatch = metadataText.match(
      /Fingerprint:([^|,]+(?:\|[^|,]+)?)/i
    );

    if (fingerprintMatch) {
      fingerprint = fingerprintMatch[1].trim();
    }

    // ========================================================
    // VERSION
    // ========================================================

    let watermarkVersion = null;

    const versionMatch = metadataText.match(
      /Version:([^|,]+)/i
    );

    if (versionMatch) {
      watermarkVersion = versionMatch[1].trim();
    }

    // ========================================================
    // FINGERPRINT VALIDATION
    // ========================================================

    const properFingerprint =
      Boolean(fingerprint) &&
      Boolean(traceId) &&
      fingerprint.startsWith(`${traceId}|`) &&
      fingerprint.length > `${traceId}|`.length;

    // ========================================================
    // LEGACY FINGERPRINT
    // ========================================================
    // Supports PDFs created by older TracePaper versions
    // where fingerprint was equal to Trace ID.

    const legacyFingerprint =
      Boolean(fingerprint) &&
      Boolean(traceId) &&
      fingerprint === traceId;

    // ========================================================
    // FINAL FINGERPRINT VALIDATION
    // ========================================================

    const validFingerprint =
      properFingerprint || legacyFingerprint;

    // ========================================================
    // VERSION
    // ========================================================

    const validVersion =
      watermarkVersion === WATERMARK_VERSION;

    // ========================================================
    // TITLE
    // ========================================================

    const hasTracePaperTitle =
      title.startsWith("TracePaper Secure Paper -");

    // ========================================================
    // PRODUCER
    // ========================================================

    const hasTracePaperProducer =
      producer === PRODUCER;

    // ========================================================
    // CREATOR
    // ========================================================

    const hasTracePaperCreator =
      creator === CREATOR;

    // ========================================================
    // AUTHOR
    // ========================================================

    const hasTracePaperAuthor =
      author === AUTHOR;

    // ========================================================
    // FINAL VERIFICATION
    // ========================================================

    /*
     * Producer is intentionally NOT required.
     *
     * Some PDF viewers, backend processing, or PDF libraries
     * can modify the Producer field.
     */

    const verified =
      hasWatermarkKey &&
      Boolean(traceId) &&
      validFingerprint &&
      validVersion &&
      hasTracePaperTitle &&
      hasTracePaperCreator &&
      hasTracePaperAuthor;

    // ========================================================
    // DEBUG LOG
    // ========================================================

    console.log("---------------------------------");
    console.log("Watermark Key:", hasWatermarkKey);
    console.log("Trace ID:", traceId);
    console.log("Fingerprint:", fingerprint);
    console.log("Proper Fingerprint:", properFingerprint);
    console.log("Legacy Fingerprint:", legacyFingerprint);
    console.log("Valid Fingerprint:", validFingerprint);
    console.log("Version:", watermarkVersion);
    console.log("Valid Version:", validVersion);
    console.log("TracePaper Title:", hasTracePaperTitle);
    console.log("TracePaper Producer:", hasTracePaperProducer);
    console.log("TracePaper Creator:", hasTracePaperCreator);
    console.log("TracePaper Author:", hasTracePaperAuthor);
    console.log("FINAL VERIFIED:", verified);
    console.log("---------------------------------");

    // ========================================================
    // RETURN
    // ========================================================

    return {
      verified,

      traceId: verified ? traceId : null,

      fingerprint: verified ? fingerprint : null,

      title,
      subject,
      producer,
      creator,
      author,

      watermarkVersion,

      watermarkKey: verified
        ? WATERMARK_KEY
        : null,

      keywords,

      checks: {
        watermarkKey: hasWatermarkKey,
        traceId: Boolean(traceId),
        fingerprint: validFingerprint,
        properFingerprint,
        legacyFingerprint,
        version: validVersion,
        title: hasTracePaperTitle,
        producer: hasTracePaperProducer,
        creator: hasTracePaperCreator,
        author: hasTracePaperAuthor,
      },
    };
  } catch (error) {
    console.error(
      "TracePaper watermark verification failed:",
      error
    );

    throw new Error(
      "Unable to verify the TracePaper watermark."
    );
  }
}

// ============================================================
// CHECK TRACEPAPER PDF
// ============================================================

export async function isTracePaperPDF(file) {
  try {
    const result = await verifyWatermark(file);

    return result.verified;
  } catch (error) {
    console.error(
      "TracePaper PDF check failed:",
      error
    );

    return false;
  }
}