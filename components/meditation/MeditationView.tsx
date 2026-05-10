'use client'

import { useState } from 'react'
import { useSwipeTabs } from '@/lib/useSwipeTabs'
import { Play, Heart, Clock, ChevronLeft, Flame, Waves, Moon, Zap, Star } from 'lucide-react'
import { SessionPlayer } from './SessionPlayer'
import { meditationCategories, meditationSessions } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { ViewShell } from '@/components/layout/ViewShell'
import type { MeditationSession } from '@/lib/types'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  Play, Flame, Waves, Moon, Zap, Heart, Star,
}

const levelLabel: Record<MeditationSession['level'], string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

interface MeditationViewProps {
  onBack: () => void
}

export function MeditationView({ onBack }: MeditationViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('quick')
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null)
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null)
  const { animKey, animClass, setSwipeDir, pillsRef, contentRef, containerRef, touchHandlers } =
    useSwipeTabs(meditationCategories, selectedCategory, setSelectedCategory)

  const filtered = selectedCategory === 'favorites'
    ? meditationSessions.filter(s => s.isFavorite)
    : meditationSessions.filter(s => s.category === selectedCategory)

  if (activeSession) {
    return <SessionPlayer session={activeSession} onClose={() => setActiveSession(null)} />
  }

  if (selectedSession) {
    return (
      <ViewShell
        header={
          <div className="flex items-center gap-3 p-4 pb-3 header-pt">
            <button
              onClick={() => setSelectedSession(null)}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
              style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
            >
              <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
            </button>
            <span style={{ color: 'rgba(255,220,170,0.4)', fontSize: 13 }}>Медитация</span>
          </div>
        }
      >
        <div className="px-4 pb-28 md:pb-8 flex flex-col gap-4 md:max-w-lg md:mx-auto md:w-full">
          <div
            className="rounded-3xl p-6 flex flex-col gap-4"
            style={{
              background: selectedSession.moodColor ?? 'linear-gradient(135deg, rgba(201,150,90,0.3) 0%, rgba(139,117,207,0.2) 100%)',
              border: '1px solid rgba(255,220,170,0.1)',
              boxShadow: 'var(--shadow-card-lg)',
              minHeight: 200,
            }}
          >
            <div>
              <h2 className="text-white font-bold text-2xl leading-tight">{selectedSession.title}</h2>
              <p className="text-white/50 text-sm mt-2">{selectedSession.description}</p>
            </div>
            <div className="flex items-center gap-3 text-xs mt-auto" style={{ color: 'rgba(255,220,170,0.5)' }}>
              <span className="flex items-center gap-1"><Clock size={11} /> {selectedSession.duration} мин</span>
              <span>·</span>
              <span>{levelLabel[selectedSession.level]}</span>
              {selectedSession.isFavorite && <Heart size={11} fill="currentColor" style={{ color: 'var(--rose)', marginLeft: 'auto' }} />}
            </div>
          </div>

          <button
            onClick={() => setActiveSession(selectedSession)}
            className="w-full py-4 rounded-2xl font-semibold transition-all duration-400 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, rgba(201,150,90,0.8), rgba(201,150,90,0.5))',
              border: '1px solid rgba(201,150,90,0.3)',
              boxShadow: 'var(--glow-amber)',
              color: 'rgba(255,240,210,0.95)',
            }}
          >
            Начать медитацию
          </button>
        </div>
      </ViewShell>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-3 header-pt">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
          style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
        >
          <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Медитация</h1>
          <p className="label-upper" style={{ marginTop: 2 }}>Спокойствие и фокус</p>
        </div>
      </div>

      {/* Layout: horizontal scroll (mobile) | sidebar (md+) */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Categories — horizontal scroll on mobile, vertical sidebar on md+ */}
        <div
          ref={pillsRef}
          className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2 md:flex-col md:overflow-x-visible md:overflow-y-auto md:gap-1 md:px-3 md:py-3 md:w-44 md:flex-shrink-0 md:border-r"
          style={{ borderColor: 'rgba(255,220,170,0.06)' }}
        >
          {meditationCategories.map(cat => {
            const Icon = iconMap[cat.icon] ?? Play
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                data-active={isActive}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap flex-shrink-0 transition-all duration-300',
                  'md:truncate md:flex-shrink-1 md:w-full md:rounded-xl md:px-3 md:py-2.5',
                  'px-3.5 py-2 text-xs font-medium',
                  isActive ? 'text-white md:text-amber' : ''
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(201,150,90,0.25), rgba(201,150,90,0.1))',
                  border: '1px solid rgba(201,150,90,0.25)',
                  color: 'var(--amber)',
                  borderRadius: '100px',
                } : {
                  background: 'rgba(255,248,235,0.05)',
                  border: '1px solid rgba(255,220,170,0.06)',
                  color: 'rgba(255,248,235,0.45)',
                  borderRadius: '100px',
                }}
              >
                <Icon size={13} strokeWidth={isActive ? 2.5 : 1.5} style={isActive ? { color: 'var(--amber)', flexShrink: 0 } : { flexShrink: 0 }} />
                <span className="text-xs">{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dots indicator — mobile only */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 md:hidden">
          {meditationCategories.map(cat => (
            <div
              key={cat.id}
              className="rounded-full transition-all duration-300"
              style={{
                width: selectedCategory === cat.id ? 14 : 4,
                height: 4,
                background: selectedCategory === cat.id ? 'var(--amber)' : 'rgba(255,220,170,0.2)',
              }}
            />
          ))}
        </div>

        {/* Session list — vertical on mobile, 2-col grid on md+ */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
          {...touchHandlers}
        >
          <div
            ref={contentRef}
            key={animKey}
            className={cn('px-4 pb-28 md:pb-8 pt-2 md:pt-3 min-h-full', animClass)}
            onAnimationEnd={() => setSwipeDir(null)}
          >
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p style={{ color: 'rgba(255,220,170,0.25)', fontSize: 13 }}>Нет сессий</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(session => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="text-left w-full transition-all duration-400 active:scale-[0.98]"
              >
                <div
                  className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: session.moodColor ?? 'rgba(255,248,235,0.04)',
                    border: '1px solid rgba(255,220,170,0.08)',
                    boxShadow: 'var(--shadow-card-sm)',
                    height: '100%',
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Play size={18} style={{ color: 'rgba(255,240,210,0.9)', marginLeft: 2 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm truncate">{session.title}</p>
                      {session.isFavorite && <Heart size={11} fill="currentColor" style={{ color: 'var(--rose)', flexShrink: 0 }} />}
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{session.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'rgba(255,220,170,0.4)' }}>
                      <Clock size={10} />
                      <span>{session.duration} мин</span>
                      <span style={{ opacity: 0.5 }}>·</span>
                      <span>{levelLabel[session.level]}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
