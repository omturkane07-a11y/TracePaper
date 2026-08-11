import { PDFDocument } from "pdf-lib";

const WATERMARK_KEY = "TracePaper-Watermark";
const WATERMARK_VERSION = "1.0";

export async function embedWatermark(file, traceId) {
  if (!file) {
    throw new Error("No PDF file selected.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Please upload a PDF question paper.");
  }

  const arrayBuffer = await file.arrayBuffer();

  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Invisible TracePaper fingerprint
  const fingerprint = `${traceId}|${crypto.randomUUID()}`;

  pdfDoc.setTitle(`TracePaper Secure Paper - ${traceId}`);
  pdfDoc.setSubject(WATERMARK_KEY);
  pdfDoc.setKeywords([
    WATERMARK_KEY,
    WATERMARK_VERSION,
    traceId,
    fingerprint,
  ]);
  pdfDoc.setProducer("TracePaper Enterprise Security System");

  const pdfBytes = await pdfDoc.save();

  return {
    pdfBytes,
    traceId,
    fingerprint,
  };
}

export async function verifyWatermark(file) {
  if (!file) {
    throw new Error("Please upload a PDF.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported.");
  }

  const arrayBuffer = await file.arrayBuffer();

  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const title = pdfDoc.getTitle() || "";
  const subject = pdfDoc.getSubject() || "";
  const keywords = pdfDoc.getKeywords() || "";

  const keywordList = keywords
    .split(",")
    .map((item) => item.trim());

  const isTracePaper =
    subject === WATERMARK_KEY &&
    keywordList.includes(WATERMARK_KEY);

  let traceId = null;
  let fingerprint = null;

  if (isTracePaper) {
    traceId =
      keywordList.find((item) =>
        item.startsWith("TP-")
      ) || null;

    fingerprint =
      keywordList.find(
        (item) =>
          item.includes("|") &&
          item.startsWith("TP-")
      ) || null;
  }

  return {
    verified: isTracePaper && !!traceId && !!fingerprint,
    traceId,
    fingerprint,
    title,
  };
}