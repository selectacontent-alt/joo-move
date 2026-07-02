import crypto from 'crypto';

const COOKIE_NAME = 'joo_admin_session';
const MAX_AGE = 60 * 60 * 12;

const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || process.env.DB_PASSWORD || 'joo-move-local-session';

const encode = (value) => Buffer.from(value).toString('base64url');
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

export function createAdminSession(user) {
  const payload = encode(JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  }));
  return `${payload}.${sign(payload)}`;
}

export function getAdminSession(request) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const expected = sign(payload);
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const adminSessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  },
};
