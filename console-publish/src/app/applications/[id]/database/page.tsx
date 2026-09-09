import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DatabasePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Database
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Manage your application database.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
  href="/applications/demo-app/database/collections"
  className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
>
              <h2 className="font-semibold">
                Collections
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Create and manage collections.
              </p>
            </Link>

            <Link
  href="/applications/demo-app/database/documents"
  className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
>
              <h2 className="font-semibold">
                Documents
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Manage documents and data.
              </p>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}