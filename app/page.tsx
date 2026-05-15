'use client'

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react'
import { retrieveLaunchParams } from '@telegram-apps/sdk-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { HomeView } from '@/components/home/HomeView'
import { MeditationView } from '@/components/meditation/MeditationView'
import { BreathingView } from '@/components/breathing/BreathingView'
import { PlanView } from '@/components/plan/PlanView'
import { TrackerView } from '@/components/tracker/TrackerView'
import { FavoritesView } from '@/components/favorites/FavoritesView'
import { NotificationsView } from '@/components/notifications/NotificationsView'
import { ProfileView } from '@/components/profile/ProfileView'
import { DayCardView } from '@/components/daycard/DayCardView'
import { useWellness, createEvent, syncEventToSupabase } from '@/lib/store/WellnessContext'
import { useOnboarding } from '@/components/home/OnboardingTour'
import { getStreakDays, offsetDateKey, computeWellnessIndex, computeInsights } from '@/lib/store/analytics'
import type { TabId, SectionId } from '@/lib/types'

const noopSubscribe = () => () => {}

// Cache the launch-params object so getTgUser returns a stable reference.
// retrieveLaunchParams() reparses on each call and returns a new object —
// without caching, useSyncExternalStore would detect change-on-every-render and infinite-loop.
type TgUser = { first_name?: string; photo_url?: string } | null
let tgUserCache: TgUser | undefined

function getTgUser(): TgUser {
  if (tgUserCache !== undefined) return tgUserCache
  try { tgUserCache = (retrieveLaunchParams().tgWebAppData?.user ?? null) as TgUser }
  catch { tgUserCache = null }
  return tgUserCache
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [initialItemId, setInitialItemId] = useState<string | null>(null)
  const tgUser = useSyncExternalStore(noopSubscribe, getTgUser, () => null)
  const firstName = tgUser?.first_name ?? null
  const photoUrl = tgUser?.photo_url ?? null
  const { state, dispatch } = useWellness()
  const { show: showTour, done: tourDone, reset: tourReset } = useOnboarding()

  const logEvent = useCallback((eventPayload: Parameters<typeof createEvent>[0]) => {
    const event = createEvent(eventPayload)
    dispatch({ type: 'LOG_EVENT', event })
    syncEventToSupabase(state.userId, event)
  }, [dispatch, state.userId])

  const streak = useMemo(
    () => getStreakDays(state.dailySnapshots, state.todayKey),
    [state.dailySnapshots, state.todayKey]
  )

  const weekMinutes = useMemo(() => {
    const keys = Array.from({ length: 7 }, (_, i) => offsetDateKey(-(6 - i)))
    return keys.reduce((s, k) => {
      const snap = state.dailySnapshots[k]
      return s + (snap?.meditationMinutes ?? 0) + (snap?.breathingMinutes ?? 0)
    }, 0)
  }, [state.dailySnapshots])

  const wellness = useMemo(
    () => computeWellnessIndex(state.events, state.assessmentsByDay, state.doneTasksByDay, state.todayKey),
    [state.events, state.assessmentsByDay, state.doneTasksByDay, state.todayKey]
  )

  const weekWellness = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const k = offsetDateKey(-(6 - i))
      return computeWellnessIndex(state.events, state.assessmentsByDay, state.doneTasksByDay, k).index
    })
  }, [state.events, state.assessmentsByDay, state.doneTasksByDay])

  const insights = useMemo(
    () => computeInsights(state.events, state.assessmentsByDay, state.doneTasksByDay, state.todayKey, 4),
    [state.events, state.assessmentsByDay, state.doneTasksByDay, state.todayKey]
  )

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setActiveSection(null)
  }

  const handleShowTour = () => {
    setActiveTab('home')
    setActiveSection(null)
    tourReset()
  }

  const renderContent = () => {
    if (activeTab === 'home') {
      if (activeSection === 'daycard') return <DayCardView onBack={() => setActiveSection(null)} />
      if (activeSection === 'meditation') return (
        <MeditationView
          onBack={() => { setInitialItemId(null); setActiveSection(null) }}
          initialSessionId={initialItemId ?? undefined}
          streak={streak}
          favoriteIds={state.favoriteMeditationIds}
          onSessionStart={(sessionId, sessionTitle, plannedMinutes) => {
            logEvent({ type: 'session_started', sessionType: 'meditation', refId: sessionId, refName: sessionTitle, plannedMinutes })
          }}
          onSessionComplete={(sessionId, sessionTitle, durationMinutes, completedFull, actualMinutes, pausedSeconds) => {
            logEvent({ type: 'meditation_session_completed', sessionId, sessionTitle, durationMinutes, completedFull, actualDurationMinutes: actualMinutes, pausedSeconds })
          }}
        />
      )
      if (activeSection === 'breathing') return (
        <BreathingView
          onBack={() => { setInitialItemId(null); setActiveSection(null) }}
          initialPracticeId={initialItemId ?? undefined}
          onSessionStart={(practiceId, practiceName, plannedRounds) => {
            logEvent({ type: 'session_started', sessionType: 'breathing', refId: practiceId, refName: practiceName, plannedRounds })
          }}
          onSessionComplete={(practiceId, practiceName, rounds, durationSeconds, targetRounds, completedFull, pausedSeconds) => {
            logEvent({ type: 'breathing_session_completed', practiceId, practiceName, rounds, durationSeconds, targetRounds, completedFull, pausedSeconds })
          }}
        />
      )
      if (activeSection === 'plan') return <PlanView onBack={() => setActiveSection(null)} onNavigate={(section, itemId) => { setInitialItemId(itemId ?? null); setActiveSection(section) }} />
      if (activeSection === 'tracker') return <TrackerView onBack={() => setActiveSection(null)} />
      return (
        <HomeView
          firstName={firstName}
          onSectionSelect={setActiveSection}
          streak={streak}
          meditationMinutesToday={state.dailySnapshots[state.todayKey]?.meditationMinutes ?? 0}
          breathingSessionsToday={state.dailySnapshots[state.todayKey]?.breathingSessionCount ?? 0}
          weekMinutes={weekMinutes}
          wellness={wellness}
          weekWellness={weekWellness}
          insights={insights}
          showTour={showTour}
          onTourDone={tourDone}
        />
      )
    }
    if (activeTab === 'favorites') return <FavoritesView />
    if (activeTab === 'notifications') return <NotificationsView />
    if (activeTab === 'profile') return <ProfileView onShowTour={handleShowTour} firstName={firstName} photoUrl={photoUrl} />
    return null
  }

  return (
    <main className="flex flex-col lg:flex-row" style={{ height: '100dvh' }}>
      {/* Desktop sidebar (lg+) */}
      <SidebarNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-hidden">
          <div className="content-shell h-full">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile + tablet nav (hidden on lg) */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  )
}
