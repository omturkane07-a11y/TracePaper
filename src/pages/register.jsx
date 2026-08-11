import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";

export default function Register() {
  return (
    <AuthLayout>

      {/* Welcome Section */}
      <div className="text-center mb-7">
        <h2 className="text-2xl font-bold text-slate-900">
          Create Your Account
        </h2>

        <p className="text-slate-500 mt-2">
          Create your enterprise account
        </p>
      </div>

      {/* Register Form */}
      <RegisterForm />

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 mt-7">
        © 2026 TracePaper. All rights reserved.
      </p>

    </AuthLayout>
  );
}