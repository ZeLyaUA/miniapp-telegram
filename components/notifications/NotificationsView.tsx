'use client'

import { Brain, Wind, Trophy, Bell } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'

const notifications = [
  { id: 'n1', icon: Brain, title: 'Время для медитации', body: 'Ваш ежедневный сеанс ждёт вас', time: '08:00', color: 'var(--violet)', bg: 'rgba(139,117,207,0.1)' },
  { id: 'n2', icon: Wind, title: 'Дыхательная практика', body: 'Попробуйте технику 4-7-8 для успокоения', time: '14:30', color: 'var(--amber)', bg: 'rgba(201,150,90,0.1)' },
  { id: 'n3', icon: Trophy, title: 'Достижение разблокировано', body: 'Вы медитировали 7 дней подряд', time: 'Вчера', color: 'var(--amber)', bg: 'rgba(201,150,90,0.1)' },
  { id: 'n4', icon: Bell, title: 'Вечернее напоминание', body: 'Не забудьте про вечернюю релаксацию', time: 'Вчера', color: 'rgba(255,248,235,0.35)', bg: 'rgba(255,255,255,0.04)' },
]

export function NotificationsView() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 header-pt">
        <h1 className="text-white font-bold" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Уведомления</h1>
        <p className="label-upper mt-1.5">Напоминания и советы</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-3 mt-2">
        {notifications.map(({ id, icon: Icon, title, body, time, color, bg }) => (
          <GlassCard key={id} className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,248,235,0.4)' }}>{body}</p>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,220,170,0.25)' }}>{time}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
