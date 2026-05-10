'use client'

import { useEffect, useState } from 'react'
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
import type { TabId, SectionId } from '@/lib/types'

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)

  useEffect(() => {
    try {
      const lp = retrieveLaunchParams()
      setFirstName(lp.tgWebAppData?.user?.first_name ?? null)
    } catch {
      // вне Telegram
    }
  }, [])

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setActiveSection(null)
  }

  const renderContent = () => {
    if (activeTab === 'home') {
      if (activeSection === 'meditation') return <MeditationView onBack={() => setActiveSection(null)} />
      if (activeSection === 'breathing') return <BreathingView onBack={() => setActiveSection(null)} />
      if (activeSection === 'plan') return <PlanView onBack={() => setActiveSection(null)} />
      if (activeSection === 'tracker') return <TrackerView onBack={() => setActiveSection(null)} />
      return <HomeView firstName={firstName} onSectionSelect={setActiveSection} />
    }
    if (activeTab === 'favorites') return <FavoritesView />
    if (activeTab === 'notifications') return <NotificationsView />
    if (activeTab === 'profile') return <ProfileView />
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
