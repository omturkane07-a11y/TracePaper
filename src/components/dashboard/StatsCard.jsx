import { TrendingUp } from "lucide-react";

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-between items-start">

      <div>
        <p className="text-slate-500 text-sm">
          {title}
        </p>

        <h2 className="text-3xl font-bold mt-2 text-slate-800">
          {value}
        </h2>

        <div className="flex items-center gap-1 mt-4 text-green-600 text-sm">
          <TrendingUp size={16} />

          <span>
            {change}
          </span>
        </div>
      </div>

      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon
          size={28}
          className="text-white"
        />
      </div>

    </div>
  );
}