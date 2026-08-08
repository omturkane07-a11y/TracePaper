import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("tracepaper_auth") === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          TracePaper
        </h1>

        <p className="text-slate-500 mt-2">
          Enterprise Examination Security Platform
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-slate-500 mt-8">
        © 2026 TracePaper. All rights reserved.
      </p>
    </AuthLayout>
  );
}