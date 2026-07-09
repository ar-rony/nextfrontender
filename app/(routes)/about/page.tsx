"use client";

import { Download, Printer, Users, Zap, Code, Eye } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function AboutPage() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const services = [
    {
      icon: Code,
      title: "Web Development",
      description:
        "Modern, performant web applications built with the latest technologies and best practices.",
    },
    {
      icon: Eye,
      title: "UI/UX Design",
      description:
        "Beautiful and intuitive interfaces that engage users and deliver real value.",
    },
    {
      icon: Zap,
      title: "Performance",
      description:
        "Lightning-fast experiences optimized for every device and connection speed.",
    },
  ];

  const team = [
    {
      name: "Frontend Developer",
      role: "Full Stack Engineer",
      skills: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    },
    {
      name: "UI/UX Specialist",
      role: "Product Designer",
      skills: ["Design Systems", "Figma", "Framer", "User Research"],
    },
  ];

  return (
    <div className="space-y-20 py-20">
      {/* Hero Section */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
            About us
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            NextFrontender: Crafting Digital Excellence
          </h1>
          <p className="text-lg text-muted-foreground">
            We are a creative team dedicated to building modern, performant, and
            beautiful digital experiences that drive real business value.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="border-y border-border/80 bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20 sm:px-8 lg:px-10 lg:flex-row">
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Our Story</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Founded with a passion for frontend excellence, NextFrontender emerged
                from the belief that great digital products require both technical
                precision and thoughtful design. We combine cutting-edge web technologies
                with a deep understanding of user needs to create experiences that people
                love.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Our Mission</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                To empower teams and individuals with beautiful, performant digital
                solutions that accelerate growth and delight users. We believe in pushing
                the boundaries of what's possible on the web while maintaining simplicity
                and clarity.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Our Values</h3>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span>
                    <strong>Excellence:</strong> We never settle for good enough. Every
                    pixel, every interaction matters.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span>
                    <strong>Collaboration:</strong> Best ideas come from working closely
                    with our clients and team.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span>
                    <strong>Innovation:</strong> We stay ahead of technology trends to
                    deliver modern solutions.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h3 className="text-2xl font-semibold mb-6">By The Numbers</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-4xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground mt-1">Projects Completed</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">30+</p>
                  <p className="text-sm text-muted-foreground mt-1">Happy Clients</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">5+ years</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Industry Experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 sm:px-8 lg:px-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
            What we do
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Comprehensive Digital Solutions
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card/50 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team */}
      <section className="border-y border-border/80 bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20 sm:px-8 lg:px-10">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80 flex items-center gap-2">
              <Users className="h-4 w-4" /> Our team
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Meet the Experts Behind the Magic
            </h2>
            <p className="text-muted-foreground">
              A talented team of designers, developers, and strategists working
              together to create exceptional digital experiences.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {team.map((member, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-8 shadow-sm"
              >
                <div className="mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary/50" />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-sm text-primary mt-1">{member.role}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, j) => (
                      <span
                        key={j}
                        className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Link */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight">
            See Our Work in Action
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Explore our portfolio of completed projects showcasing our expertise
            in web development, design, and digital strategy.
          </p>
          <Link
            href="/projects"
            className={buttonVariants({ size: "lg", className: "mt-6" })}
          >
            View Projects
          </Link>
        </div>
      </section>

      {/* CV Section */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 sm:px-8 lg:px-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
            Get to Know Us Better
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Download or Print Our CV
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Get a detailed overview of our expertise, experience, and what we've
            accomplished. Perfect for sharing, reviewing, or printing.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="/cv.pdf"
            download
            className={buttonVariants({
              size: "lg",
              className: "group justify-center",
            })}
          >
            <Download className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Download CV (PDF)
          </a>
          <button
            onClick={handlePrint}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "group justify-center",
            })}
          >
            <Printer className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Print CV
          </button>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/50 p-6 text-sm text-muted-foreground">
          <p className="mb-3 font-semibold text-foreground">Print Tips:</p>
          <ul className="space-y-1 list-inside list-disc">
            <li>Use Chrome or Firefox for the best print quality</li>
            <li>Set margins to minimal or none for optimal layout</li>
            <li>Print as PDF to save a local copy</li>
          </ul>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-8 shadow-sm sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Let's connect and discuss how we can help bring your vision to life.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className={buttonVariants({ size: "lg" })}
            >
              Get in Touch
            </Link>
            <a
              href="mailto:hello@nextfrontender.com"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
