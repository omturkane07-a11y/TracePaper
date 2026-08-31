import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="app-shell flex min-h-screen bg-slate-50">

      {/* SIDEBAR */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-w-0">

        <Navbar />

        <main className="app-main flex-1 p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}