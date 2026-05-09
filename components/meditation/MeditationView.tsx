'use client'

import { useState } from 'react'
import { Play, Heart, Clock, ChevronLeft, Flame, Waves, Moon, Zap, Star } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { meditationCategories, meditationSessions } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import type { MeditationSession } from '@/lib/types'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
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
        <div className="flex items-center gap-3 p-4 pb-2">
          <button
            onClick={() => { setSelectedSession(null); setIsPlaying(false) }}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <span className="text-white/60 text-sm">Медитация</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 flex flex-col gap-4">
          <GlassCard className="p-6 flex flex-col items-center gap-4 mt-2">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(0,212,255,0.05) 100%)',
                boxShadow: 'var(--glow-cyan)',
              }}
            >
              <Brain24 />
            </div>
            <div className="text-center">
              <h2 className="text-white text-xl font-bold">{selectedSession.title}</h2>
              <p className="text-white/50 text-sm mt-1">{selectedSession.description}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <Clock size={14} />
                {selectedSession.duration} мин
              </div>
              <div className="text-white/30">•</div>
              <div className="text-white/50 text-sm">{levelLabel[selectedSession.level]}</div>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-200 active:scale-95"
              style={{
                background: isPlaying
                  ? 'rgba(255,107,53,0.2)'
                  : 'linear-gradient(135deg, var(--neon-cyan), rgba(0,180,220,1))',
                boxShadow: isPlaying ? 'var(--glow-orange)' : 'var(--glow-cyan)',
              }}
            >
              {isPlaying ? 'Пауза' : 'Начать медитацию'}
            </button>
          </GlassCard>
          {isPlaying && (
            <GlassCard accent="cyan" className="p-4 text-center">
              <p className="text-neon-cyan text-sm font-medium">Закройте глаза и сосредоточьтесь на дыхании...</p>
              <p className="text-white/40 text-xs mt-1">{selectedSession.duration} минут · Не беспокоить</p>
            </GlassCard>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-2">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Медитация</h1>
          <p className="text-white/40 text-xs">Спокойствие и фокус</p>
        </div>
      </div>

      <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2">
        {meditationCategories.map(cat => {
          const Icon = iconMap[cat.icon] ?? Play
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
                isActive
                  ? 'text-white glow-cyan'
                  : 'text-white/50'
              )}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,212,255,0.1))'
                  : 'rgba(255,255,255,0.05)',
                border: isActive ? '1px solid rgba(0,212,255,0.4)' : '1px solid transparent',
              }}
            >
              <Icon size={14} style={isActive ? { color: 'var(--neon-cyan)' } : {}} />
              {cat.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-white/30 text-sm">Нет сессий в этой категории</p>
          </div>
        )}
        {filtered.map(session => (
          <button
            key={session.id}
            onClick={() => setSelectedSession(session)}
            className="text-left w-full transition-transform duration-150 active:scale-[0.98]"
          >
            <GlassCard className="p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,212,255,0.12)', boxShadow: 'var(--glow-cyan)' }}
              >
                <Play size={20} className="text-neon-cyan" style={{ marginLeft: 2 }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm truncate">{session.title}</p>
                  {session.isFavorite && <Heart size={12} className="text-neon-orange flex-shrink-0" fill="currentColor" />}
                </div>
                <p className="text-white/40 text-xs mt-0.5 truncate">{session.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Clock size={11} className="text-white/30" />
                  <span className="text-white/30 text-xs">{session.duration} мин</span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/30 text-xs">{levelLabel[session.level]}</span>
                </div>
              </div>
            </GlassCard>
          </button>
        ))}
      </div>
    </div>
  )
}

function Brain24() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.6A3 3 0 0 1 3.1 9.6a2.5 2.5 0 0 1 2.4-5.1A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.6A3 3 0 0 0 20.9 9.6a2.5 2.5 0 0 0-2.4-5.1A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  )
}
