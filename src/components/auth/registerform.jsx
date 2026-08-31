import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Confirm password check
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password length check
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      // Send registration request to backend
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          full_name: name,
          email: email,
          password: password,
        }
      );

      // Registration successful
      if (response.data.status === "success") {
        /*
          IMPORTANT:
          Do NOT save JWT/token here.

          Registration only creates the account.
          User must login separately.
        */

        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "Registration failed. Please try again."
        );
      } else {
        setError(
          "Unable to connect to TracePaper server. Make sure backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Full Name
        </label>

        <div className="relative">
          <User
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            placeholder="Enter password"
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
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-400
              hover:text-blue-600
              transition
            "
          >
            {showPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Confirm Password
        </label>

        <div className="relative">
          <Lock
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-400
              hover:text-blue-600
              transition
            "
          >
            {showConfirmPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Create Account Button */}
      <div className="flex justify-center pt-1">
        <button
          type="submit"
          disabled={loading}
          className="
            group
            relative
            w-[60%]
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
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
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

          <span className="relative z-10 text-base">
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </span>
        </button>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-slate-500 pt-1">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition"
        >
          Sign In
        </button>
      </p>

    </form>
  );
}