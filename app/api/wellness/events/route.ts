import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET /api/wellness/events?user_id=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  const { data, error } = await db
    .from('wellness_events')
    .select('id, type, timestamp, date_key, payload')
    .eq('user_id', userId)
    .order('timestamp', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const events = (data ?? []).map(r => ({
    ...r.payload,
    id: r.id,
    type: r.type,
    timestamp: r.timestamp,
    dateKey: r.date_key,
  }))
  return NextResponse.json({ events })
}

// POST /api/wellness/events  body: { user_id, event }
export async function POST(req: NextRequest) {
  const { user_id, event } = await req.json()
  if (!user_id || !event) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { id, type, timestamp, dateKey, ...payload } = event
  const { error } = await db.from('wellness_events').upsert({
    id,
    user_id,
    type,
    timestamp,
    date_key: dateKey,
    payload,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
