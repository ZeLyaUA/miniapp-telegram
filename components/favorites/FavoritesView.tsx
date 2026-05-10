'use client'

import { Heart, Play, Clock } from 'lucide-react'
import { meditationSessions } from '@/lib/demo-data'

const favorites = meditationSessions.filter(s => s.isFavorite)

export function FavoritesView() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 header-pt">
        <h1 className="text-white font-bold" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Избранное</h1>
        <p className="label-upper mt-1.5">Ваши любимые практики</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-3 mt-2">
        {favorites.map(session => (
          <div
            key={session.id}
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
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm truncate">{session.title}</p>
                <Heart size={11} fill="currentColor" style={{ color: 'var(--rose)', flexShrink: 0 }} />
              </div>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{session.description}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: 'rgba(255,220,170,0.4)' }}>
                <Clock size={10} />
                <span>{session.duration} мин</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
