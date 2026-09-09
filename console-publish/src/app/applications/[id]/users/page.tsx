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
};

export default function UsersPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/users");

      if (!response.ok) {
        throw new Error(`Failed to load users (${response.status})`);
      }

      setUsers(await response.json());
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main className="p-6">
      <div className="mb-8">
        <Link
          href={`/applications/${applicationId}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          ← Application
        </Link>

        <h1 className="mt-4 text-2xl font-bold">Users</h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage users of this application.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold">No users</h2>

          <p className="mt-2 text-sm text-zinc-500">
            No users found for this application.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-4 border-b border-zinc-200 p-4 text-xs font-medium text-zinc-500 dark:border-zinc-800">
            <div>Username</div>
            <div>Email</div>
            <div>Status</div>
            <div>Created</div>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/applications/${applicationId}/users/${user.id}`}
                className="grid grid-cols-4 p-4 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <div className="font-medium">
                  {user.username}
                </div>

                <div className="text-zinc-500">
                  {user.email}
                </div>

                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      user.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}