// ============================================================================
// PROJECTS API ROUTE
// ============================================================================
// POST /api/projects - Add a new project to the database
// 
// COMMON MISTAKES & DEBUGGING:
// 1. Environment Variables Not Loaded Locally:
//    - Run: npx vercel env pull .env.local
//    - This pulls all environment variables from Vercel Dashboard into .env.local
//    - Without this, POSTGRES_URL won't be available during local development
//    - Restart your dev server after pulling variables
//
// 2. Checking Vercel Runtime Logs:
//    - Go to: Vercel Dashboard > Your Project > Deployments > Runtime Logs
//    - Check these logs (not build logs) to see console.error() and console.log() output
//    - This is crucial for debugging serverless function issues
//    - Cold starts and connection pooling timeouts may only appear in Runtime Logs
//
// 3. Connection Pooling & Cold Starts:
//    - First request after deployment may be slow (cold start)
//    - Use connection pooling with @vercel/postgres (it's built-in)
//    - If you see "timeout" errors, check max_pool_size in POSTGRES_URL
//    - Consider using Vercel Postgres with its built-in connection pooling
//
// 4. Caching Issues:
//    - unstable_noStore() disables Next.js caching for this specific route
//    - Without it, newly added projects might not appear immediately on the frontend
//    - This is a known issue with serverless deployments and ISR/SSG pages
// ============================================================================

import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Request body validation interface
 */
interface CreateProjectRequest {
  name: string;
  description: string;
}

/**
 * Response body interface for success
 */
interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

/**
 * Response body interface for error
 */
interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

/**
 * Validates the request body
 * @param body - The request body to validate
 * @returns Validation result with error message if invalid
 */
function validateProjectData(body: unknown): {
  valid: boolean;
  data?: CreateProjectRequest;
  error?: string;
} {
  // Check if body is an object
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const data = body as Record<string, unknown>;

  // Validate name field
  if (!data.name) {
    return { valid: false, error: '"name" field is required' };
  }
  if (typeof data.name !== "string") {
    return { valid: false, error: '"name" must be a string' };
  }
  if (data.name.trim().length === 0) {
    return { valid: false, error: '"name" cannot be empty' };
  }
  if (data.name.length > 255) {
    return { valid: false, error: '"name" must be less than 255 characters' };
  }

  // Validate description field
  if (!data.description) {
    return { valid: false, error: '"description" field is required' };
  }
  if (typeof data.description !== "string") {
    return { valid: false, error: '"description" must be a string' };
  }
  if (data.description.trim().length === 0) {
    return { valid: false, error: '"description" cannot be empty' };
  }
  if (data.description.length > 5000) {
    return {
      valid: false,
      error: '"description" must be less than 5000 characters',
    };
  }

  return {
    valid: true,
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
    },
  };
}

/**
 * GET /api/projects
 * Retrieves all projects from the database
 * @param request - Next.js request object
 * @returns JSON array of projects or error
 */
