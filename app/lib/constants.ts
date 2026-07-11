// Project type definition
export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  stack: string[];
  // Support multiple images and a preview field
  images?: string[];
  preview?: string;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  requirements?: string;
  message?: string;
  reply?: string;
  repliedAt?: Date;
  submittedAt?: Date;
}

// Admin role definitions
export type AdminRole = "Superadmin" | "Admin" | "Viewer";

// Admin type definition
export interface Admin {
  id: string;
  username: string;
  password: string; // In production, use hashed passwords
  email: string;
  role: AdminRole;
  createdAt: Date;
}

// Admin credentials (Use strong passwords in production)
export const ADMIN_CREDENTIALS: Admin[] = [
  {
    id: "superadmin-001",
    username: "admin",
    password: "superadmin123",
    email: "superadmin@nextfrontender.com",
    role: "Superadmin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "admin-001",
    username: "admin",
    password: "admin123",
    email: "admin@nextfrontender.com",
    role: "Admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "viewer-001",
    username: "viewer",
    password: "viewer123",
    email: "viewer@nextfrontender.com",
    role: "Viewer",
    createdAt: new Date("2024-01-01"),
  },
];

// Projects data
export const projects: Project[] = [
  {
    id: "proj-001",
    slug: "aurora-studio",
    title: "Aurora Studio",
    category: "Brand experience",
    summary: "A premium portfolio and content experience for a design-led studio.",
    description:
      "Aurora Studio needed a polished digital presence that matched the quality of their client work. The site now conveys a calm, editorial aesthetic while remaining lightweight and easy to navigate.",
    stack: ["Next.js", "Tailwind CSS", "Framer Motion"],
    images: ["/projects/aurora-studio.jpg"],
    preview: "/projects/aurora-studio.jpg",
    link: "https://aurora-studio.com",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "proj-002",
    slug: "northstar-labs",
    title: "Northstar Labs",
    category: "Product launch",
    summary: "A conversion-focused launch site for a B2B SaaS product.",
    description:
      "Northstar Labs wanted a high-performance landing experience that clearly communicated the product value and supported inbound demos. The result is a focused, fast-moving page with strong storytelling and clear calls to action.",
    stack: ["Next.js", "TypeScript", "Shadcn UI"],
    images: ["/projects/northstar-labs.jpg"],
    preview: "/projects/northstar-labs.jpg",
    link: "https://northstar-labs.com",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
];

// Users/Contacts data
export const users: User[] = [
  {
    id: "user-001",
    name: "John Doe",
    email: "john@example.com",
    message: "Great work on the portfolio!",
    submittedAt: new Date("2024-01-10"),
  },
];
