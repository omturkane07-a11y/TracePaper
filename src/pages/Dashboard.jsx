import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCard from "../components/dashboard/StatsCard";
import InvestigationChart from "../components/dashboard/InvestigationChart";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import SystemStatus from "../components/dashboard/SystemStatus";
import RecentCasesTable from "../components/dashboard/RecentCasesTable";

import { statsData } from "../data/dashboardData";

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsData.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">

        {/* LEFT SIDE */}
        <div className="xl:col-span-2 flex flex-col gap-6 min-w-0">

          {/* Investigation Chart */}
          <InvestigationChart />

          {/* Recent Leak Cases */}
          <RecentCasesTable />

        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6 min-w-0 h-full">

          {/* Activity Timeline */}
          <ActivityTimeline />

          {/* System Status - Fill remaining height */}
          <div className="flex-1 min-h-0 [&>div]:h-full">
            <SystemStatus />
          </div>

        </div>

      </div>

    </div>
  );
}