import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const resources = [
  {
    name: "Credentials",
    href: "credentials",
    description: "API keys and credentials.",
  },
  {
    name: "Users",
    href: "users",
    description: "Application users.",
  },
  {
    name: "Roles",
    href: "roles",
    description: "Application roles.",
  },
  {
    name: "Permissions",
    href: "permissions",
    description: "Application permissions.",
  },
  {
    name: "Database",
    href: "database",
    description: "Collections and documents.",
  },
  {
    name: "Storage",
    href: "storage",
    description: "Buckets and stored files.",
  },
  {
    name: "Realtime",
    href: "realtime",
    description: "Channels and events.",
  },
  {
    name: "Notifications",
    href: "notifications",
    description: "Application notifications.",
  },
  {
    name: "Chat",
    href: "chat",
    description: "Conversations and messages.",
  },
];

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Zooz App
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Application ID: {id}
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">
              API Key
            </p>

            <p className="mt-2 font-mono text-sm">
              mb_****************
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Link
                key={resource.href}
                href={`/applications/${id}/${resource.href}`}
                className="rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <h2 className="font-semibold">
                  {resource.name}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {resource.description}
                </p>
              </Link>

           
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}