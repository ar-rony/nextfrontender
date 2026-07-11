// ============================================================================
// ADMIN DASHBOARD PAGE
// ============================================================================
// Main admin dashboard displaying:
// - Welcome message with admin username
// - Key statistics (projects, users, submissions)
// - Quick action links to manage content
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

/**
 * Dashboard statistics interface
 */
interface Stats {
  totalProjects: number;
  totalUsers: number;
  recentSubmissions: number;
  newMessages: number;
}

/**
 * Admin Dashboard Component
 * Displays overview statistics and quick action buttons for admin management
 */
export default function AdminDashboard() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  // Dashboard statistics
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalUsers: 0,
    recentSubmissions: 0,
    newMessages: 0,
  });
  
  // Logged-in admin username and role
  const [adminUsername, setAdminUsername] = useState("");
  const [adminRole, setAdminRole] = useState("");
  
  // Router for navigation
  const router = useRouter();

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Initialize dashboard on component mount
   * - Load admin username from localStorage
   * - Fetch dashboard statistics
   */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const username = window.localStorage.getItem("adminUsername");
    const role = window.localStorage.getItem("adminRole");

    if (username) {
      setAdminUsername(username);
    }
    if (role) {
      setAdminRole(role);
    }

    if (!role) {
      router.push("/admin/login");
      return;
    }

    // Allow Superadmin and Admin roles to access dashboard
    // Redirect only Viewer role to projects page
    if (role === "Viewer") {
      router.push("/admin/projects");
      return;
    }

    fetchStats();
  }, [router]);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  /**
   * Fetches dashboard statistics from API endpoints
   * Retrieves stats and projects count to populate dashboard cards
   */
  async function fetchStats() {
    try {
      // Fetch stats from stats endpoint
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }

      // Fetch projects to get accurate count
      const projectsResponse = await fetch("/api/admin/projects");
      if (projectsResponse.ok) {
        const projects = await projectsResponse.json();
        setStats((prev) => ({ ...prev, totalProjects: projects.length }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  // ========================================================================
  // USER ACTIONS
  // ========================================================================

  /**
   * Handles admin logout
   * - Clears authentication from localStorage
   * - Shows success toast
   * - Redirects to login page
   */
  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminRole");
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ==================================================================== */}
        {/* HEADER SECTION */}
        {/* ==================================================================== */}
        <div className="flex justify-between items-center mb-12">
          <div>
            {/* Main title */}
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            
            {/* Welcome message with logged-in admin name */}
            <p className="text-slate-400">
              Welcome, <span className="font-semibold text-slate-300">{adminUsername}</span>
              {adminRole ? (
                <span className="ml-2 text-slate-500">({adminRole})</span>
              ) : null}
            </p>
            
          </div>
          
          
          {/* Top-right action links */}
          <div className="flex items-center gap-3">
            <Link href="/projects" className="text-blue-400 hover:text-blue-300 border-slate-600 hover:border-primary">
              See Projects
            </Link>
            <Button
              variant="outline"
              title={stats.newMessages > 0 ? `${stats.newMessages} new client message${stats.newMessages === 1 ? "" : "s"}` : "No new client messages"}
              className="text-gray-800 dark:text-white border-slate-600 hover:border-primary"
            >
              <Bell className="mr-2 h-4 w-4" />
              {stats.newMessages} new
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white border-red-500"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* STATISTICS GRID */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Total Projects Stat Card */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Projects</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.totalProjects}</p>
              </div>
              <div className="text-5xl opacity-10">📁</div>
            </div>
          </Card>

          {/* Total Users Stat Card */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.totalUsers}</p>
              </div>
              <div className="text-5xl opacity-10">👥</div>
            </div>
          </Card>

          {/* New Messages Stat Card */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">New Messages</p>
                <p className="text-4xl font-bold text-gray-500 dark:text-white mt-2">{stats.newMessages}</p>
              </div>
              <div className="text-5xl opacity-10">📬</div>
            </div>
          </Card>

          {/* Recent Submissions Stat Card */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Recent Submissions</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.recentSubmissions}</p>
              </div>
              <div className="text-5xl opacity-10">📧</div>
            </div>
          </Card>
        </div>

        {/* ==================================================================== */}
        {/* QUICK ACTIONS SECTION */}
        {/* ==================================================================== */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          
          {/* Action buttons grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Manage Projects Button */}
            <Link href="/admin/projects">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base">
                Manage Projects
              </Button>
            </Link>
            
            {/* Messages Button */}
            <Link href="/admin/messages">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base">
                Messages
              </Button>
            </Link>
            
            {/* Settings Button */}
            <Link href="/admin/settings">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base">
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
