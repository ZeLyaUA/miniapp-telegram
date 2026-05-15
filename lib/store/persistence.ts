import type { WellnessEvent } from './types-events'
import type {
  StorePlanItem, ActiveProgramState, Reminder, HabitDef, Assessment,
  NotificationItem, NotificationSettings, NotificationEngineState,
} from '../types'

const LS_EVENTS = 'wellness_events_v1'
const LS_STATE = 'wellness_state_v1'

export interface PersistedState {
  planItems: StorePlanItem[]
  doneTasksByDay: Record<string, string[]>
  assessmentsByDay: Record<string, Assessment>
  donePlanItemsByDay: Record<string, string[]>
  activeProgram: ActiveProgramState | null
  favoriteMeditationIds: string[]
  favoriteBreathingIds: string[]
  reminders: Reminder[]
  habits: HabitDef[]
  notifications: NotificationItem[]
  notificationSettings: NotificationSettings
  notificationEngineState: NotificationEngineState
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  channels: { inApp: true, telegramBot: false },
  categories: {
    reminder: true,
    program: true,
    streak: true,
    achievement: true,
    summaryMorning: true,
    summaryEvening: true,
  },
  summaryMorningTime: '08:30',
  summaryEveningTime: '21:00',
  haptic: true,
  showPopup: false,
}

const emptyState: PersistedState = {
  planItems: [],
  doneTasksByDay: {},
  assessmentsByDay: {},
  donePlanItemsByDay: {},
  activeProgram: null,
  favoriteMeditationIds: [],
  favoriteBreathingIds: [],
  reminders: [
    { id: 'r1', title: 'Утренняя медитация', time: '08:00', days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'], isEnabled: true, category: 'meditation' },
    { id: 'r2', title: 'Вечернее дыхание', time: '21:00', days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], isEnabled: true, category: 'breathing' },
    { id: 'r3', title: 'Выходной ритуал', time: '10:00', days: ['Сб', 'Вс'], isEnabled: false, category: 'general' },
  ],
  notifications: [],
  notificationSettings: defaultNotificationSettings,
  notificationEngineState: { lastTickAt: 0, deliveredKeys: [] },
  habits: [
    { id: 'h1', label: 'Утренняя медитация', icon: 'Brain' },
    { id: 'h2', label: 'Дыхательные упражнения', icon: 'Wind' },
    { id: 'h3', label: 'Вечернее расслабление', icon: 'Moon' },
    { id: 'h4', label: 'Осознанные паузы', icon: 'Pause' },
    { id: 'h5', label: 'Благодарность', icon: 'Heart' },
  ],
}

// ── localStorage ──────────────────────────────────────────────────────────────

export function loadEventsFromLS(): WellnessEvent[] {
  try {
    const raw = localStorage.getItem(LS_EVENTS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveEventsToLS(events: WellnessEvent[]): void {
  try { localStorage.setItem(LS_EVENTS, JSON.stringify(events)) } catch { /* ignore */ }
}

export function loadStateFromLS(): PersistedState {
  try {
    const raw = localStorage.getItem(LS_STATE)
    if (!raw) return emptyState
    return { ...emptyState, ...JSON.parse(raw) }
  } catch { return emptyState }
}

export function saveStateToLS(state: PersistedState): void {
  try { localStorage.setItem(LS_STATE, JSON.stringify(state)) } catch { /* ignore */ }
}

// ── API (SQLite → later Postgres) ─────────────────────────────────────────────

export async function loadEventsFromSupabase(userId: string): Promise<WellnessEvent[]> {
  try {
    const res = await fetch(`/api/wellness/events?user_id=${encodeURIComponent(userId)}`)
    if (!res.ok) return []
    const { events } = await res.json()
    return events ?? []
  } catch { return [] }
}

export async function saveEventToSupabase(userId: string, event: WellnessEvent): Promise<void> {
  try {
    await fetch('/api/wellness/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, event }),
    })
  } catch { /* ignore, will sync next time */ }
}

export async function loadStateFromSupabase(userId: string): Promise<PersistedState | null> {
  try {
    const res = await fetch(`/api/wellness/state?user_id=${encodeURIComponent(userId)}`)
    if (!res.ok) return null
    const { state } = await res.json()
    return state ? { ...emptyState, ...state } : null
  } catch { return null }
}

export async function saveStateToSupabase(userId: string, state: PersistedState): Promise<void> {
  try {
    await fetch('/api/wellness/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, state }),
    })
  } catch { /* ignore */ }
}
