"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Topbar from "@/components/layout/Topbar";
import { apiFetch } from "@/lib/api";

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  isActive: boolean;
};

export default function AuthDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id;

  const [activeTab, setActiveTab] = useState<"users" | "roles" | "settings">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      // جلب المستخدمين التابعين لهذا التطبيق
      const response = await apiFetch(`/Applications/${appId}/auth/users`);
      
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load application users.");
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (appId) {
      loadUsers();
    }
  }, [appId]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Topbar />

      <main className="flex-1 mx-auto w-full max-w-7xl p-6 lg:p-10">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href={`/applications/${appId}`} className="hover:underline">
            ← Back to Application
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">Authentication</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              🔐 Authentication Service
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              إدارة المستخدمين، الجلسات، والصلاحيات الخاصة بالتطبيق.
            </p>
          </div>

          <button
            onClick={() => alert("Open Add User Modal")}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            + Add New User
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "users"
                ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Users Management
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "roles"
                ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "settings"
                ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Auth Providers & Settings
          </button>
        </div>

        {/* Tab Content: Users */}
        {activeTab === "users" && (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Registered Users</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-zinc-500">Loading users...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-sm">No users found in this application yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                  <thead className="bg-zinc-50 text-xs uppercase text-zinc-400 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900 dark:text-white">{u.email}</div>
                          {u.name && <div className="text-xs text-zinc-400">{u.name}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-mono dark:bg-zinc-800">
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                            }`}
                          >
                            {u.isActive ? "Active" : "Banned"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-600 hover:underline dark:text-blue-400 text-xs font-medium">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Roles */}
        {activeTab === "roles" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Roles & Permissions Management</h2>
            <p className="text-sm text-zinc-500 mb-6">قم بتعريف الأدوار المخصصة (مثل Admin, Moderator) وتحديد الصلاحيات المرتبطة بها.</p>
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
              <p className="text-sm text-zinc-500">No custom roles created yet.</p>
              <button className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white dark:bg-white dark:text-zinc-900">
                Create Role
              </button>
            </div>
          </div>
        )}

        {/* Tab Content: Settings */}
        {activeTab === "settings" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Authentication Settings</h2>
            <p className="text-sm text-zinc-500 mb-6">إعدادات توكن الجلسات (JWT)، انتهاء صلاحية التوكن، وطرق تسجيل الدخول المتاحة.</p>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">JWT Expiration Time</label>
                <input type="text" defaultValue="7d" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password Minimum Length</label>
                <input type="number" defaultValue={8} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              </div>
              <button className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white dark:bg-white dark:text-zinc-900">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}