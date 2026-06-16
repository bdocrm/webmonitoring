import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

async function getAuthToken(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const isHttps = request.nextUrl.protocol === 'https:';

  return (
    (await getToken({ req: request, secret, secureCookie: isHttps })) ||
    (await getToken({ req: request, secret, secureCookie: !isHttps }))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all NextAuth routes and public APIs to bypass middleware
  const publicRoutes = ['/login', '/share', '/api/public', '/api/auth', '/api/test'];
  const isPublic = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublic) {
    return NextResponse.next();
  }

  // Allow API routes (except authenticated ones)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if user is authenticated for protected page routes
  const token = await getAuthToken(request);

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except in middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
