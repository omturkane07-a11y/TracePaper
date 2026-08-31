import { useNavigate } from "react-router-dom";

export default function RecentCasesTable({ cases = [] }) {
  const navigate = useNavigate();

  // =========================================================
  // OPEN PAPER / CASE
  // =========================================================
  const handleRowClick = (item) => {
    console.log("Selected item:", item);

    // Backend मधून paper id मिळाल्यास reviewer page उघडेल
    const paperId =
      item.paper_id ||
      item.paperId ||
      item.question_paper_id ||
      item.id;

    if (!paperId) {
      console.warn("Paper ID not found:", item);
      return;
    }

    // Pending review असल्यास Reviewer page
    if (
      item.workflow_status === "pending_review" ||
      item.workflowStatus === "pending_review" ||
      item.status === "Pending Review" ||
      item.status === "pending_review"
    ) {
      navigate(`/review/question-paper/${paperId}`);
      return;
    }

    // बाकी cases साठी investigation page
    navigate(`/investigations/${paperId}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

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

      {/* =====================================================
          TABLE
      ===================================================== */}

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

            {cases.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-10 text-center text-slate-400 text-sm"
                >
                  No leak cases available yet
                </td>
              </tr>
            ) : (
              cases.map((item) => {

                const isPendingReview =
                  item.workflow_status === "pending_review" ||
                  item.workflowStatus === "pending_review" ||
                  item.status === "Pending Review" ||
                  item.status === "pending_review";

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className={`border-b border-slate-100 transition ${
                      isPendingReview
                        ? "cursor-pointer hover:bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >

                    {/* =================================================
                        CASE ID
                    ================================================= */}

                    <td className="py-4 font-medium text-slate-800">
                      {item.paper_code ||
                        item.paperCode ||
                        item.id}
                    </td>

                    {/* =================================================
                        EXAM
                    ================================================= */}

                    <td className="text-slate-700">
                      {item.exam ||
                        item.paper_title ||
                        item.paperTitle ||
                        "N/A"}
                    </td>

                    {/* =================================================
                        CENTER
                    ================================================= */}

                    <td className="text-slate-700">
                      {item.center ||
                        item.exam_center ||
                        "N/A"}
                    </td>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isPendingReview
                            ? "bg-blue-100 text-blue-700"
                            : item.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Investigation"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {isPendingReview
                          ? "Pending Review"
                          : item.status || "Unknown"}
                      </span>
                    </td>

                    {/* =================================================
                        DATE
                    ================================================= */}

                    <td className="text-slate-600">
                      {item.date ||
                        item.created_at ||
                        item.createdAt ||
                        "N/A"}
                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>
      </div>

    </div>
  );
}