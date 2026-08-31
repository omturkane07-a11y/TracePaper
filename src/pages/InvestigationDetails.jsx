import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  Users,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/investigations";

export default function InvestigationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD INVESTIGATION FROM NEON
  // ============================================

  useEffect(() => {
    const fetchInvestigation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/${id}`);

        if (response.data.status === "success") {
          setInvestigation(response.data.investigation);
        }
      } catch (err) {
        console.error("Investigation details error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load investigation details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvestigation();
  }, [id]);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">
          Loading investigation details...
        </p>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
        {error}
      </div>
    );
  }

  // ============================================
  // NOT FOUND
  // ============================================

  if (!investigation) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">
          Investigation not found.
        </p>
      </div>
    );
  }

  // ============================================
  // DATABASE → UI FORMAT
  // ============================================

  const statusMap = {
    open: "Active",
    investigating: "Under Review",
    resolved: "Resolved",
    closed: "Closed",
  };

  const riskMap = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  const status =
    statusMap[investigation.status] ||
    investigation.status;

  const riskLevel =
    riskMap[investigation.priority] ||
    investigation.priority;

  const formattedDate = investigation.started_at
    ? new Date(investigation.started_at).toLocaleDateString("en-CA")
    : "-";

  return (
    <div className="space-y-8">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div>
          <div className="flex items-center gap-3 flex-wrap">

            <h1 className="text-3xl font-bold text-slate-800">
              {investigation.investigation_code}
            </h1>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === "Active"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "Under Review"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {status}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                riskLevel === "High" ||
                riskLevel === "Critical"
                  ? "bg-red-100 text-red-700"
                  : riskLevel === "Medium"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {riskLevel}
            </span>

          </div>

          <p className="text-slate-500 mt-2">
            {investigation.exam_name || investigation.title}
          </p>
        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
          Assign Team
        </button>

      </div>


      {/* ========================================
          CASE INFORMATION
      ======================================== */}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-slate-500">
                Risk Level
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                {riskLevel}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={28} />
            </div>

          </div>

        </article>


        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-slate-500">
                Investigation Status
              </p>

              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {status}
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
              <p className="text-sm text-slate-500">
                Assigned Investigator
              </p>

              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {investigation.investigator_id
                  ? `User #${investigation.investigator_id}`
                  : "Not Assigned"}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={28} />
            </div>

          </div>

        </article>

      </section>


      {/* ========================================
          CASE DETAILS
      ======================================== */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

        <div className="mb-6">

          <h2 className="text-xl font-bold text-slate-800">
            Investigation Details
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Information retrieved from TracePaper database
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <p className="text-sm text-slate-500">
              Investigation Code
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {investigation.investigation_code}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Exam Name
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {investigation.exam_name || investigation.title}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Investigation Date
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {formattedDate}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Priority
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {riskLevel}
            </p>
          </div>

        </div>

        {investigation.description && (
          <div className="mt-6 pt-6 border-t border-slate-100">

            <p className="text-sm text-slate-500">
              Description
            </p>

            <p className="text-slate-700 mt-2">
              {investigation.description}
            </p>

          </div>
        )}

      </section>


      {/* ========================================
          EXAM / PAPER INFORMATION
      ======================================== */}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          <h2 className="text-xl font-bold text-slate-800">
            Exam Information
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Linked examination details
          </p>

          <div className="mt-6 space-y-4">

            <div>
              <p className="text-sm text-slate-500">
                Exam Name
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {investigation.exam_name || "Not Linked"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Exam Code
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {investigation.exam_code || "Not Linked"}
              </p>
            </div>

          </div>

        </article>


        <article className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          <h2 className="text-xl font-bold text-slate-800">
            Question Paper
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Linked question paper information
          </p>

          <div className="mt-6 space-y-4">

            <div>
              <p className="text-sm text-slate-500">
                Paper Code
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {investigation.paper_code || "Not Linked"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Paper Title
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {investigation.paper_title || "Not Linked"}
              </p>
            </div>

          </div>

        </article>

      </section>


      {/* ========================================
          AUDIT TIMELINE
      ======================================== */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Audit Timeline
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Activity chronology for{" "}
              {investigation.investigation_code}
            </p>
          </div>

          <div className="flex items-center gap-2 text-slate-600">

            <Clock size={18} />

            <span className="text-sm font-medium">
              {formattedDate}
            </span>

          </div>

        </div>

        <div className="space-y-4">

          <div className="flex gap-4">

            <div className="flex flex-col items-center">

              <span className="w-3 h-3 rounded-full bg-blue-600"></span>

              <span className="w-px h-12 bg-slate-200"></span>

            </div>

            <div className="pb-4">

              <p className="text-xs font-semibold uppercase text-slate-500">
                Investigation Started
              </p>

              <p className="font-semibold text-slate-900 mt-1">
                Case registered
              </p>

              <p className="text-sm text-slate-600 mt-1">
                Investigation{" "}
                {investigation.investigation_code}{" "}
                was created in TracePaper.
              </p>

            </div>

          </div>


          <div className="flex gap-4">

            <div className="flex flex-col items-center">

              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>

            </div>

            <div>

              <p className="text-xs font-semibold uppercase text-slate-500">
                Current Status
              </p>

              <p className="font-semibold text-slate-900 mt-1">
                {status}
              </p>

              <p className="text-sm text-slate-600 mt-1">
                Current investigation status retrieved
                from Neon database.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================
          BACK BUTTON
      ======================================== */}

      <div className="flex justify-end pt-2">

        <button
          onClick={() => navigate("/investigations")}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition shadow-sm"
        >
          ← Back to Investigations
        </button>

      </div>

    </div>
  );
}