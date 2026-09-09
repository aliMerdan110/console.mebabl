"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname !== "/login" &&
      pathname !== "/register" &&
      !isAuthenticated()
    ) {
      router.replace("/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}