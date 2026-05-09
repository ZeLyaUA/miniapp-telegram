'use client'

import { useState } from 'react'
import { ChevronLeft, Target, BookOpen, User, Bell, BarChart3, CheckCircle2, Circle, Clock } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { goals, programs, reminders, dailyStats } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

type PlanTab = 'goals' | 'programs' | 'myplan' | 'reminders' | 'stats'

const tabs: { id: PlanTab; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'goals', label: 'Цели', icon: Target },
  { id: 'programs', label: 'Программы', icon: BookOpen },
  { id: 'myplan', label: 'Мой план', icon: User },
  { id: 'reminders', label: 'Напоминания', icon: Bell },
  { id: 'stats', label: 'Статистика', icon: BarChart3 },
]

interface PlanViewProps {
  onBack: () => void
}

export function PlanView({ onBack }: PlanViewProps) {
  const [activeTab, setActiveTab] = useState<PlanTab>('goals')
  const [reminderStates, setReminderStates] = useState(reminders.map(r => r.isEnabled))

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
          <h1 className="text-white font-bold text-lg">План</h1>
          <p className="label-upper" style={{ marginTop: 2 }}>Путь к цели</p>
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
                background: isActive ? 'rgba(201,150,90,0.18)' : 'rgba(255,248,235,0.05)',
                border: isActive ? '1px solid rgba(201,150,90,0.25)' : '1px solid rgba(255,220,170,0.06)',
                color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.4)',
              }}
            >
              <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28">
        {activeTab === 'goals' && (
          <div className="flex flex-col gap-3 mt-2">
            {goals.map(goal => (
              <GlassCard key={goal.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,150,90,0.1)' }}>
                    <Target size={18} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{goal.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>{goal.subtitle}</p>
                    <div className="mt-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs" style={{ color: 'rgba(255,220,170,0.35)' }}>Прогресс</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--amber)' }}>{goal.progress}%</span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${goal.progress}%`, background: 'linear-gradient(to right, var(--amber), var(--violet))' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="flex flex-col gap-3 mt-2">
            {programs.map(program => (
              <GlassCard key={program.id} accent={program.isActive ? 'amber' : 'none'} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-sm">{program.title}</p>
                      {program.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(201,150,90,0.15)', color: 'var(--amber)' }}>Активна</span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>{program.description}</p>
                    <div className="flex gap-3 mt-2 text-xs" style={{ color: 'rgba(255,220,170,0.3)' }}>
                      <span>{program.duration}</span>
                      <span>·</span>
                      <span>{program.sessions} сессий</span>
                    </div>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0"
                    style={{ background: program.isActive ? 'rgba(201,150,90,0.15)' : 'rgba(255,248,235,0.06)', color: program.isActive ? 'var(--amber)' : 'rgba(255,248,235,0.35)', border: '1px solid rgba(255,220,170,0.08)' }}
                  >
                    {program.isActive ? 'Продолжить' : 'Начать'}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'myplan' && (
          <div className="flex flex-col gap-3 mt-2">
            <GlassCard accent="amber" className="p-4">
              <p className="font-semibold text-sm mb-3" style={{ color: 'var(--amber)' }}>Сегодня</p>
              {[
                { time: '08:00', title: 'Утренняя медитация', duration: '7 мин', done: true },
                { time: '12:00', title: 'Дыхание для концентрации', duration: '5 мин', done: true },
                { time: '21:00', title: 'Вечерняя релаксация', duration: '20 мин', done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,220,170,0.06)' }}>
                  {item.done
                    ? <CheckCircle2 size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                    : <Circle size={16} style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />}
                  <p className={cn('text-sm flex-1', item.done ? 'line-through' : 'text-white')} style={item.done ? { color: 'rgba(255,220,170,0.3)' } : {}}>
                    {item.title}
                  </p>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'rgba(255,220,170,0.35)' }}>{item.time}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,220,170,0.25)' }}>{item.duration}</p>
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="flex flex-col gap-3 mt-2">
            {reminders.map((reminder, i) => (
              <GlassCard key={reminder.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: reminderStates[i] ? 'rgba(201,150,90,0.1)' : 'rgba(255,255,255,0.04)' }}>
                      <Clock size={18} style={{ color: reminderStates[i] ? 'var(--amber)' : 'rgba(255,255,255,0.2)' }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: reminderStates[i] ? 'white' : 'rgba(255,255,255,0.3)' }}>{reminder.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.3)' }}>{reminder.time} · {reminder.days.join(', ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReminderStates(prev => prev.map((v, idx) => idx === i ? !v : v))}
                    className="relative w-12 h-6 rounded-full transition-all duration-400 flex-shrink-0"
                    style={{ background: reminderStates[i] ? 'var(--amber)' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-400" style={{ left: reminderStates[i] ? '26px' : '2px' }} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Дней подряд', value: dailyStats.streak, unit: 'дней', color: 'var(--amber)' },
                { label: 'Сегодня', value: dailyStats.meditationMinutes, unit: 'минут', color: 'var(--violet)' },
                { label: 'Дыхание', value: dailyStats.breathingSessions, unit: 'сессий', color: 'var(--violet)' },
                { label: 'Неделя', value: dailyStats.weekData.reduce((a, b) => a + b, 0), unit: 'минут', color: 'var(--amber)' },
              ].map(stat => (
                <GlassCard key={stat.label} className="p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.3)' }}>{stat.unit}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,248,235,0.4)' }}>{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
