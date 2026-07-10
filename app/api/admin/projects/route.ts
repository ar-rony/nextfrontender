import { revalidatePath } from "next/cache";
import { dataStore } from "@/app/lib/datastore";

export async function GET() {
  try {
    const projects = await dataStore.getProjects();
    return Response.json(projects);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newProject = await dataStore.createProject(data);
    revalidatePath("/projects");
    return Response.json(newProject, { status: 201 });
  } catch (error) {
    return Response.json({ message: "Failed to create project" }, { status: 400 });
  }
}