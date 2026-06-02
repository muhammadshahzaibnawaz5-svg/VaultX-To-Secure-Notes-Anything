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

  const isDocument = entry.category === "document";

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

            {isDocument ? (
              <>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    File Name
                  </label>
                  <p className="text-gray-300">{entry.file_name || "-"}</p>
                </div>
                {entry.file_type && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      File Type
                    </label>
                    <p className="text-gray-300">{entry.file_type}</p>
                  </div>
                )}
                {entry.file_size > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      File Size
                    </label>
                    <p className="text-gray-300">{formatFileSize(entry.file_size)}</p>
                  </div>
                )}
                {entry.file_path && (
                  <div>
                    <button
                      onClick={() => {
                        const token = (() => { try { return localStorage.getItem("vaultx_token"); } catch { return null; } })();
                        if (token) {
                          window.open(`/api/vault/${entry.id}?download=1&token=${token}`, "_blank");
                        }
                      }}
                      className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium py-3 px-4 rounded-lg transition-all w-full justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download File
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Content
                  </label>
                  <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
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
              </>
            )}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Last Updated
              </label>
              <p className="text-gray-400 text-sm">{formatDate(entry.updated_at)}</p>
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
