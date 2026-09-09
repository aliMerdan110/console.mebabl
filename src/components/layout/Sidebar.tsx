"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  applicationId?: string;
};

export default function Sidebar({
  applicationId,
}: SidebarProps) {
  const pathname = usePathname();

  const appPath = applicationId
    ? `/applications/${applicationId}`
    : "";

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
    },
    {
      name: "Applications",
      href: "/applications",
    },
  ];

  const applicationNavigation = applicationId
    ? [
        {
          name: "Overview",
          href: appPath,
        },
        {
          name: "Authentication",
          href: `${appPath}/authentication`,
        },
        {
          name: "Database",
          href: `${appPath}/database`,
        },
        {
          name: "Storage",
          href: `${appPath}/storage`,
        },
        {
          name: "Realtime",
          href: `${appPath}/realtime`,
        },
        {
          name: "Notifications",
          href: `${appPath}/notifications`,
        },
        {
          name: "Chat",
          href: `${appPath}/chat`,
        },
      ]
    : [];

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/applications") {
      return (
        pathname === "/applications" ||
        (
          pathname.startsWith("/applications/") &&
          !applicationId
        )
      );
    }

    if (href === appPath) {
      return pathname === appPath;
    }

    return pathname === href ||
      pathname.startsWith(`${href}/`);
  }

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
            const active = isActive(item.href);

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

        {applicationId && (
          <>
            <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Application
            </p>

            <div className="space-y-1">
              {applicationNavigation.map((item) => {
                const active = isActive(item.href);

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
          </>
        )}
      </nav>

      <div className="border-t border-zinc-200 p-4 text-xs text-zinc-500 dark:border-zinc-800">
        Mebabl Platform
        <br />
        Developer Console
      </div>
    </aside>
  );
}