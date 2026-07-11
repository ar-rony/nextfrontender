import { dataStore } from "@/app/lib/datastore";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, mobile, requirements } = data;

    if (!name || !email || !mobile || !requirements) {
      return Response.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    const newUser = await dataStore.createUser({
      name,
      email,
      mobile,
      requirements,
      message: requirements,
    });

    return Response.json({ success: true, message: "Message received", data: newUser }, { status: 201 });
  } catch (error) {
    console.error("Failed to create contact submission", error);
    return Response.json({ error: "Failed to submit contact request" }, { status: 500 });
  }
}
