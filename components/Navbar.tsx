"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ username: string; token: boolean } | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("vaultx_token");
      const userStr = localStorage.getItem("vaultx_user");
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setAuth({ username: user.username, token: true });
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("vaultx_token");
      localStorage.removeItem("vaultx_user");
    } catch {}
    router.push("/login");
  };

  return (
    <nav className="fixed w-full z-50 bg-[#0f1219]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <span className="text-xl font-bold text-white">Vault X</span>
          </Link>
          <div className="flex items-center gap-4">
            {auth ? (
              <>
                <span className="text-sm text-gray-300">
                  Hello,{" "}
                  <span className="font-semibold text-white">{auth.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
