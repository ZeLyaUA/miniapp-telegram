'use client'

import { useMemo } from 'react'
import { GlassCard } from '@/components/layout/GlassCard'
import { useWellnessState } from '@/lib/store/WellnessContext'
import {
  computeWellnessIndex,
  computeInsights,
  offsetDateKey,
  computeDailySnapshot,
} from '@/lib/store/analytics'
import type { Insight, InsightTone } from '@/lib/types'
import {
  TrendingUp, TrendingDown, Flame, Heart, Activity, Repeat,
  Sparkles, ArrowUp, ArrowDown, Edit3, Droplet, Award,
  type LucideIcon,
} from 'lucide-react'

const INSIGHT_ICONS: Record<string, LucideIcon> = {
  Flame, TrendingUp, ArrowUp, ArrowDown, Sparkles, Edit3, Droplet, Heart, Award,
}

const RU_DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const RU_MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function formatRange(startKey: string, endKey: string): string {
  const s = new Date(startKey + 'T00:00:00')
  const e = new Date(endKey + 'T00:00:00')
  return `${s.getDate()} ${RU_MONTHS[s.getMonth()]} — ${e.getDate()} ${RU_MONTHS[e.getMonth()]}`
}

function indexColor(idx: number): string {
  if (idx >= 70) return 'var(--amber)'
  if (idx >= 40) return 'rgba(201,150,90,0.7)'
  return 'rgba(255,220,170,0.35)'
}

const TONE_STYLES: Record<InsightTone, { bg: string; border: string; iconBg: string; iconColor: string; textColor: string }> = {
  positive: {
    bg: 'rgba(201,150,90,0.10)',
    border: '1px solid rgba(201,150,90,0.30)',
    iconBg: 'rgba(201,150,90,0.20)',
    iconColor: 'var(--amber)',
    textColor: 'rgba(255,248,235,0.92)',
  },
  neutral: {
    bg: 'rgba(139,117,207,0.10)',
    border: '1px solid rgba(139,117,207,0.25)',
    iconBg: 'rgba(139,117,207,0.18)',
    iconColor: 'var(--violet)',
    textColor: 'rgba(255,248,235,0.85)',
  },
  caution: {
    bg: 'rgba(255,220,170,0.04)',
    border: '1px dashed rgba(255,220,170,0.25)',
    iconBg: 'rgba(255,220,170,0.08)',
    iconColor: 'rgba(255,220,170,0.7)',
    textColor: 'rgba(255,248,235,0.78)',
  },
}

function InsightRow({ insight }: { insight: Insight }) {
  const Icon = INSIGHT_ICONS[insight.icon] ?? Sparkles
  const tone = TONE_STYLES[insight.tone]
  return (
    <div
      className="flex items-start gap-2.5 p-2.5 rounded-xl"
      style={{ background: tone.bg, border: tone.border }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: tone.iconBg }}>
        <Icon size={14} style={{ color: tone.iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-[12px] font-medium leading-tight" style={{ color: tone.textColor }}>{insight.title}</p>
          {insight.metric && (
            <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: tone.iconColor }}>{insight.metric}</span>
          )}
        </div>
        {insight.detail && (
          <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'rgba(255,220,170,0.45)' }}>{insight.detail}</p>
        )}
      </div>
    </div>
  )
}

