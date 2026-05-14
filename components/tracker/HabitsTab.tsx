'use client'

import { GlassCard } from '@/components/layout/GlassCard'
import { useWellness, createEvent, syncEventToSupabase, syncStateToSupabase } from '@/lib/store/WellnessContext'
import { getHabitDays, getHabitStreak } from '@/lib/store/analytics'
import { HABIT_DETECTORS_BY_ID } from '@/lib/store/habits'
import { Wind, Brain, Moon, Pause, Heart } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Wind, Brain, Moon, Pause, Heart,
}

export function HabitsTab() {
  const { state, dispatch } = useWellness()

  const toggleManualOverride = (habitId: string, currentlyManual: boolean) => {
    const event = createEvent({
      type: 'habit_checked',
      habitId,
      checked: !currentlyManual,
    })
    dispatch({ type: 'CHECK_HABIT', event })
    syncEventToSupabase(state.userId, event)
    syncStateToSupabase(state.userId, state)
  }

  if (state.habits.length === 0) {
    return (
      <div className="py-16 text-center mt-2">
        <p className="text-4xl mb-3">🌱</p>
        <p className="text-sm" style={{ color: 'rgba(255,220,170,0.3)' }}>Нет привычек</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 mt-2 max-w-lg">
      <p className="text-xs px-1" style={{ color: 'rgba(255,220,170,0.35)' }}>
        Привычки засчитываются автоматически по вашим действиям. Если делали вне приложения — отметьте вручную.
      </p>

      {state.habits.map(habit => {
        const detector = HABIT_DETECTORS_BY_ID[habit.id]
        const description = detector?.description ?? ''
        const days = getHabitDays(state.events, state.assessmentsByDay, state.doneTasksByDay, habit.id, 7)
        const streak = getHabitStreak(state.events, state.assessmentsByDay, state.doneTasksByDay, habit.id)
        const today = days[6]
        const Icon = iconMap[habit.icon] ?? Heart
        const RU_DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
        const dayLabels = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return RU_DAYS[d.getDay()]
        })

        const accent = today.effective ? 'amber' : 'none'
        const todayAuto = today.auto
        const todayManual = today.manual

        return (
          <GlassCard key={habit.id} accent={accent} className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  background: today.effective ? 'rgba(201,150,90,0.2)' : 'rgba(255,248,235,0.06)',
                  border: today.effective ? '1px solid rgba(201,150,90,0.3)' : '1px solid rgba(255,220,170,0.08)',
                }}
              >
                <Icon size={18} style={{ color: today.effective ? 'var(--amber)' : 'rgba(255,248,235,0.4)' }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: today.effective ? 'rgba(255,248,235,0.95)' : 'rgba(255,248,235,0.7)' }}>
                  {habit.label}
                </p>
                {description && (
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,220,170,0.35)' }}>
                    {description}
                  </p>
                )}
                {streak > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--amber)' }}>
                    🔥 {streak} дн подряд
                  </p>
                )}
              </div>

              {/* Today status badge */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {todayAuto ? (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider"
                    style={{ background: 'rgba(201,150,90,0.18)', color: 'var(--amber)', border: '1px solid rgba(201,150,90,0.25)' }}
                  >
                    учтено
                  </span>
                ) : (
                  <button
                    onClick={() => toggleManualOverride(habit.id, todayManual)}
                    className="text-[10px] px-2 py-1 rounded-full font-medium transition-all duration-200 active:scale-95"
                    style={todayManual ? {
                      background: 'rgba(201,150,90,0.10)',
                      color: 'rgba(255,220,170,0.85)',
                      border: '1px solid rgba(201,150,90,0.30)',
                    } : {
                      background: 'rgba(255,248,235,0.04)',
                      color: 'rgba(255,220,170,0.45)',
                      border: '1px dashed rgba(255,220,170,0.20)',
                    }}
                  >
                    {todayManual ? '✓ вне приложения' : '+ вне приложения'}
                  </button>
                )}
              </div>
            </div>

            {/* 7-day dots — auto vs manual distinct */}
            <div className="flex gap-1.5 mt-3">
              {days.map((mark, i) => {
                const isToday = i === 6
                const dotSize = isToday ? 10 : 8
                let background = 'rgba(255,255,255,0.07)'
                let border = 'none'
                let inner: React.ReactNode = null
                if (mark.auto) {
                  // Solid amber — strongest signal.
                  background = 'var(--amber)'
                } else if (mark.manual) {
                  // Outlined with center dot — manual credit.
                  background = 'transparent'
                  border = '1.5px solid rgba(201,150,90,0.55)'
                  inner = <div style={{
                    width: dotSize / 2.5, height: dotSize / 2.5, borderRadius: '50%',
                    background: 'rgba(201,150,90,0.55)',
                  }} />
                } else if (isToday) {
                  background = 'rgba(201,150,90,0.10)'
                  border = '1px solid rgba(201,150,90,0.20)'
                }
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        width: dotSize,
                        height: dotSize,
                        background,
                        border,
                        boxShadow: mark.auto && isToday ? 'var(--glow-amber)' : 'none',
                      }}
                    >
                      {inner}
                    </div>
                    <span className="text-[8px]" style={{ color: mark.effective ? 'rgba(255,220,170,0.5)' : 'rgba(255,220,170,0.2)' }}>
                      {dayLabels[i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        )
      })}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-1 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,220,170,0.4)' }}>авто</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full flex items-center justify-center" style={{ border: '1.5px solid rgba(201,150,90,0.55)' }}>
            <div style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(201,150,90,0.55)' }} />
          </div>
          <span className="text-[10px]" style={{ color: 'rgba(255,220,170,0.4)' }}>вручную</span>
        </div>
      </div>
    </div>
  )
}
