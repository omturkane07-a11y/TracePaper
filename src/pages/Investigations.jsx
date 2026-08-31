import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Filter,
  X,
  Plus,
  Upload,
  ShieldCheck,
  ShieldAlert,
  FileSearch,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { verifyWatermark } from "../utils/watermark";

// ============================================
// API
// ============================================

const API_URL = "http://localhost:5000/api/investigations";
const PAPER_VERIFY_URL = "http://localhost:5000/api/question-papers/verify";

// ============================================
// AUTH CONFIG
// ============================================

const getAuthConfig = () => {
  const token = localStorage.getItem("tracepaper_token");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

// ============================================
// COMPONENT
// ============================================

export default function Investigations() {
  const navigate = useNavigate();

  // ============================================
  // CASE STATE
  // ============================================

  const [cases, setCases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  const [showCreateModal, setShowCreateModal] = useState(false);

  // ============================================
  // CREATE CASE
  // ============================================

  const [newCase, setNewCase] = useState({
    examName: "",
    status: "Active",
    riskLevel: "Medium",
    date: "",
  });

  // ============================================
  // LEAK VERIFICATION
  // ============================================

  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [verifyingPaper, setVerifyingPaper] = useState(false);

  const [verificationResult, setVerificationResult] = useState(null);

  const [verificationError, setVerificationError] = useState("");

  // ============================================
  // LOAD INVESTIGATIONS
  // ============================================

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        API_URL,
        getAuthConfig()
      );

      if (response.data.status === "success") {
        setCases(response.data.investigations || []);
      }
    } catch (err) {
      console.error(
        "Investigation loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load investigation cases."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  // ============================================
  // STATUS / RISK COLORS
  // ============================================

  const statusClasses = {
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-slate-100 text-slate-700",
    "Under Review":
      "bg-amber-100 text-amber-700",
  };

  const riskClasses = {
    High: "bg-red-100 text-red-700",
    Low: "bg-green-100 text-green-700",
    Medium: "bg-orange-100 text-orange-700",
  };

  // ============================================
  // DATABASE → UI MAPPING
  // ============================================

  const formatStatus = (status) => {
    const statusMap = {
      open: "Active",
      investigating: "Under Review",
      resolved: "Closed",
      closed: "Closed",
    };

    return statusMap[status] || status;
  };

  const formatRisk = (priority) => {
    const priorityMap = {
      high: "High",
      medium: "Medium",
      low: "Low",
      critical: "High",
    };

    return priorityMap[priority] || "Medium";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-CA"
    );
  };

  // ============================================
  // SEARCH + FILTER
  // ============================================

  const filteredCases = cases.filter((item) => {
    const search = searchTerm.toLowerCase();

    const caseId =
      item.investigation_code?.toLowerCase() || "";

    const title =
      item.title?.toLowerCase() || "";

    const exam =
      item.exam_name?.toLowerCase() || "";

    const status = formatStatus(item.status);

    const risk = formatRisk(item.priority);

    const matchesSearch =
      caseId.includes(search) ||
      title.includes(search) ||
      exam.includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      status === statusFilter;

    const matchesRisk =
      riskFilter === "All" ||
      risk === riskFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRisk
    );
  });

  // ============================================
  // CREATE CASE
  // ============================================

  const handleCreateCase = async (e) => {
    e.preventDefault();

    if (
      !newCase.examName.trim() ||
      !newCase.date
    ) {
      return;
    }

    try {
      setError("");

      const statusMap = {
        Active: "open",
        "Under Review": "investigating",
        Closed: "closed",
      };

      const priorityMap = {
        High: "high",
        Medium: "medium",
        Low: "low",
      };

      await axios.post(
        API_URL,
        {
          title: newCase.examName.trim(),
          status: statusMap[newCase.status],
          priority:
            priorityMap[newCase.riskLevel],
          started_at: newCase.date,
        },
        getAuthConfig()
      );

      await fetchInvestigations();

      setNewCase({
        examName: "",
        status: "Active",
        riskLevel: "Medium",
        date: "",
      });

      setShowCreateModal(false);
    } catch (err) {
      console.error(
        "Create investigation error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create investigation."
      );
    }
  };

  // ============================================
  // RESET FILTER
  // ============================================

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setRiskFilter("All");
  };

  // ============================================
  // OPEN VERIFY MODAL
  // ============================================

  const openVerifyModal = () => {
    setSelectedFile(null);
    setVerificationResult(null);
    setVerificationError("");
    setShowVerifyModal(true);
  };

  // ============================================
  // CLOSE VERIFY MODAL
  // ============================================

  const closeVerifyModal = () => {
    if (verifyingPaper) return;

    setShowVerifyModal(false);
    setSelectedFile(null);
    setVerificationResult(null);
    setVerificationError("");
  };

  // ============================================
  // SELECT LEAKED PDF
  // ============================================

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setVerificationResult(null);
    setVerificationError("");
  };

  // ============================================
  // VERIFY LEAKED PAPER
  // ============================================

  const handleVerifyPaper = async () => {
    if (!selectedFile) {
      setVerificationError(
        "Please select a leaked PDF first."
      );

      return;
    }

    try {
      setVerifyingPaper(true);
      setVerificationError("");
      setVerificationResult(null);

      // ----------------------------------------
      // STEP 1
      // READ INVISIBLE WATERMARK
      // ----------------------------------------

      const watermarkData =
        await verifyWatermark(selectedFile);

      console.log(
        "Watermark result:",
        watermarkData
      );

      // ----------------------------------------
      // NO TRACEPAPER WATERMARK
      // ----------------------------------------

      if (
        !watermarkData.verified ||
        !watermarkData.fingerprint
      ) {
        setVerificationResult({
          verified: false,
          matchFound: false,
          reason:
            "No valid TracePaper invisible watermark was detected in this PDF.",
        });

        return;
      }

      // ----------------------------------------
      // STEP 2
      // SEND FINGERPRINT TO BACKEND
      // ----------------------------------------

      const response = await axios.post(
        PAPER_VERIFY_URL,
        {
          fingerprint:
            watermarkData.fingerprint,
        },
        getAuthConfig()
      );

      // ----------------------------------------
      // STEP 3
      // MATCH FOUND
      // ----------------------------------------

      if (
        response.data.status === "success" &&
        response.data.matchFound
      ) {
        setVerificationResult({
          verified: true,
          matchFound: true,

          fingerprint:
            watermarkData.fingerprint,

          traceId:
            watermarkData.traceId,

          title: watermarkData.title,

          paper: response.data.paper,

          auditTrail:
            response.data.auditTrail || [],
        });

        return;
      }

      // ----------------------------------------
      // WATERMARK EXISTS BUT NO DB MATCH
      // ----------------------------------------

      setVerificationResult({
        verified: true,
        matchFound: false,

        fingerprint:
          watermarkData.fingerprint,

        traceId: watermarkData.traceId,

        title: watermarkData.title,

        reason:
          "TracePaper watermark detected, but no matching paper was found in the database.",
      });
    } catch (err) {
      console.error(
        "Paper verification error:",
        err
      );

      // ----------------------------------------
      // BACKEND 404 = NO MATCH
      // ----------------------------------------

      if (
        err.response?.status === 404
      ) {
        setVerificationResult({
          verified: true,
          matchFound: false,

          reason:
            err.response?.data?.message ||
            "No matching question paper found.",
        });

        return;
      }

      setVerificationError(
        err.response?.data?.message ||
          err.message ||
          "Paper verification failed."
      );
    } finally {
      setVerifyingPaper(false);
    }
  };

  // ============================================
  // CREATE INVESTIGATION FROM MATCHED PAPER
  // ============================================

  const handleCreateFromVerifiedPaper =
    async () => {
      if (
        !verificationResult?.matchFound ||
        !verificationResult?.paper
      ) {
        return;
      }

      const paper =
        verificationResult.paper;

      try {
        setError("");

        const examName =
          paper.exam_name ||
          paper.paper_title ||
          "Leaked Question Paper";

        const startedAt =
          paper.exam_date ||
          new Date()
            .toISOString()
            .split("T")[0];

        // --------------------------------------
        // CREATE INVESTIGATION
        // --------------------------------------

        await axios.post(
          API_URL,
          {
            title: `Paper Leak Investigation - ${examName}`,

            status: "investigating",

            priority: "high",

            started_at: startedAt,
          },
          getAuthConfig()
        );

        // --------------------------------------
        // RECORD PAPER EVENT
        // --------------------------------------

        if (paper.id) {
          try {
            await axios.put(
              `http://localhost:5000/api/question-papers/${paper.id}/event`,
              {
                action:
                  "LEAK_DETECTED",

                description:
                  `Potential leaked copy verified against ${paper.paper_code}. Investigation initiated.`,
              },
              getAuthConfig()
            );
          } catch (eventError) {
            console.warn(
              "Paper event logging failed:",
              eventError
            );
          }

          // ------------------------------------
          // UPDATE PAPER STATUS
          // ------------------------------------

          try {
            await axios.put(
              `http://localhost:5000/api/question-papers/${paper.id}/status`,
              {
                status: "leaked",
              },
              getAuthConfig()
            );
          } catch (statusError) {
            console.warn(
              "Paper status update failed:",
              statusError
            );
          }
        }

        // --------------------------------------
        // REFRESH CASES
        // --------------------------------------

        await fetchInvestigations();

        // --------------------------------------
        // CLOSE MODAL
        // --------------------------------------

        closeVerifyModal();

        // --------------------------------------
        // SUCCESS MESSAGE
        // --------------------------------------

        setError("");

        alert(
          `Investigation created successfully for ${paper.paper_code}.`
        );
      } catch (err) {
        console.error(
          "Create leak investigation error:",
          err
        );

        setVerificationError(
          err.response?.data?.message ||
            "Failed to create investigation."
        );
      }
    };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-8">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Investigation Cases
          </h1>

          <p className="text-slate-500 mt-2">
            Monitor exam integrity investigations
            and risk outcomes
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          {/* VERIFY LEAKED PAPER */}

          <button
            onClick={openVerifyModal}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-red-700 transition shadow-sm"
          >
            <ShieldAlert size={19} />

            Verify Leaked Paper
          </button>

          {/* CREATE CASE */}

          <button
            onClick={() =>
              setShowCreateModal(true)
            }
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={19} />

            Create Case
          </button>

        </div>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ======================================
          CASE REGISTER
      ====================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-100">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Case Register
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Active exam security investigation
                records
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              {/* SEARCH */}

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search cases"
                  className="w-full sm:w-72 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>

              {/* FILTER */}

              <button
                onClick={() =>
                  setShowFilter(!showFilter)
                }
                className={`flex items-center justify-center gap-2 border px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  showFilter
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter size={17} />

                Filter
              </button>

            </div>
          </div>

          {/* FILTER PANEL */}

          {showFilter && (
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">
                      All Statuses
                    </option>

                    <option value="Active">
                      Active
                    </option>

                    <option value="Under Review">
                      Under Review
                    </option>

                    <option value="Closed">
                      Closed
                    </option>
                  </select>

                </div>

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Risk Level
                  </label>

                  <select
                    value={riskFilter}
                    onChange={(e) =>
                      setRiskFilter(
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">
                      All Risk Levels
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>

                </div>

                <div className="flex items-end">

                  <button
                    onClick={resetFilters}
                    className="w-full md:w-auto border border-slate-200 bg-white px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    Reset Filters
                  </button>

                </div>

              </div>
            </div>
          )}
        </div>

        {/* ====================================
            TABLE
        ==================================== */}

        <div className="overflow-x-auto">

          <table className="min-w-full text-left">

            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">

                <th className="px-6 py-4">
                  Case ID
                </th>

                <th className="px-6 py-4">
                  Exam Name
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Risk Level
                </th>

                <th className="px-6 py-4">
                  Date
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Loading investigation cases...
                  </td>
                </tr>

              ) : filteredCases.length > 0 ? (

                filteredCases.map((item) => {

                  const status =
                    formatStatus(
                      item.status
                    );

                  const risk =
                    formatRisk(
                      item.priority
                    );

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-5 font-semibold">

                        <button
                          onClick={() =>
                            navigate(
                              `/investigations/${item.investigation_code}`
                            )
                          }
                          className="text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          {
                            item.investigation_code
                          }
                        </button>

                      </td>

                      <td className="px-6 py-5 text-slate-700">
                        {item.exam_name ||
                          item.title}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusClasses[
                              status
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {status}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            riskClasses[
                              risk
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {risk}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {formatDate(
                          item.started_at
                        )}
                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center"
                  >

                    <div className="text-slate-400">

                      <Search
                        size={32}
                        className="mx-auto mb-3"
                      />

                      <p className="font-medium text-slate-600">
                        No investigation cases found
                      </p>

                      <p className="text-sm mt-1">
                        Try changing your search
                        or filters.
                      </p>

                    </div>

                  </td>
                </tr>

              )}

            </tbody>
          </table>
        </div>

        {/* RESULT COUNT */}

        <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-500">

          Showing{" "}

          <span className="font-semibold text-slate-700">
            {filteredCases.length}
          </span>{" "}

          of{" "}

          <span className="font-semibold text-slate-700">
            {cases.length}
          </span>{" "}

          cases

        </div>
      </div>

      {/* ======================================
          CREATE CASE MODAL
      ====================================== */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">

            <div className="flex items-center justify-between p-6 border-b border-slate-100">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Create Investigation Case
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add a new exam security
                  investigation
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X
                  size={20}
                  className="text-slate-500"
                />
              </button>

            </div>

            <form
              onSubmit={handleCreateCase}
              className="p-6 space-y-5"
            >

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Exam Name
                </label>

                <input
                  type="text"
                  value={newCase.examName}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      examName:
                        e.target.value,
                    })
                  }
                  placeholder="Enter exam name"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>

                <select
                  value={newCase.status}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      status:
                        e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Under Review">
                    Under Review
                  </option>

                  <option value="Closed">
                    Closed
                  </option>
                </select>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Risk Level
                </label>

                <select
                  value={newCase.riskLevel}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      riskLevel:
                        e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>
                </select>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Investigation Date
                </label>

                <input
                  type="date"
                  value={newCase.date}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      date: e.target.value,
                    })
                  }
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Create Case
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================
          VERIFY LEAKED PAPER MODAL
      ====================================== */}

      {showVerifyModal && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">

          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between p-6 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                  <FileSearch
                    size={22}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Verify Leaked Question Paper
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Detect the TracePaper fingerprint
                    embedded in the PDF
                  </p>
                </div>

              </div>

              <button
                onClick={closeVerifyModal}
                disabled={verifyingPaper}
                className="p-2 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
              >
                <X
                  size={20}
                  className="text-slate-500"
                />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-6 space-y-6">

              {/* UPLOAD AREA */}

              <label
                htmlFor="leaked-paper-upload"
                className="block border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
              >

                <input
                  id="leaked-paper-upload"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <Upload
                  size={34}
                  className="mx-auto text-slate-400 mb-3"
                />

                <p className="font-semibold text-slate-700">
                  {selectedFile
                    ? selectedFile.name
                    : "Upload leaked PDF"}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Only PDF files are supported
                </p>

              </label>

              {/* SELECTED FILE */}

              {selectedFile && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Selected File
                      </p>

                      <p className="text-sm text-slate-500 mt-1 break-all">
                        {selectedFile.name}
                      </p>
                    </div>

                    <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                      PDF
                    </div>

                  </div>
                </div>
              )}

              {/* VERIFICATION ERROR */}

              {verificationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">

                  <AlertTriangle
                    size={20}
                    className="text-red-600 shrink-0 mt-0.5"
                  />

                  <p className="text-sm text-red-700">
                    {verificationError}
                  </p>

                </div>
              )}

              {/* ==================================
                  VERIFICATION RESULT
              ================================== */}

              {verificationResult && (

                <div
                  className={`rounded-2xl border p-5 ${
                    verificationResult.matchFound
                      ? "bg-emerald-50 border-emerald-200"
                      : verificationResult.verified
                      ? "bg-amber-50 border-amber-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >

                  {/* MATCH FOUND */}

                  {verificationResult.matchFound ? (

                    <>
                      <div className="flex items-center gap-3">

                        <CheckCircle2
                          size={28}
                          className="text-emerald-600"
                        />

                        <div>
                          <h3 className="font-bold text-emerald-800">
                            Original Paper Identified
                          </h3>

                          <p className="text-sm text-emerald-700 mt-1">
                            The leaked PDF contains a valid
                            TracePaper fingerprint.
                          </p>
                        </div>

                      </div>

                      {/* PAPER DETAILS */}

                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="bg-white rounded-xl p-4 border border-emerald-100">

                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Paper Code
                          </p>

                          <p className="font-bold text-slate-800 mt-1">
                            {
                              verificationResult
                                .paper
                                ?.paper_code || "-"
                            }
                          </p>

                        </div>

                        <div className="bg-white rounded-xl p-4 border border-emerald-100">

                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Exam
                          </p>

                          <p className="font-bold text-slate-800 mt-1">
                            {
                              verificationResult
                                .paper
                                ?.exam_name || "-"
                            }
                          </p>

                        </div>

                        <div className="bg-white rounded-xl p-4 border border-emerald-100">

                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Subject
                          </p>

                          <p className="font-bold text-slate-800 mt-1">
                            {
                              verificationResult
                                .paper
                                ?.subject || "-"
                            }
                          </p>

                        </div>

                        <div className="bg-white rounded-xl p-4 border border-emerald-100">

                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Uploaded By
                          </p>

                          <p className="font-bold text-slate-800 mt-1">
                            {
                              verificationResult
                                .paper
                                ?.uploaded_by_name ||
                              "-"
                            }
                          </p>

                        </div>

                      </div>

                      {/* TRACE ID */}

                      {verificationResult.traceId && (
                        <div className="mt-4 bg-white rounded-xl p-4 border border-emerald-100">

                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Trace ID
                          </p>

                          <p className="font-mono text-sm text-slate-700 mt-1 break-all">
                            {
                              verificationResult.traceId
                            }
                          </p>

                        </div>
                      )}

                      {/* FINGERPRINT */}

                      {verificationResult.fingerprint && (
                        <div className="mt-4 bg-white rounded-xl p-4 border border-emerald-100">

                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Fingerprint
                          </p>

                          <p className="font-mono text-xs text-slate-600 mt-1 break-all">
                            {
                              verificationResult.fingerprint
                            }
                          </p>

                        </div>
                      )}

                      {/* CREATE INVESTIGATION */}

                      <button
                        onClick={
                          handleCreateFromVerifiedPaper
                        }
                        className="mt-5 w-full flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
                      >
                        <ShieldAlert size={19} />

                        Create High-Risk Investigation
                      </button>
                    </>

                  ) : verificationResult.verified ? (

                    /* WATERMARK FOUND BUT NO DB MATCH */

                    <div className="flex gap-3">

                      <AlertTriangle
                        size={26}
                        className="text-amber-600 shrink-0"
                      />

                      <div>

                        <h3 className="font-bold text-amber-800">
                          TracePaper Watermark Detected
                        </h3>

                        <p className="text-sm text-amber-700 mt-1">
                          The PDF contains a TracePaper
                          fingerprint, but the fingerprint
                          could not be matched with a
                          registered paper.
                        </p>

                        {verificationResult.fingerprint && (
                          <p className="font-mono text-xs text-amber-800 mt-3 break-all">
                            {
                              verificationResult
                                .fingerprint
                            }
                          </p>
                        )}

                      </div>

                    </div>

                  ) : (

                    /* NO WATERMARK */

                    <div className="flex gap-3">

                      <ShieldAlert
                        size={26}
                        className="text-red-600 shrink-0"
                      />

                      <div>

                        <h3 className="font-bold text-red-800">
                          TracePaper Watermark Not Found
                        </h3>

                        <p className="text-sm text-red-700 mt-1">
                          This PDF does not contain a valid
                          TracePaper invisible watermark.
                        </p>

                        <p className="text-xs text-red-600 mt-2">
                          The document may have been created
                          outside TracePaper or its metadata
                          may have been removed.
                        </p>

                      </div>

                    </div>

                  )}

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">

              <button
                onClick={closeVerifyModal}
                disabled={verifyingPaper}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Close
              </button>

              <button
                onClick={handleVerifyPaper}
                disabled={
                  !selectedFile ||
                  verifyingPaper
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >

                {verifyingPaper ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />

                    Verify Paper
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}