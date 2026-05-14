'use client'

import { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react'
import { retrieveLaunchParams } from '@telegram-apps/sdk-react'
import type { WellnessEvent, WellnessEventPayload } from './types-events'
import type { StorePlanItem, ActiveProgramState, Reminder, HabitDef, Assessment } from '../types'
import {
  loadEventsFromLS, saveEventsToLS,
  loadStateFromLS, saveStateToLS,
  loadEventsFromSupabase, saveEventToSupabase,
  loadStateFromSupabase, saveStateToSupabase,
  type PersistedState,
} from './persistence'
import { todayKey, computeAllSnapshots, computeDailySnapshot } from './analytics'
import type { DailySnapshot } from '../types'

// ── Store shape ───────────────────────────────────────────────────────────────

export interface WellnessStore {
  userId: string | null
  todayKey: string
  isLoading: boolean
  events: WellnessEvent[]
  // Derived — computed in reducer, never persisted
  dailySnapshots: Record<string, DailySnapshot>
  // Per-day state
  doneTasksByDay: Record<string, string[]>
  assessmentsByDay: Record<string, Assessment>
  donePlanItemsByDay: Record<string, string[]>
  // Mutable state
  planItems: StorePlanItem[]
  activeProgram: ActiveProgramState | null
  favoriteMeditationIds: string[]
  reminders: Reminder[]
  habits: HabitDef[]
}

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'INIT'; events: WellnessEvent[]; state: PersistedState; userId: string | null }
  | { type: 'MERGE_REMOTE'; events: WellnessEvent[]; state: PersistedState }
  | { type: 'LOG_EVENT'; event: WellnessEvent }
  | { type: 'TOGGLE_TASK'; dateKey: string; taskId: string }
  | { type: 'SAVE_ASSESSMENT'; dateKey: string; assessment: Assessment }
  | { type: 'ADD_PLAN_ITEM'; item: StorePlanItem }
  | { type: 'UPDATE_PLAN_ITEM'; item: StorePlanItem }
  | { type: 'DELETE_PLAN_ITEM'; id: string }
  | { type: 'TOGGLE_PLAN_ITEM_DONE'; dateKey: string; itemId: string; source: 'manual' | 'program'; programId?: string }
  | { type: 'START_PROGRAM'; activeProgram: ActiveProgramState; planItems: StorePlanItem[] }
  | { type: 'ADVANCE_PROGRAM_DAY'; dayNumber: number; newPlanItems: StorePlanItem[] }
  | { type: 'TOGGLE_FAVORITE'; sessionId: string }
  | { type: 'ADD_REMINDER'; reminder: Reminder }
  | { type: 'UPDATE_REMINDER'; reminder: Reminder }
  | { type: 'DELETE_REMINDER'; id: string }
  | { type: 'CHECK_HABIT'; event: WellnessEvent }

// ── Reducer ───────────────────────────────────────────────────────────────────

function fromPersistedState(state: PersistedState) {
  return {
    doneTasksByDay: state.doneTasksByDay,
    assessmentsByDay: state.assessmentsByDay,
    donePlanItemsByDay: state.donePlanItemsByDay,
    planItems: state.planItems,
    activeProgram: state.activeProgram,
    favoriteMeditationIds: state.favoriteMeditationIds,
    reminders: state.reminders,
    habits: state.habits,
  }
}

