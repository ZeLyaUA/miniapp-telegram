'use client'

import { Heart, Play, Clock } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { meditationSessions } from '@/lib/demo-data'

const favorites = meditationSessions.filter(s => s.isFavorite)

export function FavoritesView() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h1 className="text-white font-bold text-xl">Избранное</h1>
        <p className="text-white/40 text-sm mt-0.5">Ваши любимые практики</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 flex flex-col gap-3 mt-2">
        {favorites.map(session => (
          <GlassCard key={session.id} className="p-4 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,107,53,0.12)', boxShadow: 'var(--glow-orange)' }}
            >
              <Play size={20} className="text-neon-orange" style={{ marginLeft: 2 }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-medium text-sm truncate">{session.title}</p>
                <Heart size={12} className="text-neon-orange flex-shrink-0" fill="currentColor" />
              </div>
              <p className="text-white/40 text-xs mt-0.5 truncate">{session.description}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Clock size={11} className="text-white/30" />
                <span className="text-white/30 text-xs">{session.duration} мин</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
