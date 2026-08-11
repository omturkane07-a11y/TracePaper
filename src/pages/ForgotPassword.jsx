import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Demo reset request
    setSent(true);
  };

  return (
    <AuthLayout>

      {/* Header */}
      <div className="text-center mb-7">

        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center">
          <Mail className="text-blue-600" size={28} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          Forgot Password?
        </h2>

        <p className="text-slate-500 mt-2">
          Enter your email and we'll help you reset your password.
        </p>

      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-5">

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
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                required
              />

            </div>
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            Send Reset Link
          </button>

        </form>
      ) : (
        /* Success */
        <div className="text-center">

          <CheckCircle
            size={55}
            className="mx-auto text-emerald-500 mb-4"
          />

          <h3 className="text-xl font-bold text-slate-900">
            Reset Link Sent
          </h3>

          <p className="text-slate-500 mt-2 mb-6">
            If an account exists for{" "}
            <span className="font-semibold text-slate-700">
              {email}
            </span>
            , a password reset link has been sent.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition"
          >
            Back to Login
          </button>

        </div>
      )}

      {/* Back to Login */}
      {!sent && (
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center justify-center gap-2 w-full mt-6 text-sm text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={17} />
          Back to Login
        </button>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 mt-7">
        © 2026 TracePaper. All rights reserved.
      </p>

    </AuthLayout>
  );
}