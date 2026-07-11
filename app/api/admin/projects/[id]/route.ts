import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { dataStore } from "@/app/lib/datastore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/projects/[id]
 * Retrieves a single project by ID
 * NOTE: noStore() disables caching so frontend always gets latest data
 */
export async function GET(request: Request, { params }: RouteContext) {
  // CRITICAL: Disable caching - without this, stale project data appears on frontend
  noStore();
  
  try {
    const { id } = await params;
    const project = await dataStore.getProjectById(id);

    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    return Response.json(project);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  // CRITICAL: Disable caching - ensure updated data appears immediately on frontend
  noStore();
  
  try {
    const { id } = await params;
    const data = await request.json();

    const updatedProject = await dataStore.updateProject(id, data);
    revalidatePath("/projects");
    if (!updatedProject) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    return Response.json(updatedProject);
  } catch (error) {
    return Response.json({ message: "Failed to update project" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  // CRITICAL: Disable caching - ensure deletions are immediately reflected
  noStore();
  
  try {
    const adminRole = request.headers.get("x-admin-role");
    if (adminRole !== "Superadmin") {
      return Response.json(
        { message: "Only Superadmin may delete projects." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deletedProject = await dataStore.deleteProject(id);
    revalidatePath("/projects");

    if (!deletedProject) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    return Response.json(deletedProject);
  } catch (error) {
    return Response.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
