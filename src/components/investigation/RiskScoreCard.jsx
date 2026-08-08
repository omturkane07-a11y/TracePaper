export default function RiskScoreCard({
  score = 87,
  level = "High",
}) {

  const getColor = () => {
    if (score >= 80) {
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        progress: "bg-red-500",
      };
    }

    if (score >= 50) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        progress: "bg-yellow-500",
      };
    }

    return {
      bg: "bg-green-100",
      text: "text-green-700",
      progress: "bg-green-500",
    };
  };

  const color = getColor();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-5">
        AI Risk Assessment
      </h2>

      <div className="flex items-center justify-between">

        <div>

          <p className="text-slate-500 text-sm">
            Risk Score
          </p>

          <h1 className="text-5xl font-bold mt-2">
            {score}%
          </h1>

        </div>

        <span
          className={`px-4 py-2 rounded-full font-semibold ${color.bg} ${color.text}`}
        >
          {level}
        </span>

      </div>

      <div className="w-full bg-slate-200 rounded-full h-3 mt-6">

        <div
          className={`${color.progress} h-3 rounded-full`}
          style={{ width: `${score}%` }}
        ></div>

      </div>

      <div className="mt-6 space-y-3 text-sm">

        <div>🔴 Multiple suspicious login attempts</div>

        <div>🟠 Unusual paper access pattern</div>

        <div>🟡 AI flagged abnormal download activity</div>

      </div>

      <div className="mt-6 p-4 rounded-xl bg-slate-100">

        <p className="font-semibold">
          AI Recommendation
        </p>

        <p className="text-slate-600 mt-2">
          Immediate investigation recommended due to high-risk indicators.
        </p>

      </div>

    </div>
  );
}