import { useEffect, useState } from "react";
import axios from "axios";

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
  // ============================================
  // ANALYTICS STATE
  // ============================================

  const [analytics, setAnalytics] = useState({
    stats: {
      totalCases: 0,
      leakDetected: 0,
      resolved: 0,
    },
    riskDistribution: [],
    monthlyInvestigations: [],
    sourceAnalysis: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FETCH ANALYTICS
  // ============================================

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:5000/api/analytics"
        );

        if (response.data.success) {
          setAnalytics(response.data);
        }
      } catch (err) {
        console.error("Analytics error:", err);

        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // ============================================
  // STATS
  // ============================================

  const stats = [
    {
      label: "Total Cases",
      value: analytics.stats.totalCases,
      detail: "Open + closed investigations",
    },
    {
      label: "Leak Detected",
      value: analytics.stats.leakDetected,
      detail: "Confirmed source signals",
    },
    {
      label: "Resolved",
      value: analytics.stats.resolved,
      detail: "Closure actions completed",
    },
  ];

  // ============================================
  // REAL DATABASE DATA
  // ============================================

  const riskDistributionData = analytics.riskDistribution;

  const monthlyData = analytics.monthlyInvestigations;

  const sourceAnalysisData = analytics.sourceAnalysis;

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
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

        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Enterprise Analytics
        </h1>

        <p className="text-slate-500 mt-2">
          Risk intelligence, leak pattern monitoring, and investigation flow
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >
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

            <p className="text-xs text-slate-500 mt-4">
              {stat.detail}
            </p>
          </div>
        ))}
      </section>

      {/* Risk + Source */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Risk Distribution */}
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
            {riskDistributionData.length > 0 ? (
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
                      <Cell
                        key={entry.name}
                        fill={
                          ["#2563EB", "#10B981", "#F59E0B", "#EF4444"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400">
                  No investigation data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Source Analysis */}
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
            {sourceAnalysisData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sourceAnalysisData}
                  margin={{ left: -30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="source" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400">
                  No source data available
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Monthly Investigations */}
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

          <span className="text-sm text-slate-500">
            {new Date().getFullYear()}
          </span>
        </div>

        <div className="h-80">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="investigations"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-400">
                No monthly investigation data available
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}