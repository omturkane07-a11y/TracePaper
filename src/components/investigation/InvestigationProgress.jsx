export default function InvestigationProgress() {

  const steps = [
    {
      title: "Case Reported",
      status: "completed",
    },
    {
      title: "Evidence Collected",
      status: "completed",
    },
    {
      title: "AI Analysis",
      status: "completed",
    },
    {
      title: "Final Verification",
      status: "active",
    },
    {
      title: "Case Closed",
      status: "pending",
    },
  ];

  const progress = 80;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800">
        Investigation Progress
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Current investigation workflow
      </p>

      <div className="mt-6">

        <div className="flex justify-between text-sm mb-2">

          <span>Progress</span>

          <span className="font-semibold">
            {progress}%
          </span>

        </div>

        <div className="w-full bg-slate-200 rounded-full h-3">

          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>

        </div>

      </div>

      <div className="mt-8 space-y-4">

        {steps.map((step, index) => (

          <div
            key={index}
            className="flex items-center justify-between border-b border-slate-100 pb-3"
          >

            <span className="font-medium text-slate-700">
              {step.title}
            </span>

            {step.status === "completed" && (
              <span className="text-green-600 font-semibold">
                ✓ Completed
              </span>
            )}

            {step.status === "active" && (
              <span className="text-blue-600 font-semibold">
                ⏳ In Progress
              </span>
            )}

            {step.status === "pending" && (
              <span className="text-slate-400 font-semibold">
                Pending
              </span>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}