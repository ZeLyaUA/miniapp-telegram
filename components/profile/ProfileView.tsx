'use client'

import { useState } from 'react'
import { ChevronRight, Bell, Palette, Globe, Info, Sparkles } from 'lucide-react'
import { NotificationSettingsView } from './NotificationSettingsView'
import { ThemeSelectorView } from './ThemeSelectorView'
import { LanguageView } from './LanguageView'
import { AboutView } from './AboutView'

type SubScreen = 'notifications' | 'theme' | 'language' | 'about'

const menuItems: { id: SubScreen; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }> }[] = [
  { id: 'notifications', label: 'Настройки уведомлений', icon: Bell },
  { id: 'theme',         label: 'Тема приложения',       icon: Palette },
  { id: 'language',      label: 'Язык',                  icon: Globe },
  { id: 'about',         label: 'О приложении',          icon: Info },
]

interface ProfileViewProps {
  onShowTour: () => void
  firstName: string | null
  photoUrl: string | null
}

export function ProfileView({ onShowTour, firstName, photoUrl }: ProfileViewProps) {
  const [subScreen, setSubScreen] = useState<SubScreen | null>(null)
  const [imgFailed, setImgFailed] = useState(false)

  if (subScreen === 'notifications') return <NotificationSettingsView onBack={() => setSubScreen(null)} />
  if (subScreen === 'theme')         return <ThemeSelectorView onBack={() => setSubScreen(null)} />
  if (subScreen === 'language')      return <LanguageView onBack={() => setSubScreen(null)} />
  if (subScreen === 'about')         return <AboutView onBack={() => setSubScreen(null)} />

  const displayName = firstName ?? 'Пользователь'
  const initial = (firstName ?? '?').trim().charAt(0).toUpperCase() || '?'
  const showPhoto = photoUrl && !imgFailed

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 header-pt">
        <h1 className="text-white font-bold" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Профиль</h1>
        <p className="label-upper mt-1.5">Настройки</p>
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
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={displayName}
              onError={() => setImgFailed(true)}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              style={{ border: '1px solid rgba(201,150,90,0.25)' }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(201,150,90,0.35) 0%, rgba(139,117,207,0.3) 100%)',
                border: '1px solid rgba(201,150,90,0.25)',
              }}
            >
              <span className="text-white font-bold" style={{ fontSize: 26, letterSpacing: '-0.02em' }}>{initial}</span>
            </div>
          )}
          <div>
            <p className="text-white font-bold text-lg">{displayName}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSubScreen(item.id)}
              className="w-full p-4 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99] text-left"
              style={{
                background: 'rgba(255,248,235,0.04)',
                border: '1px solid rgba(255,220,170,0.08)',
              }}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} strokeWidth={1.5} style={{ color: 'rgba(255,220,170,0.4)' }} />
                <span className="text-white text-sm">{item.label}</span>
              </div>
              <ChevronRight size={16} style={{ color: 'rgba(255,220,170,0.2)' }} />
            </button>
          ))}

          <button
            onClick={onShowTour}
            className="w-full p-4 flex items-center justify-between rounded-2xl transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(201,150,90,0.1) 0%, rgba(139,117,207,0.07) 100%)',
              border: '1px solid rgba(201,150,90,0.18)',
            }}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--amber)', opacity: 0.8 }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,220,170,0.85)' }}>Показать тур по приложению</span>
            </div>
            <ChevronRight size={16} style={{ color: 'rgba(201,150,90,0.35)' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
