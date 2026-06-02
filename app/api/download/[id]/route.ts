import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { VaultEncryptor } from "@/lib/encryption";

const encryptor = new VaultEncryptor(3);

function verifyAuth(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const tokenParam = url.searchParams.get("token");
    const username = verifyAuth(request) || tokenParam;
    if (!username) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    const db = await readDb();
    const user = db.users.find((u) => u.username === username);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    const entries = db.vaults[user.id] || [];
    const entry = entries.find((e) => e.id === id);
    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      );
    }

    const decrypted = encryptor.decryptEntry(entry);
    if (!decrypted.file_path) {
      return NextResponse.json(
        { success: false, error: "No file associated with this entry" },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "data", "uploads", decrypted.file_path);
    const fileBuffer = await fs.readFile(filePath);
    const fileName = decrypted.file_name || "download";
    const fileType = decrypted.file_type || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": fileType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
