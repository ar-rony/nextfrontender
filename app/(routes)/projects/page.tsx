import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import type { Project } from "@/app/lib/constants";
import ProjectsGalleryClient from "./ProjectsGalleryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected work and recent projects.",
};

export default function ProjectsPage() {
  const filePath = path.join(process.cwd(), "data", "projects.json");
  const projects = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Project[];

  return <ProjectsGalleryClient projects={projects} />;
}
