"use client";

import { motion } from "framer-motion";
import { ArrowDown, GitBranch, LinkIcon, MessageCircleMore } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";

const phrases = [
  "Frontend Developer",
  "Next.js Specialist",
  "UI/UX Enthusiast",
  "Open Source Contributor",
];

export function Hero() {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const speed = isDeleting ? 70 : 90;

    const timeout = window.setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentPhrase.length) {
          setText(currentPhrase.slice(0, text.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else if (text.length > 0) {
        setText(text.slice(0, -1));
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev: number) => (prev + 1) % phrases.length);
      }
    }, speed);

    return () => window.clearTimeout(timeout);
  }, [isDeleting, phraseIndex, text]);
  return (
    <section className="relative min-h-[calc(100vh-0rem)] flex items-center justify-center overflow-hidden px-4">
      {/* Background gradient (optional) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 max-w-3xl"
      >
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative inline-block"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-full blur-2xl opacity-30" />
          <img
            src="/herologo.png" // Put your image in public/images
            alt="NextFrontender"
            className="w-32 h-32 rounded-full border-4 border-white/10 shadow-2xl relative z-10 object-cover"
          />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Next<span className="text-primary">Frontender</span>
        </h1>

        <div className="text-2xl md:text-3xl text-muted-foreground" aria-live="polite">
          <span>{text}</span>
          <span className="ml-1 animate-pulse">|</span>
        </div>

        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Building exceptional digital experiences with modern web technologies.
          Focused on performance, accessibility, and beautiful design.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/projects"
            className={buttonVariants({ size: "lg", className: "group pl-4" })}
          >
            View Projects
            <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
          </Link>
          <Link
            href="/about"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            About Us
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-4 justify-center pt-4">
          {[
            { icon: GitBranch, href: "https://github.com/yourusername" },
            { icon: LinkIcon, href: "https://linkedin.com/in/yourusername" },
            { icon: MessageCircleMore, href: "https://twitter.com/yourusername" },
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.1 }}
              className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <social.icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      {/* <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10"
      >
        <Link href="#projects"><ArrowDown className="w-6 h-6 text-muted-foreground" /></Link>
      </motion.div> */}
    </section>
  );
}