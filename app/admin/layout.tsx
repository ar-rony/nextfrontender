"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
 
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
 
  useEffect(() => {
    const storedValue = window.localStorage.getItem("isAdmin");
    const storedRole = window.localStorage.getItem("adminRole");
    const authenticated = storedValue === "true" && !!storedRole;
 
    setAdminRole(storedRole);
    setIsAdmin(authenticated);
 
    if (!authenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
      return;
    }
 
    if (authenticated && pathname === "/admin" && storedRole !== "Superadmin") {
      router.push("/admin/projects");
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
