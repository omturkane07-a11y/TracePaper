import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  FilePlus2,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      title: "Question Paper",
      path: "/question-paper",
      icon: FilePlus2,
    },

    {
      title: "Watermark Verification",
      path: "/watermark-verification",
      icon: ShieldCheck,
    },

    {
      title: "Investigations",
      path: "/investigations",
      icon: FileSearch,
    },

    {
      title: "Leak Alerts",
      path: "/leak-alerts",
      icon: ShieldAlert,
    },

    {
      title: "Reports",
      path: "/reports",
      icon: FileText,
    },

    {
      title: "Users",
      path: "/users",
      icon: Users,
    },

    {
      title: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },

    {
      title: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col">

      {/* LOGO */}

      <div className="h-20 px-6 flex items-center border-b border-slate-800">

        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mr-3">

          <ShieldCheck size={22} />

        </div>

        <div>

          <h1 className="text-lg font-bold tracking-wide">
            TracePaper
          </h1>

          <p className="text-xs text-slate-400">
            Enterprise Security
          </p>

        </div>

      </div>

      {/* MENU */}

      <nav className="flex-1 p-4 space-y-2">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`
              }
            >

              <Icon size={20} />

              <span className="font-medium">
                {item.title}
              </span>

            </NavLink>
          );

        })}

      </nav>

      {/* SECURITY STATUS */}

      <div className="p-4 border-t border-slate-800">

        <div className="p-4 rounded-xl bg-slate-900">

          <div className="flex items-center gap-2">

            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />

            <span className="text-sm font-semibold text-slate-200">
              System Secure
            </span>

          </div>

          <p className="text-xs text-slate-500 mt-2">
            TracePaper security services active
          </p>

        </div>

      </div>

    </aside>
  );
}