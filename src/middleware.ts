import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    console.log('Token:', token);  // Log the token to check if it's valid
  
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!token || !(await verifyToken(token))) {
        console.log('Redirecting to login due to invalid token');
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  
    return NextResponse.next();
  }
  

export const config = {
  matcher: ['/dashboard/:path*'],
}