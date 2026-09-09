
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);

    localStorage.removeItem("mebabl_access_token");
    localStorage.removeItem("mebabl_refresh_token");

    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
