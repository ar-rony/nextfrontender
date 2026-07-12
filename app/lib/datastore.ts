// ============================================================================
// DATA STORE MODULE - Handles Projects and Users Management
// ============================================================================
// This module provides a centralized data store for managing projects and users.
// It supports both file-based storage (JSON) and database storage (PostgreSQL).
// Priority: Database > File System
// ============================================================================

import { Project, User } from "@/app/lib/constants";
import { prisma } from "@/app/lib/prisma";
import fs from "fs";
import os from "os";
import path from "path";


// ============================================================================
// DATABASE CLIENT SETUP
// ============================================================================
// Prisma handles both local development and Vercel Postgres using DATABASE_URL.

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
/**
 * Represents the raw project row structure from PostgreSQL
 * Used internally for database queries
 */
type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  stack: unknown; // Stored as JSONB in database
  images: unknown; // Stored as JSONB in database
  preview: string | null;
  link: string | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Converts a raw database project row to a typed Project object
 * Safely handles JSON parsing and type conversions
 * @param {ProjectRow} record - Raw project row from database
 * @returns {Project} Typed project object
 */
function toProject(record: ProjectRow): Project {
  // Parse stack array - handle multiple formats (array, JSON string, etc.)
  const stack = Array.isArray(record.stack)
    ? record.stack.filter((item): item is string => typeof item === "string")
    : typeof record.stack === "string"
      ? JSON.parse(record.stack)
      : [];

  // Parse images array - handle multiple formats
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

/**
 * Converts a title string to a URL-safe slug
 * Example: "My Project Title" -> "my-project-title"
 * @param {string} value - Title to slugify
 * @returns {string} URL-safe slug
 */
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, ""); // Remove leading/trailing hyphens
}

// ============================================================================
// DATA STORE CLASS
// ============================================================================
/**
 * Main data store class managing projects and users
 * Handles persistence across file system and PostgreSQL database
 */
class DataStore {
  // Cache for projects to reduce database queries
  private projects: Project[] = [];
  
  // User list persisted to file system for contact submissions and client management
  private users: User[] = [];
  
  // File paths for persistence
  private filePath: string; // Persistent storage location for projects
  private runtimePath: string; // Runtime temporary storage for projects
  private usersFilePath: string; // Persistent storage location for users
  private usersRuntimePath: string; // Runtime temporary storage for users
  
  // Flags for optimization
  private projectsLoaded = false; // Prevents redundant loading
  private databaseReady = false; // Caches database initialization status
  private databaseAvailable = false;

  constructor() {
    // Initialize file paths
    this.filePath = path.join(process.cwd(), "data", "projects.json");
    this.runtimePath = path.join(os.tmpdir(), "nextfrontender-projects.json");
    this.usersFilePath = path.join(process.cwd(), "data", "users.json");
    this.usersRuntimePath = path.join(os.tmpdir(), "nextfrontender-users.json");
    
    // Load projects synchronously on initialization (file-based fallback)
    this.projects = this.loadProjectsSync();

    // Load users from persisted storage or seed default values
    this.users = this.loadUsersSync();
  }

  // ========================================================================
  // PROJECT LOADING METHODS
  // ========================================================================

  /**
   * Synchronously loads projects from file system (blocking, used during initialization)
   * Attempts runtime path first, then fallback to persistent path
   * @returns {Project[]} Array of projects or empty array if loading fails
   */
  private loadProjectsSync(): Project[] {
    // Prefer runtime path if it exists (newer data)
    const loadPath = fs.existsSync(this.runtimePath) ? this.runtimePath : this.filePath;

    try {
      if (fs.existsSync(loadPath)) {
        const raw = fs.readFileSync(loadPath, "utf-8");
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
          
        // Convert date strings to Date objects
        return parsed.map((p) => {
          const createdAt = p.createdAt instanceof Date
            ? p.createdAt
            : typeof p.createdAt === "string" || typeof p.createdAt === "number"
              ? new Date(p.createdAt)
              : undefined;
          const updatedAt = p.updatedAt instanceof Date
            ? p.updatedAt
            : typeof p.updatedAt === "string" || typeof p.updatedAt === "number"
              ? new Date(p.updatedAt)
              : undefined;

          return {
            ...(p as unknown as Project),
            createdAt,
            updatedAt,
          } as Project;
        });
      }
    } catch (err) {
      console.error("Failed to load projects.json", err);
    }

    return [];
  }

