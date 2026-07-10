// ============================================================================
// PROJECTS API ROUTE HANDLERS
// ============================================================================
// Endpoints for managing projects:
// GET /api/admin/projects - Retrieve all projects
// POST /api/admin/projects - Create a new project
// ============================================================================

import { revalidatePath } from "next/cache";
import { dataStore } from "@/app/lib/datastore";

/**
 * GET /api/admin/projects
 * Retrieves all projects from the data store
 * @returns {Response} JSON array of all projects
 */
export async function GET() {
  try {
    // Fetch all projects from data store
    const projects = await dataStore.getProjects();
    
    // Return projects as JSON
    return Response.json(projects);
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching projects:", error);
    
    // Return error response
    return Response.json(
      { message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/projects
 * Creates a new project in the data store
 * @param {Request} request - Request containing project data in JSON body
 * @returns {Response} Created project with status 201
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.slug || !data.category || !data.summary || !data.description) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new project using data store
    const newProject = await dataStore.createProject(data);
    
    // Revalidate cache for projects pages
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    
    // Return created project with 201 status
    return Response.json(newProject, { status: 201 });
  } catch (error) {
    // Log error for debugging
    console.error("Error creating project:", error);
    
    // Return error response
    return Response.json(
      { message: "Failed to create project", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
