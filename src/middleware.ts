import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Admin routes are now protected by Firebase Auth on the client side
  // This middleware is kept for future server-side checks if needed
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
