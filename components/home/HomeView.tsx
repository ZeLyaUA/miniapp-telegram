'use client'

import {
  Brain, Wind, CalendarCheck, BarChart3, Flame, Clock, ChevronRight,
  TrendingUp, ArrowUp, ArrowDown, Sparkles, Edit3, Droplet, Heart,
  type LucideIcon,
} from 'lucide-react'
import { OnboardingTour } from './OnboardingTour'
import type { SectionId, Insight } from '@/lib/types'

const quickActions: { id: SectionId; label: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { id: 'breathing', label: 'Дыхание', icon: Wind },
  { id: 'meditation', label: 'Медитация', icon: Brain },
  { id: 'plan', label: 'План', icon: CalendarCheck },
  { id: 'tracker', label: 'Трекер', icon: BarChart3 },
]

const INSIGHT_ICONS: Record<string, LucideIcon> = {
  Flame, TrendingUp, ArrowUp, ArrowDown, Sparkles, Edit3, Droplet, Heart,
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Доброе утро'
  if (h >= 12 && h < 17) return 'Добрый день'
  if (h >= 17 && h < 22) return 'Добрый вечер'
  return 'Доброй ночи'
}

function getDayCard() {
  const now = new Date()
  const date = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  const weekday = now.toLocaleDateString('ru-RU', { weekday: 'long' })
  return { date, weekday }
}

interface WellnessSnapshot {
  index: number
  practice: number
  vitality: number
  discipline: number
}

interface HomeViewProps {
  firstName: string | null
  onSectionSelect: (section: SectionId) => void
  streak?: number
  meditationMinutesToday?: number
  breathingSessionsToday?: number
  weekMinutes?: number
  wellness?: WellnessSnapshot
  weekWellness?: number[]
  insights?: Insight[]
  showTour?: boolean
  onTourDone?: () => void
}

const RU_DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function indexLabel(idx: number): string {
  if (idx >= 80) return 'Отличный день'
  if (idx >= 60) return 'Уверенный темп'
  if (idx >= 40) return 'Можно лучше'
  if (idx >= 20) return 'Слабый сигнал'
  return 'Тишина'
}

function indexColor(idx: number): string {
  if (idx >= 70) return 'var(--amber)'
  if (idx >= 40) return 'rgba(201,150,90,0.7)'
  return 'rgba(255,220,170,0.35)'
}

function WellnessRing({ wellness }: { wellness: WellnessSnapshot }) {
  const size = 132
  const stroke = 10
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, wellness.index)) / 100
  const dash = circ * pct
  const colour = indexColor(wellness.index)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,220,170,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: 'stroke-dasharray 600ms ease-out, stroke 400ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] tracking-widest" style={{ color: 'rgba(255,220,170,0.45)' }}>ИНДЕКС</span>
        <span className="text-white font-bold" style={{ fontSize: 36, lineHeight: 1 }}>{wellness.index}</span>
        <span className="text-[10px] mt-0.5" style={{ color: colour }}>{indexLabel(wellness.index)}</span>
      </div>
    </div>
  )
}

