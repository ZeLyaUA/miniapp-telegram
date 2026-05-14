import type { WellnessEvent } from './types-events'
import type { DailySnapshot, PeriodStats, ActivityLogEntry, Assessment, PillarId } from '../types'
import { dayCardBlocks } from '../demo-data'

// ── Pillar scoring (per-day) ──────────────────────────────────────────────────

interface PillarTaskAggregate {
  totalWeight: number
  taskWeights: Map<string, number>   // taskId → weight
}

const PILLAR_AGG_CACHE = new Map<PillarId, PillarTaskAggregate>()

function getPillarAggregate(pillarId: PillarId): PillarTaskAggregate {
  const cached = PILLAR_AGG_CACHE.get(pillarId)
  if (cached) return cached
  const taskWeights = new Map<string, number>()
  let totalWeight = 0
  for (const block of dayCardBlocks) {
    for (const task of block.tasks) {
      if (task.pillarTags?.includes(pillarId)) {
        const w = task.weight ?? 1
        taskWeights.set(task.id, w)
        totalWeight += w
      }
    }
  }
  const agg = { totalWeight, taskWeights }
  PILLAR_AGG_CACHE.set(pillarId, agg)
  return agg
}

export function getAutoPillarScore(pillarId: PillarId, doneTaskIds: string[]): number | null {
  const agg = getPillarAggregate(pillarId)
  if (agg.totalWeight === 0) return null
  let earned = 0
  for (const id of doneTaskIds) {
    const w = agg.taskWeights.get(id)
    if (w != null) earned += w
  }
  return Math.round((earned / agg.totalWeight) * 10 * 10) / 10
}

export function getManualPillarOverride(
  events: WellnessEvent[],
  pillarId: PillarId,
  dateKey: string,
): number | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]
    if (e.dateKey !== dateKey) continue
    if (e.type === 'pillar_score_saved' && e.pillarId === pillarId) return e.score
    if (e.type === 'pillar_score_cleared' && e.pillarId === pillarId) return null
  }
  return null
}

const ALL_PILLARS: PillarId[] = ['breathing', 'smile', 'nutrition', 'acceptance', 'silence']

