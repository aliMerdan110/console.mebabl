import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const files = [
  {
    name: "image.png",
    size: "0 KB",
    type: "image/png",
  },
  {
    name: "document.pdf",
    size: "0 KB",
    type: "application/pdf",
  },
];

export default function FilesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Files</h1>

              <p className="mt-1 text-sm text-zinc-500">
                Manage stored files.
              </p>
            </div>

            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900">
              + Upload File
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between border-b border-zinc-200 p-5 last:border-0 dark:border-zinc-800"
              >
                <div>
                  <h2 className="font-medium">
                    {file.name}
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    {file.type}
                  </p>
                </div>

                <span className="text-sm text-zinc-500">
                  {file.size}
                </span>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}