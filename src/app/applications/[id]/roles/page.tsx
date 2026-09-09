import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const roles = [
  {
    name: "Administrator",
    description: "Full application access.",
  },
  {
    name: "User",
    description: "Standard application access.",
  },
];

export default function RolesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Roles</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage application roles.
              </p>
            </div>

            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900">
              + Create Role
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.name}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h2 className="font-semibold">{role.name}</h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}