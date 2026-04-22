import crypto from "node:crypto";

const SCRYPT_KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, SCRYPT_KEY_LEN)
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;

  const hash = crypto
    .scryptSync(password, salt, SCRYPT_KEY_LEN)
    .toString("hex");

  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(originalHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
