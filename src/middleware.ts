import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Local storage mode: allow all requests to proceed directly
  return NextResponse.next({ request });
}

export const config = { matcher: ['/dashboard/:path*'] };
