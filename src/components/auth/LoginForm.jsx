import { useNavigate } from "react-router-dom";

import PasswordInput from "./PasswordInput";
import RememberMe from "./RememberMe";

export default function LoginForm() {

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("tracepaper_auth", "true");
    navigate("/dashboard");
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>

      <div>
        <label className="block text-sm font-medium mb-2">
          Email
        </label>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <PasswordInput />

      <RememberMe />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Login
      </button>

    </form>
  );
}