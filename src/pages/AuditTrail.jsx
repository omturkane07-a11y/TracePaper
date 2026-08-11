import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Activity,
  ShieldCheck,
  ShieldAlert,
  X,
} from "lucide-react";

export default function AuditTrail() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLog, setSelectedLog] = useState(null);

  const auditLogs = [
    {
      id: 1,
      timestamp: "2026-08-08 10:42 AM",
      user: "Admin",
      action: "Risk Level Changed",
      caseId: "TP-1024",
      module: "Investigations",
      status: "Success",
      details:
        "Risk level for case TP-1024 was changed from Medium to High.",
    },
    {
      id: 2,
      timestamp: "2026-08-08 10:25 AM",
      user: "Admin",
      action: "Case Created",
      caseId: "TP-1027",
      module: "Investigations",
      status: "Success",
      details:
        "A new exam security investigation case TP-1027 was created.",
    },
    {
      id: 3,
      timestamp: "2026-08-08 09:58 AM",
      user: "Admin",
      action: "Paper Uploaded",
      caseId: "TP-1024",
      module: "Leak Detection",
      status: "Success",
      details:
        "Exam paper evidence was uploaded successfully for case TP-1024.",
    },
    {
      id: 4,
      timestamp: "2026-08-08 09:35 AM",
      user: "Admin",
      action: "AI Scan Completed",
      caseId: "TP-1024",
      module: "Leak Detection",
      status: "Success",
      details:
        "AI-based document analysis completed successfully.",
    },
    {
      id: 5,
      timestamp: "2026-08-08 09:12 AM",
      user: "Investigator",
      action: "Evidence Added",
      caseId: "TP-1026",
      module: "Investigations",
      status: "Success",
      details:
        "New investigation evidence was added to case TP-1026.",
    },
    {
      id: 6,
      timestamp: "2026-08-08 08:45 AM",
      user: "Admin",
      action: "User Login",
      caseId: "—",
      module: "Authentication",
      status: "Success",
      details: "Administrator successfully logged into TracePaper.",
    },
    {
      id: 7,
      timestamp: "2026-08-08 08:21 AM",
      user: "Investigator",
      action: "Report Generated",
      caseId: "TP-1025",
      module: "Reports",
      status: "Success",
      details:
        "Investigation report was generated for case TP-1025.",
    },
    {
      id: 8,
      timestamp: "2026-08-08 08:03 AM",
      user: "Unknown",
      action: "Failed Login",
      caseId: "—",
      module: "Authentication",
      status: "Failed",
      details:
        "A failed login attempt was detected and recorded by the system.",
    },
  ];

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.caseId.toLowerCase().includes(search.toLowerCase()) ||
        log.module.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const successCount = auditLogs.filter(
    (log) => log.status === "Success"
  ).length;

  const failedCount = auditLogs.filter(
    (log) => log.status === "Failed"
  ).length;

  return (
    <div className="w-full max-w-full overflow-x-hidden">

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Audit Trail
          </h1>

          <p className="text-lg text-slate-500 mt-2">
            Complete history of system activity and investigation actions
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        {/* Total Events */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between min-w-0">
          <div>
            <p className="text-slate-500 text-base">
              Total Events
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              {auditLogs.length}
            </h2>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <Activity
              size={30}
              className="text-blue-600"
            />
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between min-w-0">
          <div>
            <p className="text-slate-500 text-base">
              Today's Events
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              {auditLogs.length - 2}
            </h2>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck
              size={30}
              className="text-emerald-600"
            />
          </div>
        </div>

        {/* Security Events */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between min-w-0">
          <div>
            <p className="text-slate-500 text-base">
              Security Events
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              2
            </h2>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
            <ShieldCheck
              size={30}
              className="text-purple-600"
            />
          </div>
        </div>

        {/* Failed Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between min-w-0">
          <div>
            <p className="text-slate-500 text-base">
              Failed Actions
            </p>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              {failedCount}
            </h2>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert
              size={30}
              className="text-red-600"
            />
          </div>
        </div>

      </div>

      {/* SYSTEM ACTIVITY */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full max-w-full">

        {/* TOP SECTION */}
        <div className="p-6 border-b border-slate-100">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                System Activity
              </h2>

              <p className="text-slate-500 mt-1">
                Every important system and investigation action is recorded
              </p>
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

              <div className="relative w-full sm:w-80">

                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center justify-center gap-2 border border-slate-200 px-5 py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition"
              >
                <Filter size={18} />
                Filter
              </button>

            </div>
          </div>

          {/* FILTER PANEL */}
          {filterOpen && (
            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="mt-1 border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none"
                >
                  <option value="All">All</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="sm:mt-5 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                Reset Filters
              </button>

            </div>
          )}

        </div>

        {/* TABLE */}
        <div className="w-full overflow-hidden">

          <table className="w-full table-fixed text-left">

            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">

                <th className="w-[15%] px-4 py-4">
                  Timestamp
                </th>

                <th className="w-[10%] px-4 py-4">
                  User
                </th>

                <th className="w-[18%] px-4 py-4">
                  Action
                </th>

                <th className="w-[12%] px-4 py-4">
                  Case ID
                </th>

                <th className="w-[14%] px-4 py-4">
                  Module
                </th>

                <th className="w-[12%] px-4 py-4">
                  Status
                </th>

                <th className="w-[10%] px-4 py-4 text-center">
                  Details
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (

                  <tr
                    key={log.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >

                    <td className="px-4 py-5 text-sm text-slate-600 truncate">
                      {log.timestamp}
                    </td>

                    <td className="px-4 py-5 font-medium text-slate-800 truncate">
                      {log.user}
                    </td>

                    <td className="px-4 py-5">

                      <span className="inline-block max-w-full px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold truncate">
                        {log.action}
                      </span>

                    </td>

                    <td className="px-4 py-5">

                      {log.caseId !== "—" ? (
                        <span className="font-semibold text-blue-700">
                          {log.caseId}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}

                    </td>

                    <td className="px-4 py-5 text-sm text-slate-600 truncate">
                      {log.module}
                    </td>

                    <td className="px-4 py-5">

                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          log.status === "Success"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status}
                      </span>

                    </td>

                    <td className="px-4 py-5 text-center">

                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        title="View Details"
                      >
                        <Eye size={19} />
                      </button>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-12 text-slate-500"
                  >
                    No audit logs found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* DETAILS MODAL */}
      {selectedLog && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">

            <div className="flex items-center justify-between p-6 border-b border-slate-100">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Audit Event Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Event #{selectedLog.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-6 space-y-4">

              <div>
                <p className="text-xs text-slate-500">
                  Timestamp
                </p>

                <p className="font-medium text-slate-800">
                  {selectedLog.timestamp}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  User
                </p>

                <p className="font-medium text-slate-800">
                  {selectedLog.user}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Action
                </p>

                <p className="font-medium text-slate-800">
                  {selectedLog.action}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Case ID
                </p>

                <p className="font-medium text-blue-700">
                  {selectedLog.caseId}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Module
                </p>

                <p className="font-medium text-slate-800">
                  {selectedLog.module}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedLog.status === "Success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedLog.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Description
                </p>

                <p className="text-slate-700 mt-1 leading-relaxed">
                  {selectedLog.details}
                </p>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end">

              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}