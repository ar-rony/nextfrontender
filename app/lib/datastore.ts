import { Project, User } from "@/app/lib/constants";
import fs from "fs";
import os from "os";
import path from "path";

// This datastore persists projects to data/projects.json in the repo root and
// also syncs to GitHub when credentials are available for Vercel deployments.
class DataStore {
  private projects: Project[] = [];
  private users: User[] = [];
  private filePath: string;
  private runtimePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "projects.json");
    this.runtimePath = path.join(os.tmpdir(), "nextfrontender-projects.json");
    this.projects = this.loadProjectsSync();

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

  private loadProjectsSync(): Project[] {
    const loadPath = fs.existsSync(this.runtimePath) ? this.runtimePath : this.filePath;

    try {
      if (fs.existsSync(loadPath)) {
        const raw = fs.readFileSync(loadPath, "utf-8");
        const parsed = JSON.parse(raw);
        return parsed.map((p: any) => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        }));
      }
    } catch (err) {
      console.error("Failed to load projects.json", err);
    }

    return [];
  }

  private async loadProjects() {
    const candidates = [
      process.env.PROJECTS_JSON_PATH,
      this.filePath,
      this.runtimePath,
    ].filter(Boolean) as string[];

    for (const filePath of candidates) {
      if (!fs.existsSync(filePath)) continue;

      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        this.projects = parsed.map((p: any) => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        }));
        return;
      } catch (err) {
        console.error("Failed to load projects.json", err);
      }
    }

    if (process.env.PROJECTS_JSON_URL) {
      try {
        const res = await fetch(process.env.PROJECTS_JSON_URL);
        if (res.ok) {
          const parsed = await res.json();
          this.projects = parsed.map((p: any) => ({
            ...p,
            createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
          }));
          return;
        }
      } catch (err) {
        console.error("Failed to fetch remote projects.json", err);
      }
    }

    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
      try {
        const [owner, repoName] = process.env.GITHUB_REPO.split("/");
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/contents/data/projects.json?ref=${process.env.GITHUB_BRANCH || "main"}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              Accept: "application/vnd.github+json",
            },
          }
        );

        if (res.ok) {
          const json = await res.json();
          const content = Buffer.from(json.content, "base64").toString("utf-8");
          const parsed = JSON.parse(content);
          this.projects = parsed.map((p: any) => ({
            ...p,
            createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch projects from GitHub", err);
      }
    }
  }

  // Projects methods
  async getProjects(): Promise<Project[]> {
    await this.loadProjects();
    return this.projects;
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    await this.loadProjects();
    return this.projects.find((p) => p.id === id);
  }

  async createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    await this.loadProjects();
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
    await this.loadProjects();
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
    await this.loadProjects();
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

      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.projects, null, 2), "utf-8");

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
  async getStats() {
    await this.loadProjects();
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
