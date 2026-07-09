import { dataStore } from "@/app/lib/datastore";

export async function GET() {
  try {
    const stats = dataStore.getStats();
    return Response.json(stats);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
