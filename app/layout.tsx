import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Vault X - Secure Digital Vault",
  description:
    "Store your sensitive information securely with VaultX. Notes, passwords, documents - all protected with Caesar Cipher encryption.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f1219] text-white antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
