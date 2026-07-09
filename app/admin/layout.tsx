"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("isAdmin");

  useEffect(() => {
    // If not authenticated and not already on the login page, redirect to login
    if (!isAdmin && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [isAdmin, router, pathname]);

  // Allow the login page to render even when not authenticated
  if (!isAdmin && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
