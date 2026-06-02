"use client";

import { useState, useEffect } from "react";

interface VaultEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  username: string;
  password: string;
  url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: "general", label: "🔐 General" },
  { value: "password", label: "🔑 Password" },
  { value: "note", label: "📝 Note" },
  { value: "card", label: "💳 Card" },
  { value: "document", label: "📄 Document" },
];

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export default function AddEditModal({
  entry,
  onClose,
  onSave,
}: {
  entry: VaultEntry | null;
  onClose: () => void;
  onSave: (data: Partial<VaultEntry>) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setCategory(entry.category);
      setContent(entry.content);
      setUsername(entry.username);
      setPassword(entry.password);
      setUrl(entry.url);
    } else {
      setTitle("");
      setCategory("general");
      setContent("");
      setUsername("");
      setPassword("");
      setUrl("");
      setSelectedFile(null);
    }
  }, [entry]);

  async function uploadFile(file: File) {
    const token = lsGet("vaultx_token");
    if (!token) throw new Error("Not authenticated");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Upload failed");
    return data.file;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setUploadProgress("");

    try {
      let fileData = {};
      if (category === "document" && selectedFile) {
        setUploadProgress("Uploading file...");
        fileData = await uploadFile(selectedFile);
      }

      const saveData: Partial<VaultEntry> = {
        title: title.trim(),
        category,
        content: content.trim() || selectedFile?.name || "",
        username: username.trim(),
        password,
        url: url.trim(),
        ...fileData,
      };

      await onSave(saveData);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
      setUploadProgress("");
    }
  };

  const isDocument = category === "document";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1f2e] rounded-xl border border-gray-800 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {entry ? "Edit Entry" : "Add New Entry"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#0f1219] border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
                placeholder="Entry title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value !== "document") setSelectedFile(null);
                }}
                className="w-full bg-[#0f1219] border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {isDocument ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#0f1219] border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#6366f1] file:text-white file:font-medium hover:file:bg-[#4f46e5]"
                  />
                </div>
                {selectedFile && (
                  <p className="mt-1 text-sm text-gray-400">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full bg-[#0f1219] border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none"
                  placeholder="Enter your secure content"
                />
              </div>
            )}

            {!isDocument && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0f1219] border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
                    placeholder="Username or email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0f1219] border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
                    placeholder="******"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-[#0f1219] border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}

            {uploadProgress && (
              <p className="text-sm text-[#6366f1]">{uploadProgress}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || (isDocument && !selectedFile && !entry?.file_path)}
                className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Entry"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}