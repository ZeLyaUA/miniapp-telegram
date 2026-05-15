'use client'

import { Home, Star, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWellnessState } from '@/lib/store/WellnessContext'
import type { TabId } from '@/lib/types'

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }> }[] = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'favorites', label: 'Избранное', icon: Star },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
  { id: 'profile', label: 'Профиль', icon: User },
]

interface SidebarNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  const wellness = useWellnessState()
  const unread = wellness.notifications.filter(n => !n.isRead).length
  const unreadLabel = unread > 9 ? '9+' : String(unread)
  return (
    <aside
      className="hidden lg:flex flex-col gap-1 px-3 py-6 h-full"
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,220,170,0.06)',
        background: 'rgba(255,248,235,0.02)',
      }}
    >
      {/* Logo / app name */}
      <div className="px-3 pb-6 mb-2" style={{ borderBottom: '1px solid rgba(255,220,170,0.06)' }}>
        <p className="text-white font-bold" style={{ fontSize: 16, letterSpacing: '-0.02em' }}>Wellness</p>
        <p className="label-upper mt-0.5">Midnight Ritual</p>
      </div>

      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id
        const showBadge = id === 'notifications' && unread > 0
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-2xl text-left w-full transition-all duration-300',
              isActive ? '' : 'opacity-40 hover:opacity-70'
            )}
            style={isActive ? {
              background: 'rgba(201,150,90,0.14)',
              border: '1px solid rgba(201,150,90,0.18)',
            } : {
              border: '1px solid transparent',
            }}
          >
            <Icon
              size={18}
              strokeWidth={isActive ? 2 : 1.5}
              style={{ color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.8)', flexShrink: 0 }}
            />
            <span
              className="text-sm font-medium flex-1"
              style={{ color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.8)' }}
            >
              {label}
            </span>
            {showBadge && (
              <span
                className="flex items-center justify-center text-[10px] font-semibold leading-none"
                style={{
                  minWidth: 18, height: 18, padding: '0 5px',
                  borderRadius: 9,
                  background: 'var(--amber)',
                  color: '#1a1024',
                }}
              >
                {unreadLabel}
              </span>
            )}
          </button>
        )
      })}
    </aside>
  )
}
