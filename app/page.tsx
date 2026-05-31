import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-125 h-125 rounded-full bg-[#6366f1]/5 blur-[120px] animate-float" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-100 h-100 rounded-full bg-[#6366f1]/5 blur-[100px] animate-float"
        style={{ animationDelay: "-1.5s" }}
      />

      <div className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 bg-[#6366f1]/20 text-[#6366f1] px-4 py-2 rounded-full text-sm animate-fade-in-down delay-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366f1] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366f1]" />
            </span>
            Secure & Encrypted
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight 
animate-fade-in-up delay-2">
            Your Digital Vault
            <br />
            <span className="text-[#6366f1]">Protected Forever</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-3">
            Store your sensitive information securely with VaultX. Notes,
            passwords, documents - all protected with Caesar Cipher encryption.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up delay-4">
            <Link
              href="/register"
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-3xl animate-pulse-glow"
            >
              Create Free Vault
              <svg
                className="w-5 h-5 arrow-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="border border-gray-600 hover:bg-blue-500 text-white px-6 py-3 rounded-3xl transition-all duration-200 bg-[#6366F1] hover:translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)]"
            >
              Sign In
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto cursor-pointer mb-8">
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 feature-card animate-fade-in-up delay-2">
              <span className="feature-icon text-3xl mb-4">🔒</span>
              <h3 className="feature-title text-lg font-semibold text-white mb-2">
                Caesar Cipher Encryption
              </h3>
              <p className="text-gray-400 text-sm">
                Your data is encrypted using Caesar Cipher before storage
              </p>
            </div>
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 feature-card animate-fade-in-up delay-3">
              <span className="feature-icon text-3xl mb-4">☁️</span>
              <h3 className="feature-title text-lg font-semibold text-white mb-2">
                Cloud Storage
              </h3>
              <p className="text-gray-400 text-sm">
                Access your vault from anywhere, anytime
              </p>
            </div>
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 feature-card animate-fade-in-up delay-4">
              <span className="feature-icon text-3xl mb-4">⚡</span>
              <h3 className="feature-title text-lg font-semibold text-white mb-2">
                Fast & Simple
              </h3>
              <p className="text-gray-400 text-sm">
                Intuitive interface designed for efficiency
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>Vault X - Secure Digital Vault © 2024 | BSSE-E1 Group Project</p>
        </div>
      </footer>
    </div>
  );
}
