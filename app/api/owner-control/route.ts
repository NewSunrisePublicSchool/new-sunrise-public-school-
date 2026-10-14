import { NextRequest, NextResponse } from 'next/server'

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stypnhzdnsgmyngqkpmz.supabase.co'}/functions/v1/owner-control`

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const upstream = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
    })
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Owner control service unavailable' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
