import type { Metadata } from "next";
import ProjectsGalleryClient from "./ProjectsGalleryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected work and recent projects.",
};

// Render shell immediately; ProjectsGalleryClient will fetch data on the client.
export default function ProjectsPage() {
  return <ProjectsGalleryClient />;
}
