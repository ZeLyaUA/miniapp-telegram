'use client'

import { Brain, Wind, CalendarCheck, BarChart3, Play, Flame, Clock } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { dailyStats, meditationSessions } from '@/lib/demo-data'
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

function getFeaturedSession() {
  const h = new Date().getHours()
  if (h >= 5 && h < 11)  return meditationSessions.find(s => s.id === 'm1')!
  if (h >= 11 && h < 17) return meditationSessions.find(s => s.id === 'm11')!
  if (h >= 17 && h < 21) return meditationSessions.find(s => s.id === 'm7')!
  return meditationSessions.find(s => s.id === 'm9')!
}

const levelLabel: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

interface HomeViewProps {
  firstName: string | null
  onSectionSelect: (section: SectionId) => void
}

export function HomeView({ firstName, onSectionSelect }: HomeViewProps) {
  const { streak, weekData, meditationMinutes, breathingSessions } = dailyStats
  const featured = getFeaturedSession()
  const completedDays = weekData.map(v => v > 0)

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
          {/* Featured practice card */}
          <button
            onClick={() => onSectionSelect('meditation')}
            className="text-left w-full transition-all duration-500 active:scale-[0.98] active:opacity-90"
          >
            <div
              className="relative overflow-hidden rounded-3xl p-6 flex flex-col gap-4"
              style={{
                background: featured.moodColor ?? 'linear-gradient(135deg, rgba(201,150,90,0.3) 0%, rgba(139,117,207,0.2) 100%)',
                border: '1px solid rgba(255,220,170,0.1)',
                boxShadow: 'var(--shadow-card-lg), inset 0 1px 0 rgba(255,255,255,0.06)',
                minHeight: 200,
              }}
            >
              <div
                className="absolute -top-8 -right-8 w-40 h-40 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(201,150,90,0.25) 0%, transparent 70%)', filter: 'blur(20px)' }}
              />
              <div>
                <span
                  className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-3"
                  style={{ background: 'rgba(255,220,170,0.1)', color: 'rgba(255,220,170,0.7)', letterSpacing: '0.06em' }}
                >
                  РЕКОМЕНДУЕТСЯ СЕЙЧАС
                </span>
                <h2 className="text-white font-bold text-xl leading-tight">{featured.title}</h2>
                <p className="text-white/50 text-sm mt-1">{featured.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-3 text-xs" style={{ color: 'rgba(255,220,170,0.5)' }}>
                  <span>{featured.duration} мин</span>
                  <span>·</span>
                  <span>{levelLabel[featured.level]}</span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm"
                  style={{ background: 'rgba(255,220,170,0.15)', border: '1px solid rgba(255,220,170,0.2)', color: 'rgba(255,220,170,0.9)' }}
                >
                  <Play size={14} style={{ marginLeft: 1 }} />
                  Начать
                </div>
              </div>
            </div>
          </button>

          {/* Quick access */}
          <div>
            <p className="label-upper mb-3">Быстрый доступ</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 md:flex-wrap md:overflow-visible">
              {quickActions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onSectionSelect(id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full flex-shrink-0 transition-all duration-300 active:scale-95"
                  style={{
                    background: 'rgba(255,248,235,0.06)',
                    border: '1px solid rgba(255,220,170,0.08)',
                    color: 'rgba(255,248,235,0.7)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <Icon size={15} style={{ color: 'var(--amber)', opacity: 0.8 }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: stats + week progress (lg+) */}
        <div className="flex flex-col gap-4 lg:flex-1">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Flame, label: 'Серия', value: `${streak}`, unit: 'дней', color: 'var(--amber)' },
              { icon: Clock, label: 'Сегодня', value: `${meditationMinutes}`, unit: 'мин', color: 'var(--violet)' },
              { icon: Wind, label: 'Дыхание', value: `${breathingSessions}`, unit: 'сессий', color: 'var(--violet)' },
              { icon: Brain, label: 'Неделя', value: `${weekData.reduce((a, b) => a + b, 0)}`, unit: 'мин', color: 'var(--amber)' },
            ].map(({ icon: Icon, label, value, unit, color }) => (
              <GlassCard key={label} className="p-4 text-center">
                <Icon size={16} style={{ color, margin: '0 auto 4px' }} />
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-xs" style={{ color: 'rgba(255,220,170,0.3)' }}>{unit}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,248,235,0.4)' }}>{label}</p>
              </GlassCard>
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
