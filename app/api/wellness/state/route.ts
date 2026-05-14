import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET /api/wellness/state?user_id=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  const { data, error } = await db
    .from('user_wellness_state')
    .select('state')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ state: data?.state ?? null })
}

// PUT /api/wellness/state  body: { user_id, state }
export async function PUT(req: NextRequest) {
  const { user_id, state } = await req.json()
  if (!user_id || !state) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { error } = await db.from('user_wellness_state').upsert({
    user_id,
    state,
    updated_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
