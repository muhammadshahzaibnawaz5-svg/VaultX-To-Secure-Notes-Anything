"use client";

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

function formatFileSize(bytes: number) {
  if (bytes === 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
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
  const isDocument = entry.category === "document";

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

      {isDocument && entry.file_name ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{escapeHtml(entry.file_name)}</span>
          {entry.file_size > 0 && (
            <span className="text-xs text-gray-500 shrink-0">{formatFileSize(entry.file_size)}</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 line-clamp-2">
          {escapeHtml(entry.content.substring(0, 80))}
          {entry.content.length > 80 ? "..." : ""}
        </p>
      )}

      {!isDocument && (entry.username || entry.url) && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          {entry.username && (
            <p className="text-xs text-gray-500">
              Username: <span className="text-gray-400">{escapeHtml(entry.username)}</span>
            </p>
          )}
          {entry.url && (
            <p className="text-xs text-gray-500">
              URL: <span className="text-gray-400">{escapeHtml(entry.url)}</span>
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