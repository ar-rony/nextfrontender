import Link from "next/link";
import { dataStore } from "@/app/lib/datastore";

export function ProjectsSection() {
  const projects = dataStore.getProjects();

  return (
    <section id="projects" className="border-y border-border bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
              Featured projects
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Selected builds for ambitious brands.
            </h2>
          </div>
          <Link href="/projects" className="text-sm font-semibold text-primary">
            View all projects →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.slice(0, 2).map((project) => (
            <article key={project.slug} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              {project.preview && (
                <img src={project.preview} alt={project.title} className="w-full rounded-2xl mb-4" />
              )}
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                {project.category}
              </p>
              <h3 className="mt-3 text-2xl font-semibold">{project.title}</h3>
              <p className="mt-3 text-muted-foreground">{project.summary}</p>
              <Link href={`/projects/${project.slug}`} className="mt-6 inline-flex text-sm font-semibold text-primary">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
