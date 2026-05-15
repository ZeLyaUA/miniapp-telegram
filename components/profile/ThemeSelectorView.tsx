'use client'

import { useState } from 'react'
import { ChevronLeft, Moon, Sun, Check } from 'lucide-react'

const STORAGE_KEY = 'theme_mode_v1'

type ThemeMode = 'dark' | 'light'

interface ThemeSelectorViewProps {
  onBack: () => void
}

const options: { value: ThemeMode; label: string; icon: typeof Moon; description: string }[] = [
  { value: 'dark', label: 'Тёмная', icon: Moon, description: 'Активная тема — Midnight Ritual' },
  { value: 'light', label: 'Светлая', icon: Sun, description: 'Будет добавлена в одном из обновлений' },
]

function readMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw === 'light' ? 'light' : 'dark'
  } catch { return 'dark' }
}

export function ThemeSelectorView({ onBack }: ThemeSelectorViewProps) {
  const [mode, setModeState] = useState<ThemeMode>(readMode)

  const setMode = (next: ThemeMode) => {
    try { window.localStorage.setItem(STORAGE_KEY, next) } catch { /* noop */ }
    setModeState(next)
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
              Тема
            </h1>
            <p className="label-upper mt-0.5">внешний вид приложения</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-3 mt-2">
        {options.map(opt => {
          const selected = mode === opt.value
          const Icon = opt.icon
          return (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className="w-full p-4 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99] text-left"
              style={{
                background: selected ? 'rgba(201,150,90,0.1)' : 'rgba(255,248,235,0.04)',
                border: '1px solid ' + (selected ? 'rgba(201,150,90,0.3)' : 'rgba(255,220,170,0.08)'),
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: selected ? 'rgba(201,150,90,0.18)' : 'rgba(255,248,235,0.05)' }}
                >
                  <Icon size={16} strokeWidth={1.5} style={{ color: selected ? 'var(--amber)' : 'rgba(255,220,170,0.4)' }} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.45)' }}>{opt.description}</p>
                </div>
              </div>
              {selected && <Check size={18} style={{ color: 'var(--amber)' }} strokeWidth={2} />}
            </button>
          )
        })}

        <p className="text-xs px-1" style={{ color: 'rgba(255,220,170,0.35)', lineHeight: 1.5 }}>
          Сейчас доступна только тёмная тема. Светлая появится в следующих версиях.
        </p>
      </div>
    </div>
  )
}
