import { dataStore } from "@/app/lib/datastore";

export async function GET() {
  try {
    const users = dataStore.getUsers();
    return Response.json(users);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newUser = await dataStore.createUser(data);
    return Response.json(newUser, { status: 201 });
  } catch (error) {
    return Response.json({ message: "Failed to create user" }, { status: 400 });
  }
}
