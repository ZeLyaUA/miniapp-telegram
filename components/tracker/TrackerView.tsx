'use client'

import { useState } from 'react'
import { ChevronLeft, CalendarDays, Activity, BarChart3, Trophy, Calendar } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { habits, achievements, dailyStats } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

type TrackerTab = 'daily' | 'habits' | 'stats' | 'achievements' | 'calendar'

const tabs: { id: TrackerTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'daily', label: 'Ежедневный', icon: CalendarDays },
  { id: 'habits', label: 'Привычки', icon: Activity },
  { id: 'stats', label: 'Статистика', icon: BarChart3 },
  { id: 'achievements', label: 'Достижения', icon: Trophy },
  { id: 'calendar', label: 'Календарь', icon: Calendar },
]

const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

interface TrackerViewProps {
  onBack: () => void
}

export function TrackerView({ onBack }: TrackerViewProps) {
  const [activeTab, setActiveTab] = useState<TrackerTab>('daily')
  const [habitStates, setHabitStates] = useState(habits.map(h => [...h.completedDays]))
  const [selectedDay, setSelectedDay] = useState(6)

  const toggleHabit = (habitIdx: number, dayIdx: number) => {
    setHabitStates(prev => prev.map((days, hi) =>
      hi === habitIdx ? days.map((d, di) => di === dayIdx ? !d : d) : days
    ))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-2">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Трекер</h1>
          <p className="text-white/40 text-xs">Привычки и прогресс</p>
        </div>
      </div>

      <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
                isActive ? 'text-white' : 'text-white/40'
              )}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(255,107,53,0.3), rgba(255,107,53,0.1))'
                  : 'rgba(255,255,255,0.05)',
                border: isActive ? '1px solid rgba(255,107,53,0.4)' : '1px solid transparent',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        {activeTab === 'daily' && (
          <div className="flex flex-col gap-3 mt-2">
            <GlassCard accent="orange" className="p-4">
              <p className="text-neon-orange font-semibold text-sm mb-3">Сегодня</p>
              {[
                { label: 'Медитация', done: true, minutes: 25 },
                { label: 'Дыхательные упражнения', done: true, minutes: 10 },
                { label: 'Вечерняя релаксация', done: false, minutes: 20 },
                { label: 'Осознанная пауза', done: false, minutes: 5 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: item.done ? 'var(--neon-orange)' : 'rgba(255,255,255,0.2)' }}
                    >
                      {item.done && <div className="w-2 h-2 rounded-full bg-neon-orange" />}
                    </div>
                    <span className={cn('text-sm', item.done ? 'text-white' : 'text-white/50')}>{item.label}</span>
                  </div>
                  <span className="text-white/30 text-xs">{item.minutes} мин</span>
                </div>
              ))}
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-neon-orange text-3xl font-bold">{dailyStats.streak}</p>
              <p className="text-white/40 text-xs mt-1">дней подряд</p>
            </GlassCard>
          </div>
        )}

        {activeTab === 'habits' && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-end gap-2 mb-1">
              {dayLabels.map((d, i) => (
                <span key={i} className="text-white/30 text-[10px] w-7 text-center">{d}</span>
              ))}
            </div>
            {habits.map((habit, hi) => (
              <GlassCard key={habit.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{habit.label}</p>
                  <p className="text-neon-orange text-xs">{habitStates[hi].filter(Boolean).length} / 7 дней</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {habitStates[hi].map((done, di) => (
                    <button
                      key={di}
                      onClick={() => toggleHabit(hi, di)}
                      className="w-7 h-7 rounded-lg transition-all duration-200 active:scale-90"
                      style={{
                        background: done
                          ? 'linear-gradient(135deg, var(--neon-orange), rgba(255,107,53,0.6))'
                          : 'rgba(255,255,255,0.06)',
                        boxShadow: done ? '0 0 8px rgba(255,107,53,0.4)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Серия', value: `${dailyStats.streak}`, sub: 'дней подряд', color: 'var(--neon-orange)' },
                { label: 'Всего', value: '42', sub: 'часа медитации', color: 'var(--neon-cyan)' },
                { label: 'Привычки', value: '5', sub: 'активных', color: 'var(--neon-cyan)' },
                { label: 'Неделя', value: `${dailyStats.weekData.reduce((a, b) => a + b, 0)}`, sub: 'минут', color: 'var(--neon-orange)' },
              ].map(stat => (
                <GlassCard key={stat.label} className="p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-white/30 text-xs mt-0.5">{stat.sub}</p>
                  <p className="text-white/50 text-xs">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
            <GlassCard className="p-4">
              <p className="text-white/50 text-xs mb-3">Активность за неделю</p>
              <div className="flex items-end gap-2 h-20">
                {dailyStats.weekData.map((val, i) => {
                  const max = Math.max(...dailyStats.weekData)
                  const height = max > 0 ? Math.max((val / max) * 100, val > 0 ? 10 : 4) : 4
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className="w-full rounded-sm"
                        style={{
                          height: `${height}%`,
                          background: val > 0
                            ? 'linear-gradient(to top, var(--neon-orange), var(--neon-cyan))'
                            : 'rgba(255,255,255,0.06)',
                          minHeight: '3px',
                        }}
                      />
                      <span className="text-white/30 text-[9px]">{dayLabels[i]}</span>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="flex flex-col gap-3 mt-2">
            {achievements.map(achievement => (
              <GlassCard
                key={achievement.id}
                accent={achievement.isUnlocked ? 'orange' : 'none'}
                className="p-4 flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{
                    background: achievement.isUnlocked
                      ? 'rgba(255,107,53,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    boxShadow: achievement.isUnlocked ? 'var(--glow-orange)' : 'none',
                    filter: achievement.isUnlocked ? 'none' : 'grayscale(1)',
                  }}
                >
                  <Trophy size={22} style={{ color: achievement.isUnlocked ? 'var(--neon-orange)' : 'rgba(255,255,255,0.2)' }} />
                </div>
                <div className="flex-1">
                  <p className={cn('text-sm font-medium', achievement.isUnlocked ? 'text-white' : 'text-white/40')}>
                    {achievement.title}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">{achievement.description}</p>
                  {!achievement.isUnlocked && achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${achievement.progress}%`,
                            background: 'rgba(255,107,53,0.5)',
                          }}
                        />
                      </div>
                      <p className="text-white/20 text-xs mt-0.5">{achievement.progress}%</p>
                    </div>
                  )}
                </div>
                {achievement.isUnlocked && (
                  <div
                    className="px-2 py-1 rounded-lg text-[10px] font-medium flex-shrink-0"
                    style={{ background: 'rgba(255,107,53,0.2)', color: 'var(--neon-orange)' }}
                  >
                    ✓
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="flex flex-col gap-3 mt-2">
            <GlassCard className="p-4">
              <p className="text-white font-semibold text-sm mb-4">Май 2026</p>
              <div className="grid grid-cols-7 gap-1 text-center">
                {dayLabels.map(d => (
                  <div key={d} className="text-white/30 text-[10px] py-1">{d}</div>
                ))}
                {[null, null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day, i) => {
                  const isToday = day === 10
                  const hasActivity = day !== null && day <= 10 && day % 3 !== 0
                  const isSelected = day === selectedDay
                  return (
                    <button
                      key={i}
                      onClick={() => day && setSelectedDay(day)}
                      disabled={!day}
                      className="aspect-square flex items-center justify-center rounded-lg text-xs transition-all duration-200"
                      style={{
                        background: isSelected && day
                          ? 'var(--neon-orange)'
                          : isToday
                            ? 'rgba(0,212,255,0.2)'
                            : 'transparent',
                        color: isSelected ? 'white' : isToday ? 'var(--neon-cyan)' : day ? 'rgba(255,255,255,0.7)' : 'transparent',
                      }}
                    >
                      {day && (
                        <div className="flex flex-col items-center">
                          {day}
                          {hasActivity && (
                            <div
                              className="w-1 h-1 rounded-full mt-0.5"
                              style={{ background: isSelected ? 'white' : 'var(--neon-orange)' }}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}
