import { Project, User } from "@/app/lib/constants";
import { createClient, createPool } from "@vercel/postgres";
import fs from "fs";
import os from "os";
import path from "path";

function getDbClient() {
  const directConnection = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
  const pooledConnection = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (directConnection && !directConnection.includes("-pooler.")) {
    return createClient({ connectionString: directConnection });
  }

  if (pooledConnection && pooledConnection.includes("-pooler.")) {
    return createPool({ connectionString: pooledConnection });
  }

  if (directConnection) {
    return createClient({ connectionString: directConnection });
  }

  return undefined;
}

const db = getDbClient();

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  stack: unknown;
  images: unknown;
  preview: string | null;
  link: string | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
};

function toProject(record: ProjectRow): Project {
  const stack = Array.isArray(record.stack)
    ? record.stack.filter((item): item is string => typeof item === "string")
    : typeof record.stack === "string"
      ? JSON.parse(record.stack)
      : [];

  const images = Array.isArray(record.images)
    ? record.images.filter((item): item is string => typeof item === "string")
    : typeof record.images === "string"
      ? JSON.parse(record.images)
      : [];

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    category: record.category,
    summary: record.summary,
    description: record.description,
    stack,
    images,
    preview: record.preview ?? undefined,
    link: record.link ?? undefined,
    createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
    updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

class DataStore {
  private projects: Project[] = [];
  private users: User[] = [];
  private filePath: string;
  private runtimePath: string;
  private projectsLoaded = false;
  private databaseReady = false;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "projects.json");
    this.runtimePath = path.join(os.tmpdir(), "nextfrontender-projects.json");
    this.projects = this.loadProjectsSync();

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

  private async ensureProjectsTable(): Promise<boolean> {
    const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
    if (!connectionString) {
      return false;
    }

    if (!db) {
      console.error("No database client available for Vercel Postgres");
      return false;
    }

    if (this.databaseReady) {
      return true;
    }

    try {
      await db.sql`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          summary TEXT NOT NULL,
          description TEXT NOT NULL,
          stack JSONB NOT NULL DEFAULT '[]'::jsonb,
          images JSONB,
          preview TEXT,
          link TEXT,
          "createdAt" TIMESTAMPTZ DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      this.databaseReady = true;
      return true;
    } catch (err) {
      console.error("Failed to initialize Vercel Postgres for projects", err);
      return false;
    }
  }

  private async loadProjectsFromDatabase(): Promise<Project[]> {
    const isReady = await this.ensureProjectsTable();
    if (!isReady) return [];

    if (!db) {
      return [];
    }

    try {
      const result = await db.sql`SELECT * FROM projects ORDER BY "createdAt" DESC`;
      const rows = (result.rows as ProjectRow[]) ?? [];
      const projects = rows.map(toProject);

      if (projects.length === 0) {
        const fallbackProjects = this.loadProjectsSync();
        if (fallbackProjects.length > 0) {
          for (const project of fallbackProjects) {
            await db.sql`
              INSERT INTO projects (id, slug, title, category, summary, description, stack, images, preview, link)
              VALUES (${project.id}, ${project.slug}, ${project.title}, ${project.category}, ${project.summary}, ${project.description}, ${JSON.stringify(project.stack ?? [])}, ${JSON.stringify(project.images ?? [])}, ${project.preview ?? null}, ${project.link ?? null})
              ON CONFLICT (id) DO NOTHING
            `;
          }

          const seededResult = await db.sql`SELECT * FROM projects ORDER BY "createdAt" DESC`;
          const seededRows = (seededResult.rows as ProjectRow[]) ?? [];
          const seededProjects = seededRows.map(toProject);
          this.projects = seededProjects;
          await this.syncProjectsFile(seededProjects);
          return seededProjects;
        }
      }

      this.projects = projects;
      await this.syncProjectsFile(projects);
      return projects;
    } catch (err) {
      console.error("Failed to load projects from Postgres", err);
      return [];
    }
  }

  private async loadProjectsFromFile(): Promise<Project[]> {
    const candidates = [process.env.PROJECTS_JSON_PATH, this.filePath, this.runtimePath].filter(Boolean) as string[];

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
        return this.projects;
      } catch (err) {
        console.error("Failed to load projects.json", err);
      }
    }

    return this.projects;
  }

  private async loadProjects() {
    if (this.projectsLoaded) return;

    this.projectsLoaded = true;
    const projectsFromDatabase = await this.loadProjectsFromDatabase();
    if (projectsFromDatabase.length > 0 || this.databaseReady) {
      this.projects = projectsFromDatabase;
      return;
    }

    this.projects = await this.loadProjectsFromFile();
  }

  private async syncProjectsFile(projects: Project[]) {
    try {
      const runtimeDir = path.dirname(this.runtimePath);
      if (!fs.existsSync(runtimeDir)) fs.mkdirSync(runtimeDir, { recursive: true });
      fs.writeFileSync(this.runtimePath, JSON.stringify(projects, null, 2), "utf-8");

      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(projects, null, 2), "utf-8");

      await this.commitToGitHub(projects);
    } catch (err) {
      console.error("Failed to sync projects.json", err);
    }
  }

  private async commitToGitHub(projects: Project[]) {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    if (!token || !repo) return;

    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) return;

    const pathName = "data/projects.json";
    const content = Buffer.from(JSON.stringify(projects, null, 2)).toString("base64");
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
      slug: data.slug || slugify(data.title),
      title: data.title,
      category: data.category,
      summary: data.summary,
      description: data.description,
      stack: data.stack ?? [],
      images: data.images ?? [],
      preview: data.preview,
      link: data.link,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const databaseReady = await this.ensureProjectsTable();
    if (databaseReady && db) {
      await db.sql`
        INSERT INTO projects (id, slug, title, category, summary, description, stack, images, preview, link)
        VALUES (${project.id}, ${project.slug}, ${project.title}, ${project.category}, ${project.summary}, ${project.description}, ${JSON.stringify(project.stack)}, ${JSON.stringify(project.images ?? [])}, ${project.preview ?? null}, ${project.link ?? null})
      `;
      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      return project;
    }

    this.projects = [...this.projects, project];
    await this.syncProjectsFile(this.projects);
    return project;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    await this.loadProjects();
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const updatedProject = {
      ...this.projects[index],
      ...data,
      slug: data.slug || this.projects[index].slug || slugify(data.title || this.projects[index].title),
      updatedAt: new Date(),
    };

    const databaseReady = await this.ensureProjectsTable();
    if (databaseReady && db) {
      await db.sql`
        UPDATE projects
        SET slug = ${updatedProject.slug},
            title = ${updatedProject.title},
            category = ${updatedProject.category},
            summary = ${updatedProject.summary},
            description = ${updatedProject.description},
            stack = ${JSON.stringify(updatedProject.stack ?? [])},
            images = ${JSON.stringify(updatedProject.images ?? [])},
            preview = ${updatedProject.preview ?? null},
            link = ${updatedProject.link ?? null},
            "updatedAt" = NOW()
        WHERE id = ${id}
      `;
      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      return updatedProject;
    }

    this.projects[index] = updatedProject;
    await this.syncProjectsFile(this.projects);
    return this.projects[index];
  }

  async deleteProject(id: string): Promise<Project | undefined> {
    await this.loadProjects();
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const [deleted] = this.projects.splice(index, 1);

    const databaseReady = await this.ensureProjectsTable();
    if (databaseReady && db) {
      await db.sql`DELETE FROM projects WHERE id = ${id}`;
      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      return deleted;
    }

    await this.syncProjectsFile(this.projects);
    return deleted;
  }

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

export const dataStore = new DataStore();
