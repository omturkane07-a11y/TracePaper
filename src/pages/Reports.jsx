import { useEffect, useRef, useState } from "react";
import axios from "axios";

import ReportSummaryCard from "../components/reports/ReportSummaryCard";
import ReportTable from "../components/reports/ReportTable";
import DownloadReportCard from "../components/reports/DownloadReportCard";

const API_URL = "http://localhost:5000/api/reports";

export default function Reports() {
  // ============================================
  // STATE
  // ============================================

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Prevent duplicate API request in React StrictMode
  const hasFetched = useRef(false);

  // ============================================
  // LOAD REPORTS FROM DATABASE
  // ============================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      if (response.data.status === "success") {
        setReports(response.data.reports || []);
      } else {
        setError("Unable to load investigation reports.");
      }
    } catch (err) {
      console.error("Reports loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load investigation reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    fetchReports();
  }, []);

  // ============================================
  // SUMMARY CALCULATIONS
  // ============================================

  const totalReports = reports.length;

  const highRiskReports = reports.filter((report) => {
    const risk = report.risk?.toLowerCase();

    return risk === "high" || risk === "critical";
  }).length;

  const today = new Date().toDateString();

  const generatedToday = reports.filter((report) => {
    if (!report.date) return false;

    return new Date(report.date).toDateString() === today;
  }).length;

  // ============================================
  // UI
  // ============================================

  return (
    <div className="space-y-8">

      {/* =====================================
          HEADER
      ====================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Investigation Reports
        </h1>

        <p className="text-slate-500 mt-2">
          AI generated reports for all investigation cases.
        </p>
      </div>

      {/* =====================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* =====================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <ReportSummaryCard
          title="Total Reports"
          value={loading ? "..." : totalReports}
          color="text-blue-600"
        />

        <ReportSummaryCard
          title="High Risk Reports"
          value={loading ? "..." : highRiskReports}
          color="text-red-600"
        />

        <ReportSummaryCard
          title="Generated Today"
          value={loading ? "..." : generatedToday}
          color="text-green-600"
        />

      </div>

      {/* =====================================
          REPORT TABLE
      ====================================== */}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center text-slate-400">
          Loading investigation reports...
        </div>
      ) : (
        <ReportTable reports={reports} />
      )}

      {/* =====================================
          DOWNLOAD REPORT
      ====================================== */}

      <DownloadReportCard reports={reports} />

    </div>
  );
}