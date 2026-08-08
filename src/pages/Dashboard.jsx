import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCard from "../components/dashboard/StatsCard";
import InvestigationChart from "../components/dashboard/InvestigationChart";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import SystemStatus from "../components/dashboard/SystemStatus";
import RecentCasesTable from "../components/dashboard/RecentCasesTable";

import { statsData } from "../data/dashboardData";

export default function Dashboard() {
  return (
    <div className="space-y-8">

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



      {/* Chart + Right Side Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        {/* Left - Investigation Chart */}
        <div className="xl:col-span-2">

          <InvestigationChart />

        </div>



        {/* Right - Activity & Status */}
        <div className="flex flex-col gap-6 xl:h-[680px]">

          <ActivityTimeline />

          <SystemStatus />

        </div>


      </div>



      {/* Recent Leak Cases */}

      <div>

        <RecentCasesTable />

      </div>


    </div>
  );
}