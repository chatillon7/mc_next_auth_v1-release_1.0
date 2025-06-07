import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const protectedRoutes = ["/dashboard", "/profile", "/destek"]
const adminRoutes = ["/admin"]

export default async function middleware(req) {
  const path = req.nextUrl.pathname  // /dashboard
  const isProtectedRoute = protectedRoutes.includes(path) // true
  const isAdminRoute = adminRoutes.includes(path) // false
  // const isAdminRoute = path.startsWith('/admin')

  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if ((isProtectedRoute || isAdminRoute) && !session?.userId) {
    return NextResponse.redirect(new URL('/auth/login', req.nextUrl))
  }

  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL('/yetkisiz', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
