import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // This is the baseline test. This simple middleware should not crash.
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}