"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth";

type Developer = {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
};

export default function Topbar() {
  const [developer, setDeveloper] =
    useState<Developer | null>(null);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDeveloper() {
      try {
        const response = await apiFetch(
          "/developers/me"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load developer."
          );
        }

        const data: Developer =
          await response.json();

        if (mounted) {
          setDeveloper(data);
        }
      } catch {
        // Authentication and refresh handling
        // are handled by apiFetch.
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDeveloper();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Developer Console
        </span>
      </div>

      <div className="flex items-center gap-4">
        {loading ? (
          <div className="text-right">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

            <div className="mt-1 h-3 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ) : developer ? (
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {developer.displayName}
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {developer.email}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {loggingOut
            ? "Logging out..."
            : "Logout"}
        </button>
      </div>
    </header>
  );
}