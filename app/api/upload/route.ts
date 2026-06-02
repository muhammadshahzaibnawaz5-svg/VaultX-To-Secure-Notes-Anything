import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readDb } from "@/lib/db";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function verifyAuth(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
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
    if (!body.name || !body.data) {
      return NextResponse.json(
        { success: false, error: "File name and data are required" },
        { status: 400 }
      );
    }

    const fileSize = body.size || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const userDir = path.join(UPLOADS_DIR, user.id);
    await fs.mkdir(userDir, { recursive: true });

    const safeName = `${Date.now()}_${body.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(userDir, safeName);

    const buffer = Buffer.from(body.data, "base64");
    await fs.writeFile(filePath, buffer);

    const relativePath = `${user.id}/${safeName}`;

    return NextResponse.json({
      success: true,
      file: {
        file_name: body.name,
        file_size: fileSize,
        file_type: body.type || "",
        file_path: relativePath,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
