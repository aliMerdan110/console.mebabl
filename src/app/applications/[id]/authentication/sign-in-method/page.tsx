"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Breadcrumb from "@/components/layout/Breadcrumb";
import { apiFetch } from "@/lib/api";

type AuthProvider = {
  provider: string;
  isEnabled: boolean;
};

const providerLabels: Record<string, string> = {
  "email-password": "Email/Password",
  "email-link": "Email link (passwordless sign-in)",
};

const providerDescriptions: Record<string, string> = {
  "email-password":
    "Allow users to sign up using their email address and password. Mebabl also provides email verification, password recovery, and email address change primitives.",

  "email-link":
    "Allow users to sign in without a password using a secure email link.",
};

const supportedProviders = [
  "email-password",
  "email-link",
];

const tabs = [
  {
    label: "Overview",
    href: "",
    icon: "grid",
  },
  {
    label: "Users",
    href: "/users",
    icon: "users",
  },
  {
    label: "Sign-in methods",
    href: "/sign-in-method",
    icon: "key",
  },
  {
    label: "Email templates",
    href: "/templates",
    icon: "mail",
  },
  {
    label: "Usage",
    href: "/usage",
    icon: "chart",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
  },
];

export default function SignInMethodPage() {
  const params = useParams<{ id: string }>();
  const applicationId = String(params.id);

  const basePath =
    `/applications/${applicationId}/authentication`;

  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function loadProviders() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `/applications/${applicationId}/authentication/providers`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load sign-in providers (${response.status})`,
        );
      }

      const data = await response.json();

      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.providers)
            ? data.providers
            : [];

      setProviders(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load sign-in providers.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    void loadProviders();
  }, [applicationId]);

  function isEnabled(provider: string) {
    return (
      providers.find(
        (x) => x.provider === provider,
      )?.isEnabled ?? false
    );
  }

  async function toggleProvider(provider: string) {
    try {
      setUpdating(provider);
      setError("");

      const currentState = isEnabled(provider);

      const response = await apiFetch(
        `/applications/${applicationId}/authentication/providers/${provider}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isEnabled: !currentState,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update ${provider} (${response.status})`,
        );
      }

      setProviders((current) =>
        current.map((item) =>
          item.provider === provider
            ? {
                ...item,
                isEnabled: !currentState,
              }
            : item,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update provider.",
      );
    } finally {
      setUpdating(null);
    }
  }

  const enabledProviders = providers.filter(
    (provider) => provider.isEnabled,
  ).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb />

        {/* Header */}
        <div className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Icon name="key" size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Sign-in methods
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Choose how users can authenticate with this application.
              </p>
            </div>
          </div>

          <Link
            href={`${basePath}/settings`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            <Icon name="settings" size={16} />
            Authentication settings
          </Link>
        </div>

        {/* Tabs */}
        <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((tab) => {
            const active =
              tab.href === "/sign-in-method";

            return (
              <Link
                key={tab.label}
                href={`${basePath}${tab.href}`}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                <Icon
                  name={tab.icon}
                  size={16}
                />

                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-red-600 dark:text-red-400">
                <Icon name="alert" size={18} />
              </div>

              <div>
                <h3 className="font-medium text-red-700 dark:text-red-300">
                  Failed to load authentication
                </h3>

                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stats */}
            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon="key"
                label="Enabled providers"
                value={String(enabledProviders)}
                hint="Currently available sign-in methods"
              />

              <StatCard
                icon="check"
                label="Authentication"
                value="Ready"
                hint="Authentication service is available"
              />

              <StatCard
                icon="shield"
                label="Supported methods"
                value={String(supportedProviders.length)}
                hint="Available provider configurations"
              />
            </section>

            {/* Providers Workspace */}
            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Sign-in providers
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Choose how users can authenticate with this
                      application.
                    </p>
                  </div>

                  <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:flex">
                    <Icon name="key" size={19} />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {supportedProviders.map((provider) => {
                  const enabled = isEnabled(provider);
                  const busy = updating === provider;

                  return (
                    <ProviderRow
                      key={provider}
                      provider={provider}
                      enabled={enabled}
                      busy={busy}
                      onToggle={() =>
                        toggleProvider(provider)
                      }
                    />
                  );
                })}
              </div>
            </section>

            {/* Information */}
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-zinc-500 dark:text-zinc-400">
                  <Icon name="info" size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Configure authentication for your application
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Users will only be able to use providers that are
                    enabled here.
                  </p>
                </div>
              </div>

              <Link
                href={`${basePath}/users`}
                className="shrink-0 text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                View users →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Provider Row                                                               */
/* ========================================================================== */

function ProviderRow({
  provider,
  enabled,
  busy,
  onToggle,
}: {
  provider: string;
  enabled: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-6 py-6 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              enabled
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            <Icon
              name={
                provider === "email-password"
                  ? "mail"
                  : "link"
              }
              size={19}
            />
          </div>

          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {providerLabels[provider] ?? provider}
              </h3>

              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  enabled
                    ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
              >
                {enabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {providerDescriptions[provider] ??
                "Configure this authentication provider for your application."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
            enabled
              ? "bg-zinc-900 dark:bg-white"
              : "bg-zinc-300 dark:bg-zinc-700"
          } ${
            busy
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
          aria-label={`Toggle ${
            providerLabels[provider] ?? provider
          }`}
          aria-pressed={enabled}
        >
          <span
            className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition ${
              enabled
                ? "translate-x-5"
                : "translate-x-0.5"
            } ${
              enabled
                ? "dark:bg-zinc-900"
                : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Loading                                                                    */
/* ========================================================================== */

function LoadingState() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          />
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
          <div className="h-5 w-48 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />

                <div>
                  <div className="h-4 w-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />

                  <div className="mt-3 h-4 w-96 max-w-[60vw] animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>

              <div className="h-6 w-11 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ========================================================================== */
/* Stat Card                                                                  */
/* ========================================================================== */

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
        <Icon name={icon} size={19} />
      </div>

      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        {hint}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* Icon                                                                       */
/* ========================================================================== */

function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<
    string,
    React.ReactNode
  > = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    key: (
      <>
        <circle cx="7.5" cy="15.5" r="4.5" />
        <path d="m11 12 9-9M17 6l2 2M14 9l2 2" />
      </>
    ),

    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),

    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.14 1.14" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.14-1.14" />
      </>
    ),

    chart: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 3-4 3 2 5-7" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.56-1H6v-2.4h1.04a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88L8.2 8.66l1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.56V4h2.4v.2a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.56 1H22v2.4h-1.04a1.7 1.7 0 0 0-1.56 1Z" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 4 6v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),

    alert: (
      <>
        <path d="M10.3 3.8 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
  };

  return (
    <svg {...common}>
      {paths[name] ?? paths.info}
    </svg>
  );
}