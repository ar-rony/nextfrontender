"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User } from "@/app/lib/constants";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    requirements: "",
  });

  const unreadCount = useMemo(
    () => users.filter((user) => !user.reply).length,
    [users]
  );

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        toast.error("Failed to fetch clients");
        console.error(error);
      }
    };

    loadClients();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      toast.error("Failed to fetch clients");
      console.error(error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", mobile: "", requirements: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `/api/admin/users/${editingId}` : "/api/admin/users";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingId ? "Client updated!" : "Client added!");
        resetForm();
        setShowForm(false);
        fetchUsers();
      } else {
        toast.error("Failed to save client");
      }
    } catch (error) {
      toast.error("Error saving client");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile || "",
      requirements: user.requirements || user.message || "",
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const startReply = (user: User) => {
    setReplyingId(user.id);
    setReplyText(user.reply || "");
  };

  const cancelReply = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const handleSendReply = async (userId: string) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText, repliedAt: new Date().toISOString() }),
      });

      if (response.ok) {
        toast.success("Reply saved and marked as replied.");
        cancelReply();
        fetchUsers();
      } else {
        toast.error("Failed to save reply.");
      }
    } catch (error) {
      toast.error("Error sending reply.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Client deleted!");
        fetchUsers();
      } else {
        toast.error("Failed to delete client");
      }
    } catch (error) {
      toast.error("Error deleting client");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    cancelReply();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Link href="/admin">
              <Button variant="ghost" className="text-slate-400 mb-4">
                ← Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Read contact form messages, reply to them, and delete anything you no longer need.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Button
              variant="outline"
              title={
                unreadCount > 0
                  ? `${unreadCount} new client message${unreadCount === 1 ? "" : "s"}`
                  : "No new client messages"
              }
              className="text-white border-slate-600 hover:border-primary"
            >
              <Bell className="mr-2 h-4 w-4" />
              {unreadCount} new
            </Button>
            {!showForm && (
              <Button
                onClick={() => {
                  cancelReply();
                  setShowForm(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add message
              </Button>
            )}
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{editingId ? "Edit client" : "Add new client"}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Keep contact records up to date and add missing mobile or requirements details.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-slate-600 text-white"
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Client name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="client@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mobile</label>
                  <Input
                    type="tel"
                    name="mobile"
                    placeholder="01XXXXXXXXX"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Requirements</label>
                  <Textarea
                    name="requirements"
                    placeholder="Client requirements or project details"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? "Saving..." : editingId ? "Save changes" : "Add client"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-slate-600 text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">No client messages yet.</p>
            </Card>
          ) : (
            users.map((user) => {
              const isReplied = Boolean(user.reply);
              const messageText = user.requirements || user.message || "No message provided.";

              return (
                <Card key={user.id} className="bg-slate-800 border-slate-700 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white">{user.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isReplied ? "bg-emerald-600/15 text-emerald-200" : "bg-sky-500/15 text-sky-200"}`}>
                          {isReplied ? "Replied" : "New"}
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <p className="text-slate-400 text-sm">{user.email}</p>
                        {user.mobile && <p className="text-slate-400 text-sm">{user.mobile}</p>}
                      </div>
                      <p className="text-slate-300 text-sm leading-6">{messageText}</p>
                      {user.submittedAt && (
                        <p className="text-slate-500 text-xs">
                          Submitted: {new Date(user.submittedAt).toLocaleString()}
                        </p>
                      )}
                      {isReplied && user.reply && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-slate-100">
                          <p className="text-sm font-medium text-emerald-200">Reply</p>
                          <p className="mt-2 text-sm leading-6">{user.reply}</p>
                          {user.repliedAt && (
                            <p className="mt-2 text-xs text-slate-500">Replied: {new Date(user.repliedAt).toLocaleString()}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleEdit(user)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={() => startReply(user)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {isReplied ? "Update reply" : "Reply"}
                        </Button>
                      </div>

                      {replyingId === user.id && (
                        <div className="mt-4 w-full rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Reply message</label>
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                            className="bg-slate-900 border-slate-700 text-white"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleSendReply(user.id)}
                              disabled={loading}
                              className="bg-sky-600 hover:bg-sky-700 text-white"
                            >
                              Send reply
                            </Button>
                            <Button
                              variant="outline"
                              onClick={cancelReply}
                              className="border-slate-600 text-white"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
