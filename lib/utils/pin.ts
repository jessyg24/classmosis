import bcrypt from "bcryptjs";

/**
 * Generate a random 4-digit PIN as a string (e.g., "0042", "7391")
 */
export function generatePin(): string {
  const pin = Math.floor(Math.random() * 10000);
  return pin.toString().padStart(4, "0");
}

/**
 * Hash a PIN for secure storage
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

/**
 * Compare a plain PIN against a hashed PIN
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Generate a unique 4-digit class code
 */
export function generateClassCode(): string {
  const code = Math.floor(Math.random() * 10000);
  return code.toString().padStart(4, "0");
}
