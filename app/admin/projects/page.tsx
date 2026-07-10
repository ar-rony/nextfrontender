// ============================================================================
// ADMIN PROJECTS MANAGEMENT PAGE
// ============================================================================
// This page allows administrators to manage projects (Create, Read, Update, Delete)
// Features:
// - View all projects in a list
// - Create new projects with images, stack, and metadata
// - Edit existing projects
// - Delete projects with confirmation
// - Form validation and error handling
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Project } from "@/app/lib/constants";

/**
 * Admin Projects Management Page Component
 * Provides full CRUD functionality for projects management
 */
export default function ProjectsManagementPage() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  // Projects list from database
  const [projects, setProjects] = useState<Project[]>([]);
  
  // UI state for form visibility
  const [showForm, setShowForm] = useState(false);
  
  // ID of project being edited (null for new project)
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Loading state for async operations (submit, delete)
  const [loading, setLoading] = useState(false);
  
  // State for individual delete operations (tracks which project is being deleted)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form data state with all project fields
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    summary: "",
    description: "",
    stack: "", // Comma-separated string for form input
    images: [] as string[], // Base64 or URL strings
    imageNames: [] as string[], // Filenames for display
    preview: "", // URL of main preview image
    link: "",
  });

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Fetch projects on component mount
   */
  useEffect(() => {
    fetchProjects();
  }, []);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  /**
   * Fetches all projects from API endpoint
   * Updates local state and shows error toast on failure
   */
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      toast.error("Failed to fetch projects");
      console.error(error);
    }
  };

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================

  /**
   * Handles text input changes for form fields
   * Updates formData state with new value
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles file selection and converts to data URLs
   * Supports multiple file uploads
   * Updates both images (as base64) and imageNames (for display)
   * First image is set as preview automatically
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    /**
     * Converts a File to a data URL
     * @param {File} file - File to convert
     * @returns {Promise<string>} Data URL of the file
     */
    const toDataUrl = (file: File) =>
      new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result));
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

    try {
      const urls: string[] = [];
      const names: string[] = [];
      
      // Convert each file to data URL
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await toDataUrl(file);
        urls.push(url);
        names.push(file.name);
      }

      // Update form data with images and set first as preview
      setFormData((prev) => ({
        ...prev,
        images: urls,
        imageNames: names,
        preview: urls[0] || "",
      }));
    } catch (error) {
      console.error("Failed to read files", error);
      toast.error("Failed to read image files");
    }
  };

  /**
   * Handles form submission (create or update project)
   * Validates form data and sends to API
   * Updates project list and resets form on success
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine if creating or updating
      const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
      const method = editingId ? "PUT" : "POST";

      // Remove imageNames from payload (not needed by API)
      const { imageNames, ...payload } = formData;
      
      // Send request to API
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          // Convert comma-separated stack string to array
          stack: formData.stack.split(",").map((s) => s.trim()),
        }),
      });

      if (response.ok) {
        // Show success message
        toast.success(editingId ? "Project updated!" : "Project created!");
        
        // Reset form state
        setFormData({
          title: "",
          slug: "",
          category: "",
          summary: "",
          description: "",
          stack: "",
          images: [] as string[],
          imageNames: [] as string[],
          preview: "",
          link: "",
        });
        
        setEditingId(null);
        setShowForm(false);
        
        // Refresh projects list
        fetchProjects();
      } else {
        toast.error("Failed to save project");
      }
    } catch (error) {
      toast.error("Error saving project");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // PROJECT CRUD OPERATIONS
  // ========================================================================

  /**
   * Loads a project into the form for editing
   * Handles various image format conversions
   * @param {Project} project - Project to edit
   */
  const handleEdit = (project: Project) => {
    // Extract images array - handle multiple formats
    const images = Array.isArray((project as any).images)
      ? ((project as any).images as string[])
      : (project as any).image
      ? [(project as any).image]
      : [];

    // Extract image filenames for display
    const imageNames = images.map((image) => image.split("/").pop() || image);

    // Populate form with project data
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category,
      summary: project.summary,
      description: project.description,
      stack: project.stack.join(", "), // Convert array to comma-separated string
      images,
      imageNames,
      preview: (project as any).preview || (project as any).image || "",
      link: project.link || "",
    });
    
    // Set editing mode
    setEditingId(project.id);
    setShowForm(true);
  };

  /**
   * Deletes a project after user confirmation
   * Shows confirmation dialog before deletion
   * @param {string} id - Project ID to delete
   */
  const handleDelete = async (id: string) => {
    // Show confirmation dialog
    if (!confirm("Are you sure you want to delete this project?")) return;

    // Set this project as loading
    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Project deleted!");
        fetchProjects();
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      toast.error("Error deleting project");
      console.error(error);
    } finally {
      // Clear loading state
      setDeletingId(null);
    }
  };

  /**
   * Cancels form editing and resets form state
   * Called when user clicks Cancel button or wants to hide form
   */
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    
    // Reset form to initial state
    setFormData({
      title: "",
      slug: "",
      category: "",
      summary: "",
      description: "",
      stack: "",
      images: [] as string[],
      imageNames: [] as string[],
      preview: "",
      link: "",
    });
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ================================================================ */}
        {/* HEADER SECTION */}
        {/* ================================================================ */}
        <div className="flex justify-between items-center mb-8">
          <div>
            {/* Back to Dashboard Link */}
            <Link href="/admin">
              <Button variant="ghost" className="text-slate-400 mb-4">
                ← Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Manage Projects</h1>
          </div>
          
          {/* "Add New Project" button - only shown when form is hidden */}
          {!showForm && (
            <Button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add New Project
            </Button>
          )}
        </div>

        {/* ================================================================ */}
        {/* PROJECT FORM SECTION */}
        {/* ================================================================ */}
        {showForm && (
          <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? "Edit Project" : "Create New Project"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title and Slug Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="Project title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slug *
                  </label>
                  <Input
                    type="text"
                    name="slug"
                    placeholder="project-slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Category and Link Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category *
                  </label>
                  <Input
                    type="text"
                    name="category"
                    placeholder="e.g., Brand experience"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Link
                  </label>
                  <Input
                    type="url"
                    name="link"
                    placeholder="https://example.com"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Summary Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Summary *
                </label>
                <Input
                  type="text"
                  name="summary"
                  placeholder="Brief project summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <Textarea
                  name="description"
                  placeholder="Detailed project description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Stack and Images Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stack (comma-separated) *
                  </label>
                  <Input
                    type="text"
                    name="stack"
                    placeholder="Next.js, React, Tailwind CSS"
                    value={formData.stack}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Images
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="bg-slate-700 border-slate-600 text-white file:text-slate-300"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Upload one or more images; the first will be used as the preview.
                  </p>
                  
                  {/* Display selected image filenames */}
                  {formData.imageNames.length > 0 && (
                    <p className="text-sm text-slate-300 mt-2">
                      Selected: {formData.imageNames.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-4 pt-4">
                {/* Submit Button - disabled during loading */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Saving..." : "Save Project"}
                </Button>
                
                {/* Cancel Button */}
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* ================================================================ */}
        {/* PROJECTS LIST SECTION */}
        {/* ================================================================ */}
        <div className="space-y-4">
          {/* Empty State */}
          {projects.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">
                No projects yet. Create one to get started!
              </p>
            </Card>
          ) : (
            // Projects Grid
            projects.map((project) => (
              <Card key={project.id} className="bg-slate-800 border-slate-700 p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  {/* Project Info Section */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                    <p className="text-slate-400 text-sm">{project.category}</p>
                    <p className="text-slate-300 mt-2">{project.summary}</p>
                    
                    {/* Technology Stack Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* Edit Button - opens form with project data */}
                    <Button
                      type="button"
                      onClick={() => handleEdit(project)}
                      disabled={deletingId === project.id}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </Button>
                    
                    {/* Delete Button - shows confirmation before deleting */}
                    <Button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id || loading}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === project.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
