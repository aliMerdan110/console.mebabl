
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { apiFetch } from "@/lib/api";

type Application = {
  id: string;
  name: string;
  isActive?: boolean;
  status?: string;
  apiKey?: string;
};

type ApplicationsResponse =
  | Application[]
  | {
      items: Application[];
    };

type CreateApplicationResponse = {
  id: string;
  name: string;
  apiKey: string;
  apiSecret?: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [applicationName, setApplicationName] =
    useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [createdSecret, setCreatedSecret] =
    useState<string | null>(null);

  async function loadApplications() {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        "/applications"
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load applications (${response.status}).`
        );
      }

      const data: ApplicationsResponse =
        await response.json();

      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        setApplications(data.items ?? []);
      }
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

  async function handleCreateApplication(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name = applicationName.trim();

    if (!name) {
      setCreateError(
        "Application name is required."
      );
      return;
    }

    if (creating) {
      return;
    }

    setCreating(true);
    setCreateError("");
    setCreatedSecret(null);

    try {
      const response = await apiFetch(
        "/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let data:
        | CreateApplicationResponse
        | { message?: string }
        | null = null;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        if (text) {
          data = {
            message: text,
          };
        }
      }

      if (!response.ok) {
        const message =
          data &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : `Failed to create application (${response.status}).`;

        throw new Error(message);
      }

      if (
        !data ||
        !("id" in data) ||
        !("name" in data) ||
        !("apiKey" in data)
      ) {
        throw new Error(
          "Application was created, but the response was incomplete."
        );
      }

      setApplicationName("");
      setShowCreateForm(false);

      if (
        "apiSecret" in data &&
        typeof data.apiSecret === "string"
      ) {
        setCreatedSecret(data.apiSecret);
      }

      await loadApplications();
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Failed to create application."
      );
    } finally {
      setCreating(false);
    }
  }

  function getApplicationStatus(
    application: Application
  ) {
    if (
      typeof application.status === "string"
    ) {
      return application.status;
    }

    return application.isActive === false
      ? "Inactive"
      : "Active";
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Applications
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage your Mebabl applications.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm(true);
                setCreateError("");
                setCreatedSecret(null);
              }}
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + Create Application
            </button>
          </div>

          {createdSecret && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950">
              <h2 className="font-semibold text-amber-900 dark:text-amber-200">
                Application Secret
              </h2>

              <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                This secret is shown only once. Store it
                securely before leaving this page.
              </p>

              <code className="mt-4 block overflow-x-auto rounded-lg bg-white p-3 font-mono text-sm text-zinc-900 dark:bg-zinc-900 dark:text-white">
                {createdSecret}
              </code>

              <button
                type="button"
                onClick={() => setCreatedSecret(null)}
                className="mt-4 text-sm font-medium text-amber-900 underline dark:text-amber-200"
              >
                I have saved it
              </button>
            </div>
          )}

          {showCreateForm && (
            <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Create Application
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Create a new application for your
                  Mebabl project.
                </p>
              </div>

              {createError && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                >
                  {createError}
                </div>
              )}

              <form
                onSubmit={handleCreateApplication}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="applicationName"
                    className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
                  >
                    Application Name
                  </label>

                  <input
                    id="applicationName"
                    name="applicationName"
                    type="text"
                    value={applicationName}
                    onChange={(event) =>
                      setApplicationName(
                        event.target.value
                      )
                    }
                    placeholder="Zooz App"
                    required
                    disabled={creating}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {creating
                      ? "Creating..."
                      : "Create Application"}
                  </button>

                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreateError("");
                    }}
                    className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="animate-pulse space-y-4">
                <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />

                <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />

                <div className="h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950"
            >
              <h2 className="font-semibold text-red-700 dark:text-red-300">
                Failed to load applications
              </h2>

              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadApplications}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            applications.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  No applications yet
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Create your first application to get
                  started.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(true);
                    setCreateError("");
                  }}
                  className="mt-5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
                >
                  Create Application
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            applications.length > 0 && (
              <div className="grid gap-4">
                {applications.map((application) => {
                  const status =
                    getApplicationStatus(
                      application
                    );

                  const isActive =
                    status === "Active";

                  return (
                    <Link
                      key={application.id}
                      href={`/applications/${application.id}`}
                      className="block rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {application.name}
                          </h2>

                          {application.apiKey && (
                            <p className="mt-2 truncate font-mono text-sm text-zinc-500 dark:text-zinc-400">
                              {application.apiKey}
                            </p>
                          )}

                          <p className="mt-3 text-xs text-zinc-400">
                            ID: {application.id}
                          </p>
                        </div>

                        <span
                          className={
                            isActive
                              ? "shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400"
                              : "shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }
                        >
                          {status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
