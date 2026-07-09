import { ADMIN_CREDENTIALS } from "@/app/lib/constants";

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword, adminUsername } = await request.json();

    const admin = ADMIN_CREDENTIALS.find(
      (a) => a.username === adminUsername && a.password === currentPassword
    );

    if (!admin) {
      return Response.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    return Response.json(
      { message: "Password change functionality requires a database" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
