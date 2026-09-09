"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Footer from "@/components/layout/Footer";
import Topbar from "@/components/layout/Topbar";
import { apiFetch } from "@/lib/api";

type AuthenticationSettings = {
  id: string;
  applicationId: string;

  allowRegistration: boolean;
  requireEmailVerification: boolean;
  allowPasswordAuthentication: boolean;
  allowAnonymousAuthentication: boolean;

  passwordMinLength: number;
  sessionLifetimeDays: number;
  refreshTokenLifetimeDays: number;
  maxLoginAttempts: number;
};

type UserProfile = {
  name?: string;
  email: string;
};

export default function AuthenticationSettingsPage() {
  const params = useParams<{ id: string }>();

  const applicationId = String(params.id);

  const [settings, setSettings] =
    useState<AuthenticationSettings | null>(null);

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      /*
       * Developer profile
       */
      const userResponse = await apiFetch("/developers/me");

      if (userResponse.status === 401) {
        return;
      }

      if (userResponse.ok) {
        const userData: UserProfile =
          await userResponse.json();

        setUser(userData);
      }

      /*
       * Authentication Settings
       *
       * GET /api/applications/{applicationId}/authentication/settings
       */
      const response = await apiFetch(
        `/applications/${applicationId}/authentication/settings`,
      );

      if (response.status === 401) {
        return;
      }

      /*
       * If settings do not exist,
       * use default settings.
       */
      if (response.status === 404) {
        setSettings({
          id: "",
          applicationId,

          allowRegistration: true,
          requireEmailVerification: false,
          allowPasswordAuthentication: true,
          allowAnonymousAuthentication: false,

          passwordMinLength: 8,
          sessionLifetimeDays: 7,
          refreshTokenLifetimeDays: 30,
          maxLoginAttempts: 5,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load authentication settings (${response.status})`,
        );
      }

      const data: AuthenticationSettings =
        await response.json();

      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load authentication settings.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    void loadSettings();
  }, [applicationId]);

  function updateSetting<
    K extends keyof AuthenticationSettings,
  >(
    key: K,
    value: AuthenticationSettings[K],
  ) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });

    setSuccess("");
  }

  async function handleSave() {
    if (!settings || saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * PUT /api/applications/{applicationId}/authentication/settings
       */
      const response = await apiFetch(
        `/applications/${applicationId}/authentication/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            allowRegistration:
              settings.allowRegistration,

            requireEmailVerification:
              settings.requireEmailVerification,

            allowPasswordAuthentication:
              settings.allowPasswordAuthentication,

            allowAnonymousAuthentication:
              settings.allowAnonymousAuthentication,

            passwordMinLength:
              settings.passwordMinLength,

            sessionLifetimeDays:
              settings.sessionLifetimeDays,

            refreshTokenLifetimeDays:
              settings.refreshTokenLifetimeDays,

            maxLoginAttempts:
              settings.maxLoginAttempts,
          }),
        },
      );

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        let message =
          `Failed to save authentication settings (${response.status})`;

        try {
          const data = await response.json();

          message =
            data?.message ||
            data?.detail ||
            data?.title ||
            message;
        } catch {
          // Ignore invalid/non-JSON error response.
        }

        throw new Error(message);
      }

      const updatedSettings: AuthenticationSettings =
        await response.json();

      setSettings(updatedSettings);

      setSuccess(
        "Authentication settings saved successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save authentication settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  const developerName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Topbar user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 p-6 lg:p-10">
        {/* Authentication Navigation */}
        <AuthenticationHeader
          applicationId={applicationId}
          active="Settings"
        />

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Authentication settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              Configure how authentication and user
              accounts behave in this application.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              loading ||
              saving ||
              !settings
            }
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>

        {/* Developer */}
        {developerName && (
          <div className="mb-6 text-xs text-zinc-400">
            Signed in as {developerName}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
          >
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
          >
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {success}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />

                <div className="mt-4 h-4 w-80 rounded bg-zinc-200 dark:bg-zinc-800" />

                <div className="mt-6 h-12 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        {!loading && settings && (
          <div className="space-y-6">
            {/* User accounts */}
            <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  User accounts
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Control how users can create and verify
                  their accounts.
                </p>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* Registration */}
                <label className="flex cursor-pointer items-center justify-between gap-6 p-6">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Allow user registration
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Allow new users to create accounts
                      in this application.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      settings.allowRegistration
                    }
                    onChange={(event) =>
                      updateSetting(
                        "allowRegistration",
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 rounded border-zinc-300"
                  />
                </label>

                {/* Email verification */}
                <label className="flex cursor-pointer items-center justify-between gap-6 p-6">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Require email verification
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Require users to verify their email
                      before accessing protected features.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      settings.requireEmailVerification
                    }
                    onChange={(event) =>
                      updateSetting(
                        "requireEmailVerification",
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 rounded border-zinc-300"
                  />
                </label>
              </div>
            </section>

            {/* Sign-in options */}
            <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Sign-in options
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Configure the authentication methods
                  available to users.
                </p>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* Password */}
                <label className="flex cursor-pointer items-center justify-between gap-6 p-6">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Password authentication
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Allow users to sign in using email
                      and password.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      settings.allowPasswordAuthentication
                    }
                    onChange={(event) =>
                      updateSetting(
                        "allowPasswordAuthentication",
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 rounded border-zinc-300"
                  />
                </label>

                {/* Anonymous */}
                <label className="flex cursor-pointer items-center justify-between gap-6 p-6">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Anonymous authentication
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Allow users to access the application
                      without creating an account.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      settings.allowAnonymousAuthentication
                    }
                    onChange={(event) =>
                      updateSetting(
                        "allowAnonymousAuthentication",
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 rounded border-zinc-300"
                  />
                </label>
              </div>
            </section>

            {/* Password policy */}
            <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Password policy
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Configure the minimum password
                  requirements for users.
                </p>
              </div>

              <div className="p-6">
                <label
                  htmlFor="passwordMinLength"
                  className="block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  Minimum password length
                </label>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  The minimum number of characters required
                  for a user password.
                </p>

                <input
                  id="passwordMinLength"
                  type="number"
                  min={6}
                  max={128}
                  value={
                    settings.passwordMinLength
                  }
                  onChange={(event) =>
                    updateSetting(
                      "passwordMinLength",
                      Number(event.target.value),
                    )
                  }
                  className="mt-4 w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-zinc-700"
                />
              </div>
            </section>

            {/* Session & Security */}
            <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Session & security
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Configure session and login security
                  settings.
                </p>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-3">
                {/* Session lifetime */}
                <div>
                  <label
                    htmlFor="sessionLifetimeDays"
                    className="block text-sm font-medium text-zinc-900 dark:text-white"
                  >
                    Session lifetime
                  </label>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Days
                  </p>

                  <input
                    id="sessionLifetimeDays"
                    type="number"
                    min={1}
                    max={365}
                    value={
                      settings.sessionLifetimeDays
                    }
                    onChange={(event) =>
                      updateSetting(
                        "sessionLifetimeDays",
                        Number(event.target.value),
                      )
                    }
                    className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-zinc-700"
                  />
                </div>

                {/* Refresh token lifetime */}
                <div>
                  <label
                    htmlFor="refreshTokenLifetimeDays"
                    className="block text-sm font-medium text-zinc-900 dark:text-white"
                  >
                    Refresh token lifetime
                  </label>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Days
                  </p>

                  <input
                    id="refreshTokenLifetimeDays"
                    type="number"
                    min={1}
                    max={3650}
                    value={
                      settings.refreshTokenLifetimeDays
                    }
                    onChange={(event) =>
                      updateSetting(
                        "refreshTokenLifetimeDays",
                        Number(event.target.value),
                      )
                    }
                    className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-zinc-700"
                  />
                </div>

                {/* Max login attempts */}
                <div>
                  <label
                    htmlFor="maxLoginAttempts"
                    className="block text-sm font-medium text-zinc-900 dark:text-white"
                  >
                    Max login attempts
                  </label>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Attempts
                  </p>

                  <input
                    id="maxLoginAttempts"
                    type="number"
                    min={1}
                    max={100}
                    value={
                      settings.maxLoginAttempts
                    }
                    onChange={(event) =>
                      updateSetting(
                        "maxLoginAttempts",
                        Number(event.target.value),
                      )
                    }
                    className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-zinc-700"
                  />
                </div>
              </div>
            </section>

            {/* Bottom save */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </div>
        )}

        {/* Application ID */}
        <div className="mt-8 text-xs text-zinc-400">
          Application ID: {applicationId}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   Authentication Header
   ========================================================= */

function AuthenticationHeader({
  applicationId,
  active,
}: {
  applicationId: string;
  active: string;
}) {
  const tabs = [
    {
      label: "Authentication",
      href: "",
    },
    {
      label: "Sign-in method",
      href: "/sign-in-method",
    },
    {
      label: "Templates",
      href: "/templates",
    },
    {
      label: "Usage",
      href: "/usage",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Extensions",
      href: "/extensions",
    },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href={`/applications/${applicationId}`}
          className="transition hover:text-zinc-900 hover:underline dark:hover:text-white"
        >
          Application
        </Link>

        <span>/</span>

        <span>Authentication</span>

        <span>/</span>

        <span className="font-medium text-zinc-900 dark:text-white">
          {active}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-8 overflow-x-auto">
        <nav className="flex min-w-max gap-1 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((tab) => {
            const isActive =
              tab.label === active;

            return (
              <Link
                key={tab.label}
                href={`/applications/${applicationId}/authentication${tab.href}`}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}