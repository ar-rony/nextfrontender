import Link from "next/link";

export default function ContactPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 sm:px-8 lg:px-10  py-20 ">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
          Contact
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Let’s create something sharp and useful together.
        </h1>
        <p className="text-lg text-muted-foreground">
          Whether you need a launch-ready website or a full product experience,
          I’m ready to help.
        </p>
      </div>

      <div className="grid gap-6 rounded-3xl border border-border bg-card/70 p-8 shadow-sm md:grid-cols-[1fr_0.8fr]">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Reach out</h2>
          <p className="text-muted-foreground">
            Send a note with your idea, timeline, or product challenge.
          </p>
          <a
            href="mailto:hello@nextfrontender.com"
            className="inline-flex text-primary"
          >
            hello@nextfrontender.com
          </a>
        </div>
        <div className="rounded-2xl border border-border bg-background/80 p-5">
          <p className="text-sm font-semibold">What I can support</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Marketing sites and portfolios</li>
            <li>• Design systems and UI kits</li>
            <li>• Product landing pages</li>
          </ul>
          <Link href="/projects" className="mt-5 inline-flex text-sm font-semibold text-primary">
            Browse my work →
          </Link>
        </div>
      </div>
    </section>
  );
}
