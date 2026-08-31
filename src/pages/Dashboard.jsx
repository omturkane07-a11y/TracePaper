import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCard from "../components/dashboard/StatsCard";
import InvestigationChart from "../components/dashboard/InvestigationChart";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import SystemStatus from "../components/dashboard/SystemStatus";
import RecentCasesTable from "../components/dashboard/RecentCasesTable";

import {
  FileText,
  AlertTriangle,
  Building2,
  Search,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";

// ============================================================
// API
// ============================================================

const DASHBOARD_API =
  "http://localhost:5000/api/dashboard";

const PAPERS_API =
  "http://localhost:5000/api/question-papers";

// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {
  const navigate = useNavigate();

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPapers: 0,
      pendingQuestionPapers: 0,
      leakAlerts: 0,
      examCenters: 0,
      investigations: 0,
    },
    chartData: [],
    recentCases: [],
    activities: [],
  });

  // ============================================================
  // QUESTION PAPERS
  // ============================================================

  const [pendingPapers, setPendingPapers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [papersLoading, setPapersLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [papersError, setPapersError] =
    useState("");

  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("tracepaper_token") ||
      localStorage.getItem("token")
    );
  };

  // ============================================================
  // GET CURRENT USER ROLE
  // ============================================================

  const getCurrentRole = () => {
    try {
      const token = getToken();

      if (!token) {
        return "";
      }

      const parts = token.split(".");

      if (parts.length !== 3) {
        return "";
      }

      const payload = JSON.parse(
        atob(parts[1])
      );

      return String(payload.role || "")
        .trim()
        .toLowerCase();
    } catch (error) {
      console.error(
        "ROLE READ ERROR:",
        error
      );

      return "";
    }
  };

  // ============================================================
  // CURRENT ROLE
  // ============================================================

  const currentRole = getCurrentRole();

  console.log(
    "CURRENT DASHBOARD ROLE:",
    currentRole
  );

  // ============================================================
  // FETCH DASHBOARD DATA
  // ============================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token not found."
        );
        return;
      }

      const response = await axios.get(
        DASHBOARD_API,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "DASHBOARD RESPONSE:",
        response.data
      );

      if (
        response.data?.status ===
        "success"
      ) {
        setDashboardData({
          stats: response.data.stats || {
            totalPapers: 0,
            pendingQuestionPapers: 0,
            leakAlerts: 0,
            examCenters: 0,
            investigations: 0,
          },

          chartData:
            response.data.chartData || [],

          recentCases:
            response.data.recentCases || [],

          activities:
            response.data.activities || [],
        });
      }
    } catch (err) {
      console.error(
        "DASHBOARD DATA ERROR:",
        err
      );

      console.error(
        "DASHBOARD BACKEND ERROR:",
        err.response?.data
      );

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "tracepaper_token"
        );

        localStorage.removeItem(
          "token"
        );

        navigate("/login");

        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH QUESTION PAPERS
  // ROLE BASED
  // ============================================================

  const fetchQuestionPapers = async () => {
    try {
      setPapersLoading(true);
      setPapersError("");

      const token = getToken();

      if (!token) {
        setPapersError(
          "Authentication token not found."
        );

        setPendingPapers([]);

        return;
      }

      const response = await axios.get(
        PAPERS_API,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "QUESTION PAPERS FULL RESPONSE:",
        response.data
      );

      if (
        response.data?.status !==
        "success"
      ) {
        setPendingPapers([]);
        return;
      }

      const papers = Array.isArray(
        response.data.papers
      )
        ? response.data.papers
        : [];

      console.log(
        "ALL QUESTION PAPERS:",
        papers
      );

      // ========================================================
      // DEBUG STATUS
      // ========================================================

      papers.forEach((paper) => {
        console.log(
          "PAPER STATUS:",
          {
            id: paper.id,
            paper_code:
              paper.paper_code,
            workflow_status:
              paper.workflow_status,
            created_by:
              paper.created_by,
            created_by_name:
              paper.created_by_name,
          }
        );
      });

      // ========================================================
      // ROLE BASED FILTER
      // ========================================================

      const pending = papers.filter(
        (paper) => {
          const workflowStatus =
            String(
              paper.workflow_status || ""
            )
              .trim()
              .toLowerCase();

          // -----------------------------------------------
          // REVIEWER
          // -----------------------------------------------

          if (
            currentRole === "reviewer"
          ) {
            return (
              workflowStatus ===
              "pending_review"
            );
          }

          // -----------------------------------------------
          // FINAL APPROVER
          // -----------------------------------------------

          if (
            currentRole === "approver" ||
            currentRole ===
              "final_approver"
          ) {
            return (
              workflowStatus ===
              "pending_final_approval"
            );
          }

          // -----------------------------------------------
          // CREATOR
          // READ ONLY
          //
          // Creator can see BOTH:
          // pending_review
          // pending_final_approval
          // -----------------------------------------------

          if (
            currentRole === "creator"
          ) {
            return (
              workflowStatus ===
                "pending_review" ||
              workflowStatus ===
                "pending_final_approval" ||
              workflowStatus ===
                "approved"
            );
          }

          // -----------------------------------------------
          // OTHER ROLES
          // -----------------------------------------------

          return false;
        }
      );

      console.log(
        "CURRENT ROLE:",
        currentRole
      );

      console.log(
        "PENDING PAPERS FOR CURRENT ROLE:",
        pending
      );

      setPendingPapers(pending);
    } catch (err) {
      console.error(
        "QUESTION PAPERS FETCH ERROR:",
        err
      );

      console.error(
        "QUESTION PAPERS BACKEND ERROR:",
        err.response?.data
      );

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "tracepaper_token"
        );

        localStorage.removeItem(
          "token"
        );

        navigate("/login");

        return;
      }

      setPendingPapers([]);

      setPapersError(
        err.response?.data?.message ||
          "Unable to load pending question papers."
      );
    } finally {
      setPapersLoading(false);
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const refreshDashboard = () => {
    fetchDashboardData();
    fetchQuestionPapers();
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchDashboardData();
    fetchQuestionPapers();
  }, []);

  // ============================================================
  // STATS
  // ============================================================

  const statsData = [
    {
      title: "Total Papers",
      value:
        dashboardData.stats.totalPapers,
      change: "Live",
      icon: FileText,
      color: "blue",
    },

    {
      title: "Leak Alerts",
      value:
        dashboardData.stats.leakAlerts,
      change: "Live",
      icon: AlertTriangle,
      color: "red",
    },

    {
      title: "Exam Centers",
      value:
        dashboardData.stats.examCenters,
      change: "Active",
      icon: Building2,
      color: "green",
    },

    {
      title: "Investigations",
      value:
        dashboardData.stats.investigations,
      change: "Live",
      icon: Search,
      color: "purple",
    },
  ];

  // ============================================================
  // OPEN PAPER
  // ============================================================

  const handleReviewPaper = (paper) => {
    console.log(
      "Opening paper:",
      paper
    );

    const workflowStatus =
      String(
        paper.workflow_status || ""
      )
        .trim()
        .toLowerCase();

    // ========================================================
    // CREATOR - READ ONLY
    // ========================================================

    if (
      currentRole === "creator"
    ) {
      navigate(
        `/question-paper?id=${paper.id}&mode=view`
      );

      return;
    }

    // ========================================================
    // FINAL APPROVER
    // ========================================================

    if (
      currentRole === "approver" ||
      currentRole === "final_approver"
    ) {
      if (
        workflowStatus !==
        "pending_final_approval"
      ) {
        console.warn(
          "Paper is not waiting for final approval."
        );

        return;
      }

      navigate(
        `/question-paper?id=${paper.id}&mode=approve`
      );

      return;
    }

    // ========================================================
    // REVIEWER
    // ========================================================

    if (
      currentRole === "reviewer"
    ) {
      if (
        workflowStatus !==
        "pending_review"
      ) {
        console.warn(
          "Paper is not waiting for review."
        );

        return;
      }

      navigate(
        `/question-paper?id=${paper.id}&mode=review`
      );

      return;
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    try {
      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return date;
    }
  };

  // ============================================================
  // ROLE BASED HEADER TEXT
  // ============================================================

  const getPendingTitle = () => {
    if (
      currentRole === "reviewer"
    ) {
      return "Papers Pending Review";
    }

    if (
      currentRole === "approver" ||
      currentRole ===
        "final_approver"
    ) {
      return "Papers Pending Final Approval";
    }

    if (
      currentRole === "creator"
    ) {
      return "Pending Question Papers";
    }

    return "Pending Question Papers";
  };

  // ============================================================
  // ROLE BASED DESCRIPTION
  // ============================================================

  const getPendingDescription =
    () => {
      if (
        currentRole === "reviewer"
      ) {
        return "Question papers waiting for Reviewer action";
      }

      if (
        currentRole === "approver" ||
        currentRole ===
          "final_approver"
      ) {
        return "Question papers reviewed and waiting for Final Approver action";
      }

      if (
        currentRole === "creator"
      ) {
        return "View-only access to question papers currently in workflow";
      }

      return "Question papers waiting for workflow action";
    };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <DashboardHeader />

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {statsData.map(
          (item) => (
            <StatsCard
              key={item.title}
              title={item.title}
              value={
                loading
                  ? "..."
                  : item.value
              }
              change={item.change}
              icon={item.icon}
              color={item.color}
            />
          )
        )}

      </div>

      {/* ======================================================
          PENDING QUESTION PAPERS
      ====================================================== */}

      <div className="bg-[#0d1b2a] rounded-2xl border border-slate-700/80 shadow-[0_14px_34px_rgba(1,8,20,0.22)] overflow-hidden">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="px-6 py-5 border-b border-slate-700/80 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">

              <Clock
                size={22}
                className="text-orange-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-100">
                {getPendingTitle()}
              </h2>

              <p className="text-sm text-slate-300 mt-1">
                {getPendingDescription()}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                currentRole ===
                  "approver" ||
                currentRole ===
                  "final_approver"
                  ? "bg-purple-500/10 text-purple-200 border-purple-400/25"
                  : currentRole ===
                    "creator"
                  ? "bg-slate-500/10 text-slate-200 border-slate-400/20"
                  : "bg-orange-500/10 text-orange-200 border-orange-400/25"
              }`}
            >
              {papersLoading
                ? "..."
                : pendingPapers.length}{" "}
              Pending
            </span>

            <button
              onClick={
                refreshDashboard
              }
              disabled={
                papersLoading ||
                loading
              }
              className="p-2 rounded-lg border border-slate-700/80 bg-slate-900/40 hover:bg-slate-800/70 transition disabled:opacity-50"
              title="Refresh"
            >

              <RefreshCw
                size={18}
                className={
                  papersLoading
                    ? "animate-spin text-slate-100"
                    : "text-slate-200"
                }
              />

            </button>

          </div>

        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {papersError && (
          <div className="px-6 py-4 text-sm text-red-600 bg-red-50 border-b border-red-200">
            {papersError}
          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {papersLoading && (
          <div className="px-6 py-10 text-center">

            <RefreshCw
              size={28}
              className="mx-auto text-blue-600 animate-spin"
            />

            <p className="mt-3 text-gray-500">
              Loading pending papers...
            </p>

          </div>
        )}

        {/* ====================================================
            NO PAPERS
        ==================================================== */}

        {!papersLoading &&
          !papersError &&
          pendingPapers.length ===
            0 && (
            <div className="px-6 py-12 text-center">

              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">

                <FileText
                  size={30}
                  className="text-green-600"
                />

              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                No Pending Papers
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {currentRole ===
                  "reviewer"
                  ? "There are no question papers waiting for review."
                  : currentRole ===
                      "approver" ||
                    currentRole ===
                      "final_approver"
                  ? "There are no question papers waiting for final approval."
                  : currentRole ===
                    "creator"
                  ? "There are no question papers currently in workflow."
                  : "There are no pending question papers."}
              </p>

            </div>
          )}

        {/* ====================================================
            PAPERS
        ==================================================== */}

        {!papersLoading &&
          pendingPapers.length >
            0 && (
            <div className="divide-y divide-slate-700/60">

              {pendingPapers.map(
                (paper) => {

                  const workflowStatus =
                    String(
                      paper.workflow_status ||
                        ""
                    )
                      .trim()
                      .toLowerCase();

                  const isFinalApproval =
                    workflowStatus ===
                    "pending_final_approval";

                  const isPendingReview =
                    workflowStatus ===
                    "pending_review";

                  return (
                    <div
                      key={
                        paper.id
                      }
                      className="px-6 py-5 transition-colors duration-200 hover:bg-[#12263d] hover:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        {/* ==================================
                            PAPER INFO
                        ================================== */}

                        <div className="flex items-start gap-4 min-w-0">

                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              isFinalApproval
                                ? "bg-purple-500/10 border border-purple-400/25"
                                : isPendingReview
                                ? "bg-blue-500/10 border border-blue-400/25"
                                : "bg-slate-800/80 border border-slate-700"
                            }`}
                          >

                            <FileText
                              size={23}
                              className={
                                isFinalApproval
                                  ? "text-purple-300"
                                  : isPendingReview
                                  ? "text-blue-300"
                                  : "text-slate-300"
                              }
                            />

                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-bold text-slate-100">

                                {paper.paper_title ||
                                  "Untitled Question Paper"}

                              </h3>

                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  isFinalApproval
                                    ? "bg-purple-500/10 text-purple-200 border-purple-400/25"
                                    : isPendingReview
                                    ? "bg-orange-500/10 text-orange-200 border-orange-400/25"
                                    : "bg-slate-500/10 text-slate-200 border-slate-400/20"
                                }`}
                              >

                                {isFinalApproval
                                  ? "PENDING FINAL APPROVAL"
                                  : isPendingReview
                                  ? "PENDING REVIEW"
                                  : workflowStatus
                                      .replace(
                                        /_/g,
                                        " "
                                      )
                                      .toUpperCase()}

                              </span>

                            </div>

                            <p className="text-sm font-mono text-blue-300 mt-1">

                              {paper.paper_code ||
                                "—"}

                            </p>

                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-sm">

                              {/* FILE */}

                              <div>

                                <span className="text-slate-400">
                                  File:
                                </span>{" "}

                                <span className="text-slate-200">

                                  {paper.file_name ||
                                    "—"}

                                </span>

                              </div>

                              {/* CREATOR */}

                              <div>

                                <span className="text-slate-400">
                                  Creator:
                                </span>{" "}

                                <span className="text-slate-200">

                                  {paper.created_by_name ||
                                    `User #${
                                      paper.created_by ||
                                      "—"
                                    }`}

                                </span>

                              </div>

                              {/* DATE */}

                              <div>

                                <span className="text-slate-400">
                                  Created:
                                </span>{" "}

                                <span className="text-slate-200">

                                  {formatDate(
                                    paper.created_at
                                  )}

                                </span>

                              </div>

                            </div>

                          </div>

                        </div>

                        {/* ==================================
                            ACTION
                        ================================== */}

                        <div className="flex items-center gap-3 shrink-0">

                          {/* ==================================
                              REVIEWER
                          ================================== */}

                          {currentRole ===
                            "reviewer" &&
                            isPendingReview && (
                              <button
                                onClick={() =>
                                  handleReviewPaper(
                                    paper
                                  )
                                }
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
                              >

                                <Eye
                                  size={18}
                                />

                                Review

                              </button>
                            )}

                          {/* ==================================
                              FINAL APPROVER
                          ================================== */}

                          {(
                            currentRole ===
                              "approver" ||
                            currentRole ===
                              "final_approver"
                          ) &&
                            isFinalApproval && (
                              <button
                                onClick={() =>
                                  handleReviewPaper(
                                    paper
                                  )
                                }
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition shadow-sm"
                              >

                                <Eye
                                  size={18}
                                />

                                Final Approval

                              </button>
                            )}

                          {/* ==================================
                              CREATOR
                              READ ONLY
                          ================================== */}

                          {currentRole ===
                            "creator" && (
                            <button
                              onClick={() =>
                                handleReviewPaper(
                                  paper
                                )
                              }
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
                            >

                              <Eye
                                size={18}
                              />

                              View

                            </button>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

      {/* ======================================================
          MAIN DASHBOARD GRID
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">

        {/* ====================================================
            LEFT
        ==================================================== */}

        <div className="xl:col-span-2 flex flex-col gap-6 min-w-0">

          <InvestigationChart
            chartData={
              dashboardData.chartData
            }
          />

          <RecentCasesTable
            cases={
              dashboardData.recentCases
            }
          />

        </div>

        {/* ====================================================
            RIGHT
        ==================================================== */}

        <div className="flex flex-col gap-6 min-w-0 h-full">

          <ActivityTimeline
            activities={
              dashboardData.activities
            }
          />

          <div className="flex-1 min-h-0 [&>div]:h-full">

            <SystemStatus
              leakAlerts={
                dashboardData.stats
                  .leakAlerts
              }
              loading={
                loading
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}