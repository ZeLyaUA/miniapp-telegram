export type TabId = 'home' | 'favorites' | 'notifications' | 'profile'
export type SectionId = 'meditation' | 'breathing' | 'plan' | 'tracker'

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
