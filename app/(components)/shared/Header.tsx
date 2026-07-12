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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center justify-center text-2xl font-bold tracking-tight">
            <img src="/favicon.png" className="mr-2 rounded-sm" alt="NextFrontender" width="32" height="32" />
            Next<span className="text-primary">Frontender</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
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

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAdmin ? (
              <Link
                href={adminRole === "Superadmin" ? "/admin" : "/admin/projects"}
                className="hidden items-center justify-center rounded-full bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700 md:inline-flex"
                aria-label="Admin dashboard"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M12 2l7 4v6c0 5-3.6 9.7-7 10-3.4-.3-7-5-7-10V6l7-4zm0 2.2L6 7.2v4.9c0 3.9 2.7 7.4 6 7.8 3.3-.4 6-3.9 6-7.8V7.2l-6-3zM11 8h2v5h-2V8zm0 7h2v2h-2v-2z" />
                </svg>
              </Link>
            ) : null}

            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 text-foreground transition hover:bg-accent md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-55 bg-black/40 transition-opacity duration-300 md:hidden",
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-60 flex h-full w-72 max-w-[85vw] flex-col border-l border-border bg-background p-6 shadow-2xl transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-lg font-semibold">Menu</span>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground transition hover:bg-accent"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "text-base font-medium transition-colors hover:text-primary",
                pathname === href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {isAdmin ? (
          <Link
            href={adminRole === "Superadmin" ? "/admin" : "/admin/projects"}
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-auto inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
          >
            Admin Dashboard
          </Link>
        ) : null}
      </div>
    </>
  );
}