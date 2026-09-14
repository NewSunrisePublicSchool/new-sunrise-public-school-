import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/','/admission','/notices','/gallery','/enquiry']
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stypnhzdnsgmyngqkpmz.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vOgEb9epArxrrqI0WE_OZQ_lMSvuU2e'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\/$/, '') || '/'
  if (path === '/nsps-owner-7492-control' || path === '/site-inactive') return NextResponse.next()
  if (!PUBLIC_PATHS.includes(path) && !path.startsWith('/admin')) return NextResponse.next()

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/owner_website_control?id=eq.true&select=is_active,active_until`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: 'no-store'
    })
    const data = await res.json()
    const control = Array.isArray(data) ? data[0] : null
    const today = new Date().toISOString().slice(0,10)
    const expired = !!control?.active_until && today > control.active_until
    if (control?.is_active === false || expired) {
      const url = req.nextUrl.clone()
      url.pathname = '/site-inactive'
      url.search = ''
      return NextResponse.redirect(url)
    }
  } catch {
    // Fail open if the control service is temporarily unreachable.
  }
  return NextResponse.next()
}

export const config = { matcher: ['/', '/admission', '/notices', '/gallery', '/enquiry', '/admin/:path*'] }
