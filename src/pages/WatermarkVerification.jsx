import { useState } from "react";
import {
  Upload,
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  Loader2,
} from "lucide-react";

import { verifyWatermark } from "../utils/watermark";

export default function WatermarkVerification() {
  const [file, setFile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!file) {
      alert("Please upload a PDF.");
      return;
    }

    try {
      setChecking(true);
      setResult(null);

      const verification = await verifyWatermark(file);

      setResult(verification);
    } catch (error) {
      console.error(error);

      setResult({
        verified: false,
        error: "Unable to read this PDF.",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Watermark Verification
        </h1>

        <p className="text-slate-500 mt-1">
          Verify whether a question paper contains a TracePaper
          security fingerprint.
        </p>
      </div>

      {/* UPLOAD CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

        <div className="p-6 border-b border-slate-100">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShieldCheck
                size={24}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Verify Secure Question Paper
              </h2>

              <p className="text-sm text-slate-500">
                Upload a downloaded TracePaper PDF
              </p>
            </div>

          </div>

        </div>

        <div className="p-6">

          {/* UPLOAD */}
          <label className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">

            <Upload
              size={36}
              className="text-blue-600 mb-3"
            />

            <p className="font-semibold text-slate-700">
              {file
                ? file.name
                : "Click to upload secure question paper"}
            </p>

            <p className="text-sm text-slate-400 mt-1">
              PDF files only
            </p>

            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setResult(null);
              }}
            />

          </label>

          {/* VERIFY BUTTON */}
          <button
            onClick={handleVerify}
            disabled={!file || checking}
            className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition"
          >

            {checking ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Verifying Watermark...
              </>
            ) : (
              <>
                <FileCheck2 size={20} />

                Verify Watermark
              </>
            )}

          </button>

          {/* RESULT */}
          {result && (
            <div className="mt-6">

              {result.verified ? (

                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">

                  <div className="flex items-center gap-3">

                    <ShieldCheck
                      size={30}
                      className="text-emerald-600"
                    />

                    <div>
                      <h3 className="text-xl font-bold text-emerald-800">
                        Watermark Verified
                      </h3>

                      <p className="text-sm text-emerald-700">
                        TracePaper security fingerprint detected.
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="bg-white rounded-xl p-4 border border-emerald-200">

                      <p className="text-xs text-slate-500">
                        Trace ID
                      </p>

                      <p className="font-bold text-slate-800 mt-1 break-all">
                        {result.traceId}
                      </p>

                    </div>

                    <div className="bg-white rounded-xl p-4 border border-emerald-200">

                      <p className="text-xs text-slate-500">
                        Security Status
                      </p>

                      <p className="font-bold text-emerald-700 mt-1">
                        VERIFIED
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-200">

                    <p className="text-xs text-slate-500">
                      Fingerprint
                    </p>

                    <p className="text-xs font-mono text-slate-700 mt-2 break-all">
                      {result.fingerprint}
                    </p>

                  </div>

                </div>

              ) : (

                <div className="p-6 rounded-2xl bg-red-50 border border-red-200">

                  <div className="flex items-center gap-3">

                    <ShieldAlert
                      size={30}
                      className="text-red-600"
                    />

                    <div>
                      <h3 className="text-xl font-bold text-red-800">
                        Watermark Not Detected
                      </h3>

                      <p className="text-sm text-red-700">
                        This PDF does not contain a valid TracePaper
                        security fingerprint.
                      </p>
                    </div>

                  </div>

                  {result.error && (
                    <p className="text-sm text-red-700 mt-4">
                      {result.error}
                    </p>
                  )}

                </div>

              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}