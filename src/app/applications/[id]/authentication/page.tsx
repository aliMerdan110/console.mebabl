// src/app/applications/[id]/authentication/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Breadcrumb from "@/components/layout/Breadcrumb";
import { apiFetch } from "@/lib/api";

type User = {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  providers: string;
  createdAt: string;
  lastSignInAt?: string | null;
  signedInAt?: string | null;
  isActive: boolean;
};

type Provider = {
  provider: string;
  isEnabled: boolean;
};

const tabs = [
  { label: "Overview", href: "", icon: "grid" },
  { label: "Users", href: "/users", icon: "users" },
  { label: "Sign-in methods", href: "/sign-in-method", icon: "key" },
  { label: "Email templates", href: "/templates", icon: "mail" },
  { label: "Usage", href: "/usage", icon: "chart" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export default function AuthenticationPage() {
  const params = useParams<{ id: string }>();
  const applicationId = String(params.id);

  const basePath = `/applications/${applicationId}/authentication`;

  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    const response = await apiFetch(
      `/applications/${applicationId}/users`,
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(
        message || `Unable to load users (${response.status})`,
      );
    }

    const data = await response.json();

    const result = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.users)
          ? data.users
          : [];

    setUsers(result);
  }, [applicationId]);

  const loadProviders = useCallback(async () => {
    const response = await apiFetch(
      `/applications/${applicationId}/authentication/providers`,
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(
        message ||
          `Unable to load authentication providers (${response.status})`,
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
  }, [applicationId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        await Promise.all([
          loadUsers(),
          loadProviders(),
        ]);
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load authentication data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadUsers, loadProviders]);

  const totalUsers = users.length;

  const activeToday = users.filter((user) => {
    const value = user.lastSignInAt ?? user.signedInAt;

    if (!value) {
      return false;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const now = new Date();

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }).length;

  const enabledProviders = providers.filter(
    (provider) => provider.isEnabled,
  ).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb />

        <div className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Icon name="shield" size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Authentication
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage users, sign-in providers, and account security.
              </p>
            </div>
          </div>

          <Link
            href={`${basePath}/settings`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            <Icon name="settings" size={16} />
            Authentication settings
          </Link>
        </div>

        <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={`${basePath}${tab.href}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </Link>
          ))}
        </nav>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
            <h3 className="font-medium text-red-700 dark:text-red-300">
              Failed to load authentication
            </h3>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="users"
            label="Total users"
            value={loading ? "..." : String(totalUsers)}
            hint="Registered accounts"
          />

          <StatCard
            icon="activity"
            label="Active today"
            value={loading ? "..." : String(activeToday)}
            hint="Users signed in today"
          />

          <StatCard
            icon="key"
            label="Providers"
            value={loading ? "..." : String(enabledProviders)}
            hint="Enabled sign-in methods"
          />

          <StatCard
            icon="check"
            label="Service status"
            value="Ready"
            hint="Authentication is enabled"
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Authentication workspace
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage the main authentication features of this application.
              </p>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <WorkspaceLink
                href={`${basePath}/users`}
                icon="users"
                title="Users"
                text="View and manage registered users."
                action="Open users"
              />

              <WorkspaceLink
                href={`${basePath}/sign-in-method`}
                icon="key"
                title="Sign-in methods"
                text="Choose how users access your application."
                action="Configure"
              />

              <WorkspaceLink
                href={`${basePath}/templates`}
                icon="mail"
                title="Email templates"
                text="Customize authentication and security emails."
                action="Edit templates"
              />

              <WorkspaceLink
                href={`${basePath}/settings`}
                icon="lock"
                title="Security controls"
                text="Review authentication settings and account policies."
                action="Review settings"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Icon name="activity" size={20} />
              </div>

              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Live overview
              </span>
            </div>

            <h2 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-white">
              Authentication status
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Your authentication service is ready and connected to this application.
            </p>

            <div className="mt-6 space-y-3">
              <ActivityRow
                label="Application users"
                value={loading ? "..." : String(totalUsers)}
              />

              <ActivityRow
                label="Enabled providers"
                value={loading ? "..." : String(enabledProviders)}
              />

              <ActivityRow
                label="Active today"
                value={loading ? "..." : String(activeToday)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ActivityRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-zinc-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

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
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <Icon name={icon} size={19} />
      </div>

      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-400">
        {hint}
      </p>
    </div>
  );
}

function WorkspaceLink({
  href,
  icon,
  title,
  text,
  action,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-200 p-5 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Icon name={icon} size={18} />
        </span>

        <span className="text-xs font-medium text-zinc-500 opacity-0 transition group-hover:opacity-100">
          {action} →
        </span>
      </div>

      <h3 className="font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
        {text}
      </p>
    </Link>
  );
}

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

  const paths: Record<string, React.ReactNode> = {
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

    activity: (
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    ),

    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),

    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}