// ============================================================================
// DATA STORE MODULE - Handles Projects and Users Management
// ============================================================================
// This module provides a centralized data store for managing projects and users.
// It supports both file-based storage (JSON) and database storage (PostgreSQL).
// Priority: Database > File System
// ============================================================================

import { Project, User } from "@/app/lib/constants";
import { createClient, createPool } from "@vercel/postgres";
import fs from "fs";
import os from "os";
import path from "path";

// ============================================================================
// DATABASE CLIENT SETUP
// ============================================================================
/**
 * Initializes and returns the appropriate database client
 * Prefers non-pooling connection for direct queries when available
 * Falls back to pooled connection for Vercel Postgres
 * @returns {DatabaseClient | undefined} Client instance or undefined if no connection
 */
function getDbClient() {
  // Try non-pooling connection first (for direct queries)
  const directConnection = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
  
  // Fall back to pooled connection (for Vercel Postgres)
  const pooledConnection = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  // Use direct connection if available and not pooler
  if (directConnection && !directConnection.includes("-pooler.")) {
    return createClient({ connectionString: directConnection });
  }

  // Use pooled connection if available and is pooler
  if (pooledConnection && pooledConnection.includes("-pooler.")) {
    return createPool({ connectionString: pooledConnection });
  }

  // Fall back to direct connection as last resort
  if (directConnection) {
    return createClient({ connectionString: directConnection });
  }

  return undefined;
}

// Initialize database client
const db = getDbClient();

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
  
  // In-memory user list (not persisted to database in current implementation)
  private users: User[] = [];
  
  // File paths for persistence
  private filePath: string; // Persistent storage location
  private runtimePath: string; // Runtime temporary storage
  
  // Flags for optimization
  private projectsLoaded = false; // Prevents redundant loading
  private databaseReady = false; // Caches database initialization status

  constructor() {
    // Initialize file paths
    this.filePath = path.join(process.cwd(), "data", "projects.json");
    this.runtimePath = path.join(os.tmpdir(), "nextfrontender-projects.json");
    
    // Load projects synchronously on initialization (file-based fallback)
    this.projects = this.loadProjectsSync();

    // Initialize default users
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
        const parsed = JSON.parse(raw);
        
        // Convert date strings to Date objects
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

  /**
   * Ensures the PostgreSQL projects table exists and is initialized
   * Creates table schema if it doesn't exist
   * @returns {Promise<boolean>} True if table is ready, false otherwise
   */
  private async ensureProjectsTable(): Promise<boolean> {
    // Get connection string from environment
    const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
    if (!connectionString) {
      return false; // No database configured
    }

    if (!db) {
      console.error("No database client available for Vercel Postgres");
      return false;
    }

    // Return early if table is already initialized
    if (this.databaseReady) {
      return true;
    }

    try {
      // Create table with proper schema and indexes
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

  /**
   * Loads projects from PostgreSQL database
   * Attempts to seed database with file data if empty
   * @returns {Promise<Project[]>} Array of projects from database
   */
  private async loadProjectsFromDatabase(): Promise<Project[]> {
    // Ensure table exists first
    const isReady = await this.ensureProjectsTable();
    if (!isReady) return [];

    if (!db) {
      return [];
    }

    try {
      // Fetch all projects ordered by creation date (newest first)
      const result = await db.sql`SELECT * FROM projects ORDER BY "createdAt" DESC`;
      const rows = (result.rows as ProjectRow[]) ?? [];
      const projects = rows.map(toProject);

      // If database is empty, try to seed it with file data
      if (projects.length === 0) {
        const fallbackProjects = this.loadProjectsSync();
        if (fallbackProjects.length > 0) {
          // Seed database with fallback projects
          for (const project of fallbackProjects) {
            await db.sql`
              INSERT INTO projects (id, slug, title, category, summary, description, stack, images, preview, link)
              VALUES (${project.id}, ${project.slug}, ${project.title}, ${project.category}, ${project.summary}, ${project.description}, ${JSON.stringify(project.stack ?? [])}, ${JSON.stringify(project.images ?? [])}, ${project.preview ?? null}, ${project.link ?? null})
              ON CONFLICT (id) DO NOTHING
            `;
          }

          // Reload projects after seeding
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
        const parsed = JSON.parse(raw);
        
        // Convert date strings
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

    // Try to persist to database
    const databaseReady = await this.ensureProjectsTable();
    if (databaseReady && db) {
      await db.sql`
        INSERT INTO projects (id, slug, title, category, summary, description, stack, images, preview, link)
        VALUES (${project.id}, ${project.slug}, ${project.title}, ${project.category}, ${project.summary}, ${project.description}, ${JSON.stringify(project.stack)}, ${JSON.stringify(project.images ?? [])}, ${project.preview ?? null}, ${project.link ?? null})
      `;
      
      // Reload from database to ensure consistency
      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      return project;
    }

    // Fall back to file-based storage
    this.projects = [...this.projects, project];
    await this.syncProjectsFile(this.projects);
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

    // Try to persist to database
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
      
      // Reload from database
      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      return updatedProject;
    }

    // Fall back to file-based storage
    this.projects[index] = updatedProject;
    await this.syncProjectsFile(this.projects);
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

    // Try to persist deletion to database
    const databaseReady = await this.ensureProjectsTable();
    if (databaseReady && db) {
      await db.sql`DELETE FROM projects WHERE id = ${id}`;
      
      // Reload from database
      const freshProjects = await this.loadProjectsFromDatabase();
      this.projects = freshProjects;
      await this.syncProjectsFile(this.projects);
      return deleted;
    }

    // Fall back to file-based storage
    await this.syncProjectsFile(this.projects);
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
   * @returns {User} Created user
   */
  createUser(data: Omit<User, "id" | "submittedAt">): User {
    const user: User = {
      id: `user-${Date.now()}`,
      ...data,
      submittedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  /**
   * Updates an existing user
   * @param {string} id - User ID to update
   * @param {Partial<User>} data - Fields to update
   * @returns {User | undefined} Updated user or undefined if not found
   */
  updateUser(id: string, data: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...data,
    };
    return this.users[index];
  }

  /**
   * Deletes a user
   * @param {string} id - User ID to delete
   * @returns {User | undefined} Deleted user or undefined if not found
   */
  deleteUser(id: string): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    const [deleted] = this.users.splice(index, 1);
    return deleted;
  }

  // ========================================================================
  // PUBLIC ANALYTICS API
  // ========================================================================

  /**
   * Retrieves dashboard statistics
   * @returns {Promise<{totalProjects: number, totalUsers: number, recentSubmissions: number}>} Stats object
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

    return {
      totalProjects: this.projects.length,
      totalUsers: this.users.length,
      recentSubmissions,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
export const dataStore = new DataStore();
