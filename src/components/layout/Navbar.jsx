import { useState } from "react";
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

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    {
      title: "High Risk Case Detected",
      time: "2 min ago",
    },
    {
      title: "New Investigation Assigned",
      time: "10 min ago",
    },
    {
      title: "Monthly Report Generated",
      time: "1 hour ago",
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm relative">

      {/* Search */}
      <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3 w-[420px]">

        <Search size={18} className="text-slate-500" />

        <input
          type="text"
          placeholder="Search investigations..."
          className="bg-transparent outline-none ml-3 w-full text-sm"
        />

      </div>

      {/* Right Side */}
      <div className="flex items-center gap-8">

        {/* Notification */}
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

            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>

          </button>

          {showNotifications && (

            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50">

              <div className="p-4 border-b">

                <h2 className="font-bold">
                  Notifications
                </h2>

              </div>

              {notifications.map((item, index) => (

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

              ))}

              <button className="w-full p-3 text-blue-600 font-medium hover:bg-slate-50 rounded-b-2xl">
                View All
              </button>

            </div>

          )}

        </div>

        {/* Profile */}
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
                Om Turkane
              </h2>

              <p className="text-xs text-slate-500">
                Administrator
              </p>

            </div>

            <ChevronDown size={18} />

          </button>

          {showProfile && (

            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50">

              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50">

                <User size={18} />

                Profile

              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50">

                <Settings size={18} />

                Settings

              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-b-2xl">

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