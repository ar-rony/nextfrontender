import { dataStore } from "@/app/lib/datastore";

export async function GET() {
  try {
    const stats = await dataStore.getStats();
    return Response.json(stats);
  } catch (error) {
    console.error("Failed to fetch admin stats", error);
    const projects = await dataStore.getProjects();
    return Response.json({
      totalProjects: projects.length,
      totalUsers: 0,
      recentSubmissions: 0,
    });
  }
}
