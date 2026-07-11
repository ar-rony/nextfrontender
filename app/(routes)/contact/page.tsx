"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GitBranch, Link as ExternalLinkIcon, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

const socialProfiles = [
  { label: "GitHub", icon: GitBranch, href: "https://github.com/nextfrontender" },
  { label: "LinkedIn", icon: ExternalLinkIcon, href: "https://linkedin.com/in/yourusername" },
  { label: "Twitter", icon: MessageCircle, href: "https://twitter.com/yourusername" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    requirements: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Unable to send your message.");
      }

      toast.success("Message sent. I will get back to you soon.");
      setFormData({ name: "", email: "", mobile: "", requirements: "" });
      setSent(true);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 lg:px-10">
      <div className="mb-12 max-w-3xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
          Contact
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Talk through your project, timeline, or next website upgrade.
        </h1>
        <p className="text-lg text-muted-foreground">
          Use the form to share your requirements and I&apos;ll make sure it arrives in the client inbox for review.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-8 ring-1 ring-border/80 backdrop-blur-xl">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
                Let’s build something better
              </p>
              <h2 className="text-3xl font-semibold">Send your brief</h2>
              <p className="text-muted-foreground">
                I’ll review the details and route the request to the admin client inbox.
              </p>
            </div>

            {sent && (
              <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-300">
                Thanks for reaching out! Your inquiry has been received.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-primary dark:text-slate-200">
                  Full name
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="dark:bg-background/80 text-primary dark:text-white"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-primary dark:text-slate-200">
                  Email address
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="dark:bg-background/80  text-primary dark:text-white"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-primary dark:text-slate-200">
                Mobile number
                <Input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  required
                  className="dark:bg-background/80  text-primary dark:text-white"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-primary dark:text-slate-200">
                Requirements message
                <Textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Tell me about your goals, timeline, and any must-have features."
                  rows={6}
                  required
                  className="dark:bg-background/80  text-primary dark:text-white"
                />
              </label>

              <Button type="submit" disabled={isSending} className="cursor-pointer w-1/2 dark:bg-primary text-white dark:text-zinc-800 hover:bg-primary/90">
                {isSending ? "Sending..." : "Send message"}
              </Button>
            </form>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-8 ring-1 ring-border/80 backdrop-blur-xl">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
                  Contact details
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Quick access</h2>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-3xl border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-3 text-slate-200">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <a href="mailto:hello@nextfrontender.com" className="text-primary hover:text-primary/80">
                        hello@nextfrontender.com
                      </a>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-3 text-slate-200">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <a href="tel:+8801723160044" className="text-primary hover:text-primary/80">
                        +8801723160044
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
                  Social profiles
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {socialProfiles.map((profile) => {
                    const Icon = profile.icon;
                    return (
                      <Link
                        key={profile.label}
                        href={profile.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-primary dark:text-white transition hover:border-primary hover:text-primary"
                      >
                        <Icon className="h-4 w-4" />
                        {profile.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden p-0 ring-1 ring-border/80 backdrop-blur-xl">
            <div className="bg-slate-950/90 px-6 py-5">
              <div className="flex items-center gap-2 text-slate-200">
                <MapPin className="h-5 w-5  text-white dark:text-primary/80" />
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white dark:text-primary/80">
                  Office location
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                A modern digital studio presence for remote and local clients.
              </p>
            </div>
            <div className="aspect-[4/3] bg-slate-900">
              <iframe
                title="Office location map"
                src="https://www.google.com/maps?q=Dhaka+Bangladesh&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
