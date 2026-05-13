'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { dayCardBlocks, weekTheme } from '@/lib/demo-data'
import { useWellness, createEvent, syncEventToSupabase, syncStateToSupabase } from '@/lib/store/WellnessContext'
import type { WellnessEvent } from '@/lib/store/types-events'
import type { DayBlock } from '@/lib/types'

interface DayCardViewProps {
  onBack: () => void
}

function getDayInfo(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const date = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  const weekday = d.toLocaleDateString('ru-RU', { weekday: 'long' })
  const label = offset === 0 ? 'Сегодня' : offset === 1 ? 'Завтра' : offset === -1 ? 'Вчера' : weekday
  return { date, weekday, label }
}

// SVG faces
function FaceSad({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.5" />
      <circle cx="10" cy="12" r="1.5" fill={color} />
      <circle cx="18" cy="12" r="1.5" fill={color} />
      <path d="M9 19 Q14 15 19 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}
function FaceNeutral({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.5" />
      <circle cx="10" cy="12" r="1.5" fill={color} />
      <circle cx="18" cy="12" r="1.5" fill={color} />
      <line x1="9" y1="18" x2="19" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function FaceHappy({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.5" />
      <circle cx="10" cy="12" r="1.5" fill={color} />
      <circle cx="18" cy="12" r="1.5" fill={color} />
      <path d="M9 17 Q14 22 19 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// Moon quality icons for sleep
function MoonFull({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function MoonHalf({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
    </svg>
  )
}
function MoonOutline({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  )
}

const moodOptions = [
  { label: 'Плохо', Face: FaceSad },
  { label: 'Средне', Face: FaceNeutral },
  { label: 'Хорошо', Face: FaceHappy },
]

const sleepOptions = [
  { label: 'Плохой', Moon: MoonOutline },
  { label: 'Средний', Moon: MoonHalf },
  { label: 'Хороший', Moon: MoonFull },
]

// Block card with interactive checkboxes
function BlockCard({
  block,
  doneIds,
  onToggle,
}: {
  block: DayBlock
  doneIds: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <GlassCard accent={block.accent === 'none' ? undefined : block.accent} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{block.emoji}</span>
          <span className="label-upper">{block.label}</span>
        </div>
        <span className="text-xs" style={{ color: 'rgba(255,220,170,0.4)' }}>{block.timeRange}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {block.tasks.map(task => {
          const done = doneIds.has(task.id)
          return (
            <button
              key={task.id}
              onClick={() => onToggle(task.id)}
              className="flex items-center gap-3 text-left w-full transition-all duration-200 active:scale-[0.98]"
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300"
                style={done ? {
                  background: 'var(--amber)',
                  boxShadow: '0 0 8px rgba(201,150,90,0.4)',
                } : {
                  border: '1.5px solid rgba(255,220,170,0.22)',
                }}
              >
                {done && <div className="w-2 h-2 rounded-full bg-white opacity-90" />}
              </div>
              <span
                className="flex-1 text-sm"
                style={{
                  color: done ? 'rgba(255,248,235,0.3)' : 'rgba(255,248,235,0.75)',
                  textDecoration: done ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </span>
              {task.time && (
                <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,220,170,0.3)' }}>
                  {task.time}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}

// Progress ring card
function ProgressCard({ doneIds }: { doneIds: Set<string> }) {
  const total = dayCardBlocks.flatMap(b => b.tasks).length
  const done = doneIds.size
  const circumference = 2 * Math.PI * 32
  const progress = total > 0 ? done / total : 0

  return (
    <GlassCard accent="amber" className="p-4">
      <p className="label-upper mb-3">Итог дня</p>
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,220,170,0.08)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke="var(--amber)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${progress * circumference} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">{done}</span>
            <span className="text-xs" style={{ color: 'rgba(255,220,170,0.4)' }}>/{total}</span>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{done} из {total} выполнено</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,248,235,0.4)' }}>
            {done === 0 ? 'Начните свой день' : done === total ? 'День завершён! 🎉' : 'Продолжайте в том же духе'}
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

// Consciousness score + mood + sleep card
function AssessmentCard({
  score, onScore,
  mood, onMood,
  sleep, onSleep,
}: {
  score: number | null; onScore: (n: number) => void
  mood: number | null; onMood: (n: number) => void
  sleep: number | null; onSleep: (n: number) => void
}) {
  return (
    <GlassCard className="p-4">
      {/* Score row */}
      <div className="mb-4">
        <p className="label-upper mb-2.5">Оценка осознанности</p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => onScore(n)}
              className="w-8 h-8 rounded-full text-xs font-medium transition-all duration-200"
              style={score === n ? {
                background: 'var(--amber)',
                color: '#09070F',
                boxShadow: 'var(--glow-amber)',
              } : {
                background: 'rgba(255,248,235,0.05)',
                border: '1px solid rgba(255,220,170,0.1)',
                color: 'rgba(255,248,235,0.5)',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Mood + Sleep row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="label-upper mb-2.5">Самочувствие</p>
          <div className="flex flex-col gap-1.5">
            {moodOptions.map(({ label, Face }, i) => {
              const active = mood === i
              const color = active ? 'var(--amber)' : 'rgba(255,248,235,0.3)'
              return (
                <button
                  key={i}
                  onClick={() => onMood(i)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200"
                  style={active ? {
                    background: 'rgba(201,150,90,0.15)',
                    border: '1px solid rgba(201,150,90,0.3)',
                  } : {
                    background: 'rgba(255,248,235,0.04)',
                    border: '1px solid rgba(255,220,170,0.07)',
                  }}
                >
                  <Face color={color} />
                  <span className="text-xs" style={{ color: active ? 'rgba(255,220,170,0.9)' : 'rgba(255,248,235,0.4)' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="label-upper mb-2.5">Качество снов</p>
          <div className="flex flex-col gap-1.5">
            {sleepOptions.map(({ label, Moon }, i) => {
              const active = sleep === i
              const color = active ? 'var(--violet)' : 'rgba(255,248,235,0.3)'
              return (
                <button
                  key={i}
                  onClick={() => onSleep(i)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200"
                  style={active ? {
                    background: 'rgba(139,117,207,0.15)',
                    border: '1px solid rgba(139,117,207,0.3)',
                  } : {
                    background: 'rgba(255,248,235,0.04)',
                    border: '1px solid rgba(255,220,170,0.07)',
                  }}
                >
                  <Moon color={color} />
                  <span className="text-xs" style={{ color: active ? 'rgba(139,117,207,0.9)' : 'rgba(255,248,235,0.4)' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

// Weekly pillars card
function PillarsCard({
  pillarScores,
  onPillarScore,
}: {
  pillarScores: Record<string, number | null>
  onPillarScore: (id: string, score: number) => void
}) {
  return (
    <GlassCard accent="violet" className="p-4">
      <p className="label-upper mb-3">Параметры недели</p>
      <div className="flex flex-col gap-3">
        {weekTheme.pillars.map(({ id, label }) => {
          const active = pillarScores[id] ?? null
          return (
            <div key={id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs capitalize" style={{ color: 'rgba(255,248,235,0.5)' }}>{label}</span>
                {active !== null && (
                  <span className="text-xs font-medium" style={{ color: 'var(--violet)' }}>{active}/10</span>
                )}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => onPillarScore(id, n)}
                    className="flex-1 rounded-full transition-all duration-150"
                    style={{
                      height: 6,
                      background: active !== null && n <= active
                        ? 'var(--violet)'
                        : 'rgba(139,117,207,0.12)',
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

export function DayCardView({ onBack }: DayCardViewProps) {
  const [dayOffset, setDayOffset] = useState(0)
  const { state, dispatch } = useWellness()

  const getDateKey = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  const currentDateKey = getDateKey(dayOffset)
  const doneIds = new Set(state.doneTasksByDay[currentDateKey] ?? [])
  const assessment = state.assessmentsByDay[currentDateKey] ?? { consciousness: null, mood: null, sleepQuality: null }

  // Compute pillar scores for current week from events (last saved value per pillar)
  const pillarScores: Record<string, number | null> = Object.fromEntries(
    weekTheme.pillars.map(p => {
      const lastEvent = [...state.events].reverse().find(
        e => e.type === 'pillar_score_saved' &&
          (e as Extract<WellnessEvent, { type: 'pillar_score_saved' }>).pillarId === p.id &&
          (e as Extract<WellnessEvent, { type: 'pillar_score_saved' }>).weekNumber === weekTheme.week
      )
      const score = lastEvent
        ? (lastEvent as Extract<WellnessEvent, { type: 'pillar_score_saved' }>).score
        : null
      return [p.id, score]
    })
  )

  const { date, label } = getDayInfo(dayOffset)

  const syncState = useCallback(() => {
    syncStateToSupabase(state.userId, state)
  }, [state])

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', dateKey: currentDateKey, taskId: id })
    const event = createEvent({
      type: 'day_task_toggled',
      taskId: id,
      blockId: dayCardBlocks.find(b => b.tasks.some(t => t.id === id))?.id ?? '',
      done: !doneIds.has(id),
    })
    dispatch({ type: 'LOG_EVENT', event })
    syncEventToSupabase(state.userId, event)
    setTimeout(syncState, 100)
  }, [currentDateKey, dispatch, doneIds, state.userId, syncState])

  const saveAssessment = useCallback((updates: Partial<typeof assessment>) => {
    const next = { ...assessment, ...updates }
    dispatch({ type: 'SAVE_ASSESSMENT', dateKey: currentDateKey, assessment: next })
    const event = createEvent({
      type: 'daily_assessment_saved',
      consciousness: next.consciousness,
      mood: next.mood as 0 | 1 | 2 | null,
      sleepQuality: next.sleepQuality as 0 | 1 | 2 | null,
    })
    dispatch({ type: 'LOG_EVENT', event })
    syncEventToSupabase(state.userId, event)
    setTimeout(syncState, 100)
  }, [assessment, currentDateKey, dispatch, state.userId, syncState])

  const setPillarScore = useCallback((id: string, s: number) => {
    const event = createEvent({
      type: 'pillar_score_saved',
      pillarId: id,
      score: s,
      weekNumber: weekTheme.week,
    })
    dispatch({ type: 'LOG_EVENT', event })
    syncEventToSupabase(state.userId, event)
  }, [dispatch, state.userId])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="header-pt px-4 pb-3">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold" style={{ fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Карта дня
            </h1>
            <p className="label-upper mt-0.5">индивидуальная дорожная карта</p>
          </div>
        </div>

        {/* Day navigator */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-2xl mb-2"
          style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.07)' }}
        >
          <button
            onClick={() => setDayOffset(o => Math.max(o - 1, -6))}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'rgba(255,248,235,0.5)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <p className="text-white font-semibold text-sm capitalize">{date}</p>
            <p className="text-xs capitalize" style={{ color: 'rgba(255,220,170,0.45)' }}>{label}</p>
          </div>
          <button
            onClick={() => setDayOffset(o => Math.min(o + 1, 6))}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'rgba(255,248,235,0.5)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Week theme + pillars */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label-upper" style={{ color: 'rgba(255,220,170,0.5)' }}>
            Неделя {weekTheme.week} ·
          </span>
          {weekTheme.pillars.map(p => (
            <span
              key={p.id}
              className="text-xs px-2 py-0.5 rounded-full capitalize"
              style={{ background: 'rgba(201,150,90,0.08)', color: 'rgba(255,220,170,0.55)', border: '1px solid rgba(201,150,90,0.12)' }}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-3">
        {dayCardBlocks.map(block => (
          <BlockCard key={block.id} block={block} doneIds={doneIds} onToggle={toggleTask} />
        ))}
        <ProgressCard doneIds={doneIds} />
        <AssessmentCard
          score={assessment.consciousness} onScore={n => saveAssessment({ consciousness: n })}
          mood={assessment.mood} onMood={n => saveAssessment({ mood: n as 0 | 1 | 2 })}
          sleep={assessment.sleepQuality} onSleep={n => saveAssessment({ sleepQuality: n as 0 | 1 | 2 })}
        />
        <PillarsCard pillarScores={pillarScores} onPillarScore={setPillarScore} />
      </div>
    </div>
  )
}
