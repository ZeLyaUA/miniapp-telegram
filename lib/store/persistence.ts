import { createClient } from '@/utils/supabase/client'
import type { WellnessEvent } from './types-events'
import type { StorePlanItem, ActiveProgramState, Reminder, HabitDef, Assessment } from '../types'

const LS_EVENTS = 'wellness_events_v1'
const LS_STATE = 'wellness_state_v1'

export interface PersistedState {
  planItems: StorePlanItem[]
  doneTasksByDay: Record<string, string[]>
  assessmentsByDay: Record<string, Assessment>
  donePlanItemsByDay: Record<string, string[]>
  activeProgram: ActiveProgramState | null
  favoriteMeditationIds: string[]
  reminders: Reminder[]
  habits: HabitDef[]
}

const emptyState: PersistedState = {
  planItems: [],
  doneTasksByDay: {},
  assessmentsByDay: {},
  donePlanItemsByDay: {},
  activeProgram: null,
  favoriteMeditationIds: [],
  reminders: [],
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

// ── Supabase ──────────────────────────────────────────────────────────────────

export async function loadEventsFromSupabase(userId: string): Promise<WellnessEvent[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wellness_events')
      .select('id, type, timestamp, date_key, payload')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true })

    if (error || !data) return []
    return data.map(row => ({
      ...row.payload,
      id: row.id,
      type: row.type,
      timestamp: row.timestamp,
      dateKey: row.date_key,
    })) as WellnessEvent[]
  } catch { return [] }
}

export async function saveEventToSupabase(userId: string, event: WellnessEvent): Promise<void> {
  try {
    const supabase = createClient()
    const { id, type, timestamp, dateKey, ...payload } = event
    await supabase.from('wellness_events').upsert({
      id,
      user_id: userId,
      type,
      timestamp,
      date_key: dateKey,
      payload,
    })
  } catch { /* ignore, will sync next time */ }
}

export async function loadStateFromSupabase(userId: string): Promise<PersistedState | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_wellness_state')
      .select('state')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    return { ...emptyState, ...data.state }
  } catch { return null }
}

export async function saveStateToSupabase(userId: string, state: PersistedState): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('user_wellness_state').upsert({
      user_id: userId,
      state,
      updated_at: new Date().toISOString(),
    })
  } catch { /* ignore */ }
}
