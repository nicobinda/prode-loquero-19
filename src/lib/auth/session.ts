import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

const ALG = 'HS256';

function getSecret(): Uint8Array {
  if (!env.session.secret) throw new Error('SESSION_SECRET no configurado');
  return new TextEncoder().encode(env.session.secret);
}

export interface SessionClaims {
  sub: string;        // user id
  dni: string;
  is_admin: boolean;
  iat?: number;
  exp?: number;
}

export async function signSession(claims: Omit<SessionClaims, 'iat' | 'exp'>): Promise<string> {
  const days = env.session.maxAgeDays;
  return new SignJWT({ dni: claims.dni, is_admin: claims.is_admin })
    .setProtectedHeader({ alg: ALG })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(env.session.cookieName, token, {
    ...COOKIE_OPTS,
    maxAge: env.session.maxAgeDays * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(env.session.cookieName);
}

export async function readSessionCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(env.session.cookieName)?.value ?? null;
}
