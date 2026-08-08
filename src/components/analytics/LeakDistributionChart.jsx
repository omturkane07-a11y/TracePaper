import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { leakDistribution } from "../../data/analyticsData";

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
];

export default function LeakDistributionChart() {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800">
        Leak Distribution
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        By Examination Type
      </p>

      <div className="h-80">

        <ResponsiveContainer>

          <PieChart>

            <Pie
              data={leakDistribution}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label
            >

              {leakDistribution.map((entry, index) => (

                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />

              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}