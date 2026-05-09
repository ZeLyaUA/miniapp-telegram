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
      <div className="p-4 pb-2">
        <h1 className="text-white font-bold text-xl">Профиль</h1>
        <p className="text-white/40 text-sm mt-0.5">Настройки и прогресс</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 flex flex-col gap-4 mt-2">
        <GlassCard accent="cyan" className="p-5 flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.15)', boxShadow: 'var(--glow-cyan)' }}
          >
            <User size={32} className="text-neon-cyan" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Пользователь</p>
            <p className="text-white/40 text-sm">Начинающий практик</p>
            <div
              className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,107,53,0.2)', color: 'var(--neon-orange)' }}
            >
              🔥 {dailyStats.streak} дней серии
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: 'Серия', value: `${dailyStats.streak}д`, color: 'var(--neon-orange)' },
            { icon: Clock, label: 'Всего', value: '42ч', color: 'var(--neon-cyan)' },
            { icon: Trophy, label: 'Достижения', value: '3', color: 'var(--neon-orange)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <GlassCard key={label} className="p-3 text-center">
              <Icon size={18} style={{ color }} className="mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{value}</p>
              <p className="text-white/30 text-xs">{label}</p>
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
              <ChevronRight size={16} className="text-white/20" />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
