import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Bell,
  Search,
  UserCircle,
  ChevronDown,
  Settings,
  LogOut,
  User,
  ShieldAlert,
  FileSearch,
  FileText,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Navbar() {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  // ============================================
  // USER
  // ============================================

  const [user, setUser] = useState({
    id: null,
    name: "User",
    email: "",
    role: "User",
  });

  // ============================================
  // SETTINGS
  // ============================================

  const [settings, setSettings] = useState({
    emailNotifications: true,
    securityAlerts: true,
    investigationAlerts: true,
  });

  // ============================================
  // NOTIFICATIONS
  // ============================================

  const [notifications, setNotifications] =
    useState([]);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  // ============================================
  // LOAD USER + SETTINGS
  // ============================================

  useEffect(() => {
    const loadData = () => {
      try {
        const savedUser = JSON.parse(
          localStorage.getItem("tracepaper_user") || "{}"
        );

        const savedSettings = JSON.parse(
          localStorage.getItem("tracepaper_settings") || "{}"
        );

        setUser({
          id: savedUser.id || null,

          name:
            savedUser.full_name ||
            savedUser.name ||
            "User",

          email:
            savedUser.email ||
            "",

          role:
            savedUser.role ||
            "User",
        });

        setSettings({
          emailNotifications:
            savedSettings.emailNotifications ?? true,

          securityAlerts:
            savedSettings.securityAlerts ?? true,

          investigationAlerts:
            savedSettings.investigationAlerts ?? true,
        });

      } catch (error) {
        console.error(
          "Failed to load navbar data:",
          error
        );
      }
    };

    loadData();

    window.addEventListener(
      "tracepaper-settings-updated",
      loadData
    );

    window.addEventListener(
      "tracepaper-user-updated",
      loadData
    );

    return () => {
      window.removeEventListener(
        "tracepaper-settings-updated",
        loadData
      );

      window.removeEventListener(
        "tracepaper-user-updated",
        loadData
      );
    };
  }, []);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================

  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await axios.get(
        `${API_URL}/notifications`
      );

      if (
        response.data?.status === "success"
      ) {
        setNotifications(
          response.data.notifications || []
        );
      }

    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  // ============================================
  // FILTER NOTIFICATIONS USING SETTINGS
  // ============================================

  const visibleNotifications =
    notifications.filter((item) => {
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

  // ============================================
  // FORMAT TIME
  // ============================================

  const formatTime = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);
    const now = new Date();

    const diff =
      Math.floor(
        (now - notificationDate) / 1000
      );

    if (diff < 60) {
      return "Just now";
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)} min ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hour ago`;
    }

    if (diff < 172800) {
      return "Yesterday";
    }

    return notificationDate.toLocaleDateString();
  };

  // ============================================
  // NOTIFICATION ICON
  // ============================================

  const getNotificationIcon = (type) => {
    if (type === "security") {
      return (
        <ShieldAlert
          size={18}
          className="text-red-500"
        />
      );
    }

    if (type === "investigation") {
      return (
        <FileSearch
          size={18}
          className="text-blue-500"
        />
      );
    }

    return (
      <FileText
        size={18}
        className="text-green-500"
      />
    );
  };

  // ============================================
  // ROLE FORMAT
  // ============================================

  const formatRole = (role) => {
    if (!role) return "User";

    return role
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem(
      "tracepaper_auth"
    );

    localStorage.removeItem(
      "tracepaper_user"
    );

    localStorage.removeItem(
      "tracepaper_token"
    );

    setShowProfile(false);

    navigate("/login", {
      replace: true,
    });
  };

  // ============================================
  // PROFILE
  // ============================================

  const handleProfile = () => {
    setShowProfile(false);

    navigate("/settings");
  };

  return (
    <header className="app-navbar relative z-40 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6">

      {/* ==========================================
          SEARCH
      ========================================== */}

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

      {/* ==========================================
          RIGHT SIDE
      ========================================== */}

      <div className="flex items-center gap-8">

        {/* ========================================
            NOTIFICATIONS
        ======================================== */}

        <div className="relative">

          <button
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
            className="relative p-2 rounded-xl hover:bg-slate-100 transition"
          >

            <Bell
              size={24}
              className="text-slate-700"
            />

            {visibleNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {visibleNotifications.length}
              </span>
            )}

          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">

              {/* Header */}

              <div className="p-4 border-b flex items-center justify-between">

                <div>

                  <h2 className="font-bold text-slate-800">
                    Notifications
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Latest TracePaper activity
                  </p>

                </div>

                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                  {visibleNotifications.length} alerts
                </span>

              </div>

              {/* Loading */}

              {loadingNotifications ? (
                <div className="p-6 text-center">

                  <p className="text-sm text-slate-500">
                    Loading notifications...
                  </p>

                </div>
              ) : visibleNotifications.length > 0 ? (

                <div className="max-h-[360px] overflow-y-auto">

                  {visibleNotifications.map(
                    (item, index) => (
                      <div
                        key={`${item.created_at}-${index}`}
                        className="px-4 py-4 hover:bg-slate-50 border-b border-slate-100 transition"
                      >

                        <div className="flex gap-3">

                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {getNotificationIcon(
                              item.type
                            )}
                          </div>

                          <div className="min-w-0">

                            <p className="font-semibold text-sm text-slate-800">
                              {item.title}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {item.message}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-2">
                              {formatTime(
                                item.created_at
                              )}
                            </p>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="p-8 text-center">

                  <Bell
                    size={32}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="font-medium text-slate-600">
                    No notifications
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    You're all caught up.
                  </p>

                </div>

              )}

              {/* Footer */}

              <button
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/audit-trail");
                }}
                className="w-full p-3 text-blue-600 font-medium hover:bg-slate-50 transition"
              >
                View All Notifications
              </button>

            </div>
          )}

        </div>

        {/* ========================================
            PROFILE
        ======================================== */}

        <div className="relative z-50">

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

              <h2 className="font-semibold text-slate-800">
                {user.name}
              </h2>

              <p className="text-xs text-slate-500">
                {formatRole(user.role)}
              </p>

            </div>

            <ChevronDown size={18} />

          </button>

          {/* Profile Dropdown */}

          {showProfile && (
            <div className="absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-[60] overflow-hidden">

              {/* User Info */}

              <div className="px-4 py-4 bg-slate-50 border-b">

                <div className="flex items-center gap-3">

                  <UserCircle
                    size={42}
                    className="text-blue-600"
                  />

                  <div className="min-w-0">

                    <p className="font-semibold text-slate-800 truncate">
                      {user.name}
                    </p>

                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>

                  </div>

                </div>

              </div>

              {/* Profile */}

              <button
                onClick={handleProfile}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left"
              >

                <User size={18} />

                <span className="font-medium">
                  Profile
                </span>

              </button>

              {/* Settings */}

              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left"
              >

                <Settings size={18} />

                <span className="font-medium">
                  Settings
                </span>

              </button>

              {/* Logout */}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-b-2xl text-left"
              >

                <LogOut size={18} />

                <span className="font-medium">
                  Logout
                </span>

              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}