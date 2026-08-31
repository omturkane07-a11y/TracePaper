export default function ReportTable({ reports = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold mb-6">
        Investigation Reports
      </h2>

      {reports.length === 0 ? (
        <div className="py-10 text-center text-slate-500">
          No investigation reports found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">

                <th className="pb-3">Report ID</th>
                <th>Case</th>
                <th>Exam</th>
                <th>Center</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Date</th>

              </tr>
            </thead>

            <tbody>

              {reports.map((report) => (

                <tr
                  key={report.report_id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="py-4 font-semibold">
                    {report.report_id || "-"}
                  </td>

                  <td>
                    {report.case_id || "-"}
                  </td>

                  <td>
                    {report.exam || "-"}
                  </td>

                  <td>
                    {report.center || "-"}
                  </td>

                  <td>
                    <span
                      className={`font-semibold ${
                        report.risk?.toLowerCase() === "critical" ||
                        report.risk?.toLowerCase() === "high"
                          ? "text-red-600"
                          : report.risk?.toLowerCase() === "medium"
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      {report.risk || "-"}
                    </span>
                  </td>

                  <td>

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        report.status?.toLowerCase() === "open"
                          ? "bg-blue-100 text-blue-700"
                          : report.status?.toLowerCase() === "resolved"
                          ? "bg-green-100 text-green-700"
                          : report.status?.toLowerCase() === "closed"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {report.status || "-"}
                    </span>

                  </td>

                  <td>
                    {report.date
                      ? new Date(report.date).toLocaleDateString()
                      : "-"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}