'use client'

import { useState } from 'react'
import { Wind, Brain, Star, BookOpen, CheckCircle } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { useWellnessState } from '@/lib/store/WellnessContext'
import { getActivityLog } from '@/lib/store/analytics'
import type { ActivityLogEntry } from '@/lib/types'

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Wind, Brain, Star, BookOpen, CheckCircle,
}

type Filter = 'all' | 'breathing' | 'meditation' | 'assessment'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'meditation', label: 'Медитация' },
  { id: 'breathing', label: 'Дыхание' },
  { id: 'assessment', label: 'Оценки' },
]

function formatRelativeDate(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const hours = diff / 3600000

  if (hours < 1) return 'Только что'
  if (hours < 24) {
    const h = Math.floor(hours)
    return `${h} ${h === 1 ? 'час' : h < 5 ? 'часа' : 'часов'} назад`
  }
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Вчера'
  if (days < 7) return `${days} дня назад`
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

const typeColors: Record<string, string> = {
  breathing: 'var(--amber)',
  meditation: 'var(--violet)',
  assessment: 'rgba(139,207,150,0.9)',
  program: 'rgba(196,120,138,0.9)',
  task: 'rgba(255,248,235,0.4)',
}

const typeBg: Record<string, string> = {
  breathing: 'rgba(201,150,90,0.12)',
  meditation: 'rgba(139,117,207,0.12)',
  assessment: 'rgba(139,207,150,0.1)',
  program: 'rgba(196,120,138,0.1)',
  task: 'rgba(255,248,235,0.05)',
}

export function ActivityTab() {
  const [filter, setFilter] = useState<Filter>('all')
  const { events } = useWellnessState()

  const allEntries = getActivityLog(events, 100)
  const filtered = filter === 'all' ? allEntries : allEntries.filter(e => e.type === filter)

  return (
    <div className="flex flex-col gap-3 mt-2 max-w-lg">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
            style={filter === f.id ? {
              background: 'rgba(201,150,90,0.2)',
              color: 'var(--amber)',
              border: '1px solid rgba(201,150,90,0.25)',
            } : {
              background: 'rgba(255,248,235,0.05)',
              color: 'rgba(255,248,235,0.4)',
              border: '1px solid rgba(255,220,170,0.07)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm" style={{ color: 'rgba(255,220,170,0.3)' }}>
            {filter === 'all' ? 'Пока нет активности' : 'Нет записей в этой категории'}
          </p>
          {filter === 'all' && (
            <p className="text-xs mt-2" style={{ color: 'rgba(255,220,170,0.2)' }}>
              Выполните медитацию или дыхательную практику
            </p>
          )}
        </div>
      )}

      {/* Activity list */}
      {filtered.length > 0 && (
        <GlassCard className="overflow-hidden">
          {filtered.map((entry: ActivityLogEntry, i) => {
            const Icon = iconMap[entry.icon] ?? Star
            const color = typeColors[entry.type] ?? 'rgba(255,248,235,0.4)'
            const bg = typeBg[entry.type] ?? 'rgba(255,248,235,0.05)'
            const isLast = i === filtered.length - 1

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3"
                style={!isLast ? { borderBottom: '1px solid rgba(255,220,170,0.06)' } : {}}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,248,235,0.85)' }}>
                    {entry.title}
                  </p>
                  {entry.subtitle && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>
                      {entry.subtitle}
                    </p>
                  )}
                </div>
                <span className="text-[10px] flex-shrink-0 text-right" style={{ color: 'rgba(255,220,170,0.3)' }}>
                  {formatRelativeDate(entry.timestamp)}
                </span>
              </div>
            )
          })}
        </GlassCard>
      )}
    </div>
  )
}
