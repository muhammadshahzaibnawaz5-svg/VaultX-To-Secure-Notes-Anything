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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function VaultModal({
  entry,
  onClose,
  onEdit,
}: {
  entry: VaultEntry | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!entry) return null;

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
            <h2 className="text-xl font-bold text-white">{entry.title}</h2>
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

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Category
              </label>
              <p className="text-gray-300 capitalize">{entry.category}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Content
              </label>
              <p className="text-gray-300 whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Username
              </label>
              <p className="text-gray-300">{entry.username || "-"}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <p className="text-gray-300">{entry.password || "-"}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                URL
              </label>
              <p className="text-gray-300">{entry.url || "-"}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Last Updated
              </label>
              <p className="text-gray-400 text-sm">
                {formatDate(entry.updated_at)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onEdit}
              className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium py-2 px-4 rounded-lg transition-all"
            >
              Edit Entry
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
