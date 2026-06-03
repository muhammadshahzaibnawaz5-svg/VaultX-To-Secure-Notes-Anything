import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

    // Validate that body.data is a valid Base64 string
    if (typeof body.data !== "string" || body.data.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Invalid file data" },
        { status: 400 }
      );
    }

    // Return the validated file metadata + Base64 data back to client.
    // The client will include this in the vault POST/PUT payload so it gets
    // stored in vault_db.json — no filesystem writes needed, works on Railway.
    return NextResponse.json({
      success: true,
      file: {
        file_name: body.name,
        file_size: fileSize,
        file_type: body.type || "application/octet-stream",
        file_path: "",   // no longer used, kept for schema compatibility
        file_data: body.data, // Base64 content stored in DB
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
