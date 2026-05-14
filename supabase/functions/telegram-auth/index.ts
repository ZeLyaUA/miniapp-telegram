import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const encoder = new TextEncoder()

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

async function hmacSha256(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', k, encoder.encode(data))
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function validateInitData(initData: string, botToken: string): Promise<boolean> {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return false
  params.delete('hash')
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
  const secretKey = await hmacSha256(encoder.encode('WebAppData'), botToken)
  const expected = toHex(await hmacSha256(secretKey, dataCheckString))
  return expected === hash
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    const body = await req.json().catch(() => null)
    const initData: string | undefined = body?.initData
    if (!initData || typeof initData !== 'string') return json({ error: 'Missing initData' }, 400)

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) return json({ error: 'Bot token not configured' }, 500)

    const isValid = await validateInitData(initData, botToken)
    if (!isValid) return json({ error: 'Invalid initData signature' }, 401)

    const params = new URLSearchParams(initData)
    const userStr = params.get('user')
    if (!userStr) return json({ error: 'No user in initData' }, 400)

    const tgUser = JSON.parse(userStr)
    const telegramId = String(tgUser.id)
    const email = `tg_${telegramId}@tg.local`

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const metadata = {
      telegram_id: telegramId,
      first_name: tgUser.first_name ?? null,
      last_name: tgUser.last_name ?? null,
      username: tgUser.username ?? null,
    }

    // Create user if not exists (error on duplicate is expected and ignored)
    await supabase.auth.admin.createUser({ email, email_confirm: true, user_metadata: metadata })

    // Generate one-time magic link token (works for both new and existing users)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { data: metadata },
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      return json({ error: 'Failed to generate auth token' }, 500)
    }

    return json({ token_hash: linkData.properties.hashed_token })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