export async function GET(request: NextRequest) {
  // Disable caching for this route
  noStore();

  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${requestId}] GET /api/projects - Request started at ${timestamp}`);

    // Query all projects from the database
    const result = await sql`
      SELECT id, name, description, created_at
      FROM projects
      ORDER BY created_at DESC
      LIMIT 100
    `;

    console.log(
      `[${requestId}] GET /api/projects - Retrieved ${result.rows.length} projects`
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        count: result.rows.length,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[${requestId}] GET /api/projects - Error: ${errorMessage}`,
      error
    );

    // Check for specific Vercel Postgres errors
    if (errorMessage.includes("timeout")) {
      return NextResponse.json(
        {
          error: "Database connection timeout - possible cold start or connection pool exhaustion",
          details: errorMessage,
          timestamp,
          requestId,
        } as ErrorResponse,
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to retrieve projects",
        details: errorMessage,
        timestamp,
        requestId,
      } as ErrorResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Creates a new project in the database
 * @param request - Next.js request object with project data in JSON body
 * @returns Created project data or error
 *
 * Request body example:
 * {
 *   "name": "My Awesome Project",
 *   "description": "A detailed description of the project"
 * }
 */
export async function POST(request: NextRequest) {
  // Disable caching for this route
  noStore();

  // Generate unique request ID for logging and debugging
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  try {
    console.log(
      `[${requestId}] POST /api/projects - Request received at ${timestamp}`
    );
    console.log(
      `[${requestId}] POST /api/projects - Content-Type: ${request.headers.get("content-type")}`
    );

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log(`[${requestId}] POST /api/projects - Parsed body:`, body);
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
      console.error(
        `[${requestId}] POST /api/projects - JSON parse error: ${errorMsg}`
      );
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: errorMsg,
          timestamp,
          requestId,
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate request body
    const validation = validateProjectData(body);
    if (!validation.valid) {
      console.warn(
        `[${requestId}] POST /api/projects - Validation failed: ${validation.error}`
      );
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error,
          timestamp,
          requestId,
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const { name, description } = validation.data!;

    console.log(`[${requestId}] POST /api/projects - Validation passed`);
    console.log(`[${requestId}] POST /api/projects - Inserting: name="${name}"`);

    // Construct and log the SQL query (for debugging)
    // Note: In production, be careful not to log sensitive data
    const sqlQuery = `INSERT INTO projects (name, description, created_at) VALUES ('${name}', '${description}', NOW()) RETURNING id, name, description, created_at`;
    console.log(`[${requestId}] POST /api/projects - SQL Query: ${sqlQuery}`);

    // Execute INSERT query using parameterized query (safe from SQL injection)
    // This automatically handles escaping and parameter binding
    const result = await sql`
      INSERT INTO projects (name, description, created_at)
      VALUES (${name}, ${description}, NOW())
      RETURNING id, name, description, created_at
    `;

    // Verify that the query returned data
    if (!result.rows || result.rows.length === 0) {
      console.error(
        `[${requestId}] POST /api/projects - Insert executed but returned no rows`
      );
      return NextResponse.json(
        {
          error: "Database insert failed - no rows returned",
          details:
            "The INSERT query executed but did not return the created project",
          timestamp,
          requestId,
        } as ErrorResponse,
        { status: 500 }
      );
    }

    const newProject = result.rows[0] as ProjectResponse;

    console.log(
      `[${requestId}] POST /api/projects - SUCCESS: Project created with ID ${newProject.id}`
    );
    console.log(`[${requestId}] POST /api/projects - Project data:`, newProject);

    // Return success response with 201 Created status
    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: newProject,
        requestId,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(
      `[${requestId}] POST /api/projects - ERROR: ${errorMessage}`
    );
    console.error(`[${requestId}] POST /api/projects - Stack trace:`, errorStack);

    // Handle specific database errors
    if (errorMessage.includes("timeout")) {
      console.error(
        `[${requestId}] POST /api/projects - Connection timeout detected`
      );
      return NextResponse.json(
        {
          error: "Database connection timeout",
          details:
            "Connection pool exhausted or cold start timeout. The request may succeed on retry.",
          timestamp,
          requestId,
        } as ErrorResponse,
        { status: 503 }
      );
    }

    if (errorMessage.includes("ECONNREFUSED")) {
      console.error(
        `[${requestId}] POST /api/projects - Connection refused - check POSTGRES_URL`
      );
      return NextResponse.json(
        {
          error: "Database connection refused",
          details:
            "Cannot connect to database. Verify POSTGRES_URL is set in environment.",
          timestamp,
          requestId,
        } as ErrorResponse,
        { status: 503 }
      );
    }

    if (errorMessage.includes("CONSTRAINT")) {
      console.error(`[${requestId}] POST /api/projects - Constraint violation`);
      return NextResponse.json(
        {
          error: "Database constraint violation",
          details: errorMessage,
          timestamp,
          requestId,
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Generic database error
    return NextResponse.json(
      {
        error: "Failed to create project",
        details: errorMessage,
        timestamp,
        requestId,
      } as ErrorResponse,
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/projects
 * Handles CORS preflight requests (if needed)
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
