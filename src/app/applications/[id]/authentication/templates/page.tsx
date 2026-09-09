// app/applications/[id]/authentication/templates/page.tsx

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const templates = [
  {
    title: "Email verification",
    description: "Verify a user's email address.",
    status: "Ready",
    icon: "✓",
  },
  {
    title: "Password reset",
    description: "Allow users to securely reset their password.",
    status: "Ready",
    icon: "🔑",
  },
  {
    title: "Password changed",
    description: "Notify users after their password is changed.",
    status: "Ready",
    icon: "🔒",
  },
  {
    title: "Welcome email",
    description: "Send a welcome message after registration.",
    status: "Ready",
    icon: "👋",
  },
  {
    title: "Email address changed",
    description: "Notify users when their email address changes.",
    status: "Ready",
    icon: "✉️",
  },
];

export default function TemplatesPage() {
  const params = useParams<{ id: string }>();
  const applicationId = String(params.id);

  return (
    <main className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <AuthenticationHeader
          applicationId={applicationId}
          active="Templates"
        />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Templates
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Customize the emails and messages sent to your users.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-800">
                    {template.icon}
                  </div>

                  <div>
                    <h2 className="font-semibold text-zinc-900 dark:text-white">
                      {template.title}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {template.description}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {template.status}
                </span>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function AuthenticationHeader({
  applicationId,
  active,
}: {
  applicationId: string;
  active: string;
}) {
  const tabs = [
    ["Authentication", ""],
    // ["Users", "/users"],
    ["Sign-in method", "/sign-in-method"],
    ["Templates", "/templates"],
    ["Usage", "/usage"],
    ["Settings", "/settings"],
    ["Extensions", "/extensions"],
  ];

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link
          href={`/applications/${applicationId}`}
          className="hover:text-zinc-900 hover:underline dark:hover:text-white"
        >
          ← Back to Application
        </Link>

        <span>/</span>
        <span>Authentication</span>
        <span>/</span>

        <span className="font-medium text-zinc-900 dark:text-white">
          {active}
        </span>
      </div>

      <div className="mb-8 overflow-x-auto">
        <nav className="flex min-w-max gap-1 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map(([label, href]) => (
            <Link
              key={label}
              href={`/applications/${applicationId}/authentication${href}`}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
                label === active
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}