"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/app/lib/constants";

type LightboxState = {
  title: string;
  images: string[];
} | null;

function getProjectImages(project: Project) {
  const images = [
    ...(project.images ?? []),
    ...(project.preview ? [project.preview] : []),
  ].filter(Boolean) as string[];

  return Array.from(new Set(images));
}

export default function ProjectsGalleryClient({ projects }: { projects: Project[] }) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const openLightbox = (project: Project, index = 0) => {
    const images = getProjectImages(project);

    if (images.length === 0) return;

    setLightbox({ title: project.title, images });
    setActiveImageIndex(index);
  };

  const closeLightbox = () => {
    setLightbox(null);
    setActiveImageIndex(0);
  };

  const showPreviousImage = () => {
    if (!lightbox) return;

    setActiveImageIndex((prev) => (prev === 0 ? lightbox.images.length - 1 : prev - 1));
  };

  const showNextImage = () => {
    if (!lightbox) return;

    setActiveImageIndex((prev) => (prev === lightbox.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 sm:px-8 lg:px-10">
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
          {projects.map((project) => {
            const images = getProjectImages(project);

            return (
              <article
                key={project.slug}
                className="group overflow-hidden rounded-3xl border border-border bg-card/70 shadow-sm"
              >
                <div className="relative">
                  {images.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => openLightbox(project, 0)}
                      className="block aspect-[16/9] w-full overflow-hidden bg-muted"
                    >
                      <img
                        src={images[0]}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/55 to-transparent p-4 text-sm font-medium text-white">
                        View gallery
                      </span>
                    </button>
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
            );
          })}
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-6">
          <div className="relative w-full max-w-5xl rounded-2xl border border-white/10 bg-background/95 p-3 shadow-2xl sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Project gallery</p>
                <h3 className="text-lg font-semibold text-foreground">{lightbox.title}</h3>
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-black/90">
              <img
                src={lightbox.images[activeImageIndex]}
                alt={`${lightbox.title} preview ${activeImageIndex + 1}`}
                className="max-h-[70vh] w-full object-contain"
              />

              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                    aria-label="Next image"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {lightbox.images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {lightbox.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-16 w-24 overflow-hidden rounded-lg border transition ${
                      index === activeImageIndex ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={image} alt={`${lightbox.title} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
