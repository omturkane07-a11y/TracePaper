import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Analytics() {
  const stats = [
    {
      label: "Total Cases",
      value: "42",
      detail: "Open + closed investigations",
    },
    {
      label: "Leak Detected",
      value: "17",
      detail: "Confirmed source signals",
    },
    {
      label: "Resolved",
      value: "25",
      detail: "Closure actions completed",
    },
  ];

  const riskDistributionData = [
    { name: "Low", value: 12 },
    { name: "Medium", value: 15 },
    { name: "High", value: 8 },
    { name: "Critical", value: 7 },
  ];

  const monthlyData = [
    { month: "Jan", investigations: 2 },
    { month: "Feb", investigations: 5 },
    { month: "Mar", investigations: 4 },
    { month: "Apr", investigations: 9 },
    { month: "May", investigations: 6 },
    { month: "Jun", investigations: 8 },
  ];

  const sourceAnalysisData = [
    { source: " WhatsApp", count: 5 },
    { source: "Telegram", count: 4 },
    { source: "Public Forum", count: 3 },
    { source: "Web Portal", count: 2 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Enterprise Analytics
        </h1>
        <p className="text-slate-500 mt-2">
          Risk intelligence, leak pattern monitoring, and investigation flow
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <h2 className="text-4xl font-bold text-slate-900 mt-2">
                  {stat.value}
                </h2>
              </div>
              <div className="bg-blue-50 text-blue-600 rounded-xl p-3">
                <span className="text-xl font-bold">•</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Risk Distribution
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Severity profile across all case records
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              Current Snapshot
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={100}
                  paddingAngle={3}
                  label
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={entry.name} fill={["#2563EB", "#10B981", "#F59E0B", "#EF4444"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Source Analysis
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Communication and content vectors
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceAnalysisData} margin={{ left: -30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Monthly Investigations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Investigation volume over time
            </p>
          </div>
          <span className="text-sm text-slate-500">2026</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="investigations" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}