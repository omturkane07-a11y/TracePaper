import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Upload,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowRight,
} from "lucide-react";

export default function LeakDetection() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [examName, setExamName] = useState("");
  const [caseId, setCaseId] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisComplete(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file || !examName || !caseId) {
      alert("Please complete all fields and upload the exam paper.");
      return;
    }

    setAnalyzing(true);
    setAnalysisComplete(false);

    // Temporary frontend simulation.
    // Later this will be replaced with the real backend/AI analysis.
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisComplete(true);
    }, 1500);
  };

  const handleCreateInvestigation = () => {
    if (!caseId) {
      alert("Case ID is required.");
      return;
    }

    navigate(`/investigations/${caseId}`);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Leak Detection
        </h1>

        <p className="text-lg text-slate-500 mt-2">
          Detect suspicious exam-paper exposure using document analysis
          and security indicators
        </p>
      </div>

      {/* UPLOAD CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Upload Exam Paper
          </h2>

          <p className="text-slate-500 mt-1">
            Upload an exam paper for leak detection and authenticity analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Exam Name
              </label>

              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Enter exam name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Case ID
              </label>

              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="Example: TP-1028"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* FILE UPLOAD */}
          <label className="block cursor-pointer">

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/30 transition">

              {file ? (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center">
                    <FileText
                      size={32}
                      className="text-blue-600"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 mt-4">
                    {file.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <p className="text-sm text-blue-600 mt-3">
                    Click to replace file
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Upload
                      size={32}
                      className="text-blue-600"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 mt-4">
                    Upload Exam Paper
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Drag and drop your document here or click to browse
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    Supported formats: PDF, PNG, JPG
                  </p>
                </>
              )}

            </div>

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

          </label>

          {/* ANALYZE BUTTON */}
          <div className="flex justify-end mt-6">

            <button
              type="submit"
              disabled={analyzing}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <Search size={19} />

              {analyzing
                ? "Analyzing Paper..."
                : "Start Leak Detection"}
            </button>

          </div>

        </form>
      </div>

      {/* ANALYSIS PROGRESS */}
      {analyzing && (
        <div className="bg-white border border-blue-200 rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Activity
                size={25}
                className="text-blue-600 animate-pulse"
              />
            </div>

            <div className="flex-1">

              <h3 className="font-bold text-slate-800">
                Analyzing Exam Paper
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Checking document structure, watermark and suspicious
                indicators...
              </p>

              <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-2/3 animate-pulse" />
              </div>

            </div>

          </div>

        </div>
      )}

      {/* DETECTION RESULT */}
      {analysisComplete && (
        <div className="space-y-6 mb-8">

          {/* RESULT SUMMARY */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-sm text-slate-500">
                  Detection Result
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-1">
                  High Risk Detected
                </h2>

                <p className="text-slate-500 mt-2">
                  Suspicious indicators were detected in the uploaded
                  examination paper.
                </p>

                <div className="flex flex-wrap gap-3 mt-4">

                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                    {caseId}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                    {examName}
                  </span>

                </div>

              </div>

              <div className="w-24 h-24 rounded-full bg-red-100 flex flex-col items-center justify-center">

                <span className="text-3xl font-bold text-red-600">
                  82
                </span>

                <span className="text-xs text-red-600 font-semibold">
                  RISK SCORE
                </span>

              </div>

            </div>

          </div>

          {/* INDICATORS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Document Similarity */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                  <Search className="text-blue-600" />

                  <h3 className="font-bold text-slate-800">
                    Document Similarity
                  </h3>
                </div>

                <span className="font-bold text-red-600">
                  91%
                </span>

              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full mt-4">
                <div className="h-full w-[91%] bg-red-500 rounded-full" />
              </div>

              <p className="text-sm text-slate-500 mt-3">
                High similarity with previously registered documents.
              </p>

            </div>

            {/* Metadata */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-orange-500" />

                  <h3 className="font-bold text-slate-800">
                    Metadata Anomaly
                  </h3>
                </div>

                <span className="font-bold text-orange-600">
                  76%
                </span>

              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full mt-4">
                <div className="h-full w-[76%] bg-orange-500 rounded-full" />
              </div>

              <p className="text-sm text-slate-500 mt-3">
                Suspicious metadata modification indicators detected.
              </p>

            </div>

            {/* Watermark */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <div className="flex items-center gap-3">

                <ShieldCheck className="text-emerald-600" />

                <h3 className="font-bold text-slate-800">
                  Watermark Verification
                </h3>

              </div>

              <div className="flex items-center gap-2 mt-4">

                <CheckCircle2
                  size={20}
                  className="text-emerald-600"
                />

                <span className="font-semibold text-emerald-700">
                  Watermark Verified
                </span>

              </div>

              <p className="text-sm text-slate-500 mt-3">
                Document watermark is present and appears valid.
              </p>

            </div>

            {/* Exposure */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <div className="flex items-center gap-3">

                <AlertTriangle className="text-red-600" />

                <h3 className="font-bold text-slate-800">
                  Exposure Indicator
                </h3>

              </div>

              <div className="flex items-center gap-2 mt-4">

                <XCircle
                  size={20}
                  className="text-red-600"
                />

                <span className="font-semibold text-red-700">
                  Suspicious Exposure Detected
                </span>

              </div>

              <p className="text-sm text-slate-500 mt-3">
                Document shows indicators associated with unauthorized
                exposure.
              </p>

            </div>

          </div>

          {/* CREATE INVESTIGATION */}
          <div className="bg-slate-900 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <h3 className="text-xl font-bold text-white">
                Investigation Recommended
              </h3>

              <p className="text-slate-300 mt-1">
                Create an investigation case to continue the examination
                security review.
              </p>

            </div>

            <button
              type="button"
              onClick={handleCreateInvestigation}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Create Investigation

              <ArrowRight size={19} />
            </button>

          </div>

        </div>
      )}

      {/* FEATURE CARDS */}
      {!analysisComplete && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Search
                size={24}
                className="text-blue-600"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-5">
              Document Analysis
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Analyze document structure, similarity and suspicious
              modifications.
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck
                size={24}
                className="text-emerald-600"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-5">
              Watermark Verification
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Verify document watermark and authenticity indicators.
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle
                size={24}
                className="text-red-600"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-5">
              Risk Assessment
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Generate a risk score based on detected leak indicators.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}