  /**
   * Synchronously loads users from file system (blocking, used during initialization)
   * Attempts runtime path first, then fallback to persistent path
   * @returns {User[]} Array of users or seeded default values
   */
  private loadUsersSync(): User[] {
    const loadPath = fs.existsSync(this.usersRuntimePath) ? this.usersRuntimePath : this.usersFilePath;

    try {
      if (fs.existsSync(loadPath)) {
        const raw = fs.readFileSync(loadPath, "utf-8");
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;

        return parsed.map((u) => {
          const submittedAt = u.submittedAt instanceof Date
            ? u.submittedAt
            : typeof u.submittedAt === "string" || typeof u.submittedAt === "number"
              ? new Date(u.submittedAt)
              : undefined;
          const repliedAt = u.repliedAt instanceof Date
            ? u.repliedAt
            : typeof u.repliedAt === "string" || typeof u.repliedAt === "number"
              ? new Date(u.repliedAt)
              : undefined;

          return {
            ...(u as unknown as User),
            submittedAt,
            repliedAt,
          } as User;
        });
      }
    } catch (err) {
      console.error("Failed to load users.json", err);
    }

    return [
      {
        id: "user-001",
        name: "John Doe",
        email: "john@example.com",
        message: "Great work on the portfolio!",
        submittedAt: new Date("2024-01-10"),
      },
    ];
  }

