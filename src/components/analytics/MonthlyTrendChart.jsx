import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { monthlyTrend } from "../../data/analyticsData";

export default function MonthlyTrendChart() {

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800">
        Monthly Leak Trend
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Last 6 Months
      </p>

      <div className="h-80 mt-6">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={monthlyTrend}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="leaks"
              stroke="#2563EB"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );

}