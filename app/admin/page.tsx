"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Stats {
  totalProjects: number;
  totalUsers: number;
  recentSubmissions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalUsers: 0,
    recentSubmissions: 0,
  });
  const [adminUsername, setAdminUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("adminUsername");
    if (username) {
      setAdminUsername(username);
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUsername");
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Welcome, <span className="font-semibold text-slate-300">{adminUsername}</span></p>
          </div>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Visit Site
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-red-600 hover:bg-red-700 text-white border-red-500"
          >
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Projects</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.totalProjects}</p>
              </div>
              <div className="text-5xl opacity-10">📁</div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.totalUsers}</p>
              </div>
              <div className="text-5xl opacity-10">👥</div>
            </div>
          </Card>

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

        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/projects">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base">
                Manage Projects
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base">
                Manage Users
              </Button>
            </Link>
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
