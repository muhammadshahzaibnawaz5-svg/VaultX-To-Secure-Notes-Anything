"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import VaultCard from "@/components/VaultCard";
import VaultModal from "@/components/VaultModal";
import AddEditModal from "@/components/AddEditModal";

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
  file_data: string;
  created_at: string;
  updated_at: string;
}

const categoryIcons: Record<string, string> = {
  password: "🔑",
  note: "📝",
  card: "💳",
  document: "📄",
  general: "🔐",
};

type Filter = "all" | "password" | "note" | "card" | "document";

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function lsSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

function lsRemove(key: string) {
  try { localStorage.removeItem(key); } catch {}
}

async function apiRequest(
  endpoint: string,
  method: string = "GET",
  data?: unknown
) {
  const token = lsGet("vaultx_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = "Bearer " + token;

  const options: RequestInit = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(endpoint, options);
  return res.json();
}

export default function DashboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = lsGet("vaultx_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const user = lsGet("vaultx_user");
    if (user) {
      try {
        setUsername(JSON.parse(user).username);
      } catch {}
    }

    loadEntries();
  }, [router]);

  const loadEntries = async () => {
    const response = await apiRequest("/api/vault");
    if (response.success) {
      setEntries(response.entries);
    }
  };

  const filteredEntries =
    filter === "all"
      ? entries
      : entries.filter((e) => e.category === filter);

  const handleSave = useCallback(
    async (data: Partial<VaultEntry>) => {
      if (editingEntry) {
        await apiRequest("/api/vault/" + editingEntry.id, "PUT", data);
      } else {
        await apiRequest("/api/vault", "POST", data);
      }
      setShowAddModal(false);
      setEditingEntry(null);
      await loadEntries();
    },
    [editingEntry]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this entry?")) return;
      await apiRequest("/api/vault/" + id, "DELETE");
      setSelectedEntry(null);
      setEditingEntry(null);
      await loadEntries();
    },
    []
  );

  return (
    <main className="pt-20 pb-12 px-4 min-h-screen bg-[#0f1219]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Vault</h1>
            <p className="text-gray-400 mt-1">
              <span id="entriesCount">{entries.length}</span> secure entries
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              setShowAddModal(true);
            }}
            className="mt-4 sm:mt-0 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Entry
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["all", "password", "note", "card", "document"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (
                  filter === f
                    ? "bg-[#6366f1] text-white"
                    : "bg-[#1a1f2e] text-gray-400 hover:text-white border border-gray-700"
                )}
              >
                {f === "all"
                  ? "All"
                  : categoryIcons[f] + " " + (f.charAt(0).toUpperCase() + f.slice(1) + "s")}
              </button>
            )
          )}
        </div>

        {/* Entries Grid */}
        {filteredEntries.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <VaultCard
                key={entry.id}
                entry={entry}
                onView={() => setSelectedEntry(entry)}
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{filter === "document" ? "📄" : "🔐"}</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === "document" ? "No documents yet" : "Your vault is empty"}
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === "document"
                ? "Upload your first document to get started"
                : "Add your first secure entry to get started"}
            </p>
            <button
              onClick={() => {
                setEditingEntry(null);
                setShowAddModal(true);
              }}
              className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              {filter === "document" ? "Upload Document" : "Add Your First Entry"}
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedEntry && (
        <VaultModal
          entry={selectedEntry}
          onClose={() => {
            setSelectedEntry(null);
            setEditingEntry(null);
          }}
          onEdit={() => {
            setEditingEntry(selectedEntry);
            setShowAddModal(true);
            setSelectedEntry(null);
          }}
        />
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddEditModal
          entry={editingEntry}
          onClose={() => {
            setShowAddModal(false);
            setEditingEntry(null);
            setSelectedEntry(null);
          }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}