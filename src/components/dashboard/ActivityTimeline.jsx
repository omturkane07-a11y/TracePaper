import {
  FileText,
  AlertTriangle,
  ScanSearch,
  ShieldCheck,
  Activity,
} from "lucide-react";

const getActivityIcon = (action = "") => {
  const value = action.toLowerCase();

  if (
    value.includes("paper") ||
    value.includes("upload")
  ) {
    return FileText;
  }

  if (
    value.includes("leak") ||
    value.includes("alert")
  ) {
    return AlertTriangle;
  }

  if (
    value.includes("scan") ||
    value.includes("investigation")
  ) {
    return ScanSearch;
  }

  if (
    value.includes("security") ||
    value.includes("verify") ||
    value.includes("watermark")
  ) {
    return ShieldCheck;
  }

  return Activity;
};

const getIconColor = (action = "") => {
  const value = action.toLowerCase();

  if (value.includes("leak") || value.includes("alert")) {
    return "text-red-600";
  }

  if (value.includes("scan")) {
    return "text-yellow-600";
  }

  if (
    value.includes("verify") ||
    value.includes("security")
  ) {
    return "text-green-600";
  }

  return "text-blue-600";
};

const formatTime = (date) => {
  if (!date) return "Unknown time";

  const activityDate = new Date(date);
  const now = new Date();

  const diff = Math.floor(
    (now - activityDate) / 1000
  );

  if (diff < 60) {
    return `${diff} sec ago`;
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)} min ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)} hour ago`;
  }

  return activityDate.toLocaleDateString();
};

export default function ActivityTimeline({ activities = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Recent Activity
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Latest activity in TracePaper
        </p>
      </div>

      <div className="space-y-4">

        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-slate-400 text-sm">
              No recent activity available
            </p>
          </div>
        ) : (
          activities.map((item, index) => {
            const Icon = getActivityIcon(item.action);

            return (
              <div
                key={`${item.created_at}-${index}`}
                className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-none"
              >

                <Icon
                  className={getIconColor(item.action)}
                  size={20}
                />

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {item.action || "System Activity"}
                  </h3>

                  <p className="text-sm text-slate-500 truncate">
                    {item.description || "Activity recorded"}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {formatTime(item.created_at)}
                  </p>
                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}