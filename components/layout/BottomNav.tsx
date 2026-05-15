'use client'

import { Home, Star, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualKeyboard } from '@/lib/useVirtualKeyboard'
import type { TabId } from '@/lib/types'

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }> }[] = [
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
  const { isKeyboardOpen } = useVirtualKeyboard()

  return (
    <>
      {/* Mobile: floating pill bottom — hidden on lg */}
      <nav
        aria-hidden={isKeyboardOpen}
        className="fixed left-1/2 z-50 flex items-center gap-1 px-3 py-2.5 md:hidden"
        style={{
          bottom: 'max(20px, calc(env(safe-area-inset-bottom) + 8px))',
          transform: isKeyboardOpen
            ? 'translateX(-50%) translateY(140%)'
            : 'translateX(-50%)',
          opacity: isKeyboardOpen ? 0 : 1,
          pointerEvents: isKeyboardOpen ? 'none' : 'auto',
          transition: 'transform 180ms ease, opacity 140ms ease',
          borderRadius: '100px',
          background: 'rgba(18, 12, 30, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 220, 170, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 30px rgba(139,117,207,0.1)',
        }}
      >
        {tabs.map(({ id, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'relative flex items-center justify-center w-11 h-10 rounded-full transition-all duration-400',
                isActive ? 'scale-110' : 'scale-100 opacity-40 hover:opacity-60'
              )}
              style={isActive ? {
                background: 'rgba(201, 150, 90, 0.18)',
                boxShadow: 'var(--glow-amber)',
              } : {}}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.8)' }}
              />
            </button>
          )
        })}
      </nav>

      {/* Tablet (md): top pill — shown only between md and lg */}
      <nav
        className="fixed left-1/2 z-50 hidden md:flex lg:hidden items-center gap-1 px-3 py-2"
        style={{
          top: 'max(16px, var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top)))',
          transform: 'translateX(-50%)',
          borderRadius: '100px',
          background: 'rgba(18, 12, 30, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 220, 170, 0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(139,117,207,0.08)',
        }}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300',
                isActive ? '' : 'opacity-40 hover:opacity-70'
              )}
              style={isActive ? {
                background: 'rgba(201,150,90,0.18)',
              } : {}}
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.8)' }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.7)' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
