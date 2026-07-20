import type { Metadata } from "next";
import type { Project } from "@/app/lib/constants";
import { dataStore } from "@/app/lib/datastore";
import ProjectsGalleryClient from "./ProjectsGalleryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected work and recent projects.",
};

export default async function ProjectsPage() {
  const projects = await dataStore.getProjects();

  return <ProjectsGalleryClient projects={projects} />;
}
