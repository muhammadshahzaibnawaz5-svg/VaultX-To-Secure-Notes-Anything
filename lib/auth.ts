import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { readDb, writeDb } from "./db";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  // Handle Werkzeug scrypt format: scrypt:N:r:p$salt$hash
  if (stored.startsWith("scrypt:")) {
    try {
      const parts = stored.slice(7).split("$");
      const [nStr, rStr, pStr] = parts[0].split(":");
      const saltPart = parts[1];
      const hashPart = parts[2];
      const N = parseInt(nStr, 10);
      const r = parseInt(rStr, 10);
      const p = parseInt(pStr, 10);
      const saltBuffer = Buffer.from(saltPart, "hex");
      const derived = scryptSync(password, saltBuffer, 64, { N, r, p });
      const expected = Buffer.from(hashPart, "hex");
      return derived.length === expected.length && timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }

  // Handle new format: salt:hash
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

async function register(username: string, email: string, password: string) {
  if (!username || !email || !password) {
    return { success: false as const, error: "All fields are required" };
  }
  if (username.length < 3) {
    return { success: false as const, error: "Username must be at least 3 characters" };
  }
  if (password.length < 6) {
    return { success: false as const, error: "Password must be at least 6 characters" };
  }
  if (!email.includes("@")) {
    return { success: false as const, error: "Invalid email format" };
  }

  const db = await readDb();

  if (db.users.find((u) => u.username === username)) {
    return { success: false as const, error: "Username already exists" };
  }
  if (db.users.find((u) => u.email === email)) {
    return { success: false as const, error: "Email already registered" };
  }

  const user: {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    created_at: string;
    last_login: null;
  } = {
    id: `user_${db.users.length + 1}_${Date.now()}`,
    username,
    email,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    last_login: null,
  };

  db.users.push(user);
  db.vaults[user.id] = [];
  await writeDb(db);

  return {
    success: true as const,
    user: { id: user.id, username: user.username, email: user.email },
  };
}

async function login(username: string, password: string) {
  if (!username || !password) {
    return { success: false as const, error: "Username and password are required" };
  }

  const db = await readDb();
  const user = db.users.find((u) => u.username === username);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { success: false as const, error: "Invalid username or password" };
  }

  user.last_login = new Date().toISOString();
  await writeDb(db);

  return {
    success: true as const,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
    },
  };
}

export { register, login };
