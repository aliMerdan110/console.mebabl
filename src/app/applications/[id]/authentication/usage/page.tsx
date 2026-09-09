// app/applications/[id]/authentication/usage/page.tsx

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function UsagePage() {
  const params = useParams<{ id: string }>();
  const applicationId = String(params.id);

  return (
    <main className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <Header applicationId={applicationId} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Authentication Usage
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Monitor authentication activity and usage for this application.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              Usage period
            </p>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Last 30 days
            </p>
          </div>

          <select
            defaultValue="30"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card title="Total users" value="—" />
          <Card title="New users" value="—" />
          <Card title="Successful sign-ins" value="—" />
          <Card title="Failed sign-ins" value="—" />
          <Card title="Password resets" value="—" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Authentication activity"
            description="Sign-in activity over the selected period."
          />

          <ChartCard
            title="Provider usage"
            description="Authentication providers used by users."
          />
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
          Usage
        </span>
      </div>

      <div className="mb-8 overflow-x-auto">
        <nav className="flex min-w-max gap-1 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map(([label, href]) => (
            <Link
              key={label}
              href={`/applications/${applicationId}/authentication${href}`}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
                label === "Usage"
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

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>

      <div className="mt-6 flex h-56 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
        Usage data will appear here
      </div>
    </div>
  );
}