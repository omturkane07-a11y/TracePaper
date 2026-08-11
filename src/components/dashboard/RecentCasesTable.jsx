import { casesData } from "../../data/casesData";

export default function RecentCasesTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Recent Leak Cases
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Latest reported investigation cases
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-slate-500 text-sm">
              <th className="pb-3">Case ID</th>
              <th className="pb-3">Exam</th>
              <th className="pb-3">Center</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {casesData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >

                <td className="py-4 font-medium text-slate-800">
                  {item.id}
                </td>

                <td className="text-slate-700">
                  {item.exam}
                </td>

                <td className="text-slate-700">
                  {item.center}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Investigation"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="text-slate-600">
                  {item.date}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}