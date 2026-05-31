import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { VaultEncryptor } from "@/lib/encryption";

const encryptor = new VaultEncryptor(3);

function verifyAuth(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

export async function GET(request: Request) {
  try {
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
    const decryptedEntries = entries.map((e) => encryptor.decryptEntry(e));

    return NextResponse.json({
      success: true,
      entries: decryptedEntries,
      count: decryptedEntries.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const entry = {
      id: `entry_${Date.now()}`,
      title: body.title,
      category: body.category || "general",
      content: body.content,
      username: body.username || "",
      password: body.password || "",
      url: body.url || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const encrypted = encryptor.encryptEntry(entry);
    db.vaults[user.id] = db.vaults[user.id] || [];
    db.vaults[user.id].push(encrypted);
    await writeDb(db);

    return NextResponse.json(
      { success: true, entry: encryptor.decryptEntry(encrypted) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
