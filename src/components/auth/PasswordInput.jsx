import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Password
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder="Enter password"
          className="w-full border rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-3"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}