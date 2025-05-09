import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * If you want to protect all routes except static assets, use this pattern:
     * '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
     *
     * For now, we only protect the following routes with Supabase Auth:
     * - /admin/llm-logs (admin log page)
     * - /api/admin/llm-logs (admin log API)
     * - /admin/feature-flags (admin feature flags page)
     * - /api/feature-flags (admin feature flags API)
     * All other routes remain public.
     */
    '/admin/llm-logs',
    '/admin/feature-flags',
    '/api/admin/llm-logs',
    '/api/feature-flags',

    // '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)', // Not needed unless protecting all routes
  ],
}
