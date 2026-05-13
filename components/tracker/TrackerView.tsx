"use client";

import { useState } from "react";
import { useSwipeTabs } from "@/lib/useSwipeTabs";
import { ChevronLeft, BarChart3, Activity, Heart, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsTabInner } from "./StatsTab";
import { ActivityTab } from "./ActivityTab";
import { WellbeingTab } from "./WellbeingTab";
import { HabitsTab } from "./HabitsTab";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";

type TrackerTab = "stats" | "activity" | "wellbeing" | "habits";

const tabs: {
  id: TrackerTab;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  { id: "stats", label: "Статистика", icon: BarChart3 },
  { id: "activity", label: "Активность", icon: Activity },
  { id: "wellbeing", label: "Самочувствие", icon: Heart },
  { id: "habits", label: "Привычки", icon: Repeat },
];

interface TrackerViewProps {
  onBack: () => void;
}

export function TrackerView({ onBack }: TrackerViewProps) {
  const [activeTab, setActiveTab] = useState<TrackerTab>("stats");

  const {
    animKey,
    animClass,
    setSwipeDir,
    pillsRef,
    contentRef,
    containerRef,
    touchHandlers,
  } = useSwipeTabs(tabs, activeTab, setActiveTab);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-3 header-pt">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
          style={{
            background: "rgba(255,248,235,0.06)",
            border: "1px solid rgba(255,220,170,0.08)",
          }}
        >
          <ChevronLeft size={18} style={{ color: "rgba(255,248,235,0.7)" }} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">Трекер</h1>
          <p className="label-upper" style={{ marginTop: 2 }}>
            Аналитика и прогресс
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Tabs */}
        <div
          ref={pillsRef}
          className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2 md:flex-col md:overflow-x-visible md:gap-1 md:px-3 md:py-3 md:w-44 md:shrink-0 md:border-r"
          style={{ borderColor: "rgba(255,220,170,0.06)" }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                data-active={isActive}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-300 md:whitespace-normal md:shrink md:w-full md:rounded-xl md:px-3 md:py-2.5"
                style={{
                  borderRadius: "100px",
                  background: isActive
                    ? "rgba(139,117,207,0.18)"
                    : "rgba(255,248,235,0.05)",
                  border: isActive
                    ? "1px solid rgba(139,117,207,0.25)"
                    : "1px solid rgba(255,220,170,0.06)",
                  color: isActive ? "var(--violet)" : "rgba(255,248,235,0.4)",
                }}
              >
                <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
          {...touchHandlers}
        >
          <div
            ref={contentRef}
            key={animKey}
            className={cn("px-4 pb-28 md:pb-8 pt-1 min-h-full", animClass)}
            onAnimationEnd={() => setSwipeDir(null)}
          >
            {activeTab === "stats" && (
              <ErrorBoundary name="StatsTab">
                <StatsTabInner />
              </ErrorBoundary>
            )}
            {activeTab === "activity" && (
              <ErrorBoundary name="ActivityTab">
                <ActivityTab />
              </ErrorBoundary>
            )}
            {activeTab === "wellbeing" && (
              <ErrorBoundary name="WellbeingTab">
                <WellbeingTab />
              </ErrorBoundary>
            )}
            {activeTab === "habits" && (
              <ErrorBoundary name="HabitsTab">
                <HabitsTab />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
