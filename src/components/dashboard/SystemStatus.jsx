import {
  CheckCircle,
  AlertTriangle,
  Database,
  ShieldCheck,
} from "lucide-react";

export default function SystemStatus({
  leakAlerts = 0,
  loading = false,
}) {
  const statusData = [
    {
      title: "Backend API",
      status: loading ? "Checking..." : "Online",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Neon Database",
      status: loading ? "Checking..." : "Connected",
      icon: Database,
      color: "text-blue-600",
    },
    {
      title: "Security Monitor",
      status: "Active",
      icon: ShieldCheck,
      color: "text-emerald-600",
    },
    {
      title: "Leak Alerts",
      status: loading
        ? "Checking..."
        : `${leakAlerts} Active`,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          System Status
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Current system health
        </p>
      </div>

      <div className="space-y-4">

        {statusData.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-none"
            >

              <div className="flex items-center gap-3">

                <Icon
                  className={item.color}
                  size={22}
                />

                <span className="font-medium text-slate-800">
                  {item.title}
                </span>

              </div>

              <span className="text-sm font-semibold text-slate-600">
                {item.status}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}