  /**
   * Persists the current user list to runtime and persistent storage
   */
  private async syncUsersFile() {
    try {
      const runtimeDir = path.dirname(this.usersRuntimePath);
      if (!fs.existsSync(runtimeDir)) fs.mkdirSync(runtimeDir, { recursive: true });
      fs.writeFileSync(this.usersRuntimePath, JSON.stringify(this.users, null, 2), "utf-8");

      const dir = path.dirname(this.usersFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.usersFilePath, JSON.stringify(this.users, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to sync users.json", err);
    }
  }

  /**
   * Ensures the PostgreSQL projects table exists and is initialized
   * Creates table schema if it doesn't exist
   * @returns {Promise<boolean>} True if table is ready, false otherwise
   */
  private async ensureProjectsTable(): Promise<boolean> {
    if (this.databaseReady) {
      return this.databaseAvailable;
    }

    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      this.databaseAvailable = true;
      this.databaseReady = true;
      return true;
    } catch (err) {
      console.error("Prisma database connection not available", err);
      this.databaseAvailable = false;
      this.databaseReady = true;
      return false;
    }
  }

  /**
   * Loads projects from PostgreSQL database
   * Attempts to seed database with file data if empty
   * @returns {Promise<Project[]>} Array of projects from database
   */
  private async loadProjectsFromDatabase(): Promise<Project[]> {
    // Ensure table exists first
    const isReady = await this.ensureProjectsTable();
    if (!isReady) return [];

    try {
      const rows = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
      });

      const projects = rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        summary: row.summary,
        description: row.description,
        stack: Array.isArray(row.stack) ? row.stack.filter((item): item is string => typeof item === "string") : [],
        images: Array.isArray(row.images) ? row.images.filter((item): item is string => typeof item === "string") : [],
        preview: row.preview ?? undefined,
        link: row.link ?? undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      if (projects.length === 0) {
        const fallbackProjects = this.loadProjectsSync();
        if (fallbackProjects.length > 0) {
          for (const project of fallbackProjects) {
            await prisma.project.create({
              data: {
                id: project.id,
                slug: project.slug,
                title: project.title,
                category: project.category,
                summary: project.summary,
                description: project.description,
                stack: project.stack ?? [],
                images: project.images ?? [],
                preview: project.preview,
                link: project.link,
              },
            }).catch(() => undefined);
          }

          const seededProjects = await this.loadProjectsFromDatabase();
          this.projects = seededProjects;
          await this.syncProjectsFile(seededProjects);
          return seededProjects;
        }
      }

      this.projects = projects;
      await this.syncProjectsFile(projects);
      return projects;
    } catch (err) {
      console.error("Failed to load projects from Prisma", err);
      return [];
    }
  }

  /**
   * Loads projects from file system
   * Tries multiple fallback paths in order
   * @returns {Promise<Project[]>} Array of projects from file
   */
  private async loadProjectsFromFile(): Promise<Project[]> {
    // Try multiple file paths in order of preference
    const candidates = [process.env.PROJECTS_JSON_PATH, this.filePath, this.runtimePath].filter(Boolean) as string[];

    for (const filePath of candidates) {
      if (!fs.existsSync(filePath)) continue;

      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        
        // Convert date strings
        this.projects = parsed.map((p) => {
          const createdAt = p.createdAt instanceof Date
            ? p.createdAt
            : typeof p.createdAt === "string" || typeof p.createdAt === "number"
              ? new Date(p.createdAt)
              : undefined;
          const updatedAt = p.updatedAt instanceof Date
            ? p.updatedAt
            : typeof p.updatedAt === "string" || typeof p.updatedAt === "number"
              ? new Date(p.updatedAt)
              : undefined;

          return {
            ...(p as unknown as Project),
            createdAt,
            updatedAt,
          } as Project;
        });
        
        return this.projects;
      } catch (err) {
        console.error("Failed to load projects.json", err);
      }
    }

    return this.projects;
  }

  /**
   * Main project loading orchestrator
   * Tries database first, falls back to files
   * Uses caching to prevent redundant loads
   */
  private async loadProjects() {
    // Skip if already loaded
    if (this.projectsLoaded) return;

    this.projectsLoaded = true;
    
    // Try database first
    const projectsFromDatabase = await this.loadProjectsFromDatabase();
    if (projectsFromDatabase.length > 0 || this.databaseReady) {
      this.projects = projectsFromDatabase;
      return;
    }

    // Fall back to file-based loading
    this.projects = await this.loadProjectsFromFile();
  }

  // ========================================================================
  // PROJECT PERSISTENCE METHODS
  // ========================================================================

  /**
   * Synchronizes project data across both file system and database
   * Called after any project modification (create, update, delete)
   * @param {Project[]} projects - Current project list to persist
   */
  private async syncProjectsFile(projects: Project[]) {
    try {
      // Write to runtime path (temporary, per-instance)
      const runtimeDir = path.dirname(this.runtimePath);
      if (!fs.existsSync(runtimeDir)) fs.mkdirSync(runtimeDir, { recursive: true });
      fs.writeFileSync(this.runtimePath, JSON.stringify(projects, null, 2), "utf-8");

      // Write to persistent path (repo/data directory)
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(projects, null, 2), "utf-8");

      // Attempt to commit to GitHub (if configured)
      await this.commitToGitHub(projects);
    } catch (err) {
      console.error("Failed to sync projects.json", err);
    }
  }

  /**
   * Commits project changes to GitHub repository
   * Uses GitHub API to update the projects.json file
   * Only runs if GITHUB_TOKEN and GITHUB_REPO are configured
   * @param {Project[]} projects - Projects to commit
   */
  private async commitToGitHub(projects: Project[]) {
    // Get GitHub credentials from environment
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    
    // Exit if credentials are missing
    if (!token || !repo) return;

    // Parse repository owner and name (format: "owner/repo")
    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) return;

    const pathName = "data/projects.json";
    
    // Convert projects to base64 (required by GitHub API)
    const content = Buffer.from(JSON.stringify(projects, null, 2)).toString("base64");
    let sha: string | undefined;

    try {
      // Fetch existing file to get its SHA (required for updates)
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
      // Create or update the file in GitHub
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

  // ========================================================================
  // PUBLIC PROJECT API
  // ========================================================================

  /**
   * Retrieves all projects
   * @returns {Promise<Project[]>} All projects
   */
  async getProjects(): Promise<Project[]> {
    await this.loadProjects();
    return this.projects;
  }

  /**
   * Retrieves a single project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Project | undefined>} Project or undefined if not found
   */
  async getProjectById(id: string): Promise<Project | undefined> {
    await this.loadProjects();
    return this.projects.find((p) => p.id === id);
  }

  /**
   * Invalidates the projects cache
   * Call this after creating, updating, or deleting projects
   * Forces next getProjects() call to reload from database/file
   * CRITICAL: Ensures frontend always sees latest data
   * @private
   */
  private invalidateProjectsCache(): void {
    this.projectsLoaded = false;
    console.log("[DataStore] Projects cache invalidated - will reload on next request");
  }

  /**
   * Creates a new project
   * Persists to both file system and database
   * @param {Omit<Project, 'id' | 'createdAt' | 'updatedAt'>} data - Project data (without auto-generated fields)
   * @returns {Promise<Project>} Created project
   */
  async createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    await this.loadProjects();
    
    // Create project with auto-generated fields
    const project: Project = {
      id: `proj-${Date.now()}`, // Unique ID based on timestamp
      slug: data.slug || slugify(data.title), // Use provided slug or generate from title
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
    if (databaseReady) {
      await prisma.project.create({
        data: {
          id: project.id,
          slug: project.slug,
          title: project.title,
          category: project.category,
          summary: project.summary,
          description: project.description,
          stack: project.stack ?? [],
          images: project.images ?? [],
          preview: project.preview,
          link: project.link,
        },
      });

      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      this.invalidateProjectsCache();
      return project;
    }

    // Fall back to file-based storage
    this.projects = [...this.projects, project];
    await this.syncProjectsFile(this.projects);
    // Invalidate cache for next requests
    this.invalidateProjectsCache();
    return project;
  }

  /**
   * Updates an existing project
   * @param {string} id - Project ID to update
   * @param {Partial<Project>} data - Fields to update
   * @returns {Promise<Project | undefined>} Updated project or undefined if not found
   */
  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    await this.loadProjects();
    
    // Find project index
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    // Merge with existing data and update timestamp
    const updatedProject = {
      ...this.projects[index],
      ...data,
      slug: data.slug || this.projects[index].slug || slugify(data.title || this.projects[index].title),
      updatedAt: new Date(),
    };

    const databaseReady = await this.ensureProjectsTable();
    if (databaseReady) {
      await prisma.project.update({
        where: { id },
        data: {
          slug: updatedProject.slug,
          title: updatedProject.title,
          category: updatedProject.category,
          summary: updatedProject.summary,
          description: updatedProject.description,
          stack: updatedProject.stack ?? [],
          images: updatedProject.images ?? [],
          preview: updatedProject.preview ?? null,
          link: updatedProject.link ?? null,
        },
      });

      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      this.invalidateProjectsCache();
      return updatedProject;
    }

    // Fall back to file-based storage
    this.projects[index] = updatedProject;
    await this.syncProjectsFile(this.projects);
    // Invalidate cache for next requests
    this.invalidateProjectsCache();
    return this.projects[index];
  }

  /**
   * Deletes a project
   * @param {string} id - Project ID to delete
   * @returns {Promise<Project | undefined>} Deleted project or undefined if not found
   */
  async deleteProject(id: string): Promise<Project | undefined> {
    await this.loadProjects();
    
    // Find and remove project
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const [deleted] = this.projects.splice(index, 1);

    const databaseReady = await this.ensureProjectsTable();
    if (databaseReady) {
      await prisma.project.delete({ where: { id } });

      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      this.invalidateProjectsCache();
      return deleted;
    }

    // Fall back to file-based storage
    await this.syncProjectsFile(this.projects);
    // Invalidate cache for next requests
    this.invalidateProjectsCache();
    return deleted;
  }

  // ========================================================================
  // PUBLIC USER API
  // ========================================================================

  /**
   * Retrieves all users
   * @returns {User[]} All users
   */
  getUsers(): User[] {
    return this.users;
  }

  /**
   * Retrieves a single user by ID
   * @param {string} id - User ID
   * @returns {User | undefined} User or undefined if not found
   */
  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  /**
   * Creates a new user
   * @param {Omit<User, 'id' | 'submittedAt'>} data - User data
   * @returns {Promise<User>} Created user
   */
  async createUser(data: Omit<User, "id" | "submittedAt">): Promise<User> {
    const user: User = {
      id: `user-${Date.now()}`,
      ...data,
      submittedAt: new Date(),
    };
// code dataStore.ts
    const databaseReady = await this.ensureProjectsTable();
    if (databaseReady) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          message: user.message,
          submittedAt: user.submittedAt,
        },
      });
    }

    this.users.push(user);
    await this.syncUsersFile();
    return user;
  }
 
  /**
   * Updates an existing user
   * @param {string} id - User ID to update
   * @param {Partial<User>} data - Fields to update
   * @returns {Promise<User | undefined>} Updated user or undefined if not found
   */
  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...data,
    };
    await this.syncUsersFile();
    return this.users[index];
  }

  /**
   * Deletes a user
   * @param {string} id - User ID to delete
   * @returns {Promise<User | undefined>} Deleted user or undefined if not found
   */
  async deleteUser(id: string): Promise<User | undefined> {
    const index = this.users.findIndex((u) => u.id === id);
   if (index === -1) return undefined;

   const [deleted] = this.users.splice(index, 1);
   await this.syncUsersFile();
   return deleted;
  }
  // ========================================================================
  // PUBLIC ANALYTICS API
  // ========================================================================

  /**
   * Retrieves dashboard statistics
   * @returns {Promise<{totalProjects: number, totalUsers: number, recentSubmissions: number, newMessages: number}>} Stats object
   */
  async getStats() {
    await this.loadProjects();
    
    // Count submissions from the last 30 days
    const recentSubmissions = this.users.filter((u) => {
      if (!u.submittedAt) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(u.submittedAt) > thirtyDaysAgo;
    }).length;

    const newMessages = this.users.filter((u) => !u.reply).length;

    return {
      totalProjects: this.projects.length,
      totalUsers: this.users.length,
      recentSubmissions,
      newMessages,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
export const dataStore = new DataStore();
