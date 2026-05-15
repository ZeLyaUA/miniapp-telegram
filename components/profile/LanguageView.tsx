'use client'

import { ChevronLeft, Check, Globe } from 'lucide-react'

interface LanguageViewProps {
  onBack: () => void
}

export function LanguageView({ onBack }: LanguageViewProps) {
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
              Язык
            </h1>
            <p className="label-upper mt-0.5">язык интерфейса</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-3 mt-2">
        <div
          className="w-full p-4 flex items-center justify-between rounded-2xl"
          style={{
            background: 'rgba(201,150,90,0.1)',
            border: '1px solid rgba(201,150,90,0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,150,90,0.18)' }}
            >
              <Globe size={16} strokeWidth={1.5} style={{ color: 'var(--amber)' }} />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Русский</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.45)' }}>Основной язык приложения</p>
            </div>
          </div>
          <Check size={18} style={{ color: 'var(--amber)' }} strokeWidth={2} />
        </div>

        <p className="text-xs px-1" style={{ color: 'rgba(255,220,170,0.35)', lineHeight: 1.5 }}>
          Другие языки появятся в следующих обновлениях.
        </p>
      </div>
    </div>
  )
}
