'use client'

import { useEffect, useState } from 'react'
import { retrieveLaunchParams } from '@telegram-apps/sdk-react'

export default function Home() {
  const [firstName, setFirstName] = useState<string | null>(null)

  useEffect(() => {
    try {
      const lp = retrieveLaunchParams()
      setFirstName(lp.tgWebAppData?.user?.first_name ?? 'пользователь')
    } catch {
      // вне Telegram — оставляем null
    }
  }, [])

  return (
    <main className="flex flex-col flex-1 items-center justify-center p-8">
      {firstName !== null
        ? <p className="text-lg font-medium">Привет, {firstName}!</p>
        : <p className="text-muted-foreground">Запусти приложение в Telegram</p>}
    </main>
  )
}