function reducer(state: WellnessStore, action: Action): WellnessStore {
  switch (action.type) {
    case 'INIT': {
      const persisted = fromPersistedState(action.state)
      const snaps = computeAllSnapshots(action.events, persisted.assessmentsByDay)
      return {
        ...state,
        userId: action.userId,
        events: action.events,
        ...persisted,
        dailySnapshots: snaps,
        isLoading: false,
      }
    }

    case 'MERGE_REMOTE': {
      const existingIds = new Set(state.events.map(e => e.id))
      const newEvents = action.events.filter(e => !existingIds.has(e.id))
      const merged = [...state.events, ...newEvents].sort((a, b) => a.timestamp - b.timestamp)
      const persisted = fromPersistedState(action.state)
      return {
        ...state,
        events: merged,
        ...persisted,
        dailySnapshots: computeAllSnapshots(merged, persisted.assessmentsByDay),
      }
    }

    case 'LOG_EVENT': {
      const newEvents = [...state.events, action.event]
      const updatedSnap = computeDailySnapshot(newEvents, state.assessmentsByDay, action.event.dateKey)
      return {
        ...state,
        events: newEvents,
        dailySnapshots: { ...state.dailySnapshots, [action.event.dateKey]: updatedSnap },
      }
    }

    case 'TOGGLE_TASK': {
      const current = state.doneTasksByDay[action.dateKey] ?? []
      const idx = current.indexOf(action.taskId)
      const next = idx >= 0
        ? current.filter(id => id !== action.taskId)
        : [...current, action.taskId]
      return {
        ...state,
        doneTasksByDay: { ...state.doneTasksByDay, [action.dateKey]: next },
      }
    }

    case 'SAVE_ASSESSMENT': {
      const newAssessments = { ...state.assessmentsByDay, [action.dateKey]: action.assessment }
      const updatedSnap = computeDailySnapshot(state.events, newAssessments, action.dateKey)
      return {
        ...state,
        assessmentsByDay: newAssessments,
        dailySnapshots: { ...state.dailySnapshots, [action.dateKey]: updatedSnap },
      }
    }

    case 'ADD_PLAN_ITEM':
      return { ...state, planItems: [...state.planItems, action.item] }

    case 'UPDATE_PLAN_ITEM':
      return {
        ...state,
        planItems: state.planItems.map(p => p.id === action.item.id ? action.item : p),
      }

    case 'DELETE_PLAN_ITEM':
      return { ...state, planItems: state.planItems.filter(p => p.id !== action.id) }

    case 'TOGGLE_PLAN_ITEM_DONE': {
      const current = state.donePlanItemsByDay[action.dateKey] ?? []
      const idx = current.indexOf(action.itemId)
      const next = idx >= 0
        ? current.filter(id => id !== action.itemId)
        : [...current, action.itemId]
      return {
        ...state,
        donePlanItemsByDay: { ...state.donePlanItemsByDay, [action.dateKey]: next },
      }
    }

    case 'START_PROGRAM':
      return {
        ...state,
        activeProgram: action.activeProgram,
        planItems: [...state.planItems.filter(p => p.source !== 'program'), ...action.planItems],
      }

    case 'ADVANCE_PROGRAM_DAY':
      if (!state.activeProgram) return state
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          currentDay: action.dayNumber + 1,
          completedDays: [...state.activeProgram.completedDays, action.dayNumber],
        },
        planItems: [...state.planItems.filter(p => p.source !== 'program'), ...action.newPlanItems],
      }

    case 'TOGGLE_FAVORITE': {
      const has = state.favoriteMeditationIds.includes(action.sessionId)
      return {
        ...state,
        favoriteMeditationIds: has
          ? state.favoriteMeditationIds.filter(id => id !== action.sessionId)
          : [...state.favoriteMeditationIds, action.sessionId],
      }
    }

    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.reminder] }

    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r => r.id === action.reminder.id ? action.reminder : r),
      }

    case 'DELETE_REMINDER':
      return { ...state, reminders: state.reminders.filter(r => r.id !== action.id) }

    case 'CHECK_HABIT': {
      const newEvents = [...state.events, action.event]
      const updatedSnap = computeDailySnapshot(newEvents, state.assessmentsByDay, action.event.dateKey)
      return {
        ...state,
        events: newEvents,
        dailySnapshots: { ...state.dailySnapshots, [action.event.dateKey]: updatedSnap },
      }
    }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const WellnessStateCtx = createContext<WellnessStore | null>(null)
const WellnessDispatchCtx = createContext<React.Dispatch<Action> | null>(null)

