// src/app/applications/[id]/authentication/users/page.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

const providerLabels: Record<string, string> = {
  password: "Email/Password",
  "email-password": "Email/Password",
  email: "Email/Password",
  google: "Google",
  facebook: "Facebook",
  phone: "Phone",
  anonymous: "Anonymous",
  apple: "Apple",
  github: "GitHub",
  microsoft: "Microsoft",
};

const tabs = [
  { label: "Overview", href: "", icon: "grid" },
  { label: "Users", href: "/users", icon: "users" },
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
  { label: "Usage", href: "/usage", icon: "chart" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export default function UsersPage() {
  const params = useParams<{ id: string }>();
  const applicationId = String(params.id);

  const basePath =
    `/applications/${applicationId}/authentication`;

  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] =
    useState("all");

  const [showCreateUser, setShowCreateUser] =
    useState(false);

  const loadUsers = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await apiFetch(
          `/applications/${applicationId}/users`,
        );

        if (!response.ok) {
          const message = await response.text();

          throw new Error(
            message ||
              `Unable to load users (${response.status})`,
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
      } catch (error) {
        console.error(
          "Failed to load application users:",
          error,
        );

        setUsers([]);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load users.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applicationId],
  );

  const loadProviders = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error(
        "Failed to load authentication providers:",
        error,
      );

      setProviders([]);
    }
  }, [applicationId]);

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    void loadUsers();
    void loadProviders();
  }, [
    applicationId,
    loadUsers,
    loadProviders,
  ]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        [
          user.email,
          user.username,
          user.displayName,
          user.id,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      const userProviders =
        getUserProviders(user);

      const matchesProvider =
        providerFilter === "all" ||
        userProviders.some(
          (provider) =>
            normalizeProvider(provider) ===
            normalizeProvider(providerFilter),
        );

      return matchesSearch && matchesProvider;
    });
  }, [
    users,
    search,
    providerFilter,
  ]);

  const activeUsers = users.filter(
    (user) => user.isActive,
  ).length;

  const enabledProviders = providers.filter(
    (provider) => provider.isEnabled,
  ).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Icon name="users" size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Users
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage the users who belong to this
                application.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateUser(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            <Icon name="plus" size={16} />
            Create user
          </button>
        </div>

        {/* Tabs */}

        <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((tab) => {
            const active =
              tab.href === "/users";

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
            <h3 className="font-medium text-red-700 dark:text-red-300">
              Failed to load users
            </h3>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Stats */}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon="users"
            label="Total users"
            value={
              loading
                ? "..."
                : String(users.length)
            }
            hint="Registered accounts"
          />

          <StatCard
            icon="check"
            label="Active users"
            value={
              loading
                ? "..."
                : String(activeUsers)
            }
            hint="Currently active accounts"
          />

          <StatCard
            icon="key"
            label="Sign-in providers"
            value={
              loading
                ? "..."
                : String(enabledProviders)
            }
            hint="Enabled authentication methods"
          />
        </section>

        {/* Users Workspace */}

        <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Toolbar */}

          <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    <Icon name="users" size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Users list
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {filteredUsers.length} user
                      {filteredUsers.length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}

                <div className="relative sm:w-[320px]">
                  <Icon
                    name="search"
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search by identifier or UID"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:bg-zinc-800 dark:focus:ring-zinc-700"
                  />
                </div>

                {/* Provider */}

                <select
                  value={providerFilter}
                  onChange={(event) =>
                    setProviderFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="all">
                    All providers
                  </option>

                  {providers
                    .filter(
                      (provider) =>
                        provider.isEnabled,
                    )
                    .map((provider) => (
                      <option
                        key={provider.provider}
                        value={provider.provider}
                      >
                        {getProviderLabel(
                          provider.provider,
                        )}
                      </option>
                    ))}
                </select>

                {/* Refresh */}

                <button
                  type="button"
                  disabled={refreshing}
                  onClick={() =>
                    loadUsers(true)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:text-white"
                >
                  <Icon
                    name="refresh"
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Workspace Error */}

          {error && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Content */}

          {loading ? (
            <LoadingTable />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              search={search}
              onCreate={() =>
                setShowCreateUser(true)
              }
            />
          ) : (
            <UsersTable
              users={filteredUsers}
            />
          )}

          {/* Footer */}

          {!loading &&
            filteredUsers.length > 0 && (
              <div className="border-t border-zinc-200 px-6 py-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                Showing {filteredUsers.length} of{" "}
                {users.length} users
              </div>
            )}
        </section>

        {/* Information */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Icon
              name="info"
              size={18}
              className="text-zinc-500 dark:text-zinc-400"
            />

            <span className="text-zinc-600 dark:text-zinc-300">
              Users created here belong directly to
              this application.
            </span>
          </div>

          <Link
            href={`${basePath}/sign-in-method`}
            className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
          >
            Manage providers →
          </Link>
        </div>
      </div>

      {/* Create User Modal */}

      {showCreateUser && (
        <CreateUserModal
          applicationId={applicationId}
          onClose={() =>
            setShowCreateUser(false)
          }
          onCreated={() => {
            setShowCreateUser(false);
            void loadUsers(true);
          }}
        />
      )}
    </div>
  );
}

/* ========================================================================== */
/* Users Table                                                                */
/* ========================================================================== */

function UsersTable({
  users,
}: {
  users: User[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40">
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Identifier
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Providers
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Created
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Signed In
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
              User UID
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const identifier =
              user.email ||
              user.username ||
              "Anonymous user";

            return (
              <tr
                key={user.id}
                className="border-b border-zinc-100 transition hover:bg-zinc-50 last:border-0 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {getInitials(identifier)}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {identifier}
                      </div>

                      {user.username &&
                        user.username !==
                          identifier && (
                          <div className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {user.username}
                          </div>
                        )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {getUserProviders(user).map(
                      (provider) => (
                        <span
                          key={provider}
                          className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {getProviderLabel(
                            provider,
                          )}
                        </span>
                      ),
                    )}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    {formatDate(user.createdAt)}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    {formatDate(
                      user.lastSignInAt ??
                        user.signedInAt,
                    )}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <code
                    title={user.id}
                    className="inline-block max-w-[190px] truncate rounded-lg bg-zinc-100 px-2.5 py-1.5 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {user.id}
                  </code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ========================================================================== */
/* Create User Modal                                                          */
/* ========================================================================== */

function CreateUserModal({
  applicationId,
  onClose,
  onCreated,
}: {
  applicationId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] =
    useState("");
  const [username, setUsername] = useState("");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );
      return;
    }

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    try {
      setCreating(true);

      const response = await apiFetch(
        `/applications/${applicationId}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            username: username.trim(),
            displayName: displayName.trim(),
          }),
        },
      );

      if (!response.ok) {
        const message =
          await response.text();

        let errorMessage =
          `Unable to create user (${response.status})`;

        if (message) {
          try {
            const data = JSON.parse(message);

            errorMessage =
              data?.message ||
              data?.title ||
              data?.detail ||
              errorMessage;
          } catch {
            errorMessage = message;
          }
        }

        throw new Error(errorMessage);
      }

      onCreated();
    } catch (error) {
      console.error(
        "Failed to create application user:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create user.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <Icon name="users" size={17} />
              </div>

              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Create user
              </h2>
            </div>

            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Create an application user manually.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Icon name="close" size={19} />
          </button>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="user@example.com"
              type="email"
            />

            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter a password"
              type="password"
            />

            <Field
              label="Display name"
              value={displayName}
              onChange={setDisplayName}
              placeholder="John Doe"
            />

            <Field
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="john"
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Actions */}

          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {creating && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900" />
              )}

              {creating
                ? "Creating..."
                : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Field                                                                      */
/* ========================================================================== */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
      />
    </div>
  );
}

/* ========================================================================== */
/* Empty State                                                                */
/* ========================================================================== */

function EmptyState({
  search,
  onCreate,
}: {
  search: string;
  onCreate: () => void;
}) {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
        <Icon name="users" size={28} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-white">
        {search
          ? "No users found"
          : "No users yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {search
          ? "Try changing your search criteria."
          : "Create your first user to start building your application's identity system."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          <Icon name="plus" size={16} />
          Create user
        </button>
      )}
    </div>
  );
}

/* ========================================================================== */
/* Loading                                                                    */
/* ========================================================================== */

function LoadingTable() {
  return (
    <div className="space-y-3 p-6">
      {[1, 2, 3, 4, 5].map(
        (item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
          />
        ),
      )}
    </div>
  );
}

/* ========================================================================== */
/* Stat Card                                                                  */
/* ========================================================================== */

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: string;
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

      <p className="mt-1 text-xs text-zinc-400">
        {hint}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

function getUserProviders(
  user: User,
): string[] {
  if (!user.providers) {
    return [];
  }

  return user.providers
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);
}

function normalizeProvider(
  value: string,
) {
  return value
    .toLowerCase()
    .replace(/[_\s]/g, "-");
}

function getProviderLabel(
  provider: string,
) {
  return (
    providerLabels[
      provider.toLowerCase()
    ] ||
    provider
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      )
  );
}

function getInitials(
  value: string,
) {
  const parts = value
    .split(/[\s@._-]+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/* ========================================================================== */
/* Icon                                                                       */
/* ========================================================================== */

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
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
    className,
  };

  const paths: Record<
    string,
    React.ReactNode
  > = {
    grid: (
      <>
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
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
        <circle
          cx="7.5"
          cy="15.5"
          r="4.5"
        />
        <path d="m11 12 9-9M17 6l2 2M14 9l2 2" />
      </>
    ),

    mail: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
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
        <circle
          cx="12"
          cy="12"
          r="3"
        />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.56-1H6v-2.4h1.04a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88L8.2 8.66l1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.56V4h2.4v.2a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.56 1H22v2.4h-1.04a1.7 1.7 0 0 0-1.56 1Z" />
      </>
    ),

    check: (
      <>
        <circle
          cx="12"
          cy="12"
          r="9"
        />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),

    info: (
      <>
        <circle
          cx="12"
          cy="12"
          r="9"
        />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    search: (
      <>
        <circle
          cx="11"
          cy="11"
          r="7"
        />
        <path d="m20 20-4-4" />
      </>
    ),

    refresh: (
      <>
        <path d="M20 11a8.1 8.1 0 0 0-14.8-4L3 10" />
        <path d="M3 4v6h6" />
        <path d="M4 13a8.1 8.1 0 0 0 14.8 4L21 14" />
        <path d="M21 20v-6h-6" />
      </>
    ),

    close: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
  };

  return (
    <svg {...common}>
      {paths[name] ?? paths.info}
    </svg>
  );
}