// ============================================================================
// ADMIN LOGIN API ROUTE
// ============================================================================
// Endpoint: POST /api/admin/login
// Purpose: Authenticates admin users via username and password
// WARNING: This uses plain-text passwords from environment constants.
//          In production, use proper authentication (bcrypt hashing, sessions, JWT, etc.)
// ============================================================================

import { ADMIN_CREDENTIALS } from "@/app/lib/constants";

/**
 * POST /api/admin/login
 * Authenticates admin credentials
 * @param {Request} request - Request containing username and password in JSON body
 * @returns {Response} Success message with admin data or error
 */
export async function POST(request: Request) {
  try {
    // Extract credentials from request body
    const { username, password } = await request.json();

    // Find admin with matching credentials
    // WARNING: Comparing plain-text passwords - use hashing in production!
    const admin = ADMIN_CREDENTIALS.find(
      (a) => a.username === username && a.password === password
    );

    // If admin found, return success
    if (admin) {
      return Response.json(
        {
          message: "Login successful",
          admin: { id: admin.id, username: admin.username },
        },
        { status: 200 }
      );
    }

    // Invalid credentials - return 401 Unauthorized
    return Response.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    // Server error
    console.error("Login error:", error);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
