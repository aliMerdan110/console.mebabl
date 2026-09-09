"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Topbar from "@/components/layout/Topbar";
import { apiFetch } from "@/lib/api";

type TableSchema = {
  name: string;
  columnsCount: number;
  rowsCount: number;
  createdAt: string;
};

export default function DatabaseDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id;

  const [activeTab, setActiveTab] = useState<"tables" | "query" | "settings">("tables");
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users;");
  const [queryResult, setQueryResult] = useState<any>(null);

  async function loadTables() {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch(`/Applications/${appId}/database/tables`);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load database tables.");
      }

      const data = await response.json();
      setTables(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load database tables.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (appId) {
      loadTables();
    }
  }, [appId]);

  function handleRunQuery(e: React.FormEvent) {
    e.preventDefault();
    // محاكاة تشغيل استعلام SQL
    setQueryResult({
      columns: ["id", "email", "created_at"],
      rows: [
        { id: 1, email: "developer@mebabl.com", created_at: "2026-06-01" },
        { id: 2, email: "winter@mebabl.com", created_at: "2026-06-15" },
      ],
    });
  }

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
          <span className="text-zinc-900 dark:text-white font-medium">Database</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              🗄️ Database Service
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              إدارة الجداول، استعراض السجلات، وتنفيذ استعلامات SQL المباشرة.
            </p>
          </div>

          <button
            onClick={() => alert("Open Create Table Modal")}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            + Create New Table
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("tables")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "tables"
                ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Tables Schema
          </button>
          <button
            onClick={() => setActiveTab("query")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "query"
                ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            SQL Query Editor
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "settings"
                ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Connection & Settings
          </button>
        </div>

        {/* Tab Content: Tables */}
        {activeTab === "tables" && (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Database Tables</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-zinc-500">Loading tables...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : tables.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-sm">No tables created in this application yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                  <thead className="bg-zinc-50 text-xs uppercase text-zinc-400 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-4">Table Name</th>
                      <th className="px-6 py-4">Columns</th>
                      <th className="px-6 py-4">Rows</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {tables.map((tbl, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-4 font-mono font-medium text-zinc-900 dark:text-white">
                          {tbl.name}
                        </td>
                        <td className="px-6 py-4">{tbl.columnsCount} columns</td>
                        <td className="px-6 py-4">{tbl.rowsCount} rows</td>
                        <td className="px-6 py-4 text-xs">
                          {new Date(tbl.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-600 hover:underline dark:text-blue-400 text-xs font-medium">
                            Browse Data
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

        {/* Tab Content: SQL Query Editor */}
        {activeTab === "query" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">SQL Console</h2>
              <p className="text-sm text-zinc-500 mb-4">اكتب استعلام SQL واضغط على تشغيل لمعاينة النتائج مباشرة.</p>
              
              <form onSubmit={handleRunQuery}>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-900 p-4 font-mono text-sm text-green-400 dark:border-zinc-700"
                  placeholder="SELECT * FROM table_name;"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                  >
                    ▶ Run Query
                  </button>
                </div>
              </form>
            </div>

            {queryResult && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-md font-semibold text-zinc-900 dark:text-white mb-3">Query Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono text-zinc-600 dark:text-zinc-300">
                    <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                      <tr>
                        {queryResult.columns.map((col: string, i: number) => (
                          <th key={i} className="px-4 py-2">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {queryResult.rows.map((row: any, i: number) => (
                        <tr key={i}>
                          {queryResult.columns.map((col: string, j: number) => (
                            <td key={j} className="px-4 py-2">{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Settings */}
        {activeTab === "settings" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Database Connection Strings</h2>
            <p className="text-sm text-zinc-500 mb-6">استخدم بيانات الاتصال التالية للربط مع قواعد البيانات الخارجية أو الأدوات البرمجية.</p>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">PostgreSQL Connection URL</label>
                <input
                  type="text"
                  readOnly
                  value={`postgresql://app_user:secret@db.mebabl.local:5432/${appId}`}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}