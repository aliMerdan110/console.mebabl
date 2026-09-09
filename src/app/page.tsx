
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Footer from "@/components/layout/Footer";
import Topbar from "@/components/layout/Topbar";
import { apiFetch } from "@/lib/api";

type Application = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  domain: string | null;
  isActive: boolean;
};

type ApplicationsResponse =
  | Application[]
  | {
      items: Application[];
    };

type UserProfile = {
  name?: string;
  email: string;
};

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const userRes = await apiFetch("/developers/me").catch(() => null);

      if (userRes?.ok) {
        const userData: UserProfile = await userRes.json();
        setUser(userData);
      } else if (!userRes || userRes.status === 401) {
        router.push("/login");
        return;
      }

      const response = await apiFetch("/applications");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load applications (${response.status}).`,
        );
      }

      const data: ApplicationsResponse = await response.json();

      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        setApplications(data.items ?? []);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load applications.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [router]);

  const developerName =
    user?.name || user?.email?.split("@")[0] || "";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Topbar user={user} />

      <main className="mx-auto w-full max-w-7xl flex-1 p-6 lg:p-10">
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Hello, {developerName}
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage your Mebabl applications.
              </p>
            </div>

            <Link
              href="/applications/create"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + Create Application
            </Link>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Your Applications ({applications.length})
          </h2>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
            <h2 className="font-semibold text-red-700 dark:text-red-300">
              Failed to load applications
            </h2>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadInitialData}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              No applications yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Create your first Mebabl application to start using
              platform services.
            </p>

            <Link
              href="/applications/create"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create Application
            </Link>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <Link
                key={application.id}
                href={`/applications/${application.id}`}
                className="group rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-zinc-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {application.name}
                    </h3>

                    <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {application.code}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                      application.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {application.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-4 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {application.description ||
                    "No description provided."}
                </p>

                <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="truncate text-xs text-zinc-400">
                    {application.domain || "No domain"}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">
                    ID: {application.id.slice(0, 8)}...
                  </span>

                  <span className="font-medium text-zinc-600 transition group-hover:translate-x-0.5 dark:text-zinc-300">
                    Manage →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
