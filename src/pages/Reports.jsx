import ReportSummaryCard from "../components/reports/ReportSummaryCard";
import ReportTable from "../components/reports/ReportTable";
import DownloadReportCard from "../components/reports/DownloadReportCard";

export default function Reports() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>

        <h1 className="text-3xl font-bold text-slate-800">
          Investigation Reports
        </h1>

        <p className="text-slate-500 mt-2">
          AI generated reports for all investigation cases.
        </p>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <ReportSummaryCard
          title="Total Reports"
          value="124"
          color="text-blue-600"
        />

        <ReportSummaryCard
          title="High Risk Reports"
          value="32"
          color="text-red-600"
        />

        <ReportSummaryCard
          title="Generated Today"
          value="8"
          color="text-green-600"
        />

      </div>

      {/* Reports Table */}
      <ReportTable />

      {/* Download Section */}
      <DownloadReportCard />

    </div>
  );
}