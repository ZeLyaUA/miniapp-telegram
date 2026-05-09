'use client'

import { useState } from 'react'
import { ChevronLeft, Target, BookOpen, User, Bell, BarChart3, CheckCircle2, Circle, Clock } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { goals, programs, reminders, dailyStats } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

type PlanTab = 'goals' | 'programs' | 'myplan' | 'reminders' | 'stats'

const tabs: { id: PlanTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
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
      <div className="flex items-center gap-3 p-4 pb-2">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">План</h1>
          <p className="text-white/40 text-xs">Путь к цели</p>
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
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,212,255,0.1))'
                  : 'rgba(255,255,255,0.05)',
                border: isActive ? '1px solid rgba(0,212,255,0.4)' : '1px solid transparent',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        {activeTab === 'goals' && (
          <div className="flex flex-col gap-3 mt-2">
            {goals.map(goal => (
              <GlassCard key={goal.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,212,255,0.12)' }}
                  >
                    <Target size={18} className="text-neon-cyan" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{goal.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{goal.subtitle}</p>
                    <div className="mt-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-white/40 text-xs">Прогресс</span>
                        <span className="text-neon-cyan text-xs font-semibold">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${goal.progress}%`,
                            background: 'linear-gradient(to right, var(--neon-cyan), var(--neon-orange))',
                          }}
                        />
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
              <GlassCard
                key={program.id}
                accent={program.isActive ? 'cyan' : 'none'}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-sm">{program.title}</p>
                      {program.isActive && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(0,212,255,0.2)', color: 'var(--neon-cyan)' }}
                        >
                          Активна
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{program.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-white/30">
                      <span>{program.duration}</span>
                      <span>·</span>
                      <span>{program.sessions} сессий</span>
                    </div>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0"
                    style={{
                      background: program.isActive ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)',
                      color: program.isActive ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.4)',
                    }}
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
            <GlassCard accent="cyan" className="p-4">
              <p className="text-neon-cyan font-semibold text-sm mb-1">Сегодня</p>
              <div className="flex flex-col gap-2 mt-2">
                {[
                  { time: '08:00', title: 'Утренняя медитация', duration: '7 мин', done: true },
                  { time: '12:00', title: 'Дыхание для концентрации', duration: '5 мин', done: true },
                  { time: '21:00', title: 'Вечерняя релаксация', duration: '20 мин', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.done
                      ? <CheckCircle2 size={16} className="text-neon-cyan flex-shrink-0" />
                      : <Circle size={16} className="text-white/20 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className={cn('text-sm', item.done ? 'text-white/50 line-through' : 'text-white')}>
                        {item.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/30 text-xs">{item.time}</p>
                      <p className="text-white/20 text-xs">{item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="flex flex-col gap-3 mt-2">
            {reminders.map((reminder, i) => (
              <GlassCard key={reminder.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: reminderStates[i] ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.05)' }}
                    >
                      <Clock size={18} className={reminderStates[i] ? 'text-neon-cyan' : 'text-white/20'} />
                    </div>
                    <div>
                      <p className={cn('text-sm font-medium', reminderStates[i] ? 'text-white' : 'text-white/40')}>
                        {reminder.title}
                      </p>
                      <div className="flex gap-1 mt-0.5">
                        <span className="text-white/30 text-xs">{reminder.time}</span>
                        <span className="text-white/20 text-xs">·</span>
                        <span className="text-white/30 text-xs">{reminder.days.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setReminderStates(prev => prev.map((v, idx) => idx === i ? !v : v))}
                    className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                    style={{ background: reminderStates[i] ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                      style={{ left: reminderStates[i] ? '26px' : '2px' }}
                    />
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
                { label: 'Дней подряд', value: dailyStats.streak, unit: 'дней', color: 'var(--neon-orange)' },
                { label: 'Сегодня', value: dailyStats.meditationMinutes, unit: 'минут', color: 'var(--neon-cyan)' },
                { label: 'Дыхание', value: dailyStats.breathingSessions, unit: 'сессий', color: 'var(--neon-cyan)' },
                { label: 'Неделя', value: dailyStats.weekData.reduce((a, b) => a + b, 0), unit: 'минут', color: 'var(--neon-orange)' },
              ].map(stat => (
                <GlassCard key={stat.label} className="p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-white/30 text-xs">{stat.unit}</p>
                  <p className="text-white/50 text-xs mt-1">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
