import Link from "next/link";
import { getServerApiUrl } from "@/app/lib/api";

export const dynamic = "force-dynamic";

type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  stack: string[];
  images?: string[];
  preview?: string;
  link?: string;
};

export default async function ProjectsPage() {
  const res = await fetch(getServerApiUrl("/api/admin/projects"), { cache: "no-store" });
  const projects: Project[] = await res.json();

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-20 px-6 sm:px-8 lg:px-10">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
          Selected work
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Projects that blend strategy, design, and product thinking.
        </h1>
        <p className="text-lg text-muted-foreground">
          I build polished interfaces and thoughtful systems for founders, teams,
          and modern brands.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="group overflow-hidden rounded-3xl border border-border bg-card/70 shadow-sm"
          >
            <div className="relative">
              {project.preview ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                  <img
                    src={project.preview}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full bg-muted" />
              )}
              <div className="pointer-events-none absolute left-4 bottom-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                {project.category}
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-semibold text-foreground">{project.title}</h2>
              <p className="mt-3 text-muted-foreground">{project.summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-background/60 px-3 py-1 text-sm text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex items-center text-sm font-semibold text-primary"
                >
                  View project →
                </Link>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Live Preview
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
