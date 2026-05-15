import type {
  Reminder, NotificationItem, NotificationKind, NotificationCategory,
  NotificationSettings, ActiveProgramState,
  StorePlanItem, DailySnapshot, Assessment,
} from '../types'
import { toDateKey, getStreakDays } from '../store/analytics'

// ── Context ───────────────────────────────────────────────────────────────────

export interface EngineSnapshot {
  reminders: Reminder[]
  activeProgram: ActiveProgramState | null
  planItems: StorePlanItem[]
  donePlanItemsByDay: Record<string, string[]>
  dailySnapshots: Record<string, DailySnapshot>
  assessmentsByDay: Record<string, Assessment>
}

export interface EngineContext {
  now: Date
  lastTickAt: number
  deliveredKeys: Set<string>
  settings: NotificationSettings
  snapshot: EngineSnapshot
}

// ── Day-of-week helpers ───────────────────────────────────────────────────────

const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const

export function todayDayLabel(date: Date): string {
  return DAY_LABELS[date.getDay()]
}

export function reminderMatchesToday(reminder: Reminder, now: Date): boolean {
  return reminder.days.includes(todayDayLabel(now))
}

// ── Time helpers ──────────────────────────────────────────────────────────────

function timeToMsToday(now: Date, hhmm: string): number {
  const [h, m] = hhmm.split(':').map(n => parseInt(n, 10))
  const d = new Date(now)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

/**
 * true if `hhmm` (in local time, today) falls in the window (lastTickAt, now].
 * On first run (lastTickAt = 0) we only consider the past 5 minutes — otherwise
 * the user would get a flood of stale fires for every reminder earlier today.
 */
export function shouldFireAtTime(hhmm: string, now: Date, lastTickAt: number): boolean {
  const target = timeToMsToday(now, hhmm)
  const nowMs = now.getTime()
  if (target > nowMs) return false
  const lower = lastTickAt > 0 ? lastTickAt : nowMs - 5 * 60_000
  return target > lower
}

// ── Dedup ─────────────────────────────────────────────────────────────────────

export function dedupKeyFor(kind: NotificationKind, sourceId: string, dateKey: string): string {
  return `${kind}:${sourceId}:${dateKey}`
}

// ── Icon picker by category/kind ──────────────────────────────────────────────

function iconForCategory(cat?: NotificationCategory): string {
  if (cat === 'meditation') return 'Brain'
  if (cat === 'breathing') return 'Wind'
  return 'Bell'
}

function iconForKind(kind: NotificationKind, category?: NotificationCategory): string {
  switch (kind) {
    case 'reminder': return iconForCategory(category)
    case 'program': return 'Sparkles'
    case 'streak': return 'Flame'
    case 'achievement': return 'Trophy'
    case 'summary_morning': return 'Sun'
    case 'summary_evening': return 'Moon'
    default: return 'Bell'
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function makeNotification(args: {
  kind: NotificationKind
  category?: NotificationCategory
  title: string
  body: string
  sourceId: string
  now: Date
  payload?: Record<string, unknown>
}): NotificationItem {
  const dateKey = toDateKey(args.now)
  return {
    id: genId(),
    kind: args.kind,
    category: args.category,
    title: args.title,
    body: args.body,
    icon: iconForKind(args.kind, args.category),
    createdAt: args.now.getTime(),
    dateKey,
    isRead: false,
    isDismissed: false,
    sourceId: args.sourceId,
    dedupKey: dedupKeyFor(args.kind, args.sourceId, dateKey),
    payload: args.payload,
  }
}

// ── Reminders ─────────────────────────────────────────────────────────────────

export function checkReminders(ctx: EngineContext): NotificationItem[] {
  if (!ctx.settings.categories.reminder) return []
  const out: NotificationItem[] = []
  for (const r of ctx.snapshot.reminders) {
    if (!r.isEnabled) continue
    if (!reminderMatchesToday(r, ctx.now)) continue
    if (!shouldFireAtTime(r.time, ctx.now, ctx.lastTickAt)) continue
    const item = makeNotification({
      kind: 'reminder',
      category: r.category,
      title: r.title,
      body: r.description?.trim() || 'Время для практики',
      sourceId: r.id,
      now: ctx.now,
      payload: { reminderId: r.id, time: r.time },
    })
    if (ctx.deliveredKeys.has(item.dedupKey!)) continue
    out.push(item)
  }
  return out
}

// ── Program ───────────────────────────────────────────────────────────────────

export function checkProgramNotifications(ctx: EngineContext): NotificationItem[] {
  if (!ctx.settings.categories.program) return []
  const ap = ctx.snapshot.activeProgram
  if (!ap) return []
  const dateKey = toDateKey(ctx.now)
  const programDayItems = ctx.snapshot.planItems.filter(
    p => p.source === 'program' && p.programId === ap.programId && p.programDayRef === ap.currentDay,
  )
  if (programDayItems.length === 0) return []
  const done = ctx.snapshot.donePlanItemsByDay[dateKey] ?? []
  const remaining = programDayItems.filter(p => !done.includes(p.id))
  if (remaining.length === 0) return []

  // Fire at 08:00 local (independent of summary time — programs have their own anchor)
  if (!shouldFireAtTime('08:00', ctx.now, ctx.lastTickAt)) return []

  const sourceId = `program-${ap.programId}-day-${ap.currentDay}`
  const dedup = dedupKeyFor('program', sourceId, dateKey)
  if (ctx.deliveredKeys.has(dedup)) return []

  const item = makeNotification({
    kind: 'program',
    title: `День ${ap.currentDay} программы`,
    body: remaining.length === 1
      ? `Сегодня: ${remaining[0].title}`
      : `Сегодня ${remaining.length} практик в программе`,
    sourceId,
    now: ctx.now,
    payload: { programId: ap.programId, currentDay: ap.currentDay },
  })
  return [item]
}

// ── Streaks ───────────────────────────────────────────────────────────────────

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

export function checkStreakMilestones(ctx: EngineContext): NotificationItem[] {
  if (!ctx.settings.categories.streak) return []
  const dateKey = toDateKey(ctx.now)
  const streak = getStreakDays(ctx.snapshot.dailySnapshots, dateKey)
  if (!STREAK_MILESTONES.includes(streak)) return []
  const sourceId = `streak-${streak}`
  const dedup = dedupKeyFor('streak', sourceId, dateKey)
  if (ctx.deliveredKeys.has(dedup)) return []
  // Already delivered earlier (regardless of date)? — check by sourceId prefix
  for (const k of ctx.deliveredKeys) {
    if (k.startsWith(`streak:${sourceId}:`)) return []
  }
  const item = makeNotification({
    kind: 'streak',
    title: `Стрик ${streak} дней`,
    body: streak >= 30 ? 'Невероятная стабильность — продолжайте!' : 'Так держать!',
    sourceId,
    now: ctx.now,
    payload: { streak },
  })
  return [item]
}

// ── Daily summary ─────────────────────────────────────────────────────────────

export function checkDailySummary(ctx: EngineContext): NotificationItem[] {
  const out: NotificationItem[] = []
  const dateKey = toDateKey(ctx.now)

  if (ctx.settings.categories.summaryMorning
      && shouldFireAtTime(ctx.settings.summaryMorningTime, ctx.now, ctx.lastTickAt)) {
    const sourceId = 'morning'
    const dedup = dedupKeyFor('summary_morning', sourceId, dateKey)
    if (!ctx.deliveredKeys.has(dedup)) {
      const planItemsToday = ctx.snapshot.planItems.length
      const body = planItemsToday > 0
        ? `В плане ${planItemsToday} ${pluralizePractice(planItemsToday)} — давайте начнём`
        : 'Начните день с осознанной практики'
      out.push(makeNotification({
        kind: 'summary_morning',
        title: 'Доброе утро',
        body,
        sourceId,
        now: ctx.now,
      }))
    }
  }

  if (ctx.settings.categories.summaryEvening
      && shouldFireAtTime(ctx.settings.summaryEveningTime, ctx.now, ctx.lastTickAt)) {
    const sourceId = 'evening'
    const dedup = dedupKeyFor('summary_evening', sourceId, dateKey)
    if (!ctx.deliveredKeys.has(dedup)) {
      const snap = ctx.snapshot.dailySnapshots[dateKey]
      const meditationMin = snap?.meditationMinutes ?? 0
      const breathingCount = snap?.breathingSessionCount ?? 0
      const body = (meditationMin === 0 && breathingCount === 0)
        ? 'Подведите итог дня и оцените самочувствие'
        : `Сегодня: ${meditationMin} мин медитации, ${breathingCount} ${pluralizePractice(breathingCount)} дыхания`
      out.push(makeNotification({
        kind: 'summary_evening',
        title: 'Итоги дня',
        body,
        sourceId,
        now: ctx.now,
      }))
    }
  }

  return out
}

function pluralizePractice(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'практика'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'практики'
  return 'практик'
}

// ── Aggregator ────────────────────────────────────────────────────────────────

export function computePendingNotifications(ctx: EngineContext): NotificationItem[] {
  if (!ctx.settings.enabled) return []
  return [
    ...checkReminders(ctx),
    ...checkProgramNotifications(ctx),
    ...checkStreakMilestones(ctx),
    ...checkDailySummary(ctx),
  ]
}