function WeekTimeline({ values }: { values: number[] }) {
  // values[6] is today by construction (trailing 7 days, oldest first).
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return RU_DAYS_SHORT[d.getDay()]
  })

  return (
    <div className="flex items-end gap-1.5 px-0.5" style={{ height: 56 }}>
      {values.map((v, i) => {
        const isToday = i === 6
        const h = Math.max(6, (v / 100) * 48)
        const colour = indexColor(v)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full rounded-md transition-all duration-500"
              style={{
                height: h,
                background: v > 0 ? colour : 'rgba(255,220,170,0.06)',
                opacity: v > 0 ? (isToday ? 1 : 0.55) : 1,
                boxShadow: isToday && v >= 50 ? '0 0 12px rgba(201,150,90,0.35)' : 'none',
              }}
            />
            <span className="text-[9px]" style={{ color: isToday ? 'var(--amber)' : 'rgba(255,220,170,0.35)' }}>
              {days[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const TONE_STYLES: Record<Insight['tone'], { bg: string; border: string; iconBg: string; iconColor: string; textColor: string }> = {
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

function InsightChip({ insight }: { insight: Insight }) {
  const Icon = INSIGHT_ICONS[insight.icon] ?? Sparkles
  const tone = TONE_STYLES[insight.tone]
  return (
    <div
      className="flex items-start gap-2.5 p-2.5 rounded-xl"
      style={{ background: tone.bg, border: tone.border }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: tone.iconBg }}
      >
        <Icon size={14} style={{ color: tone.iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-[12px] font-medium leading-tight" style={{ color: tone.textColor }}>
            {insight.title}
          </p>
          {insight.metric && (
            <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: tone.iconColor }}>
              {insight.metric}
            </span>
          )}
        </div>
        {insight.detail && (
          <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'rgba(255,220,170,0.45)' }}>
            {insight.detail}
          </p>
        )}
      </div>
    </div>
  )
}

export function HomeView({
  firstName,
  onSectionSelect,
  streak = 0,
  meditationMinutesToday = 0,
  breathingSessionsToday = 0,
  weekMinutes = 0,
  wellness = { index: 0, practice: 0, vitality: 0, discipline: 0 },
  weekWellness = [0, 0, 0, 0, 0, 0, 0],
  insights = [],
  showTour = false,
  onTourDone,
}: HomeViewProps) {
  const { date, weekday } = getDayCard()
  const colour = indexColor(wellness.index)

  return (
    <>
    {showTour && onTourDone && <OnboardingTour onDone={onTourDone} />}
    <div className="h-full overflow-y-auto scrollbar-hide">
    <div className="flex flex-col gap-4 px-4 pb-28 md:pb-6 header-pt-home">

      {/* Greeting */}
      <div>
        <p className="text-warm text-sm">{getGreeting()}{firstName ? ',' : ''}</p>
        <h1 className="text-white font-bold mt-0.5" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {firstName ?? 'ваш ритуал ждёт'}
        </h1>
      </div>

      {/* Two-column layout on lg+ */}
      <div className="flex flex-col lg:flex-row lg:gap-5 lg:items-start gap-4">

        {/* Left column: Wellness Index + day card + quick access */}
        <div className="flex flex-col gap-4 lg:w-3/5">

          {/* Wellness Index card — ring + 3 component bars + trailing 7-day */}
          <div
            className="rounded-3xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,248,235,0.04) 0%, rgba(201,150,90,0.06) 100%)',
              border: '1px solid rgba(255,220,170,0.10)',
              boxShadow: 'var(--shadow-card-lg), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-4">
              <WellnessRing wellness={wellness} />

              <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                {[
                  { label: 'Практика', value: wellness.practice, hint: `${meditationMinutesToday + (breathingSessionsToday > 0 ? 1 : 0)} сег.` },
                  { label: 'Самочувствие', value: wellness.vitality, hint: 'из карты дня' },
                  { label: 'Дисциплина', value: wellness.discipline, hint: `${streak} ${streak === 1 ? 'день' : 'дн.'}` },
                ].map(({ label, value, hint }) => (
                  <div key={label}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px]" style={{ color: 'rgba(255,220,170,0.55)' }}>{label}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(255,220,170,0.35)' }}>{hint}</span>
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

            {/* 7-day timeline */}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,220,170,0.08)' }}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] tracking-widest" style={{ color: 'rgba(255,220,170,0.4)' }}>7 ДНЕЙ</span>
                <span className="text-[10px]" style={{ color: colour }}>
                  ср. {Math.round(weekWellness.reduce((a, b) => a + b, 0) / Math.max(1, weekWellness.length))}
                </span>
              </div>
              <WeekTimeline values={weekWellness} />
            </div>
          </div>

          {/* Day card — compact */}
          <button
            onClick={() => onSectionSelect('daycard')}
            className="text-left w-full transition-all duration-500 active:scale-[0.98] active:opacity-90"
          >
            <div
              className="relative overflow-hidden rounded-2xl p-3.5 flex items-center justify-between gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(201,150,90,0.16) 0%, rgba(139,117,207,0.12) 100%)',
                border: '1px solid rgba(255,220,170,0.1)',
                boxShadow: 'var(--shadow-card-lg), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(201,150,90,0.20) 0%, transparent 70%)', filter: 'blur(20px)' }}
              />
              <div className="min-w-0 relative z-10">
                <span
                  className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-1.5"
                  style={{ background: 'rgba(255,220,170,0.10)', color: 'rgba(255,220,170,0.7)', letterSpacing: '0.06em' }}
                >
                  КАРТА ДНЯ
                </span>
                <h2 className="text-white font-bold text-base leading-tight">{date}</h2>
                <p className="text-white/50 text-xs capitalize">{weekday}</p>
              </div>
              <div
                className="flex items-center gap-1 px-3 py-1.5 rounded-full font-medium text-xs flex-shrink-0"
                style={{ background: 'rgba(255,220,170,0.15)', border: '1px solid rgba(255,220,170,0.2)', color: 'rgba(255,220,170,0.9)' }}
              >
                Открыть
                <ChevronRight size={12} />
              </div>
            </div>
          </button>

          {/* Quick access */}
          <div>
            <p className="label-upper mb-3">Быстрый доступ</p>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onSectionSelect(id)}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 active:scale-95"
                  style={{
                    background: 'rgba(255,248,235,0.06)',
                    border: '1px solid rgba(255,220,170,0.08)',
                    color: 'rgba(255,248,235,0.7)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,220,170,0.08)' }}
                  >
                    <Icon size={22} style={{ color: 'var(--amber)', opacity: 0.9 }} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: insights + compact stats */}
        <div className="flex flex-col gap-4 lg:flex-1">

          {/* Insights — what the app sees today */}
          {insights.length > 0 && (
            <div>
              <p className="label-upper mb-3">Что замечаю</p>
              <div className="flex flex-col gap-2">
                {insights.map(ins => <InsightChip key={ins.id} insight={ins} />)}
              </div>
            </div>
          )}

          {/* Compact stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Flame, label: 'Серия', value: `${streak}`, unit: 'дн.', color: 'var(--amber)' },
              { icon: Clock, label: 'Медит.', value: `${meditationMinutesToday}`, unit: 'мин', color: 'var(--violet)' },
              { icon: Wind, label: 'Дыхание', value: `${breathingSessionsToday}`, unit: 'сес.', color: 'var(--violet)' },
              { icon: Brain, label: 'Неделя', value: `${weekMinutes}`, unit: 'мин', color: 'var(--amber)' },
            ].map(({ icon: Icon, label, value, unit, color }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center p-2 rounded-xl"
                style={{
                  background: 'rgba(255,248,235,0.04)',
                  border: '1px solid rgba(255,220,170,0.06)',
                }}
              >
                <Icon size={12} style={{ color, opacity: 0.8 }} />
                <span className="text-white font-bold text-sm mt-1">{value}</span>
                <span className="text-[9px]" style={{ color: 'rgba(255,220,170,0.3)' }}>{label} {unit}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
    </div>
    </>
  )
}
