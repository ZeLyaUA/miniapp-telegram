export type WellnessEventType =
  | 'breathing_session_completed'
  | 'meditation_session_completed'
  | 'day_task_toggled'
  | 'plan_item_toggled'
  | 'daily_assessment_saved'
  | 'pillar_score_saved'
  | 'program_started'
  | 'program_day_completed'
  | 'habit_checked'

interface WellnessEventBase {
  id: string
  type: WellnessEventType
  timestamp: number   // Date.now()
  dateKey: string     // YYYY-MM-DD local time
}

export interface BreathingCompletedEvent extends WellnessEventBase {
  type: 'breathing_session_completed'
  practiceId: string
  practiceName: string
  rounds: number
  durationSeconds: number
}

export interface MeditationCompletedEvent extends WellnessEventBase {
  type: 'meditation_session_completed'
  sessionId: string
  sessionTitle: string
  durationMinutes: number
  completedFull: boolean
  actualDurationMinutes: number
}

export interface DayTaskToggledEvent extends WellnessEventBase {
  type: 'day_task_toggled'
  taskId: string
  blockId: string
  done: boolean
}

export interface PlanItemToggledEvent extends WellnessEventBase {
  type: 'plan_item_toggled'
  itemId: string
  done: boolean
  source: 'manual' | 'program'
  programId?: string
}

export interface DailyAssessmentSavedEvent extends WellnessEventBase {
  type: 'daily_assessment_saved'
  consciousness: number | null
  mood: 0 | 1 | 2 | null
  sleepQuality: 0 | 1 | 2 | null
}

export interface PillarScoreSavedEvent extends WellnessEventBase {
  type: 'pillar_score_saved'
  pillarId: string
  score: number
  weekNumber: number
}

export interface ProgramStartedEvent extends WellnessEventBase {
  type: 'program_started'
  programId: string
  programTitle: string
  totalDays: number
}

export interface ProgramDayCompletedEvent extends WellnessEventBase {
  type: 'program_day_completed'
  programId: string
  dayNumber: number
}

export interface HabitCheckedEvent extends WellnessEventBase {
  type: 'habit_checked'
  habitId: string
  checked: boolean
}

export type WellnessEvent =
  | BreathingCompletedEvent
  | MeditationCompletedEvent
  | DayTaskToggledEvent
  | PlanItemToggledEvent
  | DailyAssessmentSavedEvent
  | PillarScoreSavedEvent
  | ProgramStartedEvent
  | ProgramDayCompletedEvent
  | HabitCheckedEvent

// Distributes Omit over union members so discriminated unions work correctly
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
export type WellnessEventPayload = DistributiveOmit<WellnessEvent, 'id' | 'timestamp' | 'dateKey'>
