import { Project, User } from "@/app/lib/constants";
import fs from "fs";
import path from "path";

// This datastore persists projects to data/projects.json in the repo root.
class DataStore {
  private projects: Project[] = [];
  private users: User[] = [];
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "projects.json");

    // Load persisted projects if the file exists; otherwise leave empty
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        // Convert date strings back to Date objects where present
        this.projects = parsed.map((p: any) => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        }));
      }
    } catch (err) {
      console.error("Failed to load projects.json", err);
      this.projects = [];
    }

    // Default users (kept in-memory)
    this.users = [
      {
        id: "user-001",
        name: "John Doe",
        email: "john@example.com",
        message: "Great work on the portfolio!",
        submittedAt: new Date("2024-01-10"),
      },
    ];
  }

  // Projects methods
  getProjects(): Project[] {
    return this.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Project {
    const project: Project = {
      id: `proj-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project);
    this.saveProjects();
    return project;
  }

  updateProject(id: string, data: Partial<Project>): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    this.projects[index] = {
      ...this.projects[index],
      ...data,
      updatedAt: new Date(),
    };
    this.saveProjects();
    return this.projects[index];
  }

  deleteProject(id: string): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const [deleted] = this.projects.splice(index, 1);
    this.saveProjects();
    return deleted;
  }

  private saveProjects() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.projects, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save projects.json", err);
    }
  }

  // Users methods
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(data: Omit<User, "id" | "submittedAt">): User {
    const user: User = {
      id: `user-${Date.now()}`,
      ...data,
      submittedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  updateUser(id: string, data: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...data,
    };
    return this.users[index];
  }

  deleteUser(id: string): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    const [deleted] = this.users.splice(index, 1);
    return deleted;
  }

  // Statistics
  getStats() {
    const recentSubmissions = this.users.filter((u) => {
      if (!u.submittedAt) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(u.submittedAt) > thirtyDaysAgo;
    }).length;

    return {
      totalProjects: this.projects.length,
      totalUsers: this.users.length,
      recentSubmissions,
    };
  }
}

// Create a singleton instance
export const dataStore = new DataStore();
