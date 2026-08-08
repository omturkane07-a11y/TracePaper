export default function RememberMe() {
  return (
    <div className="flex items-center justify-between mt-4">
      <label className="flex items-center gap-2">
        <input type="checkbox" />
        <span className="text-sm">
          Remember Me
        </span>
      </label>

      <button
        type="button"
        className="text-blue-600 text-sm"
      >
        Forgot Password?
      </button>
    </div>
  );
}