import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const permissions = [
  {
    name: "Users Read",
    code: "users.read",
  },
  {
    name: "Users Update",
    code: "users.update",
  },
  {
    name: "Users Delete",
    code: "users.delete",
  },
];

export default function PermissionsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Permissions</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage application permissions.
              </p>
            </div>

            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900">
              + Create Permission
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {permissions.map((permission) => (
              <div
                key={permission.code}
                className="flex items-center justify-between border-b border-zinc-200 p-5 last:border-0 dark:border-zinc-800"
              >
                <span className="font-medium">
                  {permission.name}
                </span>

                <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                  {permission.code}
                </code>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}