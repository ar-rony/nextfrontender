import { Project, User } from "@/app/lib/constants";
import fs from "fs";
import os from "os";
import path from "path";

// This datastore persists projects to data/projects.json in the repo root.
class DataStore {
  private projects: Project[] = [];
  private users: User[] = [];
  private filePath: string;
  private runtimePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "projects.json");
    this.runtimePath = path.join(os.tmpdir(), "nextfrontender-projects.json");

    const loadPath = fs.existsSync(this.runtimePath) ? this.runtimePath : this.filePath;

    try {
      if (fs.existsSync(loadPath)) {
        const raw = fs.readFileSync(loadPath, "utf-8");
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

  async createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const project: Project = {
      id: `proj-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project);
    await this.saveProjects();
    return project;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    this.projects[index] = {
      ...this.projects[index],
      ...data,
      updatedAt: new Date(),
    };
    await this.saveProjects();
    return this.projects[index];
  }

  async deleteProject(id: string): Promise<Project | undefined> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const [deleted] = this.projects.splice(index, 1);
    await this.saveProjects();
    return deleted;
  }

  private async saveProjects() {
    try {
      const runtimeDir = path.dirname(this.runtimePath);
      if (!fs.existsSync(runtimeDir)) fs.mkdirSync(runtimeDir, { recursive: true });
      fs.writeFileSync(this.runtimePath, JSON.stringify(this.projects, null, 2), "utf-8");

      // In local development, also persist to the repo file for visible JSON changes.
      if (!process.env.VERCEL) {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.filePath, JSON.stringify(this.projects, null, 2), "utf-8");
      }

      await this.commitToGitHub();
    } catch (err) {
      console.error("Failed to save projects.json", err);
    }
  }

  private async commitToGitHub() {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    if (!token || !repo) return;

    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) return;

    const pathName = "data/projects.json";
    const content = Buffer.from(JSON.stringify(this.projects, null, 2)).toString("base64");
    let sha: string | undefined;

    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(pathName)}?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (getRes.ok) {
        const json = await getRes.json();
        sha = json.sha;
      }
    } catch (err) {
      console.error("GitHub fetch error", err);
      return;
    }

    try {
      await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(pathName)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update projects.json from admin dashboard",
          content,
          branch,
          sha,
        }),
      });
    } catch (err) {
      console.error("GitHub commit error", err);
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
