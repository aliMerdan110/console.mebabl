"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export default function UserDetailsPage() {
  const params = useParams();

  const applicationId = params.id as string;
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUser() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(`/users/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to load user (${response.status})`);
      }

      const data: User = await response.json();

      setUser(data);
      setUsername(data.username);
      setIsActive(data.isActive);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load user."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveUser() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await apiFetch(`/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          username,
          isActive,
        }),
      });

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text || `Failed to update user (${response.status})`
        );
      }

      setMessage("User updated successfully.");

      await loadUser();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update user."
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading user...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900 dark:bg-red-950">
          User not found.
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-8">
        <Link
          href={`/applications/${applicationId}/users`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          ← Users
        </Link>

        <h1 className="mt-4 text-2xl font-bold">
          User
        </h1>

        <p className="mt-1 font-mono text-xs text-zinc-500">
          {user.id}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
          {message}
        </div>
      )}

      <div className="max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <p className="text-xs text-zinc-500">
            Email
          </p>

          <p className="mt-1">
            {user.email}
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium">
            Username
          </label>

          <input
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
            />

            Active
          </label>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-zinc-500">
              Created
            </p>

            <p className="mt-1 text-sm">
              {new Date(user.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Last Login
            </p>

            <p className="mt-1 text-sm">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : "Never"}
            </p>
          </div>
        </div>

        <button
          onClick={saveUser}
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </main>
  );
}