"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Project } from "@/app/lib/constants";

export default function ProjectsManagementPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    summary: "",
    description: "",
    stack: "",
    // support multiple images and a preview
    images: [] as string[],
    preview: "",
    link: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toDataUrl = (file: File) =>
      new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result));
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await toDataUrl(files[i]);
        urls.push(url);
      }

      setFormData((prev) => ({ ...prev, images: urls, preview: urls[0] || "" }));
    } catch (error) {
      console.error("Failed to read files", error);
      toast.error("Failed to read image files");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stack: formData.stack.split(",").map((s) => s.trim()),
        }),
      });

      if (response.ok) {
        toast.success(editingId ? "Project updated!" : "Project created!");
        setFormData({
          title: "",
          slug: "",
          category: "",
          summary: "",
          description: "",
          stack: "",
          images: [] as string[],
          preview: "",
          link: "",
        });
        setEditingId(null);
        setShowForm(false);
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

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category,
      summary: project.summary,
      description: project.description,
      stack: project.stack.join(", "),
      images: (project as any).images || (project as any).image ? [(project as any).image] : [],
      preview: (project as any).preview || (project as any).image || "",
      link: project.link || "",
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

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
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      category: "",
      summary: "",
      description: "",
      stack: "",
      images: [] as string[],
      preview: "",
      link: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin">
              <Button variant="ghost" className="text-slate-400 mb-4">
                ← Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Manage Projects</h1>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add New Project
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? "Edit Project" : "Create New Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Slug</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Link</label>
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Summary</label>
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stack (comma-separated)
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-300"
                  />
                  <p className="text-xs text-slate-400 mt-2">You can upload one or more images; the first will be used as the preview.</p>
                  {formData.preview && (
                    <img src={formData.preview} alt="preview" className="mt-3 w-full rounded-md" />
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Saving..." : "Save Project"}
                </Button>
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

        {/* Projects List */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">No projects yet. Create one to get started!</p>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="bg-slate-800 border-slate-700 p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                    <p className="text-slate-400 text-sm">{project.category}</p>
                    <p className="text-slate-300 mt-2">{project.summary}</p>
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
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(project)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(project.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
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
