'use client'

import { User, Flame, Clock, Trophy, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { dailyStats } from '@/lib/demo-data'

const menuItems = [
  { label: 'Настройки уведомлений', icon: '🔔' },
  { label: 'Тема приложения', icon: '🎨' },
  { label: 'Язык', icon: '🌐' },
  { label: 'О приложении', icon: 'ℹ️' },
]

export function ProfileView() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 header-pt">
        <h1 className="text-white font-bold" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Профиль</h1>
        <p className="label-upper mt-1.5">Настройки и прогресс</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-4 mt-2">
        <div
          className="relative overflow-hidden rounded-3xl p-5 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(201,150,90,0.2) 0%, rgba(139,117,207,0.15) 100%)',
            border: '1px solid rgba(255,220,170,0.1)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,150,90,0.15) 0%, transparent 70%)', filter: 'blur(12px)' }} />
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,150,90,0.12)', border: '1px solid rgba(201,150,90,0.2)' }}>
            <User size={30} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Пользователь</p>
            <p className="text-sm" style={{ color: 'rgba(255,220,170,0.5)' }}>Начинающий практик</p>
            <div className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(201,150,90,0.15)', color: 'var(--amber)' }}>
              🔥 {dailyStats.streak} дней серии
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: 'Серия', value: `${dailyStats.streak}д`, color: 'var(--amber)' },
            { icon: Clock, label: 'Всего', value: '42ч', color: 'var(--violet)' },
            { icon: Trophy, label: 'Достижения', value: '3', color: 'var(--amber)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <GlassCard key={label} className="p-3 text-center">
              <Icon size={18} style={{ color }} className="mx-auto mb-1" strokeWidth={1.5} />
              <p className="text-white font-bold text-lg">{value}</p>
              <p className="text-xs" style={{ color: 'rgba(255,220,170,0.35)' }}>{label}</p>
            </GlassCard>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {menuItems.map(item => (
            <GlassCard key={item.label} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-white text-sm">{item.label}</span>
              </div>
              <ChevronRight size={16} style={{ color: 'rgba(255,220,170,0.2)' }} />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
