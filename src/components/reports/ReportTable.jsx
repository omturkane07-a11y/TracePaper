import { reportsData } from "../../data/reportsData";

export default function ReportTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold mb-6">
        Investigation Reports
      </h2>

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

          {reportsData.map((report) => (

            <tr
              key={report.reportId}
              className="border-b hover:bg-slate-50"
            >

              <td className="py-4 font-semibold">
                {report.reportId}
              </td>

              <td>{report.caseId}</td>

              <td>{report.exam}</td>

              <td>{report.center}</td>

              <td className="font-semibold text-red-600">
                {report.risk}
              </td>

              <td>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">

                  {report.status}

                </span>

              </td>

              <td>{report.date}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}