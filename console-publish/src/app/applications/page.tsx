
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Application = {
  id: string;
  name: string;
  code: string;
  description: string;
  domain: string;
  isActive: boolean;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/applications");

      if (!response.ok) {
        throw new Error(
          `Failed to load applications (${response.status})`
        );
      }

      const data = await response.json();

      setApplications(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <main className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Applications
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your Mebabl applications.
          </p>
        </div>

        <Link
          href="/applications/create"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
        >
          + Create Application
        </Link>
      </div>

      {loading && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading applications...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900 dark:bg-red-950">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        applications.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-semibold">
              No applications
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Create your first application.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        applications.length > 0 && (
          <div className="grid gap-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-6">
                  <Link
                    href={`/applications/${application.id}`}
                    className="min-w-0 flex-1"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {application.name}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                          {application.description ||
                            "No description"}
                        </p>

                        <div className="mt-4 flex gap-5 text-xs text-zinc-500">
                          <span>
                            Code: {application.code}
                          </span>

                          <span>
                            Domain: {application.domain || "-"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          application.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                        }`}
                      >
                        {application.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <Link
                    href={`/applications/${application.id}`}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Overview
                  </Link>

                  <Link
                    href={`/applications/${application.id}/credentials`}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Credentials
                  </Link>

                  <Link
                    href={`/applications/${application.id}/users`}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Users
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
    </main>
  );
}