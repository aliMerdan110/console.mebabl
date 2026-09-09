"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  return (
    <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
      <Link
        href="/"
        className="hover:text-zinc-900 dark:hover:text-white"
      >
        Home
      </Link>

      {segments.map((segment, index) => {
        const href =
          "/" + segments.slice(0, index + 1).join("/");

        return (
          <span key={href} className="flex items-center gap-2">
            <span>/</span>

            <Link
              href={href}
              className="capitalize hover:text-zinc-900 dark:hover:text-white"
            >
              {segment.replaceAll("-", " ")}
            </Link>
          </span>
        );
      })}
    </div>
  );
}