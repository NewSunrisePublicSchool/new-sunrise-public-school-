import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/','/admission','/notices','/gallery','/enquiry']
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stypnhzdnsgmyngqkpmz.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vOgEb9epArxrrqI0WE_OZQ_lMSvuU2e'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\/$/, '') || '/'
  if (!PUBLIC_PATHS.includes(path) || path === '/nsps-owner-7492-control' || path === '/site-inactive') return NextResponse.next()

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/owner_website_control?id=eq.true&select=is_active`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: 'no-store'
    })
    const data = await res.json()
    if (Array.isArray(data) && data[0]?.is_active === false) {
      const url = req.nextUrl.clone()
      url.pathname = '/site-inactive'
      return NextResponse.redirect(url)
    }
  } catch {
    // Fail open if the control service is temporarily unreachable.
  }
  return NextResponse.next()
}

export const config = { matcher: ['/','/admission','/notices','/gallery','/enquiry'] }
