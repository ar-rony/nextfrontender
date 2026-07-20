"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/app/lib/constants";

export default function ProjectsGalleryClient({ projects: initialProjects }: { projects?: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects ?? []);
  const [loading, setLoading] = useState<boolean>(!initialProjects);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProjects) return;

    let mounted = true;
    const controller = new AbortController();

    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/projects', { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        if (mounted) setProjects(data ?? []);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Projects fetch error', err);
        if (mounted) setError(err.message || 'Failed to load projects');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProjects();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [initialProjects]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 sm:px-8 lg:px-10">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Selected work</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Projects that blend strategy, design, and product thinking.</h1>
        <p className="text-lg text-muted-foreground">I build polished interfaces and thoughtful systems for founders, teams, and modern brands.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <article key={i} className="rounded-3xl border border-border bg-card/70 p-6">
              <div className="relative mb-4">
                <div className="block aspect-[16/9] w-full overflow-hidden bg-muted animate-pulse" aria-hidden />
              </div>

              <div className="space-y-3">
                <div className="h-6 w-3/4 rounded bg-muted/60 animate-pulse" aria-hidden />
                <div className="h-4 w-full max-w-2xl rounded bg-muted/50 animate-pulse" aria-hidden />
                <div className="h-4 w-5/6 rounded bg-muted/50 animate-pulse" aria-hidden />

                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-muted/50 animate-pulse" aria-hidden />
                  <div className="h-6 w-12 rounded-full bg-muted/50 animate-pulse" aria-hidden />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="h-8 w-28 rounded bg-muted/60 animate-pulse" aria-hidden />
                  <div className="h-6 w-20 rounded bg-muted/60 animate-pulse" aria-hidden />
                </div>
              </div>
            </article>
          ))
        ) : error ? (
          <div className="col-span-2 p-6 text-center text-sm text-destructive">{error}</div>
        ) : (
          projects.map((project) => {
            const img = (project.preview || (project.images && project.images[0])) ?? null;

            return (
              <article key={project.slug} className="group overflow-hidden rounded-3xl border border-border bg-card/70 shadow-sm">
                <div className="relative">
                  {img ? (
                    <Link href={`/projects/${project.slug}`} className="block aspect-[16/9] w-full overflow-hidden bg-muted">
                      <img src={img} alt={project.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <span className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/55 to-transparent p-4 text-sm font-medium text-white">View project</span>
                    </Link>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-muted" />
                  )}
                  <div className="pointer-events-none absolute left-4 bottom-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white">{project.category}</div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-foreground">{project.title}</h2>
                  <p className="mt-3 text-muted-foreground">{project.summary}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <span key={item} className="rounded-full bg-background/60 px-3 py-1 text-sm text-muted-foreground">{item}</span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Link href={`/projects/${project.slug}`} className="inline-flex items-center text-sm font-semibold text-primary">View project →</Link>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">Live Preview</a>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
