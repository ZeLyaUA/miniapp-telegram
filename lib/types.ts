export type TabId = 'home' | 'favorites' | 'notifications' | 'profile'
export type SectionId = 'meditation' | 'breathing' | 'plan' | 'tracker' | 'daycard'

export type PillarId = 'breathing' | 'smile' | 'nutrition' | 'acceptance' | 'silence'

export interface TaskAutoSource {
  type: 'breathing' | 'meditation'
  refId: string
  minMinutes?: number
}

export interface DayTask {
  id: string
  title: string
  time?: string
  done: boolean
  pillarTags?: PillarId[]
  weight?: number
  autoSource?: TaskAutoSource
}

export interface DayBlock {
  id: string
  label: string
  timeRange: string
  emoji: string
  accent: 'amber' | 'violet' | 'none'
  tasks: DayTask[]
}

export interface WeekPillar {
  id: string
  label: string
}

export interface WeekTheme {
  week: number
  title: string
  pillars: WeekPillar[]
}

export interface MeditationCategory {
  id: string
  label: string
  sublabel: string
  icon: string
}

export interface MeditationSession {
  id: string
  title: string
  description: string
  duration: number
  category: string
  isFavorite: boolean
  level: 'beginner' | 'intermediate' | 'advanced'
  moodColor?: string
}

export interface BreathingPractice {
  id: string
  name: string
  subtitle: string
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
  rounds: number
  description: string
  icon: string
  howTo?: string[]
}

export type ProgramStepType = 'breathing' | 'meditation'

export interface ProgramStep {
  type: ProgramStepType
  refId: string
  title: string
  duration: string
}

export interface ProgramDay {
  day: number
  title: string
  steps: ProgramStep[]
}

export interface Goal {
  id: string
  title: string
  subtitle: string
  progress: number
  target: string
  icon: string
}

export interface Program {
  id: string
  title: string
  duration: string
  sessions: number
  description: string
  isActive: boolean
  days?: ProgramDay[]
}

export type NotificationCategory = 'meditation' | 'breathing' | 'general'

export interface Reminder {
  id: string
  title: string
  time: string
  days: string[]
  isEnabled: boolean
  category?: NotificationCategory
  description?: string
}

export type NotificationKind =
  | 'reminder'
  | 'program'
  | 'streak'
  | 'achievement'
  | 'summary_morning'
  | 'summary_evening'
  | 'system'

export interface NotificationItem {
  id: string
  kind: NotificationKind
  category?: NotificationCategory
  title: string
  body: string
  icon: string
  createdAt: number
  dateKey: string
  isRead: boolean
  isDismissed: boolean
  sourceId?: string
  dedupKey?: string
  payload?: Record<string, unknown>
}

export interface NotificationChannelSettings {
  inApp: boolean
  telegramBot: boolean
}

export interface NotificationCategorySettings {
  reminder: boolean
  program: boolean
  streak: boolean
  achievement: boolean
  summaryMorning: boolean
  summaryEvening: boolean
}

export interface NotificationSettings {
  enabled: boolean
  channels: NotificationChannelSettings
  categories: NotificationCategorySettings
  summaryMorningTime: string
  summaryEveningTime: string
  haptic: boolean
  showPopup: boolean
}

export interface NotificationEngineState {
  lastTickAt: number
  deliveredKeys: string[]
}

export interface Habit {
  id: string
  label: string
  icon: string
  completedDays: boolean[]
  streak: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  isUnlocked: boolean
  progress?: number
}

export interface DailyStats {
  meditationMinutes: number
  breathingSessions: number
  streak: number
  weekData: number[]
}

// ── Store types ───────────────────────────────────────────────────────────────

export interface StorePlanItem {
  id: string
  title: string
  time: string
  duration: string
  section: 'Утро' | 'День' | 'Вечер'
  source: 'manual' | 'program'
  programId?: string
  programDayRef?: number
  practiceType?: 'breathing' | 'meditation'
  practiceRefId?: string
}

export interface ActiveProgramState {
  programId: string
  startedAt: number                                // timestamp
  currentDay: number                               // 1-based
  completedDays: number[]
  scheduledByDateKey?: Record<string, number>      // calendar day → programDay user worked on
  skippedDays?: number[]                           // programDays explicitly skipped
}

export interface Assessment {
  consciousness: number | null  // 1–10
  mood: 0 | 1 | 2 | null        // 0=плохо, 1=средне, 2=хорошо
  sleepQuality: 0 | 1 | 2 | null
  energy: number | null         // 1–10
  water: number | null          // 0–8 cups
  journal: string | null        // short reflection
}

export interface HabitDef {
  id: string
  label: string
  icon: string
}

export interface DailySnapshot {
  dateKey: string
  meditationMinutes: number
  breathingSessionCount: number
  breathingMinutes: number
  assessment: Assessment | null
  pillarScores: Record<string, number>
  hadActivity: boolean
  // Phase F additions — composite scores. Optional so legacy snapshots stay valid.
  wellnessIndex?: number       // 0–100 composite for the day
  discipline?: number          // 0–100 cadence/consistency component
  vitality?: number            // 0–100 body-signals component (mood/energy/sleep/water)
  practice?: number            // 0–100 actual practice volume component
}

export type InsightTone = 'positive' | 'neutral' | 'caution'

export interface Insight {
  id: string
  tone: InsightTone
  icon: string         // lucide icon name
  title: string
  detail?: string
  metric?: string      // optional small numeric tag, e.g. "+1.4"
}

export interface PeriodStats {
  label: string
  startDate: string
  endDate: string
  meditationMinutes: number
  breathingSessionCount: number
  breathingMinutes: number
  activeDays: number
  avgMood: number | null
  avgSleep: number | null
  avgConsciousness: number | null
  dailyBreakdown: DailySnapshot[]
}

export interface ActivityLogEntry {
  id: string
  timestamp: number
  dateKey: string
  type: 'breathing' | 'meditation' | 'assessment' | 'task' | 'program'
  title: string
  subtitle?: string
  icon: string
}
