import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const collections = [
  { id: "users", name: "Users", documents: 0 },
  { id: "products", name: "Products", documents: 0 },
  { id: "orders", name: "Orders", documents: 0 },
];

export default function CollectionsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Collections</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage database collections.
              </p>
            </div>

            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900">
              + Create Collection
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/applications/demo-app/database/documents?collection=${collection.id}`}
                className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h2 className="font-semibold">
                  {collection.name}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {collection.documents} documents
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