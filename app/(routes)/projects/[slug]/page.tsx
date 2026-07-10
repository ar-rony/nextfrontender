import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataStore } from "@/app/lib/datastore";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const projects = await dataStore.getProjects();
  const project = projects.find((entry) => entry.slug === slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: `${project.title} | Nextfrontender`,
    description: project.summary || project.description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const projects = await dataStore.getProjects();
  const project = projects.find((entry) => entry.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-20 px-6 sm:px-8 lg:px-10">
      <Link href="/projects" className="text-sm font-semibold text-primary">
        ← Back to projects
      </Link>
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          {project.category}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid gap-6 rounded-3xl border border-border bg-card/70 p-8 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-2xl font-semibold">What I delivered</h2>
          <p className="mt-3 text-muted-foreground">
            This project focused on translating complex requirements into a calm,
            easy-to-use product experience with a strong visual identity.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background/80 p-5">
          <h3 className="font-semibold">Stack</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {project.stack.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Images / gallery */}
      {project.images && project.images.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {project.images.map((img, idx) => (
            <img key={idx} src={img} alt={`${project.title}-${idx}`} className="rounded-lg w-full" />
          ))}
        </div>
      )}
    </section>
  );
}
