import { ADMIN_CREDENTIALS } from "@/app/lib/constants";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const admin = ADMIN_CREDENTIALS.find(
      (a) => a.username === username && a.password === password
    );

    if (admin) {
      return Response.json(
        { message: "Login successful", admin: { id: admin.id, username: admin.username } },
        { status: 200 }
      );
    }

    return Response.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
