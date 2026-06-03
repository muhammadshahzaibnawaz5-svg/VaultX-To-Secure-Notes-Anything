import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
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
    const download = url.searchParams.get("download");
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

    if (download === "1" && decrypted.file_data) {
      // Decode Base64 stored in DB — no filesystem access needed
      const fileBuffer = Buffer.from(decrypted.file_data, "base64");
      const fileName = decrypted.file_name || "download";
      const fileType = decrypted.file_type || "application/octet-stream";
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": fileType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    }

    return NextResponse.json({ success: true, entry: decrypted });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
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
      file_data: body.file_data ?? existing.file_data, // preserve or replace Base64
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
    const initialLength = entries.length;
    db.vaults[user.id] = entries.filter((e) => e.id !== id);
    // file_data was stored in DB — no disk file to clean up

    if (db.vaults[user.id].length < initialLength) {
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
