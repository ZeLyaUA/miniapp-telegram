import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/wellness/state?user_id=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  const row = db
    .prepare('SELECT state FROM user_wellness_state WHERE user_id = ?')
    .get(userId) as { state: string } | undefined

  return NextResponse.json({ state: row ? JSON.parse(row.state) : null })
}

// PUT /api/wellness/state  body: { user_id, state }
export async function PUT(req: NextRequest) {
  const { user_id, state } = await req.json()
  if (!user_id || !state) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  db.prepare(`
    INSERT INTO user_wellness_state (user_id, state, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at
  `).run(user_id, JSON.stringify(state))

  return NextResponse.json({ ok: true })
}
