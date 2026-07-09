import { dataStore } from "@/app/lib/datastore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = dataStore.getUserById(id);

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updatedUser = dataStore.updateUser(id, data);
    if (!updatedUser) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    return Response.json(updatedUser);
  } catch (error) {
    return Response.json({ message: "Failed to update user" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deletedUser = dataStore.deleteUser(id);

    if (!deletedUser) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    return Response.json(deletedUser);
  } catch (error) {
    return Response.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
