import { Download } from "lucide-react";

export default function DownloadReportCard() {
  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold mb-4">

        Export Report

      </h2>

      <p className="text-slate-500 mb-6">

        Download AI generated investigation report.

      </p>

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-3"
      >

        <Download size={20} />

        Download PDF

      </button>

    </div>

  );
}