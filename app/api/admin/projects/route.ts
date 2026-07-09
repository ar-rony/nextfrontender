import { dataStore } from "@/app/lib/datastore";
import { projects as staticProjects } from "@/app/lib/constants";

export async function GET() {
  try {
    const projects = dataStore.getProjects();
    return Response.json(projects);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newProject = dataStore.createProject(data);
    // Also persist to the in-memory constants list so frontend sources that read
    // `lib/constants.ts` reflect the new project during this session.
    staticProjects.push(newProject as any);

    return Response.json(newProject, { status: 201 });
  } catch (error) {
    return Response.json({ message: "Failed to create project" }, { status: 400 });
  }
}
