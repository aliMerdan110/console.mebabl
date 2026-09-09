"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Applications", href: "/applications" },
  { name: "Database", href: "/applications/demo-app/database" },
  { name: "Storage", href: "/applications/demo-app/storage" },
  { name: "Realtime", href: "/applications/demo-app/realtime" },
  { name: "Notifications", href: "/applications/demo-app/notifications" },
  { name: "Chat", href: "/applications/demo-app/chat" },
];

const applicationNavigation = [
  { name: "Overview", href: "/applications/demo-app" },
  { name: "Credentials", href: "/applications/demo-app/credentials" },
  { name: "Users", href: "/applications/demo-app/users" },
  { name: "Roles", href: "/applications/demo-app/roles" },
  {
    name: "Permissions",
    href: "/applications/demo-app/permissions",
  },
  {
    name: "Collections",
    href: "/applications/demo-app/database/collections",
  },
  {
    name: "Documents",
    href: "/applications/demo-app/database/documents",
  },
  {
    name: "Buckets",
    href: "/applications/demo-app/storage/buckets",
  },
  {
    name: "Files",
    href: "/applications/demo-app/storage/files",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
        >
          Mebabl
          <span className="ml-1 text-zinc-500">
            Console
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Console
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Application
        </p>

        <div className="space-y-1">
          {applicationNavigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-zinc-200 p-4 text-xs text-zinc-500 dark:border-zinc-800">
        Mebabl Platform
        <br />
        Developer Console
      </div>
    </aside>
  );
}