export function WeeklyReportTab() {
  const state = useWellnessState()

  const data = useMemo(() => {
    const todayKey = state.todayKey

    // Trailing 7 days (this week), and the 7 days before that (prior week).
    const thisWeekKeys = Array.from({ length: 7 }, (_, i) => offsetDateKey(-(6 - i)))
    const prevWeekKeys = Array.from({ length: 7 }, (_, i) => offsetDateKey(-(13 - i)))

    const perDay = thisWeekKeys.map(k => ({
      key: k,
      wi: computeWellnessIndex(state.events, state.assessmentsByDay, state.doneTasksByDay, k),
      snap: computeDailySnapshot(state.events, state.assessmentsByDay, state.doneTasksByDay, k),
    }))
    const prevPerDay = prevWeekKeys.map(k =>
      computeWellnessIndex(state.events, state.assessmentsByDay, state.doneTasksByDay, k)
    )

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

    const avgIndex = avg(perDay.map(d => d.wi.index))
    const avgPractice = avg(perDay.map(d => d.wi.practice))
    const avgVitality = avg(perDay.map(d => d.wi.vitality))
    const avgDiscipline = avg(perDay.map(d => d.wi.discipline))
    const prevAvgIndex = avg(prevPerDay.map(p => p.index))

    const totalMeditation = perDay.reduce((s, d) => s + d.snap.meditationMinutes, 0)
    const totalBreathingMinutes = perDay.reduce((s, d) => s + d.snap.breathingMinutes, 0)
    const totalBreathingSessions = perDay.reduce((s, d) => s + d.snap.breathingSessionCount, 0)
    const activeDays = perDay.filter(d => d.snap.hadActivity).length

    // Best and worst days
    const ranked = [...perDay].sort((a, b) => b.wi.index - a.wi.index)
    const bestDay = ranked[0]
    const worstDay = ranked[ranked.length - 1]

    const insights = computeInsights(state.events, state.assessmentsByDay, state.doneTasksByDay, todayKey, 6)

    return {
      thisWeekKeys,
      perDay,
      avgIndex,
      avgPractice,
      avgVitality,
      avgDiscipline,
      prevAvgIndex,
      delta: avgIndex - prevAvgIndex,
      totalMeditation,
      totalBreathingMinutes,
      totalBreathingSessions,
      activeDays,
      bestDay,
      worstDay,
      insights,
    }
  }, [state.events, state.assessmentsByDay, state.doneTasksByDay, state.todayKey])

  const rangeLabel = formatRange(data.thisWeekKeys[0], data.thisWeekKeys[6])
  const deltaUp = data.delta >= 0
  const colour = indexColor(data.avgIndex)

  return (
    <div className="flex flex-col gap-4 mt-2 max-w-2xl">
      {/* Header — week range + delta */}
      <div className="flex items-baseline justify-between px-1">
        <div>
          <p className="text-xs" style={{ color: 'rgba(255,220,170,0.45)' }}>Отчёт за неделю</p>
          <p className="text-sm" style={{ color: 'rgba(255,248,235,0.85)' }}>{rangeLabel}</p>
        </div>
        {data.prevAvgIndex > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
            style={{
              background: deltaUp ? 'rgba(201,150,90,0.15)' : 'rgba(255,220,170,0.06)',
              color: deltaUp ? 'var(--amber)' : 'rgba(255,220,170,0.5)',
            }}
          >
            {deltaUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {deltaUp ? '+' : ''}{data.delta} к прошлой
          </div>
        )}
      </div>

      {/* Average index hero */}
      <GlassCard accent={data.avgIndex >= 60 ? 'amber' : 'none'} className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-widest" style={{ color: 'rgba(255,220,170,0.45)' }}>СРЕДНИЙ</span>
            <span className="text-white font-bold" style={{ fontSize: 44, lineHeight: 1 }}>{data.avgIndex}</span>
            <span className="text-[10px] mt-0.5" style={{ color: colour }}>из 100</span>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {[
              { label: 'Практика', value: data.avgPractice, icon: Activity },
              { label: 'Самочувствие', value: data.avgVitality, icon: Heart },
              { label: 'Дисциплина', value: data.avgDiscipline, icon: Repeat },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Icon size={10} style={{ color: 'rgba(255,220,170,0.45)' }} />
                    <span className="text-[11px]" style={{ color: 'rgba(255,220,170,0.55)' }}>{label}</span>
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: indexColor(value) }}>{value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,220,170,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${value}%`, background: indexColor(value) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Per-day timeline */}
      <GlassCard className="p-4">
        <p className="text-[10px] tracking-widest mb-3" style={{ color: 'rgba(255,220,170,0.45)' }}>ПО ДНЯМ</p>
        <div className="flex items-end gap-1.5" style={{ height: 72 }}>
          {data.perDay.map((d, i) => {
            const isToday = i === 6
            const h = Math.max(6, (d.wi.index / 100) * 64)
            const c = indexColor(d.wi.index)
            const dateObj = new Date(d.key + 'T00:00:00')
            const dayLabel = RU_DAYS_SHORT[dateObj.getDay()]
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-semibold" style={{ color: d.wi.index > 0 ? c : 'rgba(255,220,170,0.25)' }}>
                  {d.wi.index > 0 ? d.wi.index : '·'}
                </span>
                <div
                  className="w-full rounded-md transition-all duration-500"
                  style={{
                    height: h,
                    background: d.wi.index > 0 ? c : 'rgba(255,220,170,0.06)',
                    opacity: d.wi.index > 0 ? (isToday ? 1 : 0.6) : 1,
                    boxShadow: isToday && d.wi.index >= 50 ? '0 0 10px rgba(201,150,90,0.3)' : 'none',
                  }}
                />
                <span className="text-[9px]" style={{ color: isToday ? 'var(--amber)' : 'rgba(255,220,170,0.35)' }}>{dayLabel}</span>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Best & worst */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { kind: 'best', icon: Award, label: 'Лучший день', day: data.bestDay, color: 'var(--amber)' },
          { kind: 'worst', icon: ArrowDown, label: 'Слабый день', day: data.worstDay, color: 'rgba(255,220,170,0.5)' },
        ].map(({ kind, icon: Icon, label, day, color }) => {
          const dateObj = new Date(day.key + 'T00:00:00')
          const dayLabel = RU_DAYS_SHORT[dateObj.getDay()]
          return (
            <div
              key={kind}
              className="rounded-2xl p-3"
              style={{
                background: 'rgba(255,248,235,0.04)',
                border: '1px solid rgba(255,220,170,0.08)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <Icon size={12} style={{ color }} />
                <span className="text-[10px] tracking-widest" style={{ color: 'rgba(255,220,170,0.45)' }}>{label.toUpperCase()}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-white font-bold text-xl">{day.wi.index}</span>
                <span className="text-[10px]" style={{ color: 'rgba(255,220,170,0.5)' }}>{dayLabel}</span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'rgba(255,220,170,0.4)' }}>
                {day.snap.meditationMinutes + day.snap.breathingMinutes} мин · {day.snap.assessment ? 'карта заполнена' : 'без карты'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Totals row */}
      <GlassCard className="p-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Активные', value: `${data.activeDays}`, unit: 'из 7' },
            { label: 'Медит.', value: `${data.totalMeditation}`, unit: 'мин' },
            { label: 'Дыхание', value: `${data.totalBreathingSessions}`, unit: 'сес.' },
            { label: 'Всего', value: `${data.totalMeditation + data.totalBreathingMinutes}`, unit: 'мин' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-white font-bold text-base">{stat.value}</span>
              <span className="text-[9px]" style={{ color: 'rgba(255,220,170,0.35)' }}>{stat.label}</span>
              <span className="text-[9px]" style={{ color: 'rgba(255,220,170,0.25)' }}>{stat.unit}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div>
          <p className="label-upper mb-2 px-1">Что заметил за неделю</p>
          <div className="flex flex-col gap-2">
            {data.insights.map(ins => <InsightRow key={ins.id} insight={ins} />)}
          </div>
        </div>
      )}

      {data.activeDays === 0 && (
        <div className="py-8 text-center">
          <p className="text-4xl mb-2">🌱</p>
          <p className="text-sm" style={{ color: 'rgba(255,220,170,0.4)' }}>Пока пусто. Сделайте короткую практику — отчёт оживёт.</p>
        </div>
      )}
    </div>
  )
}
