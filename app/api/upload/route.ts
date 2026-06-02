import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readDb } from "@/lib/db";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const userDir = path.join(UPLOADS_DIR, user.id);
    await fs.mkdir(userDir, { recursive: true });

    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(userDir, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicPath = `/uploads/${user.id}/${safeName}`;

    return NextResponse.json({
      success: true,
      file: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_path: publicPath,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
