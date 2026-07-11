// ============================================================================
// ADMIN LOGIN PAGE
// ============================================================================
// Authentication page for admin access
// - Username and password validation
// - Secure login via API
// - Session storage (localStorage) for authentication state
// WARNING: In production, use proper authentication (sessions, JWT with httpOnly cookies)
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

/**
 * Admin Login Page Component
 * Provides login form for admin authentication
 */
export default function AdminLoginPage() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  // Form input states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Loading state during form submission
  const [loading, setLoading] = useState(false);
  
  // Router for navigation after login
  const router = useRouter();

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================

  /**
   * Handles login form submission
   * - Validates credentials via API
   * - Stores auth token in localStorage on success
   * - Redirects to admin dashboard on successful login
   * - Shows error message on failed login
   * @param {React.FormEvent} e - Form submit event
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send login request to API
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Parse response
      const data = await response.json();

      if (response.ok) {
        // Store authentication flag, username, and role in localStorage
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminUsername", username);
        localStorage.setItem("adminRole", data.admin.role);
        
        // Show success message
        toast.success("Login successful!");
        
        // Redirect based on role
        const destination = data.admin.role === "Superadmin" ? "/admin" : "/admin/projects";
        router.push(destination);
      } else {
        // Show error message from API or generic message
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Panel</h1>
          <p className="text-slate-400 text-center mb-8">Sign in to your account</p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
            </div>

            {/* Login Submit Button */}
            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Back to Website Link */}
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 my-4">
              ← Back to website
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
