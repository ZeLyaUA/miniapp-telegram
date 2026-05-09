'use client'

import { useEffect } from 'react'
import { init, mountViewport, expandViewport, bindViewportCssVars } from '@telegram-apps/sdk-react'

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('eruda').then(({ default: eruda }) => eruda.init())
    }
    try {
      const cleanup = init()
      mountViewport().then(() => {
        bindViewportCssVars()
        expandViewport()
      }).catch(() => {})
      return cleanup
    } catch {
      // вне Telegram — ограниченный режим
    }
  }, [])

  return <>{children}</>
}
