/**
 * AES-GCM encryption using MASTER_KEY from environment.
 * Used to encrypt plugin secrets (API keys, OAuth tokens) before storing in Convex.
 */

const MASTER_KEY_HEX = process.env.MASTER_KEY ?? '';

async function getKey(): Promise<CryptoKey> {
  if (!MASTER_KEY_HEX || MASTER_KEY_HEX.length < 64) {
    throw new Error('MASTER_KEY must be set as a 32-byte (64 hex chars) environment variable.');
  }
  const keyBuffer = Buffer.from(MASTER_KEY_HEX, 'hex');
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const out = new Uint8Array(12 + ciphertext.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(ciphertext), 12);
  return Buffer.from(out).toString('base64');
}

export async function decrypt(encryptedBase64: string): Promise<string> {
  const key = await getKey();
  const data = Buffer.from(encryptedBase64, 'base64');
  const iv = data.subarray(0, 12);
  const ciphertext = data.subarray(12);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
