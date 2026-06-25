import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;
const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$/;

export function isPasswordHash(value) {
  return typeof value === 'string' && BCRYPT_HASH_RE.test(value);
}

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password is required');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, storedPassword) {
  if (typeof password !== 'string' || typeof storedPassword !== 'string') {
    return { valid: false, needsRehash: false };
  }

  if (isPasswordHash(storedPassword)) {
    return {
      valid: await bcrypt.compare(password, storedPassword),
      needsRehash: false
    };
  }

  return {
    valid: password === storedPassword,
    needsRehash: password === storedPassword
  };
}
