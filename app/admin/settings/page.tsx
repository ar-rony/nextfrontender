"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  useEffect(() => {
    setAdminRole(localStorage.getItem("adminRole"));
  }, []);

  const permissionsDescription =
    adminRole === "Superadmin"
      ? "Superadmin can access the dashboard, manage all projects, delete projects, and handle messages."
      : adminRole === "Admin"
      ? "Admin can add and edit projects and manage messages, but cannot delete projects."
      : adminRole === "Viewer"
      ? "Viewer can view and update projects and messages, but cannot delete projects."
      : "Your role determines which admin actions are available.";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          adminUsername: localStorage.getItem("adminUsername"),
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Error changing password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link href="/admin">
          <Button variant="ghost" className="text-slate-400 mb-8">
            ← Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        {/* Change Password */}
        <Card className="bg-slate-800 border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 mt-6"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="bg-slate-800 border-slate-700 p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Admin Information</h2>
          <div className="space-y-3 text-slate-300">
            <p>
              <span className="text-slate-400">Username:</span> {localStorage.getItem("adminUsername")}
            </p>
            <p>
              <span className="text-slate-400">Role:</span> {adminRole || "Unknown"}
            </p>
            <p className="text-sm text-slate-400 mt-4">{permissionsDescription}</p>
            <p className="text-sm text-slate-400 mt-4">
              Keep your login credentials safe and change your password regularly.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
