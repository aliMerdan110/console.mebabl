import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const notifications = [
  { title: "Welcome", status: "Read" },
  { title: "New update available", status: "Unread" },
];

export default async function NotificationsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Application notifications.
            </p>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.title}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="font-medium">
                  {notification.title}
                </span>

                <span className="text-sm text-zinc-500">
                  {notification.status}
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