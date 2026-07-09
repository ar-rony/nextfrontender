import { dataStore } from "@/app/lib/datastore";

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

    const updatedProject = await dataStore.updateProject(id, data);
    if (!updatedProject) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    return Response.json(updatedProject);
  } catch (error) {
    return Response.json({ message: "Failed to update project" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deletedProject = await dataStore.deleteProject(id);

    if (!deletedProject) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    return Response.json(deletedProject);
  } catch (error) {
    return Response.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
