'use client'

import { useState, useMemo } from 'react'
import { GlassCard } from '@/components/layout/GlassCard'
import { useWellnessState } from '@/lib/store/WellnessContext'
import { getMoodCorrelation, offsetDateKey } from '@/lib/store/analytics'

type Days = 7 | 14 | 30
const DAY_OPTIONS: { value: Days; label: string }[] = [
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
  { value: 30, label: '30 дней' },
]

const MOOD_LABELS = ['Плохо', 'Средне', 'Хорошо']
const SLEEP_LABELS = ['Плохой', 'Средний', 'Хороший']

function Sparkline({
  values, maxVal, color, dotRadius = 3, height = 60,
}: {
  values: (number | null)[]
  maxVal: number
  color: string
  dotRadius?: number
  height?: number
}) {
  const n = values.length
  if (n === 0) return null
  const w = 260
  const pad = 8
  const innerW = w - pad * 2
  const innerH = height - pad * 2

  const points: { x: number; y: number; val: number }[] = []
  values.forEach((v, i) => {
    if (v == null) return
    const x = pad + (i / (n - 1 || 1)) * innerW
    const y = pad + (1 - v / maxVal) * innerH
    points.push({ x, y, val: v })
  })

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const cx = (prev.x + p.x) / 2
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`
  }, '')

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} style={{ overflow: 'visible' }}>
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0.7}
        />
      )}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={dotRadius} fill={color} opacity={0.9} />
      ))}
    </svg>
  )
}

function TrendCard({
  title, color, values, labels, maxVal, dayLabels
}: {
  title: string
  color: string
  values: (number | null)[]
  labels: string[]
  maxVal: number
  dayLabels: string[]
}) {
  const defined = values.filter((v): v is number => v != null)
  const avg = defined.length > 0 ? defined.reduce((a, b) => a + b, 0) / defined.length : null

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="label-upper">{title}</p>
        {avg != null && (
          <span className="text-xs font-medium" style={{ color }}>
            ср. {avg.toFixed(1)}
          </span>
        )}
      </div>
      {defined.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: 'rgba(255,220,170,0.25)' }}>Нет данных</p>
      ) : (
        <>
          <Sparkline values={values} maxVal={maxVal} color={color} />
          <div className="flex justify-between mt-1">
            {dayLabels.slice(0, 5).map((l, i) => (
              <span key={i} className="text-[9px]" style={{ color: 'rgba(255,220,170,0.25)' }}>{l}</span>
            ))}
          </div>
          {avg != null && (
            <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,220,170,0.4)' }}>
              Обычно: {labels[Math.round(Math.min(avg, maxVal - 0.01))]}
            </p>
          )}
        </>
      )}
    </GlassCard>
  )
}

export function WellbeingTab() {
  const [days, setDays] = useState<Days>(14)
  const { assessmentsByDay, dailySnapshots } = useWellnessState()
  console.log('[WellbeingTab] render — snapshots:', Object.keys(dailySnapshots).length, 'assessments:', Object.keys(assessmentsByDay).length)

  const dayKeys = useMemo(
    () => Array.from({ length: days }, (_, i) => offsetDateKey(-(days - 1 - i))),
    [days]
  )

  const dayLabels = useMemo(
    () => dayKeys.map(k => new Date(k + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })),
    [dayKeys]
  )

  const moodValues = useMemo(() => dayKeys.map(k => assessmentsByDay[k]?.mood ?? null), [dayKeys, assessmentsByDay])
  const sleepValues = useMemo(() => dayKeys.map(k => assessmentsByDay[k]?.sleepQuality ?? null), [dayKeys, assessmentsByDay])
  const consValues = useMemo(() => dayKeys.map(k => assessmentsByDay[k]?.consciousness ?? null), [dayKeys, assessmentsByDay])

  const corr = useMemo(() => getMoodCorrelation(dailySnapshots, 'meditation'), [dailySnapshots])
  const corrBreath = useMemo(() => getMoodCorrelation(dailySnapshots, 'breathing'), [dailySnapshots])

  return (
    <div className="flex flex-col gap-3 mt-2 max-w-lg">
      {/* Day range selector */}
      <div
        className="flex gap-1 p-1 rounded-2xl"
        style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.06)' }}
      >
        {DAY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setDays(opt.value)}
            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-300"
            style={days === opt.value ? {
              background: 'rgba(139,117,207,0.2)',
              color: 'var(--violet)',
              border: '1px solid rgba(139,117,207,0.2)',
            } : {
              color: 'rgba(255,248,235,0.35)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Mood trend */}
      <TrendCard
        title="Самочувствие"
        color="var(--amber)"
        values={moodValues}
        labels={MOOD_LABELS}
        maxVal={2}
        dayLabels={dayLabels}
      />

      {/* Sleep trend */}
      <TrendCard
        title="Качество сна"
        color="var(--violet)"
        values={sleepValues}
        labels={SLEEP_LABELS}
        maxVal={2}
        dayLabels={dayLabels}
      />

      {/* Consciousness trend */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="label-upper">Осознанность</p>
          {consValues.filter(v => v != null).length > 0 && (
            <span className="text-xs font-medium" style={{ color: 'rgba(139,207,150,0.9)' }}>
              ср. {(consValues.filter((v): v is number => v != null).reduce((a, b) => a + b, 0) / consValues.filter(v => v != null).length).toFixed(1)}/10
            </span>
          )}
        </div>
        {consValues.filter(v => v != null).length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'rgba(255,220,170,0.25)' }}>Нет данных</p>
        ) : (
          <>
            <Sparkline values={consValues} maxVal={10} color="rgba(139,207,150,0.9)" />
            <div className="flex justify-between mt-1">
              {dayLabels.slice(0, 5).map((l, i) => (
                <span key={i} className="text-[9px]" style={{ color: 'rgba(255,220,170,0.25)' }}>{l}</span>
              ))}
            </div>
          </>
        )}
      </GlassCard>

      {/* Correlation insights */}
      {(corr.diff != null || corrBreath.diff != null) && (
        <GlassCard className="p-4">
          <p className="label-upper mb-3">Инсайты</p>
          <div className="flex flex-col gap-2">
            {corr.diff != null && Math.abs(corr.diff) >= 0.1 && (
              <div className="flex items-start gap-2">
                <span style={{ color: 'var(--amber)', fontSize: 14 }}>✦</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,248,235,0.6)' }}>
                  В дни медитации настроение в среднем на{' '}
                  <span style={{ color: corr.diff > 0 ? 'var(--amber)' : 'var(--violet)', fontWeight: 600 }}>
                    {Math.abs(corr.diff).toFixed(1)} пункта {corr.diff > 0 ? 'выше' : 'ниже'}
                  </span>
                </p>
              </div>
            )}
            {corrBreath.diff != null && Math.abs(corrBreath.diff) >= 0.1 && (
              <div className="flex items-start gap-2">
                <span style={{ color: 'var(--violet)', fontSize: 14 }}>✦</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,248,235,0.6)' }}>
                  После дыхательных практик настроение на{' '}
                  <span style={{ color: corrBreath.diff > 0 ? 'var(--amber)' : 'var(--violet)', fontWeight: 600 }}>
                    {Math.abs(corrBreath.diff).toFixed(1)} пункта {corrBreath.diff > 0 ? 'лучше' : 'хуже'}
                  </span>
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
