import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rutas que NO requieren sesión.
const PUBLIC_PATHS = ['/login', '/_next', '/favicon.ico', '/api/auth', '/api/cron'];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const cookieName = process.env.SESSION_COOKIE_NAME ?? 'pb_session';
  const token = req.cookies.get(cookieName)?.value;
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete(cookieName);
    return res;
  }
}

export const config = {
  // Aplica a todo excepto assets estáticos.
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)).*)'],
};
