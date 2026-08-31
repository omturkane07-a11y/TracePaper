import { NavLink } from "react-router-dom";
import logo from "../../assets/tracepaper-logo.png";

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
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({ collapsed, onToggle }) {
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
    <aside
      className={`
      app-sidebar
        relative
        min-h-screen
        bg-slate-950
        text-white
        flex
        flex-col
        shrink-0
        transition-all
        duration-300
        ease-in-out
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* ================= HEADER ================= */}

      <div
        className={`
          relative
          h-20
          border-b
          border-slate-800
          flex
          items-center
          transition-all
          duration-300
          ${collapsed ? "justify-center px-2" : "px-6"}
        `}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="TracePaper Logo"
              className="
                w-[40px]
                h-[40px]
                shrink-0
                object-contain
                transition-all
                duration-300
              "
            />

            <div className="overflow-hidden whitespace-nowrap leading-none">
              <h1 className="text-[20px] font-bold tracking-wide leading-none">
                TracePaper
              </h1>

              <p className="text-xs text-slate-400 leading-none mt-1">
                Enterprise Security
              </p>
            </div>
          </div>
        )}

        {/* ================= TOGGLE BUTTON ================= */}

        <button
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className={`
            absolute
            top-6
            z-50

            flex
            items-center
            justify-center

            w-8
            h-8

            rounded-lg

            bg-blue-600
            border
            border-blue-400

            text-white

            shadow-lg
            shadow-blue-600/30

            hover:bg-blue-500
            hover:scale-105

            transition-all
            duration-300

            ${
              collapsed
                ? "left-1/2 -translate-x-1/2"
                : "right-2"
            }
          `}
        >
          {collapsed ? (
            <Menu size={17} />
          ) : (
            <X size={17} />
          )}
        </button>
      </div>

      {/* ================= MENU ================= */}

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={
                collapsed
                  ? item.title
                  : undefined
              }
              className={({ isActive }) =>
                `
                group
                relative
                flex
                items-center
                ${
                  collapsed
                    ? "justify-center"
                    : "gap-3"
                }

                px-4
                py-3
                rounded-xl

                transition-all
                duration-200

                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }
                `
              }
            >
              {/* ICON */}

              <Icon
                size={20}
                className="shrink-0"
              />

              {/* TITLE */}

              {!collapsed && (
                <span className="font-medium whitespace-nowrap">
                  {item.title}
                </span>
              )}

              {/* ================= TOOLTIP ================= */}

              {collapsed && (
                <span
                  className="
                    absolute
                    left-full
                    ml-3

                    px-3
                    py-2

                    rounded-lg

                    bg-slate-900
                    border
                    border-slate-700

                    text-white
                    text-sm
                    whitespace-nowrap

                    opacity-0
                    invisible

                    group-hover:opacity-100
                    group-hover:visible

                    transition-all
                    duration-200

                    z-50
                    shadow-xl
                  "
                >
                  {item.title}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ================= SECURITY STATUS ================= */}

      {!collapsed && (
        <div className="p-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-900">
            <div className="flex items-center gap-2">
              <div
                className="
                  w-2.5
                  h-2.5
                  bg-emerald-500
                  rounded-full
                  animate-pulse
                "
              />

              <span className="text-sm font-semibold text-slate-200">
                System Secure
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              TracePaper security services active
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}