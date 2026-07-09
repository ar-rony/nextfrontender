import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
          Frontend Developer • UI Engineer
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          I craft modern web experiences with clarity and momentum.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          I help brands launch thoughtful interfaces that feel polished, fast,
          and easy to use.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/projects" className={buttonVariants({ size: "lg" })}>
          See projects
        </Link>
        <Link
          href="/contact"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Start a conversation
        </Link>
      </div>
    </section>
  );
}
