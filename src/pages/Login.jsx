import { useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();

  return (
    <AuthLayout>

      {/* Welcome Section */}
      <div className="text-center mb-7">
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome Back
        </h2>

        <p className="text-slate-500 mt-2">
          Sign in to access your security dashboard
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Register Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition"
          >
            Create Account
          </button>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 mt-7">
        © 2026 TracePaper. All rights reserved.
      </p>

    </AuthLayout>
  );
}