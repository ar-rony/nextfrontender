// ============================================================================
// PROJECT BY ID API ROUTE HANDLERS
// ============================================================================
// Endpoints for managing individual projects:
// GET /api/admin/projects/[id] - Retrieve a specific project
// PUT /api/admin/projects/[id] - Update a specific project
// DELETE /api/admin/projects/[id] - Delete a specific project
// ============================================================================

import { revalidatePath } from "next/cache";
import { dataStore } from "@/app/lib/datastore";

/**
 * Route context type for Next.js dynamic routes
 * Includes params which are Promise-based in Next.js 16+
 */
type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/projects/[id]
 * Retrieves a specific project by ID
 * @param {Request} request - HTTP request object
 * @param {RouteContext} context - Route context with params
 * @returns {Response} Project data or 404 error
 */
export async function GET(request: Request, { params }: RouteContext) {
  try {
    // Extract project ID from route params
    const { id } = await params;
    
    // Fetch project from data store
    const project = await dataStore.getProjectById(id);

    // Check if project exists
    if (!project) {
      return Response.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Return project data
    return Response.json(project);
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching project:", error);
    
    // Return error response
    return Response.json(
      { message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/projects/[id]
 * Updates a specific project
 * @param {Request} request - Request containing updated project data
 * @param {RouteContext} context - Route context with params
 * @returns {Response} Updated project or error
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    // Extract project ID from route params
    const { id } = await params;
    
    // Parse request body with updated data
    const data = await request.json();

    // Update project using data store
    const updatedProject = await dataStore.updateProject(id, data);
    
    // Check if project was found and updated
    if (!updatedProject) {
      return Response.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Revalidate cache for updated project pages
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${updatedProject.slug}`);

    // Return updated project
    return Response.json(updatedProject);
  } catch (error) {
    // Log error for debugging
    console.error("Error updating project:", error);
    
    // Return error response
    return Response.json(
      { message: "Failed to update project", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Deletes a specific project
 * @param {Request} request - HTTP request object
 * @param {RouteContext} context - Route context with params
 * @returns {Response} Deleted project data or error
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    // Extract project ID from route params
    const { id } = await params;
    
    // Delete project using data store
    const deletedProject = await dataStore.deleteProject(id);

    // Check if project was found and deleted
    if (!deletedProject) {
      return Response.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Revalidate cache for project pages
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    if (deletedProject.slug) {
      revalidatePath(`/projects/${deletedProject.slug}`);
    }

    // Return deleted project data
    return Response.json(deletedProject);
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting project:", error);
    
    // Return error response
    return Response.json(
      { message: "Failed to delete project", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
