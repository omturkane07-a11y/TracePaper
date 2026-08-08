export default function EvidencePanel() {

  const evidence = [
    {
      title: "Paper Source Verification",
      status: "Completed",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Access Log Analysis",
      status: "Completed",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "CCTV Footage Review",
      status: "Pending",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
    },
    {
      title: "Staff Verification",
      status: "Pending",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Evidence Management
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Investigation evidence tracking
          </p>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Upload Evidence
        </button>

      </div>

      <div className="space-y-4">

        {evidence.map((item, index) => (

          <div
            key={index}
            className="flex justify-between items-center border-b border-slate-100 pb-4"
          >

            <span className="font-medium text-slate-700">
              {item.title}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${item.bg} ${item.color}`}
            >
              {item.status}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}