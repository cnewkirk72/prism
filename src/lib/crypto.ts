import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * AES-256-GCM symmetric encryption for OAuth access/refresh tokens at rest.
 * Key comes from PRISM_TOKEN_KEY (64 hex chars = 32 bytes).
 *
 * Format on disk: base64(iv || authTag || ciphertext)
 */

const ALGO = "aes-256-gcm";

function key(): Buffer {
  const raw = process.env.PRISM_TOKEN_KEY;
  if (!raw) throw new Error("PRISM_TOKEN_KEY missing — generate with `openssl rand -hex 32`");
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) throw new Error("PRISM_TOKEN_KEY must be 64 hex characters");
  return Buffer.from(raw, "hex");
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptToken(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv(ALGO, key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}
