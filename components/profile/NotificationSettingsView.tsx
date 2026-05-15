'use client'

import { useState } from 'react'
import { ChevronLeft, Bell } from 'lucide-react'

const STORAGE_KEY = 'notifications_enabled_v1'

interface NotificationSettingsViewProps {
  onBack: () => void
}

function readEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw === null ? true : raw === '1'
  } catch { return true }
}

export function NotificationSettingsView({ onBack }: NotificationSettingsViewProps) {
  const [enabled, setEnabledState] = useState<boolean>(readEnabled)

  const setEnabled = (next: boolean | ((prev: boolean) => boolean)) => {
    setEnabledState(prev => {
      const value = typeof next === 'function' ? next(prev) : next
      try { window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0') } catch { /* noop */ }
      return value
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="header-pt px-4 pb-2">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold" style={{ fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Уведомления
            </h1>
            <p className="label-upper mt-0.5">напоминания о практиках</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-3 mt-2">
        <button
          onClick={() => setEnabled(v => !v)}
          className="w-full p-4 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99]"
          style={{
            background: 'rgba(255,248,235,0.04)',
            border: '1px solid rgba(255,220,170,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: enabled ? 'rgba(201,150,90,0.15)' : 'rgba(255,248,235,0.05)' }}
            >
              <Bell size={16} strokeWidth={1.5} style={{ color: enabled ? 'var(--amber)' : 'rgba(255,220,170,0.4)' }} />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Включить уведомления</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.45)' }}>
                {enabled ? 'Получать напоминания' : 'Напоминания отключены'}
              </p>
            </div>
          </div>
          <div
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{
              background: enabled ? 'rgba(201,150,90,0.5)' : 'rgba(255,248,235,0.1)',
              border: '1px solid ' + (enabled ? 'rgba(201,150,90,0.6)' : 'rgba(255,220,170,0.12)'),
            }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
              style={{
                left: enabled ? 'calc(100% - 18px)' : '2px',
                background: enabled ? 'var(--amber)' : 'rgba(255,248,235,0.5)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }}
            />
          </div>
        </button>

        <p className="text-xs px-1" style={{ color: 'rgba(255,220,170,0.35)', lineHeight: 1.5 }}>
          Напоминания приходят через Telegram. Убедитесь, что уведомления от бота разрешены в настройках мессенджера.
        </p>
      </div>
    </div>
  )
}
