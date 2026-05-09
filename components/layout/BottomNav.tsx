'use client'

import { Home, Star, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TabId } from '@/lib/types'

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'favorites', label: 'Избранное', icon: Star },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
  { id: 'profile', label: 'Профиль', icon: User },
]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-50"
      style={{
        background: 'rgba(8, 14, 40, 0.95)',
        borderTop: '1px solid rgba(0, 212, 255, 0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center gap-0.5 flex-1 py-1 transition-all duration-200"
          >
            <div
              className={cn(
                'p-1.5 rounded-xl transition-all duration-200',
                isActive && 'glow-orange'
              )}
            >
              <Icon
                size={22}
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-neon-orange' : 'text-white/40'
                )}
              />
            </div>
            <span
              className={cn(
                'text-[10px] font-medium transition-colors duration-200',
                isActive ? 'text-neon-orange' : 'text-white/40'
              )}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
