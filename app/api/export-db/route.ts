import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = await readDb();
    return NextResponse.json(db);
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
