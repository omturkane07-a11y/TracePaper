import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import RememberMe from "./RememberMe";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      // Save authentication information
      localStorage.setItem("tracepaper_auth", "true");
      localStorage.setItem(
        "tracepaper_token",
        data.token
      );
      localStorage.setItem(
        "tracepaper_user",
        JSON.stringify(data.user)
      );

      // Navigate to originally requested page
      const from =
        location.state?.from?.pathname || "/dashboard";

      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Email Address
        </label>

        <div className="relative">
          <Mail
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              border border-slate-200
              rounded-xl
              pl-11 pr-4
              py-3.5
              outline-none
              bg-slate-50
              focus:bg-white
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
              transition
            "
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Password
        </label>

        <div className="relative">
          <Lock
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full
              border border-slate-200
              rounded-xl
              pl-11 pr-12
              py-3.5
              outline-none
              bg-slate-50
              focus:bg-white
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
              transition
            "
            required
            disabled={loading}
          />

          {/* Eye Button */}
          <button
            type="button"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              flex
              items-center
              justify-center
              text-slate-400
              hover:text-blue-600
              cursor-pointer
              transition
            "
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>
        </div>
      </div>

      {/* Remember Me + Forgot Password */}
      <div className="flex items-center justify-between">
        <RememberMe />

        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="
            text-sm
            text-blue-600
            font-medium
            hover:text-blue-700
            hover:underline
            transition
          "
          disabled={loading}
        >
          Forgot Password?
        </button>
      </div>

      {/* LOGIN BUTTON */}
      <div className="flex justify-center pt-1">
        <button
          type="submit"
          disabled={loading}
          className="
            group
            relative
            w-[50%]
            h-10
            overflow-hidden
            rounded-full
            bg-gradient-to-b
            from-[#4f8cff]
            via-[#1764ff]
            to-[#0645d8]
            text-white
            font-bold
            tracking-wide
            shadow-[0_7px_0_#0638a8,0_12px_22px_rgba(20,80,220,0.35)]
            border
            border-blue-300/50
            transition-all
            duration-200
            hover:from-[#639bff]
            hover:via-[#2872ff]
            hover:to-[#0b50e5]
            hover:-translate-y-0.5
            hover:shadow-[0_8px_0_#0638a8,0_15px_25px_rgba(20,80,220,0.4)]
            active:translate-y-[5px]
            active:shadow-[0_2px_0_#0638a8,0_5px_12px_rgba(20,80,220,0.3)]
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
          {/* Glossy Highlight */}
          <span
            className="
              absolute
              inset-x-5
              top-1
              h-1/2
              rounded-full
              bg-gradient-to-b
              from-white/45
              via-white/15
              to-transparent
              pointer-events-none
            "
          />

          {/* Shine Animation */}
          <span
            className="
              absolute
              top-0
              -left-20
              h-full
              w-16
              rotate-12
              bg-white/25
              blur-md
              transition-all
              duration-700
              group-hover:left-[110%]
            "
          />

          {/* Button Text */}
          <span className="relative z-10 text-base">
            {loading ? "LOGGING IN..." : "LOGIN"}
          </span>
        </button>
      </div>

    </form>
  );
}