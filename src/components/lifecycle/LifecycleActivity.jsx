export default function LifecycleActivity() {

  const activities = [
    {
      title: "Paper Created",
      time: "09:00 AM",
    },
    {
      title: "Paper Printed",
      time: "10:15 AM",
    },
    {
      title: "Paper Packed",
      time: "11:00 AM",
    },
    {
      title: "Transport Started",
      time: "12:20 PM",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Recent Activities
      </h2>

      <div className="space-y-5">

        {activities.map((item, index) => (
          <div
            key={index}
            className="flex justify-between border-b pb-3"
          >
            <div>
              <p className="font-medium text-slate-800">
                {item.title}
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {item.time}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}