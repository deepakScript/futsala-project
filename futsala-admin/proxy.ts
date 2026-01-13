import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/auth', '/api/auth/login', '/api/auth/register', '/'];

  // Allow next/static, images, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If user is authenticated and tries to access public auth pages (except valid public home), redirect to dashboard
  if (token && (pathname === '/auth' || pathname === '/')) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT authenticated and tries to access protected pages OR the root home page, redirect to auth
  if (!token && (!publicPaths.includes(pathname) || pathname === '/')) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