export function getEffectivePillarScores(
  events: WellnessEvent[],
  doneTaskIds: string[],
  dateKey: string,
): { scores: Record<string, number>; overrides: Record<string, boolean> } {
  const scores: Record<string, number> = {}
  const overrides: Record<string, boolean> = {}
  for (const p of ALL_PILLARS) {
    const manual = getManualPillarOverride(events, p, dateKey)
    if (manual != null) {
      scores[p] = manual
      overrides[p] = true
    } else {
      const auto = getAutoPillarScore(p, doneTaskIds)
      if (auto != null) scores[p] = auto
      overrides[p] = false
    }
  }
  return { scores, overrides }
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function offsetDateKey(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return toDateKey(d)
}

function addDays(dateKey: string, days: number): string {
  const d = new Date(dateKey + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

function dateRange(startKey: string, endKey: string): string[] {
  const keys: string[] = []
  let cur = startKey
  while (cur <= endKey) {
    keys.push(cur)
    cur = addDays(cur, 1)
  }
  return keys
}

export function computeDailySnapshot(
  events: WellnessEvent[],
  assessmentsByDay: Record<string, Assessment>,
  doneTasksByDay: Record<string, string[]>,
  dateKey: string
): DailySnapshot {
  const dayEvents = events.filter(e => e.dateKey === dateKey)

  let meditationMinutes = 0
  let breathingSessionCount = 0
  let breathingMinutes = 0

  for (const e of dayEvents) {
    if (e.type === 'meditation_session_completed') {
      meditationMinutes += Math.round(e.actualDurationMinutes)
    }
    if (e.type === 'breathing_session_completed') {
      breathingSessionCount++
      breathingMinutes += Math.round(e.durationSeconds / 60)
    }
  }

  const doneTaskIds = doneTasksByDay[dateKey] ?? []
  const { scores: pillarScores } = getEffectivePillarScores(events, doneTaskIds, dateKey)

  const assessment = assessmentsByDay[dateKey] ?? null
  const hadActivity = meditationMinutes > 0 || breathingSessionCount > 0

  return { dateKey, meditationMinutes, breathingSessionCount, breathingMinutes, assessment, pillarScores, hadActivity }
}

export function computeAllSnapshots(
  events: WellnessEvent[],
  assessmentsByDay: Record<string, Assessment>,
  doneTasksByDay: Record<string, string[]>,
): Record<string, DailySnapshot> {
  const dateKeys = new Set(events.map(e => e.dateKey))
  Object.keys(assessmentsByDay).forEach(k => dateKeys.add(k))
  Object.keys(doneTasksByDay).forEach(k => dateKeys.add(k))
  const result: Record<string, DailySnapshot> = {}
  for (const key of dateKeys) {
    result[key] = computeDailySnapshot(events, assessmentsByDay, doneTasksByDay, key)
  }
  return result
}

export function getStreakDays(snapshots: Record<string, DailySnapshot>, today: string): number {
  let streak = 0
  let cur = today
  while (true) {
    const snap = snapshots[cur]
    if (!snap?.hadActivity) break
    streak++
    cur = addDays(cur, -1)
  }
  return streak
}

export function getPeriodStats(
  events: WellnessEvent[],
  assessmentsByDay: Record<string, Assessment>,
  doneTasksByDay: Record<string, string[]>,
  startDate: string,
  endDate: string,
  label: string
): PeriodStats {
  const days = dateRange(startDate, endDate)
  const dailyBreakdown = days.map(d => computeDailySnapshot(events, assessmentsByDay, doneTasksByDay, d))

  const meditationMinutes = dailyBreakdown.reduce((s, d) => s + d.meditationMinutes, 0)
  const breathingSessionCount = dailyBreakdown.reduce((s, d) => s + d.breathingSessionCount, 0)
  const breathingMinutes = dailyBreakdown.reduce((s, d) => s + d.breathingMinutes, 0)
  const activeDays = dailyBreakdown.filter(d => d.hadActivity).length

  const moodValues = dailyBreakdown.map(d => d.assessment?.mood).filter((v): v is 0 | 1 | 2 => v != null)
  const sleepValues = dailyBreakdown.map(d => d.assessment?.sleepQuality).filter((v): v is 0 | 1 | 2 => v != null)
  const consValues = dailyBreakdown.map(d => d.assessment?.consciousness).filter((v): v is number => v != null)

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  return {
    label,
    startDate,
    endDate,
    meditationMinutes,
    breathingSessionCount,
    breathingMinutes,
    activeDays,
    avgMood: avg(moodValues),
    avgSleep: avg(sleepValues),
    avgConsciousness: avg(consValues),
    dailyBreakdown,
  }
}

export function getWeekPeriod(weeksAgo: number): { start: string; end: string } {
  const today = new Date()
  const dayOfWeek = (today.getDay() + 6) % 7  // Mon=0, Sun=6
  const monday = new Date(today)
  monday.setDate(today.getDate() - dayOfWeek - weeksAgo * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: toDateKey(monday), end: toDateKey(sunday) }
}

export function getMonthPeriod(monthsAgo: number): { start: string; end: string } {
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth() - monthsAgo
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  return { start: toDateKey(first), end: toDateKey(last) }
}

export function getYearPeriod(yearsAgo: number): { start: string; end: string } {
  const y = new Date().getFullYear() - yearsAgo
  return { start: `${y}-01-01`, end: `${y}-12-31` }
}

export function getActivityLog(events: WellnessEvent[], limit = 50): ActivityLogEntry[] {
  const relevant = events
    .filter(e => ['breathing_session_completed', 'meditation_session_completed', 'daily_assessment_saved', 'program_started', 'program_day_completed'].includes(e.type))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)

  return relevant.map(e => {
    if (e.type === 'breathing_session_completed') {
      return {
        id: e.id,
        timestamp: e.timestamp,
        dateKey: e.dateKey,
        type: 'breathing' as const,
        title: e.practiceName,
        subtitle: `${e.rounds} кругов · ${Math.round(e.durationSeconds / 60)} мин`,
        icon: 'Wind',
      }
    }
    if (e.type === 'meditation_session_completed') {
      return {
        id: e.id,
        timestamp: e.timestamp,
        dateKey: e.dateKey,
        type: 'meditation' as const,
        title: e.sessionTitle,
        subtitle: `${Math.round(e.actualDurationMinutes)} мин${!e.completedFull ? ' (прервана)' : ''}`,
        icon: 'Brain',
      }
    }
    if (e.type === 'daily_assessment_saved') {
      const moodLabel = e.mood === 2 ? 'Хорошо' : e.mood === 1 ? 'Средне' : e.mood === 0 ? 'Плохо' : ''
      return {
        id: e.id,
        timestamp: e.timestamp,
        dateKey: e.dateKey,
        type: 'assessment' as const,
        title: 'Оценка дня',
        subtitle: [moodLabel, e.consciousness != null ? `Осознанность ${e.consciousness}/10` : ''].filter(Boolean).join(' · '),
        icon: 'Star',
      }
    }
    if (e.type === 'program_started') {
      return {
        id: e.id,
        timestamp: e.timestamp,
        dateKey: e.dateKey,
        type: 'program' as const,
        title: `Начата программа`,
        subtitle: e.programTitle,
        icon: 'BookOpen',
      }
    }
    // program_day_completed
    const pd = e as Extract<WellnessEvent, { type: 'program_day_completed' }>
    return {
      id: pd.id,
      timestamp: pd.timestamp,
      dateKey: pd.dateKey,
      type: 'program' as const,
      title: `День ${pd.dayNumber} программы завершён`,
      icon: 'CheckCircle',
    }
  })
}

export function getHabitCheckedDays(events: WellnessEvent[], habitId: string, days = 7): boolean[] {
  const result: boolean[] = []
  for (let i = days - 1; i >= 0; i--) {
    const key = offsetDateKey(-i)
    const checked = events
      .filter(e => e.type === 'habit_checked' && e.dateKey === key)
      .filter(e => (e as Extract<WellnessEvent, { type: 'habit_checked' }>).habitId === habitId)
    const last = checked[checked.length - 1] as Extract<WellnessEvent, { type: 'habit_checked' }> | undefined
    result.push(last?.checked === true)
  }
  return result
}

export function getHabitStreak(events: WellnessEvent[], habitId: string): number {
  let streak = 0
  let offset = 0
  while (true) {
    const key = offsetDateKey(-offset)
    const dayEvents = events.filter(e => e.type === 'habit_checked' && e.dateKey === key)
      .filter(e => (e as Extract<WellnessEvent, { type: 'habit_checked' }>).habitId === habitId)
    const last = dayEvents[dayEvents.length - 1] as Extract<WellnessEvent, { type: 'habit_checked' }> | undefined
    if (last?.checked !== true) break
    streak++
    offset++
    if (offset > 365) break
  }
  return streak
}

export function getMoodCorrelation(
  snapshots: Record<string, DailySnapshot>,
  metric: 'meditation' | 'breathing'
): { withPractice: number | null; withoutPractice: number | null; diff: number | null } {
  const withMood: number[] = []
  const withoutMood: number[] = []

  for (const snap of Object.values(snapshots)) {
    if (snap.assessment?.mood == null) continue
    const hasPractice = metric === 'meditation' ? snap.meditationMinutes > 0 : snap.breathingSessionCount > 0
    if (hasPractice) withMood.push(snap.assessment.mood)
    else withoutMood.push(snap.assessment.mood)
  }

  const avg = (arr: number[]) => arr.length >= 2 ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  const w = avg(withMood)
  const wo = avg(withoutMood)
  return {
    withPractice: w != null ? Math.round(w * 10) / 10 : null,
    withoutPractice: wo != null ? Math.round(wo * 10) / 10 : null,
    diff: w != null && wo != null ? Math.round((w - wo) * 10) / 10 : null,
  }
}
