import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  Search,
  UserCircle,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState({
    name: "Om Turkane",
    email: "admin@tracepaper.com",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    securityAlerts: true,
    investigationAlerts: true,
  });

  // ================= LOAD USER + SETTINGS =================

  useEffect(() => {
    const loadData = () => {
      const savedUser = JSON.parse(
        localStorage.getItem("tracepaper_user") || "{}"
      );

      const savedSettings = JSON.parse(
        localStorage.getItem("tracepaper_settings") || "{}"
      );

      setUser({
        name: savedUser.name || "Om Turkane",
        email: savedUser.email || "admin@tracepaper.com",
      });

      setSettings({
        emailNotifications:
          savedSettings.emailNotifications ?? true,

        securityAlerts:
          savedSettings.securityAlerts ?? true,

        investigationAlerts:
          savedSettings.investigationAlerts ?? true,
      });
    };

    loadData();

    window.addEventListener(
      "tracepaper-settings-updated",
      loadData
    );

    return () => {
      window.removeEventListener(
        "tracepaper-settings-updated",
        loadData
      );
    };
  }, []);

  // ================= NOTIFICATIONS =================

  const notifications = [
    {
      title: "High Risk Case Detected",
      time: "2 min ago",
      type: "security",
    },
    {
      title: "New Investigation Assigned",
      time: "10 min ago",
      type: "investigation",
    },
    {
      title: "Monthly Report Generated",
      time: "1 hour ago",
      type: "email",
    },
  ];

  const visibleNotifications = notifications.filter((item) => {
    if (
      item.type === "security" &&
      !settings.securityAlerts
    ) {
      return false;
    }

    if (
      item.type === "investigation" &&
      !settings.investigationAlerts
    ) {
      return false;
    }

    if (
      item.type === "email" &&
      !settings.emailNotifications
    ) {
      return false;
    }

    return true;
  });

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("tracepaper_auth");

    setShowProfile(false);

    navigate("/login", {
      replace: true,
    });
  };

  // ================= PROFILE =================

  const handleProfile = () => {
    setShowProfile(false);

    navigate("/settings");
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6">

      {/* ================= SEARCH ================= */}

      <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3 w-[420px]">

        <Search
          size={18}
          className="text-slate-500"
        />

        <input
          type="text"
          placeholder="Search investigations..."
          className="bg-transparent outline-none ml-3 w-full text-sm"
        />

      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="flex items-center gap-8">

        {/* ================= NOTIFICATIONS ================= */}

        <div className="relative">

          <button
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
            className="relative p-2 rounded-xl hover:bg-slate-100 transition"
          >

            <Bell
              size={24}
              className="text-slate-700"
            />

            {visibleNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {visibleNotifications.length}
              </span>
            )}

          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50">

              <div className="p-4 border-b flex items-center justify-between">

                <h2 className="font-bold">
                  Notifications
                </h2>

                <span className="text-xs text-slate-500">
                  {visibleNotifications.length} alerts
                </span>

              </div>

              {visibleNotifications.length > 0 ? (
                visibleNotifications.map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-slate-50 border-b"
                  >

                    <p className="font-medium text-sm">
                      {item.title}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {item.time}
                    </p>

                  </div>
                ))
              ) : (
                <div className="p-6 text-center">

                  <Bell
                    size={28}
                    className="mx-auto text-slate-300 mb-2"
                  />

                  <p className="text-sm text-slate-500">
                    No notifications
                  </p>

                </div>
              )}

              <button
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/audit-trail");
                }}
                className="w-full p-3 text-blue-600 font-medium hover:bg-slate-50 rounded-b-2xl"
              >
                View All
              </button>

            </div>
          )}

        </div>

        {/* ================= PROFILE ================= */}

        <div className="relative">

          <button
            onClick={() =>
              setShowProfile(!showProfile)
            }
            className="flex items-center gap-3 hover:bg-slate-100 px-3 py-2 rounded-xl transition"
          >

            <UserCircle
              size={40}
              className="text-blue-600"
            />

            <div className="text-left">

              <h2 className="font-semibold">
                {user.name}
              </h2>

              <p className="text-xs text-slate-500">
                Administrator
              </p>

            </div>

            <ChevronDown size={18} />

          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50">

              {/* Profile */}

              <button
                onClick={handleProfile}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >

                <User size={18} />

                <div className="text-left">

                  <p className="font-medium">
                    Profile
                  </p>

                  <p className="text-xs text-slate-400 truncate max-w-[150px]">
                    {user.email}
                  </p>

                </div>

              </button>

              {/* Settings */}

              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >

                <Settings size={18} />

                Settings

              </button>

              {/* Logout */}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-b-2xl"
              >

                <LogOut size={18} />

                Logout

              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}