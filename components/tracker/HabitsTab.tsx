'use client'

import { GlassCard } from '@/components/layout/GlassCard'
import { useWellness, createEvent, syncEventToSupabase, syncStateToSupabase } from '@/lib/store/WellnessContext'
import { getHabitCheckedDays, getHabitStreak, todayKey } from '@/lib/store/analytics'
import { Wind, Brain, Moon, Pause, Heart } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Wind, Brain, Moon, Pause, Heart,
}

export function HabitsTab() {
  const { state, dispatch } = useWellness()
  const today = todayKey()
  console.log('[HabitsTab] render — habits:', state.habits.length, 'events:', state.events.length)

  const toggleHabit = (habitId: string, currentlyDone: boolean) => {
    const event = createEvent({
      type: 'habit_checked',
      habitId,
      checked: !currentlyDone,
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
        Отметьте выполненные привычки за сегодня
      </p>

      {state.habits.map(habit => {
        const checkedDays = getHabitCheckedDays(state.events, habit.id, 7)
        const streak = getHabitStreak(state.events, habit.id)
        const doneToday = checkedDays[6]

        const Icon = iconMap[habit.icon] ?? Heart
        const RU_DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
        const dayLabels = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return RU_DAYS[d.getDay()]
        })

        return (
          <GlassCard key={habit.id} accent={doneToday ? 'amber' : 'none'} className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  background: doneToday ? 'rgba(201,150,90,0.2)' : 'rgba(255,248,235,0.06)',
                  border: doneToday ? '1px solid rgba(201,150,90,0.3)' : '1px solid rgba(255,220,170,0.08)',
                }}
              >
                <Icon size={18} style={{ color: doneToday ? 'var(--amber)' : 'rgba(255,248,235,0.4)' }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: doneToday ? 'rgba(255,248,235,0.95)' : 'rgba(255,248,235,0.7)' }}>
                  {habit.label}
                </p>
                {streak > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--amber)' }}>
                    🔥 {streak} дней подряд
                  </p>
                )}
              </div>

              {/* Check button */}
              <button
                onClick={() => toggleHabit(habit.id, doneToday)}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 active:scale-90"
                style={doneToday ? {
                  background: 'var(--amber)',
                  boxShadow: 'var(--glow-amber)',
                } : {
                  border: '1.5px solid rgba(255,220,170,0.22)',
                }}
              >
                {doneToday && <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90" />}
              </button>
            </div>

            {/* 7-day dots */}
            <div className="flex gap-1.5 mt-3">
              {checkedDays.map((done, i) => {
                const isToday = i === 6
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: isToday ? 10 : 8,
                        height: isToday ? 10 : 8,
                        background: done
                          ? 'var(--amber)'
                          : isToday
                          ? 'rgba(201,150,90,0.2)'
                          : 'rgba(255,255,255,0.07)',
                        boxShadow: done && isToday ? 'var(--glow-amber)' : 'none',
                        border: isToday && !done ? '1px solid rgba(201,150,90,0.3)' : 'none',
                      }}
                    />
                    <span className="text-[8px]" style={{ color: done ? 'rgba(255,220,170,0.5)' : 'rgba(255,220,170,0.2)' }}>
                      {dayLabels[i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
