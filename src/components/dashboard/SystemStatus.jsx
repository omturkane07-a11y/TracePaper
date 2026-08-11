import {
  CheckCircle,
  AlertTriangle,
  Database,
  ShieldCheck,
} from "lucide-react";

const statusData = [
  {
    title: "AI Detection Engine",
    status: "Online",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Database",
    status: "Healthy",
    icon: Database,
    color: "text-blue-600",
  },
  {
    title: "Security Monitor",
    status: "Protected",
    icon: ShieldCheck,
    color: "text-emerald-600",
  },
  {
    title: "Leak Alerts",
    status: "2 Active",
    icon: AlertTriangle,
    color: "text-red-600",
  },
];

export default function SystemStatus() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          System Status
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Current system health
        </p>
      </div>

      {/* Status List */}
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