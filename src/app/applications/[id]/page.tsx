"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Breadcrumb from "@/components/layout/Breadcrumb";
import { apiFetch } from "@/lib/api";

type Application = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  domain?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
};

type ApplicationPlatform = {
  id: string;
  applicationId: string;
  platform: string;
  nickname?: string | null;
  packageName?: string | null;
  bundleId?: string | null;
  domain?: string | null;
  isActive: boolean;
};

const platformDefinitions = [
  {
    key: "android",
    name: "Android",
    description: "Android application",
    icon: "🤖",
  },
  {
    key: "ios",
    name: "iOS",
    description: "iOS application",
    icon: "",
  },
  {
    key: "web",
    name: "Web",
    description: "Web application",
    icon: "🌐",
  },
  {
    key: "flutter",
    name: "Flutter",
    description: "Flutter application",
    icon: "💙",
  },
];

export default function ApplicationOverviewPage() {
  const params = useParams();
  const router = useRouter();

  const applicationId = params.id as string;

  const [application, setApplication] =
    useState<Application | null>(null);

  const [platforms, setPlatforms] =
    useState<ApplicationPlatform[]>([]);

  const [loading, setLoading] = useState(true);
  const [platformsLoading, setPlatformsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [platformsError, setPlatformsError] =
    useState("");

  async function loadApplication() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `/applications/${applicationId}`,
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 404) {
        router.push("/applications");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load application (${response.status}).`,
        );
      }

      const data =
        (await response.json()) as Application;

      setApplication(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load application.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPlatforms() {
    try {
      setPlatformsLoading(true);
      setPlatformsError("");

      const response = await apiFetch(
        `/applications/${applicationId}/platforms`,
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load platforms (${response.status}).`,
        );
      }

      const data =
        (await response.json()) as ApplicationPlatform[];

      setPlatforms(data);
    } catch (err) {
      setPlatformsError(
        err instanceof Error
          ? err.message
          : "Failed to load application platforms.",
      );
    } finally {
      setPlatformsLoading(false);
    }
  }

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    void loadApplication();
    void loadPlatforms();
  }, [applicationId]);

  function getPlatform(platformKey: string) {
    return platforms.find(
      (platform) =>
        platform.platform.toLowerCase() ===
        platformKey.toLowerCase(),
    );
  }

  function handleAddApp() {
    router.push(
      `/applications/${applicationId}/setup`,
    );
  }

  function handlePlatformSettings() {
    router.push(
      `/applications/${applicationId}/authentication`,
    );
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 lg:p-8">
        <Breadcrumb />

        <div className="animate-pulse space-y-6">
          <div>
            <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />

            <div className="mt-4 h-8 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />

            <div className="mt-2 h-4 w-80 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>

          <div className="h-80 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </main>
    );
  }

  if (error || !application) {
    return (
      <main className="flex-1 p-6 lg:p-8">
        <Breadcrumb />

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
          <h1 className="font-semibold text-red-700 dark:text-red-300">
            Failed to load application
          </h1>

          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error || "Application not found."}
          </p>

          <button
            type="button"
            onClick={() => void loadApplication()}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 lg:p-8">
      <Breadcrumb />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/applications"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Applications
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {application.name}
            </h1>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                application.isActive === false
                  ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
              }`}
            >
              {application.isActive === false
                ? "Inactive"
                : "Active"}
            </span>
          </div>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Application overview and configuration.
          </p>
        </div>

        <Link
          href={`/applications/${application.id}/edit`}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Edit Application
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Application Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500">
              Name
            </p>

            <p className="mt-2 font-medium text-zinc-900 dark:text-white">
              {application.name}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500">
              Code
            </p>

            <p className="mt-2 font-mono text-sm text-zinc-900 dark:text-white">
              {application.code}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500">
              Domain
            </p>

            <p className="mt-2 truncate text-sm text-zinc-900 dark:text-white">
              {application.domain || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500">
              Application ID
            </p>

            <p
              title={application.id}
              className="mt-2 truncate font-mono text-xs text-zinc-900 dark:text-white"
            >
              {application.id}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Application Platforms
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Platforms connected to this application.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddApp}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            + Add App
          </button>
        </div>

        {platformsLoading && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4"
                >
                  <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />

                    <div className="h-3 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!platformsLoading && platformsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
            <h3 className="font-medium text-red-700 dark:text-red-300">
              Failed to load platforms
            </h3>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {platformsError}
            </p>

            <button
              type="button"
              onClick={() => void loadPlatforms()}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
            >
              Try Again
            </button>
          </div>
        )}

        {!platformsLoading && !platformsError && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {platformDefinitions.map((definition) => {
                const platform = getPlatform(
                  definition.key,
                );

                const added = Boolean(platform);

                return (
                  <div
                    key={definition.key}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-lg dark:bg-zinc-800">
                        {definition.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-zinc-900 dark:text-white">
                            {definition.name}
                          </h3>

                          {added && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                platform?.isActive
                                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                              }`}
                            >
                              {platform?.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                          {platform?.nickname ||
                            definition.description}
                        </p>

                        {platform?.packageName && (
                          <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                            {platform.packageName}
                          </p>
                        )}

                        {platform?.bundleId && (
                          <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                            {platform.bundleId}
                          </p>
                        )}

                        {platform?.domain && (
                          <p className="mt-1 truncate text-xs text-zinc-400">
                            {platform.domain}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {added ? (
                        <>
                          <span className="text-sm text-zinc-400">
                            Added
                          </span>

                          <button
                            type="button"
                            onClick={handlePlatformSettings}
                            aria-label={`Open ${definition.name} settings`}
                            title={`${definition.name} settings`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                              />

                              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.56-1H6v-2.4h1.04a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88L8.2 8.66l1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.88-.34l-.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 15.4 9a1.7 1.7 0 0 0 1.56 1H18v2.4h-1.04a1.7 1.7 0 0 0-1.56 1Z" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAddApp}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {platforms.length === 0 && (
              <div className="border-t border-zinc-200 px-6 py-6 text-center dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No platforms have been added yet.
                </p>

                <button
                  type="button"
                  onClick={handleAddApp}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  + Add App
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}