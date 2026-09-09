import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const conversations = [
  { title: "General", messages: 0 },
  { title: "Support", messages: 0 },
];

export default async function ChatPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">
          <Breadcrumb />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chat</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Conversations and messages.
              </p>
            </div>

            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900">
              + New Conversation
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.title}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h2 className="font-semibold">
                  {conversation.title}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {conversation.messages} messages
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