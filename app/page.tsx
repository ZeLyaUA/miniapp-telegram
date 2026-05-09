'use client'

import { useEffect, useState } from 'react'
import { retrieveLaunchParams } from '@telegram-apps/sdk-react'
import { BottomNav } from '@/components/layout/BottomNav'
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

  const handleSectionSelect = (section: SectionId) => {
    setActiveSection(section)
  }

  const handleSectionBack = () => {
    setActiveSection(null)
  }

  const renderContent = () => {
    if (activeTab === 'home') {
      if (activeSection === 'meditation') return <MeditationView onBack={handleSectionBack} />
      if (activeSection === 'breathing') return <BreathingView onBack={handleSectionBack} />
      if (activeSection === 'plan') return <PlanView onBack={handleSectionBack} />
      if (activeSection === 'tracker') return <TrackerView onBack={handleSectionBack} />
      return <HomeView firstName={firstName} onSectionSelect={handleSectionSelect} />
    }
    if (activeTab === 'favorites') return <FavoritesView />
    if (activeTab === 'notifications') return <NotificationsView />
    if (activeTab === 'profile') return <ProfileView />
    return null
  }

  return (
    <main className="flex flex-col" style={{ height: '100dvh' }}>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-hide pb-16">
          {renderContent()}
        </div>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  )
}
