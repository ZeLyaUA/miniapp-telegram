'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
import { getStreakDays, offsetDateKey } from '@/lib/store/analytics'
import type { TabId, SectionId } from '@/lib/types'

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [initialItemId, setInitialItemId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const { state, dispatch } = useWellness()
  const { show: showTour, done: tourDone, reset: tourReset } = useOnboarding()

  useEffect(() => {
    try {
      const lp = retrieveLaunchParams()
      setFirstName(lp.tgWebAppData?.user?.first_name ?? null)
    } catch { /* вне Telegram */ }
  }, [])

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
          onSessionComplete={(sessionId, sessionTitle, durationMinutes, completedFull, actualMinutes) => {
            logEvent({ type: 'meditation_session_completed', sessionId, sessionTitle, durationMinutes, completedFull, actualDurationMinutes: actualMinutes })
          }}
        />
      )
      if (activeSection === 'breathing') return (
        <BreathingView
          onBack={() => { setInitialItemId(null); setActiveSection(null) }}
          initialPracticeId={initialItemId ?? undefined}
          onSessionComplete={(practiceId, practiceName, rounds, durationSeconds) => {
            logEvent({ type: 'breathing_session_completed', practiceId, practiceName, rounds, durationSeconds })
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
          showTour={showTour}
          onTourDone={tourDone}
        />
      )
    }
    if (activeTab === 'favorites') return <FavoritesView />
    if (activeTab === 'notifications') return <NotificationsView />
    if (activeTab === 'profile') return <ProfileView onShowTour={handleShowTour} />
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
