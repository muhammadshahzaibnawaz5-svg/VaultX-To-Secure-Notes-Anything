import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "vault_db.json");

interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  last_login: string | null;
}

interface VaultEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  username: string;
  password: string;
  url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

interface Database {
  users: User[];
  vaults: Record<string, VaultEntry[]>;
}

async function ensureDbExists(): Promise<void> {
  try {
    await fs.access(path.dirname(DB_PATH));
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  }
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [], vaults: {} }, null, 2), "utf-8");
  }
}

async function readDb(): Promise<Database> {
  await ensureDbExists();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeDb(data: Database): Promise<void> {
  await ensureDbExists();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export { readDb, writeDb };
export type { User, VaultEntry, Database };
