import { useParams } from "react-router-dom";
import { AlertTriangle, Clock, ShieldCheck, Users } from "lucide-react";

export default function InvestigationDetails() {
  const { id } = useParams();

  const investigation = {
    id,
    examName: "Secondary Board Mathematics",
    status: "Active",
    riskLevel: "High",
    riskScore: 82,
    aiPrediction: "High confidence leak pattern",
    team: "Risk Intelligence Cell",
    date: "2026-08-01",
  };

  const evidence = [
    { id: "EV-9001", type: "Printed Document", status: "Verified", date: "2026-08-01" },
    { id: "EV-9002", type: "Digital Upload", status: "Pending", date: "2026-08-05" },
    { id: "EV-9003", type: "CCTV Log", status: "Verified", date: "2026-08-06" },
  ];

  const activities = [
    { time: "08:15 AM", title: "Case intake registered", detail: "Investigation opened by Risk Operations" },
    { time: "10:40 AM", title: "AI document profile scanned", detail: "Match confidence detected at 82%" },
    { time: "01:25 PM", title: "Evidence review assigned", detail: "Evidence management queue updated" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-800">
              {investigation.id}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              {investigation.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              {investigation.riskLevel}
            </span>
          </div>
          <p className="text-slate-500 mt-2">
            {investigation.examName}
          </p>
        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
          Assign Team
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">Risk Score</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-2">
                {investigation.riskScore}%
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={28} />
            </div>
          </div>
          <div className="mt-6 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-red-500" style={{ width: `${investigation.riskScore}%` }}></div>
          </div>
        </article>

        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">AI Prediction</p>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {investigation.aiPrediction}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck size={28} />
            </div>
          </div>
        </article>

        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">Assigned Investigation Team</p>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {investigation.team}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={28} />
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Leak Source Detection
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Source confidence signal distribution
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Live Feed
            </span>
          </div>

          <div className="space-y-5">
            {[
              { label: "Printing Press", value: 82 },
              { label: "Transport Unit", value: 40 },
              { label: "Storage Facility", value: 65 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-600">{item.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-blue-600" style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Evidence Panel
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Collected supporting artifacts
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              Upload
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="pb-3">Evidence ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-4 font-semibold text-slate-900">{item.id}</td>
                    <td className="py-4 text-slate-700">{item.type}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
                    </td>
                    <td className="py-4 text-slate-600">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Audit Timeline
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Activity chronology for {investigation.id}
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock size={18} />
            <span className="text-sm font-medium">{investigation.date}</span>
          </div>
        </div>

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                {index !== activities.length - 1 && <span className="w-px h-12 bg-slate-200"></span>}
              </div>
              <div className="pb-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{activity.time}</p>
                <p className="font-semibold text-slate-900 mt-1">{activity.title}</p>
                <p className="text-sm text-slate-600 mt-1">{activity.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
