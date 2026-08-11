import { CalendarDays } from "lucide-react";

export default function DashboardHeader() {
  const today = new Date();

  const currentDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between mb-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome to TracePaper Enterprise Dashboard
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
        <CalendarDays
          className="text-blue-600"
          size={22}
        />

        <span className="font-medium text-slate-700">
          {currentDate}
        </span>
      </div>

    </div>
  );
}