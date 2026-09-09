import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const documents = [
  {
    id: "doc_001",
    data: "{ }",
  },
  {
    id: "doc_002",
    data: "{ }",
  },
];

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Documents</h1>

              <p className="mt-1 text-sm text-zinc-500">
                Collection documents.
              </p>
            </div>

            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900">
              + Create Document
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between border-b border-zinc-200 p-5 last:border-0 dark:border-zinc-800"
              >
                <code className="text-sm">
                  {document.id}
                </code>

                <code className="rounded bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-800">
                  {document.data}
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