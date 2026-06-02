import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { VaultEncryptor } from "@/lib/encryption";

const encryptor = new VaultEncryptor(3);

function verifyAuth(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const username = verifyAuth(request);
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

    const body = await request.json();
    const entries = db.vaults[user.id] || [];
    const index = entries.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      );
    }

    const existing = entries[index];
    const updated = {
      ...existing,
      title: body.title ?? existing.title,
      category: body.category ?? existing.category,
      content: body.content ?? existing.content,
      username: body.username ?? existing.username,
      password: body.password ?? existing.password,
      url: body.url ?? existing.url,
      file_name: body.file_name ?? existing.file_name,
      file_size: body.file_size ?? existing.file_size,
      file_type: body.file_type ?? existing.file_type,
      file_path: body.file_path ?? existing.file_path,
      updated_at: new Date().toISOString(),
    };

    const encrypted = encryptor.encryptEntry(updated);
    entries[index] = encrypted;
    db.vaults[user.id] = entries;
    await writeDb(db);

    return NextResponse.json({
      success: true,
      entry: encryptor.decryptEntry(encrypted),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const username = verifyAuth(request);
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
    const entryToDelete = entries.find((e) => e.id === id);
    const initialLength = entries.length;
    db.vaults[user.id] = entries.filter((e) => e.id !== id);

    if (db.vaults[user.id].length < initialLength) {
      if (entryToDelete?.file_path) {
        const fullPath = path.join(process.cwd(), "public", entryToDelete.file_path);
        try { await fs.unlink(fullPath); } catch {}
      }
      await writeDb(db);
      return NextResponse.json({ success: true, message: "Entry deleted" });
    }

    return NextResponse.json(
      { success: false, error: "Entry not found" },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
