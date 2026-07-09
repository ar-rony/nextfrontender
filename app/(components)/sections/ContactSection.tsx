import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20 sm:px-8 lg:px-10">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
          Let’s work together
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to launch a smarter digital experience?
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          I’m available for full-project work, collaborations, and thoughtful product iterations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className={buttonVariants({ size: "lg" })}>
            Get in touch
          </Link>
          <Link
            href="mailto:hello@nextfrontender.com"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Email me
          </Link>
        </div>
      </div>
    </section>
  );
}
