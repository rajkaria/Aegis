/**
 * AES-256-GCM encryption for private keys.
 * KEK (Key Encryption Key) is read from WALLET_KEK env var.
 */
import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const ALGO = "aes-256-gcm";
const NONCE_LEN = 12; // 96-bit nonce for GCM
const TAG_LEN = 16;

function getKek(): Buffer {
  const hex = process.env.WALLET_KEK;
  if (!hex || hex.length !== 64) {
    throw new Error("WALLET_KEK env var must be a 64-char hex string (32 bytes).");
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a private key. Returns { ciphertext, nonce } as hex strings.
 */
export function encryptPrivateKey(plaintext: string): { ciphertext: string; nonce: string } {
  const kek = getKek();
  const nonce = randomBytes(NONCE_LEN);
  const cipher = createCipheriv(ALGO, kek, nonce);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  // Concatenate ciphertext + auth tag
  return {
    ciphertext: encrypted + tag.toString("hex"),
    nonce: nonce.toString("hex"),
  };
}

/**
 * Decrypt a private key from ciphertext + nonce (both hex).
 */
export function decryptPrivateKey(ciphertext: string, nonce: string): string {
  const kek = getKek();
  const nonceBuffer = Buffer.from(nonce, "hex");

  // Split ciphertext and auth tag
  const tagHex = ciphertext.slice(-TAG_LEN * 2);
  const encHex = ciphertext.slice(0, -TAG_LEN * 2);

  const decipher = createDecipheriv(ALGO, kek, nonceBuffer);
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  let decrypted = decipher.update(encHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
