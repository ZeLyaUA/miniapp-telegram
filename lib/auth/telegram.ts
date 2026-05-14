'use client'

import { createClient } from '@/utils/supabase/client'
import type { Session } from '@supabase/supabase-js'

export interface TelegramAuthResult {
  session: Session | null
  telegramId: string | null
}

function getRawInitData(): string | null {
  if (typeof window === 'undefined') return null
  return (window as Window & { Telegram?: { WebApp?: { initData?: string } } })
    .Telegram?.WebApp?.initData ?? null
}

function parseTelegramId(initData: string): string | null {
  try {
    const user = JSON.parse(new URLSearchParams(initData).get('user') ?? '{}')
    return user.id ? String(user.id) : null
  } catch {
    return null
  }
}

export async function authenticateWithTelegram(): Promise<TelegramAuthResult> {
  const initData = getRawInitData()
  if (!initData) return { session: null, telegramId: null }

  const telegramId = parseTelegramId(initData)
  const supabase = createClient()

  // Re-use existing valid session
  const { data: { session: existing } } = await supabase.auth.getSession()
  if (existing) return { session: existing, telegramId }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/telegram-auth`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      },
    )
    if (!res.ok) return { session: null, telegramId }

    const { token_hash } = await res.json()
    if (!token_hash) return { session: null, telegramId }

    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })
    if (error || !data.session) return { session: null, telegramId }

    return { session: data.session, telegramId }
  } catch {
    return { session: null, telegramId }
  }
}
