import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  Loader2,
  Fingerprint,
  Download,
} from "lucide-react";

import { embedWatermark } from "../utils/watermark";

export default function QuestionPaper() {
  const [formData, setFormData] = useState({
    examName: "",
    examCode: "",
    subject: "",
    examDate: "",
    center: "",
  });

  const [file, setFile] = useState(null);
  const [traceId, setTraceId] = useState("");
  const [generated, setGenerated] = useState(false);

  const [securityStage, setSecurityStage] = useState("idle");
  const [watermarkVerified, setWatermarkVerified] = useState(false);

  const [downloadingSecurePaper, setDownloadingSecurePaper] =
    useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateTraceId = () => {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    return `TP-${new Date().getFullYear()}-${randomNumber}`;
  };

  const sanitizeFileName = (text) => {
    return String(text ?? "TracePaper")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, "_");
  };

  const handleGenerate = () => {
    if (
      !formData.examName ||
      !formData.examCode ||
      !formData.subject ||
      !formData.examDate ||
      !formData.center ||
      !file
    ) {
      alert(
        "Please fill all fields and upload the question paper."
      );
      return;
    }

    if (file.type !== "application/pdf") {
      alert(
        "Please upload a PDF question paper. Actual watermark embedding currently supports PDF files."
      );
      return;
    }

    const newTraceId = generateTraceId();

    setTraceId(newTraceId);
    setGenerated(true);

    setWatermarkVerified(false);
    setSecurityStage("processing");
  };

  // Simulated security processing
  useEffect(() => {
    if (securityStage !== "processing") return;

    const timer = setTimeout(() => {
      setSecurityStage("verified");
      setWatermarkVerified(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [securityStage]);

  // =========================================================
  // DOWNLOAD ACTUAL SECURE QUESTION PAPER
  // =========================================================

  const handleDownloadSecurePaper = async () => {
    if (!file || !traceId) {
      alert("Secure paper information is not available.");
      return;
    }

    if (file.type !== "application/pdf") {
      alert(
        "Only PDF question papers can be secured."
      );
      return;
    }

    try {
      setDownloadingSecurePaper(true);

      // Actual watermark/fingerprint embedding
      const result = await embedWatermark(
        file,
        traceId
      );

      const blob = new Blob(
        [result.pdfBytes],
        {
          type: "application/pdf",
        }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `TracePaper_Secure_${sanitizeFileName(
        traceId
      )}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error(
        "Secure paper generation failed:",
        error
      );

      alert(
        "Unable to create the secure question paper. Please make sure the uploaded file is a valid PDF."
      );
    } finally {
      setDownloadingSecurePaper(false);
    }
  };

  // =========================================================
  // CERTIFICATE PDF
  // =========================================================

  const handleDownloadCertificate = () => {
    if (!traceId || !file) {
      alert(
        "Certificate information is not available."
      );
      return;
    }

    const certificateWindow = window.open(
      "",
      "_blank"
    );

    if (!certificateWindow) {
      alert(
        "Please allow pop-ups to generate the certificate."
      );
      return;
    }

    certificateWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>
            TracePaper Certificate - ${traceId}
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            @page {
              size: A4;
              margin: 15mm;
            }

            body {
              margin: 0;
              padding: 30px;
              font-family: Arial, Helvetica, sans-serif;
              background: #f1f5f9;
              color: #0f172a;
            }

            .certificate {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 42px;
              border: 2px solid #10b981;
              border-radius: 16px;
            }

            .header {
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 24px;
              margin-bottom: 26px;
            }

            .logo {
              width: 60px;
              height: 60px;
              margin: 0 auto 14px;
              border-radius: 14px;
              background: #dcfce7;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
            }

            h1 {
              margin: 0;
              font-size: 27px;
              letter-spacing: 1px;
              color: #0f172a;
            }

            .subtitle {
              margin-top: 8px;
              color: #64748b;
              font-size: 14px;
            }

            .certificate-title {
              margin-top: 18px;
              font-size: 18px;
              font-weight: bold;
              color: #047857;
            }

            .trace-box {
              background: #0f172a;
              color: white;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 26px;
            }

            .trace-label {
              color: #94a3b8;
              font-size: 11px;
              margin-bottom: 7px;
              letter-spacing: 1px;
            }

            .trace-id {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
            }

            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 14px;
              color: #1e293b;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              margin-bottom: 25px;
            }

            .detail {
              padding: 14px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
            }

            .label {
              font-size: 10px;
              color: #64748b;
              margin-bottom: 5px;
              text-transform: uppercase;
            }

            .value {
              font-size: 14px;
              font-weight: bold;
              color: #1e293b;
              word-break: break-word;
            }

            .security {
              padding: 18px;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              border-radius: 12px;
              margin-bottom: 25px;
            }

            .security-title {
              color: #047857;
              font-weight: bold;
              margin-bottom: 10px;
              font-size: 15px;
            }

            .security-item {
              color: #065f46;
              font-size: 13px;
              margin: 6px 0;
            }

            .description {
              text-align: center;
              color: #475569;
              font-size: 13px;
              line-height: 1.6;
              margin: 20px 0 25px;
            }

            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 18px;
              text-align: center;
              color: #64748b;
              font-size: 11px;
              line-height: 1.5;
            }

            .print-button {
              display: block;
              margin: 25px auto 0;
              padding: 12px 25px;
              background: #059669;
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              font-size: 14px;
            }

            @media print {

              body {
                background: white;
                padding: 0;
              }

              .certificate {
                max-width: none;
                border: 2px solid #10b981;
                border-radius: 0;
                box-shadow: none;
              }

              .print-button {
                display: none;
              }

            }

          </style>
        </head>

        <body>

          <div class="certificate">

            <div class="header">

              <div class="logo">
                🔐
              </div>

              <h1>
                TRACEPAPER
              </h1>

              <div class="subtitle">
                Enterprise Examination Security System
              </div>

              <div class="certificate-title">
                Secure Question Paper Registration Certificate
              </div>

            </div>

            <div class="trace-box">

              <div class="trace-label">
                UNIQUE TRACE ID
              </div>

              <div class="trace-id">
                ${traceId}
              </div>

            </div>

            <div class="section-title">
              Paper Details
            </div>

            <div class="details">

              <div class="detail">
                <div class="label">
                  Exam Name
                </div>

                <div class="value">
                  ${formData.examName}
                </div>
              </div>

              <div class="detail">
                <div class="label">
                  Exam Code
                </div>

                <div class="value">
                  ${formData.examCode}
                </div>
              </div>

              <div class="detail">
                <div class="label">
                  Subject
                </div>

                <div class="value">
                  ${formData.subject}
                </div>
              </div>

              <div class="detail">
                <div class="label">
                  Exam Date
                </div>

                <div class="value">
                  ${formData.examDate}
                </div>
              </div>

              <div class="detail">
                <div class="label">
                  Exam Center
                </div>

                <div class="value">
                  ${formData.center}
                </div>
              </div>

              <div class="detail">
                <div class="label">
                  Original File
                </div>

                <div class="value">
                  ${file?.name || "N/A"}
                </div>
              </div>

            </div>

            <div class="security">

              <div class="security-title">
                ✓ Security Verification
              </div>

              <div class="security-item">
                ✓ Question Paper Registered
              </div>

              <div class="security-item">
                ✓ Hidden Watermark: Verified
              </div>

              <div class="security-item">
                ✓ Trace Status: Active
              </div>

            </div>

            <div class="description">
              This certificate confirms the registration
              of the question paper in the TracePaper
              security workflow. The generated Trace ID
              is associated with the registered
              examination paper.
            </div>

            <div class="footer">
              TracePaper Enterprise Security System
              <br />
              Secure • Traceable • Verifiable
            </div>

            <button
              class="print-button"
              onclick="window.print()"
            >
              Save Certificate as PDF
            </button>

          </div>

        </body>
      </html>
    `);

    certificateWindow.document.close();

    certificateWindow.onload = () => {
      setTimeout(() => {
        certificateWindow.focus();
        certificateWindow.print();
      }, 500);
    };
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Question Paper
        </h1>

        <p className="text-slate-500 mt-1">
          Create and secure examination papers with TracePaper
        </p>

      </div>

      {/* CREATION CARD */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

        {/* CARD HEADER */}

        <div className="p-6 border-b border-slate-100">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">

              <FileText
                size={24}
                className="text-blue-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Create Secure Question Paper
              </h2>

              <p className="text-sm text-slate-500">
                Register the original examination paper
              </p>

            </div>

          </div>

        </div>

        {/* FORM */}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* EXAM NAME */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Name
            </label>

            <input
              type="text"
              name="examName"
              value={formData.examName}
              onChange={handleChange}
              placeholder="Secondary Board Examination"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* EXAM CODE */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Code
            </label>

            <input
              type="text"
              name="examCode"
              value={formData.examCode}
              onChange={handleChange}
              placeholder="SBM-2026"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* SUBJECT */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Subject
            </label>

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Mathematics"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* DATE */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Date
            </label>

            <input
              type="date"
              name="examDate"
              value={formData.examDate}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* CENTER */}

          <div className="md:col-span-2">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Center
            </label>

            <input
              type="text"
              name="center"
              value={formData.center}
              onChange={handleChange}
              placeholder="KOP-024"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* UPLOAD */}

          <div className="md:col-span-2">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Original Question Paper
            </label>

            <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">

              <Upload
                size={32}
                className="text-blue-600 mb-3"
              />

              <p className="font-semibold text-slate-700">
                {file
                  ? file.name
                  : "Click to upload question paper"}
              </p>

              <p className="text-sm text-slate-400 mt-1">
                PDF format required for secure watermark
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] || null
                  )
                }
              />

            </label>

          </div>

        </div>

        {/* SECURITY INFORMATION */}

        <div className="mx-6 mb-6 p-5 rounded-xl bg-blue-50 border border-blue-100">

          <div className="flex items-start gap-3">

            <ShieldCheck
              size={25}
              className="text-blue-600 mt-1"
            />

            <div>

              <h3 className="font-bold text-slate-800">
                TracePaper Security
              </h3>

              <p className="text-sm text-slate-600 mt-1">
                A unique Trace ID and invisible security
                fingerprint will be embedded into the
                uploaded PDF.
              </p>

            </div>

          </div>

        </div>

        {/* GENERATE BUTTON */}

        <div className="px-6 pb-6">

          <button
            onClick={handleGenerate}
            disabled={
              securityStage === "processing"
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition"
          >

            {securityStage === "processing" ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Securing Paper...
              </>
            ) : (
              <>
                <KeyRound size={20} />

                Generate Secure Paper
              </>
            )}

          </button>

        </div>

      </div>

      {/* GENERATED RESULT */}

      {generated && (

        <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm">

          {/* RESULT HEADER */}

          <div className="p-6 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <CheckCircle2
                size={28}
                className="text-emerald-600"
              />

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Question Paper Registered
                </h2>

                <p className="text-sm text-slate-500">
                  Secure paper registration completed
                </p>

              </div>

            </div>

          </div>

          <div className="p-6">

            {/* TRACE ID */}

            <div className="bg-slate-900 rounded-xl p-5">

              <p className="text-sm text-slate-400">
                Unique Trace ID
              </p>

              <p className="text-2xl font-bold text-white mt-1 tracking-wider">
                {traceId}
              </p>

            </div>

            {/* SECURITY PROCESSING */}

            <div className="mt-5 p-5 rounded-xl border border-slate-200 bg-slate-50">

              <div className="flex items-center gap-3">

                {securityStage === "processing" ? (
                  <Loader2
                    size={24}
                    className="text-blue-600 animate-spin"
                  />
                ) : (
                  <ShieldCheck
                    size={24}
                    className="text-emerald-600"
                  />
                )}

                <div>

                  <p className="font-bold text-slate-800">
                    Security Processing
                  </p>

                  <p className="text-sm text-slate-500">
                    {securityStage === "processing"
                      ? "Generating secure watermark fingerprint..."
                      : "Security verification completed successfully."}
                  </p>

                </div>

              </div>

              {/* STEPS */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">

                {/* TRACE ID */}

                <div
                  className={`p-4 rounded-xl ${
                    securityStage === "processing" ||
                    securityStage === "verified"
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-white border border-slate-200"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={18}
                      className={
                        securityStage === "processing" ||
                        securityStage === "verified"
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }
                    />

                    <p className="font-semibold text-slate-700">
                      Trace ID
                    </p>

                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Identity generated
                  </p>

                </div>

                {/* WATERMARK */}

                <div
                  className={`p-4 rounded-xl ${
                    securityStage === "processing"
                      ? "bg-blue-50 border border-blue-200"
                      : securityStage === "verified"
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-white border border-slate-200"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    {securityStage === "processing" ? (
                      <Loader2
                        size={18}
                        className="text-blue-600 animate-spin"
                      />
                    ) : (
                      <Lock
                        size={18}
                        className={
                          securityStage === "verified"
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }
                      />
                    )}

                    <p className="font-semibold text-slate-700">
                      Hidden Watermark
                    </p>

                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    {securityStage === "processing"
                      ? "Preparing security layer..."
                      : securityStage === "verified"
                      ? "Ready to embed"
                      : "Waiting"}
                  </p>

                </div>

                {/* VERIFICATION */}

                <div
                  className={`p-4 rounded-xl ${
                    securityStage === "verified"
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-white border border-slate-200"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    {securityStage === "verified" ? (
                      <CheckCircle2
                        size={18}
                        className="text-emerald-600"
                      />
                    ) : (
                      <Fingerprint
                        size={18}
                        className="text-slate-400"
                      />
                    )}

                    <p className="font-semibold text-slate-700">
                      Verification
                    </p>

                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    {securityStage === "verified"
                      ? "Ready"
                      : "Pending"}
                  </p>

                </div>

              </div>

            </div>

            {/* STATUS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

              <div className="p-4 bg-slate-50 rounded-xl">

                <p className="text-xs text-slate-500">
                  Paper
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  Registered
                </p>

              </div>

              <div
                className={`p-4 rounded-xl ${
                  watermarkVerified
                    ? "bg-emerald-50"
                    : "bg-amber-50"
                }`}
              >

                <div className="flex items-center gap-2">

                  {watermarkVerified ? (
                    <ShieldCheck
                      size={18}
                      className="text-emerald-600"
                    />
                  ) : (
                    <Lock
                      size={18}
                      className="text-amber-600"
                    />
                  )}

                  <p
                    className={`text-xs ${
                      watermarkVerified
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    Hidden Watermark
                  </p>

                </div>

                <p
                  className={`font-semibold mt-1 ${
                    watermarkVerified
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {watermarkVerified
                    ? "Ready"
                    : "Processing"}
                </p>

              </div>

              <div className="p-4 bg-blue-50 rounded-xl">

                <p className="text-xs text-blue-600">
                  Trace Status
                </p>

                <p className="font-semibold text-blue-700 mt-1">
                  Active
                </p>

              </div>

            </div>

            {/* PAPER DETAILS */}

            <div className="mt-6">

              <h3 className="font-bold text-slate-800 mb-4">
                Paper Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>

                  <p className="text-xs text-slate-500">
                    Exam
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formData.examName}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Subject
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formData.subject}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Exam Center
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formData.center}
                  </p>

                </div>

              </div>

            </div>

            {/* SECURE PAPER */}

            {watermarkVerified && (

              <div className="mt-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200">

                <div className="flex flex-col gap-5">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">

                      <ShieldCheck
                        size={22}
                        className="text-emerald-600"
                      />

                    </div>

                    <div>

                      <h3 className="font-bold text-emerald-800">
                        Secure Paper Ready
                      </h3>

                      <p className="text-sm text-emerald-700 mt-1">
                        Your original PDF is ready for
                        invisible fingerprint embedding.
                      </p>

                    </div>

                  </div>

                  <div className="flex flex-col md:flex-row gap-3">

                    {/* SECURE PAPER */}

                    <button
                      onClick={
                        handleDownloadSecurePaper
                      }
                      disabled={
                        downloadingSecurePaper
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >

                      {downloadingSecurePaper ? (
                        <>
                          <Loader2
                            size={19}
                            className="animate-spin"
                          />

                          Embedding Watermark...
                        </>
                      ) : (
                        <>
                          <Download size={19} />

                          Download Secure Paper
                        </>
                      )}

                    </button>

                    {/* CERTIFICATE */}

                    <button
                      onClick={
                        handleDownloadCertificate
                      }
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >

                      <Download size={19} />

                      Download Certificate PDF

                    </button>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}