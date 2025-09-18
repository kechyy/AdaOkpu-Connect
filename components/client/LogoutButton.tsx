"use client";
export function LogoutButton() {
  return (
    <button
      className="px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 text-sm"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/auth/login";
      }}
    >
      Logout
    </button>
  );
}