function createId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function toPersistedState(s: WellnessStore): PersistedState {
  return {
    planItems: s.planItems,
    doneTasksByDay: s.doneTasksByDay,
    assessmentsByDay: s.assessmentsByDay,
    donePlanItemsByDay: s.donePlanItemsByDay,
    activeProgram: s.activeProgram,
    favoriteMeditationIds: s.favoriteMeditationIds,
    reminders: s.reminders,
    habits: s.habits,
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function WellnessProvider({ children }: { children: ReactNode }) {
  const initial: WellnessStore = {
    userId: null,
    todayKey: todayKey(),
    isLoading: true,
    events: [],
    dailySnapshots: {},
    doneTasksByDay: {},
    assessmentsByDay: {},
    donePlanItemsByDay: {},
    planItems: [],
    activeProgram: null,
    favoriteMeditationIds: [],
    reminders: [],
    habits: [],
  }

  const [state, dispatch] = useReducer(reducer, initial)
  const stateRef = useRef(state)
  stateRef.current = state

  // Init: load localStorage immediately, then merge from server
  useEffect(() => {
    let cancelled = false

    let userId: string | null = null
    try {
      const lp = retrieveLaunchParams()
      const uid = lp.tgWebAppData?.user?.id
      userId = uid != null ? String(uid) : null
    } catch { /* outside Telegram */ }

    const events = loadEventsFromLS()
    const persisted = loadStateFromLS()
    dispatch({ type: 'INIT', events, state: persisted, userId })

    if (userId) {
      Promise.all([
        loadEventsFromSupabase(userId),
        loadStateFromSupabase(userId),
      ]).then(([remoteEvents, remoteState]) => {
        if (cancelled) return
        if (remoteEvents.length > 0 || remoteState) {
          dispatch({ type: 'MERGE_REMOTE', events: remoteEvents, state: remoteState ?? persisted })
        }
      })
    }

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist to localStorage + debounced Supabase state sync
  const prevLoadingRef = useRef(true)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (state.isLoading) { prevLoadingRef.current = true; return }
    if (prevLoadingRef.current) { prevLoadingRef.current = false; return }
    saveEventsToLS(state.events)
    saveStateToLS(toPersistedState(state))
    if (stateRef.current.userId) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      syncTimerRef.current = setTimeout(() => {
        syncStateToSupabase(stateRef.current.userId, stateRef.current)
      }, 2000)
    }
  }, [state])

  // Sync new events to Supabase as they arrive
  const prevEventsLenRef = useRef(0)
  useEffect(() => {
    if (state.isLoading) return
    const newEvents = state.events.slice(prevEventsLenRef.current)
    prevEventsLenRef.current = state.events.length
    if (newEvents.length > 0) {
      newEvents.forEach(e => syncEventToSupabase(stateRef.current.userId, e))
    }
  }, [state.events, state.isLoading])

  return (
    <WellnessStateCtx.Provider value={state}>
      <WellnessDispatchCtx.Provider value={dispatch}>
        {children}
      </WellnessDispatchCtx.Provider>
    </WellnessStateCtx.Provider>
  )
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useWellnessState(): WellnessStore {
  const ctx = useContext(WellnessStateCtx)
  if (!ctx) throw new Error('useWellnessState must be used within WellnessProvider')
  return ctx
}

export function useWellnessDispatch(): React.Dispatch<Action> {
  const ctx = useContext(WellnessDispatchCtx)
  if (!ctx) throw new Error('useWellnessDispatch must be used within WellnessProvider')
  return ctx
}

export function useWellness() {
  return { state: useWellnessState(), dispatch: useWellnessDispatch() }
}

// ── Action creators ───────────────────────────────────────────────────────────

export function createEvent(payload: WellnessEventPayload): WellnessEvent {
  const now = new Date()
  return {
    ...payload,
    id: createId(),
    timestamp: now.getTime(),
    dateKey: now.toISOString().split('T')[0],
  } as unknown as WellnessEvent
}

// Async Supabase sync helper — fire and forget
export function syncEventToSupabase(userId: string | null, event: WellnessEvent): void {
  if (!userId) return
  saveEventToSupabase(userId, event).catch(() => {})
}

export function syncStateToSupabase(userId: string | null, state: WellnessStore): void {
  if (!userId) return
  saveStateToSupabase(userId, toPersistedState(state)).catch(() => {})
}
