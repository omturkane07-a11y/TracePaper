import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, X, Plus } from "lucide-react";

export default function Investigations() {
  const navigate = useNavigate();

  // ---------------------------------------
  // CASE DATA
  // ---------------------------------------

  const [cases, setCases] = useState([
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
  ]);

  // ---------------------------------------
  // SEARCH / FILTER STATE
  // ---------------------------------------

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  // ---------------------------------------
  // CREATE CASE STATE
  // ---------------------------------------

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newCase, setNewCase] = useState({
    examName: "",
    status: "Active",
    riskLevel: "Medium",
    date: "",
  });

  // ---------------------------------------
  // STATUS / RISK COLORS
  // ---------------------------------------

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

  // ---------------------------------------
  // SEARCH + FILTER
  // ---------------------------------------

  const filteredCases = cases.filter((item) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      item.id.toLowerCase().includes(search) ||
      item.examName.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const matchesRisk =
      riskFilter === "All" || item.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // ---------------------------------------
  // CREATE CASE
  // ---------------------------------------

  const handleCreateCase = (e) => {
    e.preventDefault();

    if (!newCase.examName.trim() || !newCase.date) {
      return;
    }

    const nextNumber =
      Math.max(
        ...cases.map((item) => Number(item.id.replace("TP-", "")))
      ) + 1;

    const createdCase = {
      id: `TP-${nextNumber}`,
      examName: newCase.examName.trim(),
      status: newCase.status,
      riskLevel: newCase.riskLevel,
      date: newCase.date,
    };

    setCases((prev) => [...prev, createdCase]);

    setNewCase({
      examName: "",
      status: "Active",
      riskLevel: "Medium",
      date: "",
    });

    setShowCreateModal(false);
  };

  // ---------------------------------------
  // RESET FILTER
  // ---------------------------------------

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setRiskFilter("All");
  };

  return (
    <div className="space-y-8">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Investigation Cases
          </h1>

          <p className="text-slate-500 mt-2">
            Monitor exam integrity investigations and risk outcomes
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={19} />
          Create Case
        </button>

      </div>

      {/* =====================================
          CASE REGISTER
      ====================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Register Header */}

        <div className="p-6 border-b border-slate-100">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Case Register
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Active exam security investigation records
              </p>
            </div>

            {/* Search + Filter */}

            <div className="flex flex-col sm:flex-row gap-3">

              {/* Search */}

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cases"
                  className="w-full sm:w-72 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>

              {/* Filter Button */}

              <button
                onClick={() => setShowFilter(!showFilter)}
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

          {/* =====================================
              FILTER PANEL
          ====================================== */}

          {showFilter && (
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Status */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Risk */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Risk Level
                  </label>

                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Risk Levels</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Reset */}

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

        {/* =====================================
            TABLE
        ====================================== */}

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

              {filteredCases.length > 0 ? (

                filteredCases.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >

                    {/* Case ID */}

                    <td className="px-6 py-5 font-semibold">

                      <button
                        onClick={() =>
                          navigate(`/investigations/${item.id}`)
                        }
                        className="text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        {item.id}
                      </button>

                    </td>

                    {/* Exam */}

                    <td className="px-6 py-5 text-slate-700">
                      {item.examName}
                    </td>

                    {/* Status */}

                    <td className="px-6 py-5">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusClasses[item.status]
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                    {/* Risk */}

                    <td className="px-6 py-5">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          riskClasses[item.riskLevel]
                        }`}
                      >
                        {item.riskLevel}
                      </span>

                    </td>

                    {/* Date */}

                    <td className="px-6 py-5 text-slate-600">
                      {item.date}
                    </td>

                  </tr>

                ))

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
                        Try changing your search or filters.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* Result Count */}

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

      {/* =====================================
          CREATE CASE MODAL
      ====================================== */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between p-6 border-b border-slate-100">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Create Investigation Case
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add a new exam security investigation
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={20} className="text-slate-500" />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleCreateCase}
              className="p-6 space-y-5"
            >

              {/* Exam Name */}

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
                      examName: e.target.value,
                    })
                  }
                  placeholder="Enter exam name"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Status */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>

                <select
                  value={newCase.status}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      status: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Closed">Closed</option>
                </select>

              </div>

              {/* Risk */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Risk Level
                </label>

                <select
                  value={newCase.riskLevel}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      riskLevel: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

              </div>

              {/* Date */}

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

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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

    </div>
  );
}