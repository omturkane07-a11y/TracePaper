import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { chartData } from "../../data/chartData";

export default function InvestigationChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[680px]">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Leak Investigation Trend
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Last 6 Months Analysis
          </p>
        </div>

      </div>


      <div className="h-[450px] mt-4">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart 
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
            />

            <XAxis 
              dataKey="month"
            />

            <YAxis />

            <Tooltip />


            <Line
              type="monotone"
              dataKey="leaks"
              stroke="#2563EB"
              strokeWidth={4}
              dot={{ r: 6 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}