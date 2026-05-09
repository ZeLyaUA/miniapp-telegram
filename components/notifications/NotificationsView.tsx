'use client'

import { Bell, Brain, Wind, Trophy } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'

const notifications = [
  { id: 'n1', icon: Brain, title: 'Время для медитации', body: 'Ваш ежедневный сеанс ждёт вас', time: '08:00', color: 'var(--neon-cyan)', bg: 'rgba(0,212,255,0.12)' },
  { id: 'n2', icon: Wind, title: 'Дыхательная практика', body: 'Попробуйте технику 4-7-8 для успокоения', time: '14:30', color: 'var(--neon-orange)', bg: 'rgba(255,107,53,0.12)' },
  { id: 'n3', icon: Trophy, title: 'Достижение разблокировано!', body: 'Вы медитировали 7 дней подряд', time: 'Вчера', color: 'var(--neon-orange)', bg: 'rgba(255,107,53,0.12)' },
  { id: 'n4', icon: Bell, title: 'Вечернее напоминание', body: 'Не забудьте про вечернюю релаксацию', time: 'Вчера', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)' },
]

export function NotificationsView() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h1 className="text-white font-bold text-xl">Уведомления</h1>
        <p className="text-white/40 text-sm mt-0.5">Напоминания и советы</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 flex flex-col gap-3 mt-2">
        {notifications.map(({ id, icon: Icon, title, body, time, color, bg }) => (
          <GlassCard key={id} className="p-4 flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{title}</p>
              <p className="text-white/40 text-xs mt-0.5">{body}</p>
            </div>
            <span className="text-white/20 text-xs flex-shrink-0">{time}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
