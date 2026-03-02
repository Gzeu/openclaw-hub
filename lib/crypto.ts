/**
 * AES-256-GCM encryption for plugin secrets.
 * MASTER_KEY env var must be a 32-byte hex string (64 chars).
 *
 * Example generation:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM
const TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const key = process.env.MASTER_KEY;
  if (!key) throw new Error('MASTER_KEY env var is not set');
  if (key.length !== 64) throw new Error('MASTER_KEY must be 64 hex chars (32 bytes)');
  return Buffer.from(key, 'hex');
}

export async function encrypt(plaintext: string): Promise<string> {
  const crypto = await import('crypto');
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Format: iv(12) + tag(16) + ciphertext → base64
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export async function decrypt(ciphertext: string): Promise<string> {
  const crypto = await import('crypto');
  const key = getMasterKey();
  const buf = Buffer.from(ciphertext, 'base64');

  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const data = buf.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);

  return decipher.update(data) + decipher.final('utf-8');
}
