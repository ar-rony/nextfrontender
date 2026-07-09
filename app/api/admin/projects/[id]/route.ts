import { dataStore } from "@/app/lib/datastore";
import { projects as staticProjects } from "@/app/lib/constants";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const project = dataStore.getProjectById(id);

    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    return Response.json(project);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updatedProject = dataStore.updateProject(id, data);
    if (!updatedProject) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    // Keep the static projects list in sync
    const idx = staticProjects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      staticProjects[idx] = { ...staticProjects[idx], ...updatedProject } as any;
    }

    return Response.json(updatedProject);
  } catch (error) {
    return Response.json({ message: "Failed to update project" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deletedProject = dataStore.deleteProject(id);

    if (!deletedProject) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    // Remove from static projects list as well
    const idx = staticProjects.findIndex((p) => p.id === id);
    if (idx !== -1) staticProjects.splice(idx, 1);

    return Response.json(deletedProject);
  } catch (error) {
    return Response.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
