export type TabId = 'home' | 'favorites' | 'notifications' | 'profile'
export type SectionId = 'meditation' | 'breathing' | 'plan' | 'tracker' | 'daycard'

export interface DayTask {
  id: string
  title: string
  time?: string
  done: boolean
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

export interface Reminder {
  id: string
  title: string
  time: string
  days: string[]
  isEnabled: boolean
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
  startedAt: number       // timestamp
  currentDay: number      // 1-based
  completedDays: number[]
}

export interface Assessment {
  consciousness: number | null  // 1–10
  mood: 0 | 1 | 2 | null       // 0=плохо, 1=средне, 2=хорошо
  sleepQuality: 0 | 1 | 2 | null
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
