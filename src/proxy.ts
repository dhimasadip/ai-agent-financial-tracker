import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if user is authenticated
  const isAuthenticated = !!req.auth;

  // Public routes that don't require authentication
  const isPublicRoute = pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth');

  // Allow static files and Next.js internals
  const isStaticFile = pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.');

  // If it's a static file, skip
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthenticated && (pathname.startsWith('/signin') || pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Redirect unauthenticated users to signin
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL('/signin', req.url);
    if (pathname !== '/') {
      signInUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};