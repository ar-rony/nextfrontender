"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const storedValue = window.localStorage.getItem("isAdmin");
    const authenticated = storedValue === "true";

    setIsAdmin(authenticated);

    if (!authenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  if (isAdmin === null) {
    return null;
  }

  if (!isAdmin && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
