import {
  FileText,
  AlertTriangle,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

const activities = [
  {
    icon: FileText,
    title: "Paper Uploaded",
    time: "2 min ago",
    color: "text-blue-600",
  },
  {
    icon: AlertTriangle,
    title: "Leak Alert Generated",
    time: "10 min ago",
    color: "text-red-600",
  },
  {
    icon: ScanSearch,
    title: "AI Scan Completed",
    time: "25 min ago",
    color: "text-yellow-600",
  },
  {
    icon: ShieldCheck,
    title: "Watermark Verified",
    time: "1 hour ago",
    color: "text-green-600",
  },
];

export default function ActivityTimeline() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-1 min-h-0 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">
        Recent Activity
      </h2>

      <div className="space-y-4">
        {activities.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b pb-3 last:border-none"
          >
            <item.icon className={item.color} size={20} />

            <div>
              <h3 className="font-semibold">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}