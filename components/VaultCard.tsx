"use client";

interface VaultEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  username: string;
  password: string;
  url: string;
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (m) =>
    m === "&" ? "&amp;" : m === "<" ? "&lt;" : m === ">" ? "&gt;" : m === '"' ? "&quot;" : "&#39;"
  );
}

export default function VaultCard({
  entry,
  onView,
  onDelete,
}: {
  entry: VaultEntry;
  onView: () => void;
  onDelete: () => void;
}) {
  const icon = categoryIcons[entry.category] || categoryIcons.general;

  return (
    <div
      className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-5 hover:border-[#6366f1]/50 transition-all cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-gray-100">
              {escapeHtml(entry.title)}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{entry.category}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-500 hover:text-red-500 transition-colors p-1"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <p className="text-sm text-gray-400 line-clamp-2">
        {escapeHtml(entry.content.substring(0, 80))}
        {entry.content.length > 80 ? "..." : ""}
      </p>
      {(entry.username || entry.url) && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          {entry.username && (
            <p className="text-xs text-gray-500">
              Username:{" "}
              <span className="text-gray-400">
                {escapeHtml(entry.username)}
              </span>
            </p>
          )}
          {entry.url && (
            <p className="text-xs text-gray-500">
              URL:{" "}
              <span className="text-gray-400">{escapeHtml(entry.url)}</span>
            </p>
          )}
        </div>
      )}
      <div className="mt-3 text-xs text-gray-600">
        Updated: {formatDate(entry.updated_at)}
      </div>
    </div>
  );
}
