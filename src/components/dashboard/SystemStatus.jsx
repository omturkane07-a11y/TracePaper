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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 min-h-0">
      <h2 className="text-xl font-bold mb-5">
        System Status
      </h2>

      <div className="space-y-4">
        {statusData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b pb-3 last:border-none"
          >
            <div className="flex items-center gap-3">
              <item.icon className={item.color} size={22} />

              <span className="font-medium">
                {item.title}
              </span>
            </div>

            <span className="text-sm font-semibold text-slate-600">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}