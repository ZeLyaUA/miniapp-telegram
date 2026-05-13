'use client'

import { Brain, Wind, CalendarCheck, BarChart3, Flame, Clock, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import type { SectionId } from '@/lib/types'

const quickActions: { id: SectionId; label: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { id: 'breathing', label: 'Дыхание', icon: Wind },
  { id: 'meditation', label: 'Медитация', icon: Brain },
  { id: 'plan', label: 'План', icon: CalendarCheck },
  { id: 'tracker', label: 'Трекер', icon: BarChart3 },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Доброе утро'
  if (h >= 12 && h < 17) return 'Добрый день'
  if (h >= 17 && h < 22) return 'Добрый вечер'
  return 'Доброй ночи'
}

function getDayCard() {
  const now = new Date()
  const date = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  const weekday = now.toLocaleDateString('ru-RU', { weekday: 'long' })
  return { date, weekday }
}

interface HomeViewProps {
  firstName: string | null
  onSectionSelect: (section: SectionId) => void
  streak?: number
  meditationMinutesToday?: number
  breathingSessionsToday?: number
  weekMinutes?: number
}

export function HomeView({ firstName, onSectionSelect, streak = 0, meditationMinutesToday = 0, breathingSessionsToday = 0, weekMinutes = 0 }: HomeViewProps) {
  const { date, weekday } = getDayCard()

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
    <div className="flex flex-col gap-4 px-4 pb-28 md:pb-6 header-pt-home">
      {/* Greeting */}
      <div className="md:hidden">
        <p className="text-warm text-sm">{getGreeting()}{firstName ? ',' : ''}</p>
        <h1 className="text-white font-bold mt-0.5" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {firstName ?? 'ваш ритуал ждёт'}
        </h1>
        {/* <p className="mt-1.5 text-xs" style={{ color: 'rgba(255,220,170,0.4)', letterSpacing: '0.04em' }}>
          {streak} дней серии · продолжайте
        </p> */}
      </div>

      {/* Desktop greeting */}
      <div className="hidden md:block">
        <p className="text-warm text-sm">{getGreeting()}{firstName ? ',' : ''}</p>
        <h1 className="text-white font-bold mt-0.5" style={{ fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {firstName ?? 'ваш ритуал ждёт'}
        </h1>
        {/* <p className="mt-1.5 text-xs" style={{ color: 'rgba(255,220,170,0.4)', letterSpacing: '0.04em' }}>
          {streak} дней серии · продолжайте
        </p> */}
      </div>

      {/* Two-column layout on md+ */}
      <div className="flex flex-col lg:flex-row lg:gap-5 lg:items-start gap-4">

        {/* Left column: featured card + quick access */}
        <div className="flex flex-col gap-4 lg:w-3/5">
          {/* Day card */}
          <button
            onClick={() => onSectionSelect('daycard')}
            className="text-left w-full transition-all duration-500 active:scale-[0.98] active:opacity-90"
          >
            <div
              className="relative overflow-hidden rounded-3xl p-4 flex flex-col gap-2"
              style={{
                background: 'linear-gradient(135deg, rgba(201,150,90,0.2) 0%, rgba(139,117,207,0.15) 100%)',
                border: '1px solid rgba(255,220,170,0.1)',
                boxShadow: 'var(--shadow-card-lg), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="absolute -top-8 -right-8 w-40 h-40 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(201,150,90,0.25) 0%, transparent 70%)', filter: 'blur(20px)' }}
              />
              <div>
                <span
                  className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-2"
                  style={{ background: 'rgba(255,220,170,0.1)', color: 'rgba(255,220,170,0.7)', letterSpacing: '0.06em' }}
                >
                  КАРТА ДНЯ
                </span>
                <h2 className="text-white font-bold text-lg leading-tight">{date}</h2>
                <p className="text-white/50 text-sm capitalize">{weekday}</p>
              </div>
              <div className="flex items-center justify-end mt-1">
                <div
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm"
                  style={{ background: 'rgba(255,220,170,0.15)', border: '1px solid rgba(255,220,170,0.2)', color: 'rgba(255,220,170,0.9)' }}
                >
                  Открыть
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </button>

          {/* Quick access - 4 large tiles */}
          <div>
            <p className="label-upper mb-3">Наш быстрый доступ</p>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onSectionSelect(id)}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl transition-all duration-300 active:scale-95"
                  style={{
                    background: 'rgba(255,248,235,0.06)',
                    border: '1px solid rgba(255,220,170,0.08)',
                    color: 'rgba(255,248,235,0.7)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,220,170,0.08)' }}
                  >
                    <Icon size={24} style={{ color: 'var(--amber)', opacity: 0.9 }} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: stats + week progress (lg+) */}
        <div className="flex flex-col gap-4 lg:flex-1">
          {/* Stats grid - compact 4 columns, no scroll */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Flame, label: 'Серия', value: `${streak}`, unit: 'дней', color: 'var(--amber)' },
              { icon: Clock, label: 'Сегодня', value: `${meditationMinutesToday}`, unit: 'мин', color: 'var(--violet)' },
              { icon: Wind, label: 'Дыхание', value: `${breathingSessionsToday}`, unit: 'сессий', color: 'var(--violet)' },
              { icon: Brain, label: 'Неделя', value: `${weekMinutes}`, unit: 'мин', color: 'var(--amber)' },
            ].map(({ icon: Icon, label, value, unit, color }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center p-2 rounded-xl"
                style={{
                  background: 'rgba(255,248,235,0.04)',
                  border: '1px solid rgba(255,220,170,0.06)',
                }}
              >
                <Icon size={12} style={{ color, opacity: 0.8 }} />
                <span className="text-white font-bold text-sm mt-1">{value}</span>
                <span className="text-[10px]" style={{ color: 'rgba(255,220,170,0.3)' }}>{unit}</span>
              </div>
            ))}
          </div>

          {/* Week progress */}
          {/* <div>
            <p className="label-upper mb-3">Прогресс недели</p>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between gap-1">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => {
                  const done = completedDays[i] ?? false
                  const isToday = i === (new Date().getDay() + 6) % 7
                  return (
                    <div key={day} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
                        style={{
                          background: done
                            ? 'linear-gradient(135deg, var(--amber), rgba(201,150,90,0.6))'
                            : isToday ? 'rgba(201,150,90,0.12)' : 'rgba(255,255,255,0.04)',
                          border: done ? 'none' : isToday ? '1px solid rgba(201,150,90,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: done ? 'var(--glow-amber)' : 'none',
                        }}
                      >
                        {done && <div className="w-2 h-2 rounded-full bg-white opacity-90" />}
                      </div>
                      <span className="text-[10px]" style={{ color: done ? 'var(--amber)' : 'rgba(255,255,255,0.25)' }}>{day}</span>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </div> */}
        </div>
      </div>
    </div>
    </div>
  )
}
