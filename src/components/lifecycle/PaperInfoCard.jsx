export default function PaperInfoCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Paper Information
      </h2>

      <div className="space-y-5">

        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            Paper Code
          </span>

          <span className="font-semibold text-slate-800">
            QP-2026-001
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            Examination
          </span>

          <span className="font-semibold text-slate-800">
            Final Semester Exam
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            Subject
          </span>

          <span className="font-semibold text-slate-800">
            Computer Networks
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            Watermark ID
          </span>

          <span className="font-semibold text-blue-600">
            WM-845732
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            Encryption
          </span>

          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            AES-256 Enabled
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            Current Status
          </span>

          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
            In Transit
          </span>
        </div>

      </div>

    </div>
  );
}