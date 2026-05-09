'use client'

import { useState } from 'react'
import { ChevronLeft, CalendarDays, Activity, BarChart3, Trophy, Calendar } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { habits, achievements, dailyStats } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

type TrackerTab = 'daily' | 'habits' | 'stats' | 'achievements' | 'calendar'

const tabs: { id: TrackerTab; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
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
  const [selectedDay, setSelectedDay] = useState(10)

  const toggleHabit = (habitIdx: number, dayIdx: number) => {
    setHabitStates(prev => prev.map((days, hi) =>
      hi === habitIdx ? days.map((d, di) => di === dayIdx ? !d : d) : days
    ))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
          style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
        >
          <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">Трекер</h1>
          <p className="label-upper" style={{ marginTop: 2 }}>Привычки и прогресс</p>
        </div>
      </div>

      <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all duration-300"
              style={{
                borderRadius: '100px',
                background: isActive ? 'rgba(139,117,207,0.18)' : 'rgba(255,248,235,0.05)',
                border: isActive ? '1px solid rgba(139,117,207,0.25)' : '1px solid rgba(255,220,170,0.06)',
                color: isActive ? 'var(--violet)' : 'rgba(255,248,235,0.4)',
              }}
            >
              <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28">
        {activeTab === 'daily' && (
          <div className="flex flex-col gap-3 mt-2">
            <GlassCard accent="violet" className="p-4">
              <p className="font-semibold text-sm mb-3" style={{ color: 'var(--violet)' }}>Сегодня</p>
              {[
                { label: 'Медитация', done: true, minutes: 25 },
                { label: 'Дыхательные упражнения', done: true, minutes: 10 },
                { label: 'Вечерняя релаксация', done: false, minutes: 20 },
                { label: 'Осознанная пауза', done: false, minutes: 5 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(139,117,207,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: item.done ? 'var(--violet)' : 'rgba(255,255,255,0.15)' }}>
                      {item.done && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--violet)' }} />}
                    </div>
                    <span className={cn('text-sm', item.done ? 'line-through' : 'text-white')} style={item.done ? { color: 'rgba(255,255,255,0.3)' } : {}}>{item.label}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,220,170,0.3)' }}>{item.minutes} мин</span>
                </div>
              ))}
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--violet)' }}>{dailyStats.streak}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,220,170,0.35)' }}>дней подряд</p>
            </GlassCard>
          </div>
        )}

        {activeTab === 'habits' && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-end gap-1.5 mb-1 px-1">
              {dayLabels.map((d, i) => (
                <span key={i} className="text-[10px] w-7 text-center" style={{ color: 'rgba(255,220,170,0.25)' }}>{d}</span>
              ))}
            </div>
            {habits.map((habit, hi) => (
              <GlassCard key={habit.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{habit.label}</p>
                  <p className="text-xs" style={{ color: 'var(--violet)' }}>{habitStates[hi].filter(Boolean).length} / 7 дней</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {habitStates[hi].map((done, di) => (
                    <button
                      key={di}
                      onClick={() => toggleHabit(hi, di)}
                      className="w-7 h-7 rounded-lg transition-all duration-400 active:scale-90"
                      style={{
                        background: done ? 'linear-gradient(135deg, var(--violet), rgba(139,117,207,0.6))' : 'rgba(255,255,255,0.05)',
                        border: done ? 'none' : '1px solid rgba(255,220,170,0.06)',
                        boxShadow: done ? 'var(--glow-violet)' : 'none',
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
                { label: 'Серия', value: `${dailyStats.streak}`, sub: 'дней подряд', color: 'var(--amber)' },
                { label: 'Всего', value: '42', sub: 'часа медитации', color: 'var(--violet)' },
                { label: 'Привычки', value: '5', sub: 'активных', color: 'var(--violet)' },
                { label: 'Неделя', value: `${dailyStats.weekData.reduce((a, b) => a + b, 0)}`, sub: 'минут', color: 'var(--amber)' },
              ].map(stat => (
                <GlassCard key={stat.label} className="p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.3)' }}>{stat.sub}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,248,235,0.4)' }}>{stat.label}</p>
                </GlassCard>
              ))}
            </div>
            <GlassCard className="p-4">
              <p className="label-upper mb-3">Активность за неделю</p>
              <div className="flex items-end gap-2 h-20">
                {dailyStats.weekData.map((val, i) => {
                  const max = Math.max(...dailyStats.weekData)
                  const height = max > 0 ? Math.max((val / max) * 100, val > 0 ? 10 : 4) : 4
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full rounded-sm transition-all duration-700"
                        style={{
                          height: `${height}%`,
                          background: val > 0 ? 'linear-gradient(to top, var(--amber), var(--violet))' : 'rgba(255,255,255,0.05)',
                          minHeight: '3px',
                        }}
                      />
                      <span className="text-[9px]" style={{ color: 'rgba(255,220,170,0.3)' }}>{dayLabels[i]}</span>
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
              <GlassCard key={achievement.id} accent={achievement.isUnlocked ? 'amber' : 'none'} className="p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: achievement.isUnlocked ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.03)',
                    boxShadow: achievement.isUnlocked ? 'var(--glow-amber)' : 'none',
                  }}
                >
                  <Trophy size={22} style={{ color: achievement.isUnlocked ? 'var(--amber)' : 'rgba(255,255,255,0.15)' }} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: achievement.isUnlocked ? 'white' : 'rgba(255,255,255,0.3)' }}>{achievement.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.3)' }}>{achievement.description}</p>
                  {!achievement.isUnlocked && achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${achievement.progress}%`, background: 'rgba(201,150,90,0.4)' }} />
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,220,170,0.25)' }}>{achievement.progress}%</p>
                    </div>
                  )}
                </div>
                {achievement.isUnlocked && (
                  <div className="text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ background: 'rgba(201,150,90,0.15)', color: 'var(--amber)' }}>✓</div>
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
                  <div key={d} className="text-[10px] py-1" style={{ color: 'rgba(255,220,170,0.3)' }}>{d}</div>
                ))}
                {[null, null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day, i) => {
                  const isToday = day === 10
                  const hasActivity = day !== null && day <= 10 && day % 3 !== 0
                  const isSelected = day === selectedDay
                  return (
                    <button key={i} onClick={() => day && setSelectedDay(day)} disabled={!day}
                      className="aspect-square flex items-center justify-center rounded-xl text-xs transition-all duration-300"
                      style={{
                        background: isSelected && day ? 'var(--amber)' : isToday ? 'rgba(201,150,90,0.12)' : 'transparent',
                        color: isSelected ? 'white' : isToday ? 'var(--amber)' : day ? 'rgba(255,248,235,0.6)' : 'transparent',
                        border: isToday && !isSelected ? '1px solid rgba(201,150,90,0.3)' : '1px solid transparent',
                      }}
                    >
                      {day && (
                        <div className="flex flex-col items-center">
                          {day}
                          {hasActivity && (
                            <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: isSelected ? 'white' : 'var(--violet)' }} />
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
