import { useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Bell,
  Palette,
  Lock,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const savedUser = JSON.parse(
    localStorage.getItem("tracepaper_user") || "{}"
  );

  const [name, setName] = useState(
    savedUser.name || "Om Turkane"
  );

  const [email, setEmail] = useState(
    savedUser.email || "admin@tracepaper.com"
  );

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [securityAlerts, setSecurityAlerts] =
    useState(true);

  const [investigationAlerts, setInvestigationAlerts] =
    useState(true);

  const [theme, setTheme] = useState("System Default");

  const [saved, setSaved] = useState(false);

  // ================= SAVE =================

  const handleSave = () => {
    const currentUser = {
      ...savedUser,
      name,
      email,
    };

    localStorage.setItem(
      "tracepaper_user",
      JSON.stringify(currentUser)
    );

    localStorage.setItem(
      "tracepaper_settings",
      JSON.stringify({
        emailNotifications,
        securityAlerts,
        investigationAlerts,
        theme,
      })
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);

    window.dispatchEvent(
      new Event("tracepaper-settings-updated")
    );
  };

  // ================= RESET =================

  const handleReset = () => {
    setName(savedUser.name || "Om Turkane");

    setEmail(
      savedUser.email || "admin@tracepaper.com"
    );

    setEmailNotifications(true);
    setSecurityAlerts(true);
    setInvestigationAlerts(true);
    setTheme("System Default");
  };

  return (
    <div>

      {/* ================= HEADER ================= */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="text-slate-500 mt-2">
          Manage your TracePaper account, security and
          application preferences.
        </p>
      </div>


      {/* ================= SUCCESS MESSAGE ================= */}

      {saved && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">

          <CheckCircle2 size={20} />

          <span className="font-medium">
            Settings saved successfully.
          </span>

        </div>
      )}


      {/* ================= CARDS ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


        {/* ================= PROFILE ================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">

              <User
                className="text-blue-600"
                size={22}
              />

            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Profile Settings
              </h2>

              <p className="text-sm text-slate-500">
                Manage your account information
              </p>

            </div>

          </div>


          {/* Full Name */}

          <div className="mb-5">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
              />

            </div>

          </div>


          {/* Email */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
              />

            </div>

          </div>

        </div>


        {/* ================= SECURITY ================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">

              <ShieldCheck
                className="text-indigo-600"
                size={22}
              />

            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Security
              </h2>

              <p className="text-sm text-slate-500">
                Protect your TracePaper account
              </p>

            </div>

          </div>


          {/* Change Password */}

          <button
            type="button"
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition mb-4"
          >

            <div className="flex items-center gap-3">

              <Lock
                size={19}
                className="text-slate-500"
              />

              <div className="text-left">

                <p className="font-semibold text-slate-800">
                  Change Password
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Update your account password
                </p>

              </div>

            </div>

            <span className="text-blue-600 text-sm font-medium">
              Change
            </span>

          </button>


          {/* Security Alerts */}

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">

            <div className="flex items-center gap-3">

              <ShieldCheck
                size={19}
                className="text-emerald-600"
              />

              <div>

                <p className="font-semibold text-slate-800">
                  Security Alerts
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Receive important security notifications
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setSecurityAlerts(!securityAlerts)
              }
              className={`w-11 h-6 rounded-full transition ${
                securityAlerts
                  ? "bg-blue-600"
                  : "bg-slate-300"
              }`}
            >

              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  securityAlerts
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />

            </button>

          </div>

        </div>


        {/* ================= NOTIFICATIONS ================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">

              <Bell
                className="text-amber-600"
                size={22}
              />

            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Notifications
              </h2>

              <p className="text-sm text-slate-500">
                Control system notifications
              </p>

            </div>

          </div>


          {/* Email Notifications */}

          <div className="flex items-center justify-between py-4 border-b border-slate-100">

            <div>

              <p className="font-semibold text-slate-800">
                Email Notifications
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Receive updates through email
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setEmailNotifications(
                  !emailNotifications
                )
              }
              className={`w-11 h-6 rounded-full transition ${
                emailNotifications
                  ? "bg-blue-600"
                  : "bg-slate-300"
              }`}
            >

              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  emailNotifications
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />

            </button>

          </div>


          {/* Investigation Alerts */}

          <div className="flex items-center justify-between py-4">

            <div>

              <p className="font-semibold text-slate-800">
                Investigation Alerts
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Get alerts for new investigation activity
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setInvestigationAlerts(
                  !investigationAlerts
                )
              }
              className={`w-11 h-6 rounded-full transition ${
                investigationAlerts
                  ? "bg-blue-600"
                  : "bg-slate-300"
              }`}
            >

              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  investigationAlerts
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />

            </button>

          </div>

        </div>


        {/* ================= SYSTEM PREFERENCES ================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center">

              <Palette
                className="text-cyan-600"
                size={22}
              />

            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                System Preferences
              </h2>

              <p className="text-sm text-slate-500">
                Customize your application experience
              </p>

            </div>

          </div>


          {/* Theme */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Theme
            </label>

            <div className="relative">

              <Palette
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value)
                }
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 bg-white outline-none focus:border-blue-500"
              >

                <option>System Default</option>
                <option>Light</option>
                <option>Dark</option>

              </select>

            </div>

          </div>

        </div>

      </div>


      {/* ================= ACTION BUTTONS ================= */}

      <div className="flex justify-end gap-3 mt-8">

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
        >

          <RotateCcw size={18} />

          Reset

        </button>


        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
        >

          <Save size={18} />

          Save Changes

        </button>

      </div>

    </div>
  );
}