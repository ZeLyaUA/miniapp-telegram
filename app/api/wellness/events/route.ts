import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/wellness/events?user_id=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  const rows = db
    .prepare('SELECT id, type, timestamp, date_key, payload FROM wellness_events WHERE user_id = ? ORDER BY timestamp ASC')
    .all(userId) as { id: string; type: string; timestamp: number; date_key: string; payload: string }[]

  const events = rows.map(r => ({ ...JSON.parse(r.payload), id: r.id, type: r.type, timestamp: r.timestamp, dateKey: r.date_key }))
  return NextResponse.json({ events })
}

// POST /api/wellness/events  body: { user_id, event }
export async function POST(req: NextRequest) {
  const { user_id, event } = await req.json()
  if (!user_id || !event) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { id, type, timestamp, dateKey, ...payload } = event
  db.prepare(`
    INSERT INTO wellness_events (id, user_id, type, timestamp, date_key, payload)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET payload = excluded.payload
  `).run(id, user_id, type, timestamp, dateKey, JSON.stringify(payload))

  return NextResponse.json({ ok: true })
}
