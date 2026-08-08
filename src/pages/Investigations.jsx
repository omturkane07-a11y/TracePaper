import { useNavigate } from "react-router-dom";

export default function Investigations() {
  const navigate = useNavigate();

  const cases = [
    {
      id: "TP-1024",
      examName: "Secondary Board Mathematics",
      status: "Active",
      riskLevel: "High",
      date: "2026-08-01",
    },
    {
      id: "TP-1025",
      examName: "State University Entrance",
      status: "Closed",
      riskLevel: "Low",
      date: "2026-08-03",
    },
    {
      id: "TP-1026",
      examName: "Diploma Technical Exam",
      status: "Under Review",
      riskLevel: "Medium",
      date: "2026-08-05",
    },
  ];

  const statusClasses = {
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-slate-100 text-slate-700",
    "Under Review": "bg-amber-100 text-amber-700",
  };

  const riskClasses = {
    High: "bg-red-100 text-red-700",
    Low: "bg-green-100 text-green-700",
    Medium: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Investigation Cases
          </h1>
          <p className="text-slate-500 mt-2">
            Monitor exam integrity investigations and risk outcomes
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition">
          Create Case
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Case Register
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Active exam security investigation records
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search cases"
                className="border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Exam Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    <button
                      onClick={() => navigate(`/investigations/${item.id}`)}
                      className="text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {item.id}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-slate-700">
                    {item.examName}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskClasses[item.riskLevel]}`}>
                      {item.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-600">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}