'use client'

import { useState } from 'react'
import { Play, Heart, Clock, ChevronLeft, Flame, Waves, Moon, Zap, Star } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { meditationCategories, meditationSessions } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import type { MeditationSession } from '@/lib/types'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
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
  const [isPlaying, setIsPlaying] = useState(false)

  const filtered = selectedCategory === 'favorites'
    ? meditationSessions.filter(s => s.isFavorite)
    : meditationSessions.filter(s => s.category === selectedCategory)

  if (selectedSession) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 pb-3">
          <button
            onClick={() => { setSelectedSession(null); setIsPlaying(false) }}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
            style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
          </button>
          <span style={{ color: 'rgba(255,220,170,0.4)', fontSize: 13 }}>Медитация</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-4">
          {/* Hero card with mood gradient */}
          <div
            className="rounded-3xl p-6 flex flex-col gap-4"
            style={{
              background: selectedSession.moodColor ?? 'linear-gradient(135deg, rgba(201,150,90,0.3) 0%, rgba(139,117,207,0.2) 100%)',
              border: '1px solid rgba(255,220,170,0.1)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
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
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-400 active:scale-[0.97]"
            style={{
              background: isPlaying
                ? 'rgba(139,117,207,0.2)'
                : 'linear-gradient(135deg, rgba(201,150,90,0.8), rgba(201,150,90,0.5))',
              border: `1px solid ${isPlaying ? 'rgba(139,117,207,0.3)' : 'rgba(201,150,90,0.3)'}`,
              boxShadow: isPlaying ? 'var(--glow-violet)' : 'var(--glow-amber)',
              color: isPlaying ? 'var(--violet)' : 'rgba(255,240,210,0.95)',
            }}
          >
            {isPlaying ? 'Пауза' : 'Начать медитацию'}
          </button>

          {isPlaying && (
            <GlassCard accent="violet" className="p-4 text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--violet)' }}>
                Закройте глаза. Сосредоточьтесь на дыхании.
              </p>
              <p className="text-xs mt-1.5" style={{ color: 'rgba(255,220,170,0.3)' }}>
                {selectedSession.duration} минут · не беспокоить
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-3">
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

      {/* Category filter */}
      <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2">
        {meditationCategories.map(cat => {
          const Icon = iconMap[cat.icon] ?? Play
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all duration-300',
                isActive ? 'text-white' : ''
              )}
              style={{
                borderRadius: '100px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(201,150,90,0.3), rgba(201,150,90,0.12))'
                  : 'rgba(255,248,235,0.05)',
                border: isActive
                  ? '1px solid rgba(201,150,90,0.3)'
                  : '1px solid rgba(255,220,170,0.06)',
                color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.45)',
              }}
            >
              <Icon size={13} strokeWidth={isActive ? 2.5 : 1.5} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Session list — album art style */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-3 mt-2">
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p style={{ color: 'rgba(255,220,170,0.25)', fontSize: 13 }}>Нет сессий</p>
          </div>
        )}
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
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              {/* Play button */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <Play size={18} style={{ color: 'rgba(255,240,210,0.9)', marginLeft: 2 }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">{session.title}</p>
                  {session.isFavorite && (
                    <Heart size={11} fill="currentColor" style={{ color: 'var(--rose)', flexShrink: 0 }} />
                  )}
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {session.description}
                </p>
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
  )
}
