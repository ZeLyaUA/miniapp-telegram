'use client'

import { useState } from 'react'
import { Heart, Play, Clock, Wind, ArrowUp, ArrowDown, RefreshCw, ArrowLeftRight } from 'lucide-react'
import { meditationSessions, breathingPractices } from '@/lib/demo-data'
import { GlassCard } from '@/components/layout/GlassCard'
import { cn } from '@/lib/utils'

type FilterId = 'all' | 'meditation' | 'breathing'

const breathingIconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  Wind, ArrowUp, ArrowDown, RefreshCw, ArrowLeftRight,
}

const levelLabel: Record<'beginner' | 'intermediate' | 'advanced', string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

interface FavoritesViewProps {
  favoriteMeditationIds: string[]
  favoriteBreathingIds: string[]
  onOpenMeditation: (sessionId: string) => void
  onOpenBreathing: (practiceId: string) => void
  onToggleMeditationFavorite: (id: string) => void
  onToggleBreathingFavorite: (id: string) => void
}

export function FavoritesView({
  favoriteMeditationIds,
  favoriteBreathingIds,
  onOpenMeditation,
  onOpenBreathing,
  onToggleMeditationFavorite,
  onToggleBreathingFavorite,
}: FavoritesViewProps) {
  const [filter, setFilter] = useState<FilterId>('all')

  const favMeditations = meditationSessions.filter(s => favoriteMeditationIds.includes(s.id))
  const favBreathing = breathingPractices.filter(p => favoriteBreathingIds.includes(p.id))
  const totalCount = favMeditations.length + favBreathing.length

  const showMeditations = (filter === 'all' || filter === 'meditation') && favMeditations.length > 0
  const showBreathing = (filter === 'all' || filter === 'breathing') && favBreathing.length > 0
  const showSectionTitles = filter === 'all'

  const chips: { id: FilterId; label: string; count: number }[] = [
    { id: 'all', label: 'Все', count: totalCount },
    { id: 'meditation', label: 'Медитации', count: favMeditations.length },
    { id: 'breathing', label: 'Дыхание', count: favBreathing.length },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 header-pt">
        <h1 className="text-white font-bold" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Избранное</h1>
        <p className="label-upper mt-1.5">Ваши любимые практики</p>
      </div>

      <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2">
        {chips.map(chip => {
          const isActive = filter === chip.id
          return (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all duration-300',
                'px-3.5 py-2 text-xs font-medium'
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
              <span>{chip.label}</span>
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px]"
                style={{
                  background: isActive ? 'rgba(201,150,90,0.2)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.45)',
                  minWidth: 18,
                  textAlign: 'center',
                }}
              >
                {chip.count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 pt-2 flex flex-col gap-3">
        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,220,170,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
            >
              <Heart size={26} strokeWidth={1.5} style={{ color: 'rgba(255,220,170,0.4)' }} />
            </div>
            <p className="text-white font-semibold text-sm mb-2">Пока ничего не сохранено</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,248,235,0.45)' }}>
              Нажмите на сердечко в карточке медитации или дыхательной практики, чтобы добавить её сюда.
            </p>
          </div>
        )}

        {totalCount > 0 && filter !== 'all' && (
          (filter === 'meditation' && favMeditations.length === 0) ||
          (filter === 'breathing' && favBreathing.length === 0)
        ) && (
          <div className="py-16 text-center">
            <p style={{ color: 'rgba(255,220,170,0.35)', fontSize: 13 }}>
              {filter === 'meditation' ? 'Нет сохранённых медитаций' : 'Нет сохранённых практик'}
            </p>
          </div>
        )}

        {showMeditations && (
          <>
            {showSectionTitles && <p className="label-upper mt-1">Медитации</p>}
            <div className="flex flex-col gap-3">
              {favMeditations.map(session => (
                <div
                  key={session.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenMeditation(session.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenMeditation(session.id) } }}
                  className="text-left w-full transition-all duration-400 active:scale-[0.98] cursor-pointer"
                >
                  <div
                    className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-4"
                    style={{
                      background: session.moodColor ?? 'rgba(255,248,235,0.04)',
                      border: '1px solid rgba(255,220,170,0.08)',
                      boxShadow: 'var(--shadow-card-sm)',
                    }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <Play size={18} style={{ color: 'rgba(255,240,210,0.9)', marginLeft: 2 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate pr-7">{session.title}</p>
                      <p className="text-xs mt-0.5 truncate pr-7" style={{ color: 'rgba(255,255,255,0.45)' }}>{session.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'rgba(255,220,170,0.4)' }}>
                        <Clock size={10} />
                        <span>{session.duration} мин</span>
                        <span style={{ opacity: 0.5 }}>·</span>
                        <span>{levelLabel[session.level]}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleMeditationFavorite(session.id) }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
                      style={{ background: 'rgba(0,0,0,0.18)' }}
                      aria-label="Убрать из избранного"
                    >
                      <Heart size={13} fill="currentColor" style={{ color: 'var(--rose)' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showBreathing && (
          <>
            {showSectionTitles && <p className="label-upper mt-3">Дыхание</p>}
            <div className="flex flex-col gap-3">
              {favBreathing.map(practice => {
                const Icon = breathingIconMap[practice.icon] ?? Wind
                return (
                  <div
                    key={practice.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenBreathing(practice.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenBreathing(practice.id) } }}
                    className="text-left w-full transition-all duration-400 active:scale-[0.98] cursor-pointer"
                  >
                    <GlassCard accent="amber" className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,150,90,0.12)' }}>
                        <Icon size={22} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{practice.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>{practice.subtitle}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: 'rgba(255,220,170,0.4)' }}>
                          <span>{practice.rounds} кругов</span>
                          {practice.inhale > 0 && <><span style={{ opacity: 0.5 }}>·</span><span>вдох {practice.inhale}с</span></>}
                          {practice.exhale > 0 && <><span style={{ opacity: 0.5 }}>·</span><span>выдох {practice.exhale}с</span></>}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleBreathingFavorite(practice.id) }}
                        className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90 flex-shrink-0"
                        style={{ background: 'rgba(0,0,0,0.18)' }}
                        aria-label="Убрать из избранного"
                      >
                        <Heart size={13} fill="currentColor" style={{ color: 'var(--rose)' }} />
                      </button>
                    </GlassCard>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
