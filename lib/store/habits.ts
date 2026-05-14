import type { WellnessEvent } from './types-events'
import type { Assessment } from '../types'

// ── Habit detectors ───────────────────────────────────────────────────────────
//
// A habit is no longer a manual toggle — it is a *pattern detector* over a
// user's day. The detector receives the day's events + assessment and answers
// a single question: did this habit happen today?
//
// Manual override via `habit_checked` event remains for offline credit.

export interface HabitDetectorContext {
  dateKey: string
  events: WellnessEvent[]          // pre-filtered to this dateKey
  assessment: Assessment | null
  doneTaskIds: string[]
}

export interface HabitDetector {
  id: string
  label: string
  icon: string
  description: string
  detect: (ctx: HabitDetectorContext) => boolean
}

function hourOf(ts: number): number {
  return new Date(ts).getHours()
}

const isCompletedSession = (e: WellnessEvent): boolean => {
  if (e.type === 'breathing_session_completed') return e.completedFull ?? true
  if (e.type === 'meditation_session_completed') return e.completedFull
  return false
}

export const HABIT_DETECTORS: HabitDetector[] = [
  {
    id: 'h1',
    label: 'Утренняя медитация',
    icon: 'Brain',
    description: 'Медитация до 11:00, не менее 5 минут',
    detect: ({ events }) => events.some(e =>
      e.type === 'meditation_session_completed'
      && e.actualDurationMinutes >= 5
      && hourOf(e.timestamp) < 11
    ),
  },
  {
    id: 'h2',
    label: 'Дыхательные упражнения',
    icon: 'Wind',
    description: 'Дыхательная практика доведена до конца',
    detect: ({ events }) => events.some(e =>
      e.type === 'breathing_session_completed'
      && (e.completedFull ?? true)
      && e.durationSeconds >= 60
    ),
  },
  {
    id: 'h3',
    label: 'Вечернее расслабление',
    icon: 'Moon',
    description: 'Сессия после 19:00',
    detect: ({ events }) => events.some(e =>
      (e.type === 'breathing_session_completed' || e.type === 'meditation_session_completed')
      && isCompletedSession(e)
      && hourOf(e.timestamp) >= 19
    ),
  },
  {
    id: 'h4',
    label: 'Осознанные паузы',
    icon: 'Pause',
    description: 'Минимум 2 сессии в разное время дня',
    detect: ({ events }) => {
      const windows = new Set<string>()
      for (const e of events) {
        if (e.type !== 'breathing_session_completed' && e.type !== 'meditation_session_completed') continue
        const h = hourOf(e.timestamp)
        windows.add(h < 12 ? 'morning' : h < 18 ? 'day' : 'evening')
      }
      return windows.size >= 2
    },
  },
  {
    id: 'h5',
    label: 'Благодарность',
    icon: 'Heart',
    description: '«Взгляд внутрь» заполнен (≥ 20 символов)',
    detect: ({ assessment }) => (assessment?.journal?.length ?? 0) >= 20,
  },
]

export const HABIT_DETECTORS_BY_ID: Record<string, HabitDetector> = Object.fromEntries(
  HABIT_DETECTORS.map(d => [d.id, d])
)
