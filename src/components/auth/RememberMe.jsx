import { useState } from "react";

export default function RememberMe() {
  const [remember, setRemember] = useState(false);

  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input
        type="checkbox"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />

      <span>Remember Me</span>
    </label>
  );
}