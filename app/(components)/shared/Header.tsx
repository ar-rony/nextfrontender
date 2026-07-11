"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
 
  useEffect(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("isAdmin");
      const name = localStorage.getItem("adminUsername");
      const role = localStorage.getItem("adminRole");
      setIsAdmin(!!v);
      setAdminUsername(name);
      setAdminRole(role);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight flex items-center justify-center">
            <img  src="/favicon.png" className="mr-2 rounded-sm" alt="NextFrontender" width="32" height="32"/>
             Next<span className="text-primary">Frontender</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isAdmin ? (
            <Link
              href={adminRole === "Superadmin" ? "/admin" : "/admin/projects"}
              className="hidden md:inline-flex items-center justify-center rounded-full bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700"
              aria-label="Admin dashboard"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12 2l7 4v6c0 5-3.6 9.7-7 10-3.4-.3-7-5-7-10V6l7-4zm0 2.2L6 7.2v4.9c0 3.9 2.7 7.4 6 7.8 3.3-.4 6-3.9 6-7.8V7.2l-6-3zM11 8h2v5h-2V8zm0 7h2v2h-2v-2z" />
              </svg>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}