
import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";

const stats = [
  {
    title: "Applications",
    value: "1",
    description: "Applications in your account",
    href: "/applications",
  },
  {
    title: "Users",
    value: "0",
    description: "Application users",
    href: "/users",
  },
  {
    title: "Database",
    value: "0",
    description: "Collections",
    href: "/database",
  },
  {
    title: "Storage",
    value: "0",
    description: "Stored files",
    href: "/storage",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6">
      <Breadcrumb />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Welcome to your Mebabl Developer Console.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {stat.title}
            </p>

            <p className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {stat.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Applications
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage your Mebabl applications.
              </p>
            </div>

            <Link
              href="/applications"
              className="text-sm font-medium text-zinc-900 hover:underline dark:text-white"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your applications will appear here.
            </p>

            <Link
              href="/applications/new"
              className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create Application
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Platform Services
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Services available to your applications.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/database"
              className="rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <p className="font-medium text-zinc-900 dark:text-white">
                Database
              </p>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Collections and documents
              </p>
            </Link>

            <Link
              href="/storage"
              className="rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <p className="font-medium text-zinc-900 dark:text-white">
                Storage
              </p>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Files and buckets
              </p>
            </Link>

            <Link
              href="/users"
              className="rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <p className="font-medium text-zinc-900 dark:text-white">
                Users
              </p>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Application users
              </p>
            </Link>

            <Link
              href="/roles"
              className="rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <p className="font-medium text-zinc-900 dark:text-white">
                Roles & Permissions
              </p>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Control application access
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}