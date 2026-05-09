'use client'

import { useEffect } from 'react'
import { init } from '@telegram-apps/sdk-react'

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('eruda').then(({ default: eruda }) => eruda.init())
    }
    try {
      return init()
    } catch {
      // вне Telegram — ограниченный режим
    }
  }, [])

  return <>{children}</>
}
