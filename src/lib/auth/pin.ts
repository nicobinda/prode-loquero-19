import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN debe ser 4 dígitos');
  return bcrypt.hash(pin, ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false;
  return bcrypt.compare(pin, hash);
}

export function normalizeDni(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function isValidDni(dni: string): boolean {
  return /^\d{7,8}$/.test(dni);
}
