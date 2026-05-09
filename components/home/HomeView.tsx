'use client'

import { Brain, Wind, CalendarCheck, BarChart3, Flame, Clock } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { dailyStats } from '@/lib/demo-data'
import type { SectionId } from '@/lib/types'

const sections = [
  {
    id: 'meditation' as SectionId,
    title: 'Медитация',
    subtitle: 'Спокойствие и фокус',
    icon: Brain,
    color: 'cyan' as const,
    accent: '#00d4ff',
  },
  {
    id: 'breathing' as SectionId,
    title: 'Дыхательные практики',
    subtitle: 'Техника и осознанность',
    icon: Wind,
    color: 'orange' as const,
    accent: '#ff6b35',
  },
  {
    id: 'plan' as SectionId,
    title: 'План',
    subtitle: 'Путь к цели',
    icon: CalendarCheck,
    color: 'cyan' as const,
    accent: '#00d4ff',
  },
  {
    id: 'tracker' as SectionId,
    title: 'Трекер',
    subtitle: 'Привычки и прогресс',
    icon: BarChart3,
    color: 'orange' as const,
    accent: '#ff6b35',
  },
]

interface HomeViewProps {
  firstName: string | null
  onSectionSelect: (section: SectionId) => void
}

export function HomeView({ firstName, onSectionSelect }: HomeViewProps) {
  const { streak, meditationMinutes, breathingSessions, weekData } = dailyStats
  const todayMinutes = weekData[weekData.length - 1] || meditationMinutes

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="pt-4 pb-1">
        <p className="text-white/50 text-sm">Добро пожаловать{firstName ? ',' : ''}</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">
          {firstName ?? 'в Wellness'}
        </h1>
      </div>

      <GlassCard accent="orange" className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center glow-orange"
            style={{ background: 'rgba(255, 107, 53, 0.2)' }}
          >
            <Flame size={24} className="text-neon-orange" />
          </div>
          <div>
            <p className="text-white font-bold text-xl">{streak} дней</p>
            <p className="text-white/50 text-xs">Серия практик</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-center">
            <p className="text-neon-cyan font-semibold text-lg">{todayMinutes}</p>
            <p className="text-white/40 text-xs">мин сегодня</p>
          </div>
          <div className="text-center">
            <p className="text-neon-orange font-semibold text-lg">{breathingSessions}</p>
            <p className="text-white/40 text-xs">дыхание</p>
          </div>
        </div>
      </GlassCard>

      <div className="flex items-center gap-2">
        <Clock size={14} className="text-white/40" />
        <p className="text-white/40 text-xs uppercase tracking-wider">Разделы</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sections.map(({ id, title, subtitle, icon: Icon, color, accent }) => (
          <button
            key={id}
            onClick={() => onSectionSelect(id)}
            className="text-left transition-transform duration-150 active:scale-95"
          >
            <GlassCard
              accent={color}
              className="p-4 h-full flex flex-col gap-3"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: `rgba(${color === 'cyan' ? '0, 212, 255' : '255, 107, 53'}, 0.15)`,
                  boxShadow: `0 0 16px rgba(${color === 'cyan' ? '0, 212, 255' : '255, 107, 53'}, 0.25)`,
                }}
              >
                <Icon size={24} style={{ color: accent }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{title}</p>
                <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>
              </div>
            </GlassCard>
          </button>
        ))}
      </div>

      <div className="mt-1">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 size={13} />
          Активность за неделю
        </p>
        <GlassCard className="p-4">
          <div className="flex items-end gap-2 h-16 justify-between">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => {
              const val = weekData[i] ?? 0
              const max = Math.max(...weekData)
              const height = max > 0 ? Math.max((val / max) * 100, val > 0 ? 15 : 5) : 5
              return (
                <div key={day} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${height}%`,
                      background: val > 0
                        ? 'linear-gradient(to top, var(--neon-orange), var(--neon-cyan))'
                        : 'rgba(255,255,255,0.08)',
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-white/30 text-[9px]">{day}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
