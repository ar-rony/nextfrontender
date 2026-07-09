import Link from "next/link";

import { projects } from "@/app/lib/constants";

export default function ProjectsPage() {
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
            className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              {project.category}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">{project.title}</h2>
            <p className="mt-3 text-muted-foreground">{project.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border px-3 py-1 text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
            <Link
              href={`/projects/${project.slug}`}
              className="mt-6 inline-flex items-center text-sm font-semibold text-primary"
            >
              View project →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
