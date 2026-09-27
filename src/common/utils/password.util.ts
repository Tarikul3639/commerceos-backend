import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

export async function hashPassword(
  password: string,
  saltRounds: number,
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateRandomPassword(length: number = 12): string {
  return randomBytes(length).toString('base64').slice(0, length);
}

export function generateRandomHashPassword(
  length: number = 12,
  saltRounds: number = 10,
): Promise<string> {
  const randomPassword = generateRandomPassword(length);
  return hashPassword(randomPassword, saltRounds);
}
