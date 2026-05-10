'use client'

import { useEffect } from 'react'
import { init, mountViewport, expandViewport, bindViewportCssVars, mountSwipeBehavior, disableVerticalSwipes, isSwipeBehaviorSupported } from '@telegram-apps/sdk-react'

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
        if (isSwipeBehaviorSupported()) {
          mountSwipeBehavior()
          disableVerticalSwipes()
        }
      }).catch(() => {})
      return cleanup
    } catch {
      // вне Telegram — ограниченный режим
    }
  }, [])

  return <>{children}</>
}
