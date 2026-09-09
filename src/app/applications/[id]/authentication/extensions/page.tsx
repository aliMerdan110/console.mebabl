// app/applications/[id]/authentication/extensions/page.tsx

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const extensions = [
  {
    title: "Before User Created",
    description:
      "Run custom logic before a new user is created.",
    icon: "👤",
  },
  {
    title: "After User Created",
    description:
      "Execute custom logic after a user has been created.",
    icon: "✓",
  },
  {
    title: "Before Sign In",
    description:
      "Validate or modify a sign-in request before authentication.",
    icon: "🔐",
  },
  {
    title: "After Sign In",
    description:
      "Execute custom logic after successful authentication.",
    icon: "⚡",
  },
  {
    title: "Before Password Reset",
    description:
      "Run custom logic before a password reset is processed.",
    icon: "🔑",
  },
  {
    title: "After Password Reset",
    description:
      "Execute custom logic after a password has been reset.",
    icon: "🔒",
  },
];

export default function ExtensionsPage() {
  const params = useParams<{ id: string }>();
  const applicationId = String(params.id);

  return (
    <main className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <Header applicationId={applicationId} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Authentication Extensions
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Extend the authentication system with custom actions that run
            during the user authentication lifecycle.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {extensions.map((extension) => (
            <div
              key={extension.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-800">
                  {extension.icon}
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    {extension.title}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    {extension.description}
                  </p>

                  <button
                    type="button"
                    className="mt-5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="flex gap-4">
            <div className="text-xl">💡</div>

            <div>
              <h2 className="font-semibold text-blue-900 dark:text-blue-300">
                Authentication lifecycle
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-800/80 dark:text-blue-300/70">
                Extensions will allow applications to execute custom logic
                around registration, sign-in, password reset, and other
                authentication events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Header({ applicationId }: { applicationId: string }) {
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
          Extensions
        </span>
      </div>

      <div className="mb-8 overflow-x-auto">
        <nav className="flex min-w-max gap-1 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map(([label, href]) => (
            <Link
              key={label}
              href={`/applications/${applicationId}/authentication${href}`}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
                label === "Extensions"
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