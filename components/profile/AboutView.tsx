'use client'

import { ChevronLeft, Sparkles, Wind, Brain, Sun, CalendarCheck, BarChart3 } from 'lucide-react'

interface AboutViewProps {
  onBack: () => void
}

const features: { icon: typeof Sun; title: string; description: string; color: string; bg: string }[] = [
  {
    icon: Brain,
    title: 'Медитации',
    description: 'Сессии от 5 до 45 минут — для утра, вечера и сложных моментов дня.',
    color: 'var(--violet)',
    bg: 'rgba(139,117,207,0.12)',
  },
  {
    icon: Wind,
    title: 'Дыхание',
    description: 'Техники для бодрости, концентрации и расслабления.',
    color: 'var(--violet)',
    bg: 'rgba(139,117,207,0.12)',
  },
  {
    icon: Sun,
    title: 'Карта дня',
    description: 'Практика, аффирмация и вопрос для рефлексии каждый день.',
    color: 'var(--amber)',
    bg: 'rgba(201,150,90,0.12)',
  },
  {
    icon: CalendarCheck,
    title: 'План и программы',
    description: 'Персональное расписание практик и тематические программы.',
    color: 'var(--amber)',
    bg: 'rgba(201,150,90,0.12)',
  },
  {
    icon: BarChart3,
    title: 'Трекер',
    description: 'Серия, статистика, привычки и тренды благополучия.',
    color: '#6A9B7E',
    bg: 'rgba(106,155,126,0.12)',
  },
]

export function AboutView({ onBack }: AboutViewProps) {
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
              О приложении
            </h1>
            <p className="label-upper mt-0.5">что внутри Wellness</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-4 mt-2">
        <div
          className="relative overflow-hidden rounded-3xl p-5 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(201,150,90,0.2) 0%, rgba(139,117,207,0.15) 100%)',
            border: '1px solid rgba(255,220,170,0.1)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,150,90,0.15) 0%, transparent 70%)', filter: 'blur(12px)' }} />
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(201,150,90,0.15)', border: '1px solid rgba(201,150,90,0.25)' }}
          >
            <Sparkles size={26} strokeWidth={1.5} style={{ color: 'var(--amber)' }} />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Wellness</p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,220,170,0.7)' }}>
              Пространство для медитации, дыхания и осознанности.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="p-4 flex items-start gap-3 rounded-2xl"
                style={{
                  background: 'rgba(255,248,235,0.04)',
                  border: '1px solid rgba(255,220,170,0.08)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: f.bg }}
                >
                  <Icon size={16} strokeWidth={1.5} style={{ color: f.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,220,170,0.55)', lineHeight: 1.5 }}>
                    {f.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center pt-2">
          <p className="text-xs" style={{ color: 'rgba(255,220,170,0.35)' }}>
            Версия 0.1 · Telegram Mini App
          </p>
        </div>
      </div>
    </div>
  )
}
