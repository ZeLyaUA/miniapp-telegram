'use client'

import { useState, useCallback } from 'react'
import { useSwipeTabs } from '@/lib/useSwipeTabs'
import { ChevronLeft, ChevronRight, BookOpen, User, Bell, CheckCircle2, Circle, Clock, Plus, X, Pencil, Trash2, Wind, Brain, ArrowDownLeft } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { ProgramDetailView } from './ProgramDetailView'
import { programs } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { useWellness, createEvent, syncEventToSupabase, syncStateToSupabase } from '@/lib/store/WellnessContext'
import { getPlanItemsForProgramDay } from '@/lib/store/programUtils'
import { getProgramTimeline, getProgramAdherence, getLastProgramActivityDate, daysBetween } from '@/lib/store/analytics'
import type { Program, Reminder, SectionId, StorePlanItem, ActiveProgramState } from '@/lib/types'

const tabs: { id: string; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'programs', label: 'Программы', icon: BookOpen },
  { id: 'myplan', label: 'Мой план', icon: User },
  { id: 'reminders', label: 'Напоминания', icon: Bell },
]

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const TIME_PRESETS = ['06:00', '08:00', '12:00', '18:00', '21:00']
const DURATION_PRESETS = ['5 мин', '10 мин', '15 мин', '20 мин', '30 мин', '45 мин']
const SECTIONS: Array<'Утро' | 'День' | 'Вечер'> = ['Утро', 'День', 'Вечер']

const todayLabel = (() => {
  const d = new Date()
  return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
})()

interface PlanViewProps {
  onBack: () => void
  onNavigate: (section: SectionId, itemId?: string) => void
}

export function PlanView({ onBack, onNavigate }: PlanViewProps) {
  const { state, dispatch } = useWellness()
  const todayKey = state.todayKey
  const planItems = state.planItems
  const doneItems = new Set(state.donePlanItemsByDay[todayKey] ?? [])
  const storeReminders = state.reminders
  const activeProgram = state.activeProgram

  const [activeTab, setActiveTab] = useState('programs')
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  // ── Мой план ── form state
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingItem, setEditingItem] = useState<StorePlanItem | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formTime, setFormTime] = useState('08:00')
  const [formDuration, setFormDuration] = useState('10 мин')
  const [formSection, setFormSection] = useState<'Утро' | 'День' | 'Вечер'>('Утро')

  // ── Напоминания ── form state
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('08:00')
  const [newDays, setNewDays] = useState<Set<string>>(new Set(['Пн', 'Вт', 'Ср', 'Чт', 'Пт']))

  const { animKey, animClass, setSwipeDir, pillsRef, contentRef, containerRef, touchHandlers } =
    useSwipeTabs(tabs, activeTab, setActiveTab)

  // ── Programs ──────────────────────────────────────────────────────────────

  const handleStartProgram = useCallback((program: Program) => {
    const newActiveProgram: ActiveProgramState = {
      programId: program.id,
      startedAt: Date.now(),
      currentDay: 1,
      completedDays: [],
    }
    const dayItems = getPlanItemsForProgramDay(program, 1)
    dispatch({ type: 'START_PROGRAM', activeProgram: newActiveProgram, planItems: dayItems })
    const event = createEvent({
      type: 'program_started',
      programId: program.id,
      programTitle: program.title,
      totalDays: program.days?.length ?? 0,
    })
    dispatch({ type: 'LOG_EVENT', event })
    syncEventToSupabase(state.userId, event)
    syncStateToSupabase(state.userId, state)
    setActiveTab('myplan')
  }, [dispatch, state])

  const handleAdvanceProgram = () => {
    if (!activeProgram) return
    const currentProgram = programs.find(p => p.id === activeProgram.programId)
    if (!currentProgram) return
    const nextDay = activeProgram.currentDay + 1
    const nextDayItems = getPlanItemsForProgramDay(currentProgram, nextDay)
    dispatch({ type: 'ADVANCE_PROGRAM_DAY', dayNumber: activeProgram.currentDay, newPlanItems: nextDayItems })
    const event = createEvent({
      type: 'program_day_completed',
      programId: activeProgram.programId,
      dayNumber: activeProgram.currentDay,
    })
    dispatch({ type: 'LOG_EVENT', event })
    syncEventToSupabase(state.userId, event)
    syncStateToSupabase(state.userId, state)
  }

  // ── My Plan ───────────────────────────────────────────────────────────────

  const toggleDone = (item: StorePlanItem) => {
    dispatch({ type: 'TOGGLE_PLAN_ITEM_DONE', dateKey: todayKey, itemId: item.id, source: item.source, programId: item.programId })
    const event = createEvent({
      type: 'plan_item_toggled',
      itemId: item.id,
      done: !doneItems.has(item.id),
      source: item.source,
      programId: item.programId,
    })
    dispatch({ type: 'LOG_EVENT', event })
    syncEventToSupabase(state.userId, event)
    syncStateToSupabase(state.userId, { ...state, donePlanItemsByDay: { ...state.donePlanItemsByDay, [todayKey]: [...(state.donePlanItemsByDay[todayKey] ?? []), item.id] } })
  }

  const openAddForm = () => {
    setEditingItem(null); setFormTitle(''); setFormTime('08:00'); setFormDuration('10 мин'); setFormSection('Утро')
    setShowPlanForm(true)
  }

  const openEditForm = (item: StorePlanItem) => {
    setEditingItem(item)
    setFormTitle(item.title); setFormTime(item.time); setFormDuration(item.duration)
    setFormSection(item.section)
    setShowPlanForm(true)
  }

  const closePlanForm = () => {
    setShowPlanForm(false); setEditingItem(null); setFormTitle(''); setFormTime('08:00'); setFormDuration('10 мин'); setFormSection('Утро')
  }

  const savePlanItem = () => {
    if (!formTitle.trim()) return
    if (editingItem) {
      const updated: StorePlanItem = { ...editingItem, title: formTitle.trim(), time: formTime, duration: formDuration, section: formSection }
      dispatch({ type: 'UPDATE_PLAN_ITEM', item: updated })
    } else {
      const newItem: StorePlanItem = {
        id: `mp${Date.now()}`,
        title: formTitle.trim(),
        time: formTime,
        duration: formDuration,
        section: formSection,
        source: 'manual',
      }
      dispatch({ type: 'ADD_PLAN_ITEM', item: newItem })
    }
    syncStateToSupabase(state.userId, state)
    closePlanForm()
  }

  const deletePlanItem = (id: string) => {
    dispatch({ type: 'DELETE_PLAN_ITEM', id })
    syncStateToSupabase(state.userId, state)
    closePlanForm()
  }

  // ── Reminders ─────────────────────────────────────────────────────────────

  const toggleDay = (day: string) =>
    setNewDays(prev => {
      const s = new Set(prev)
      if (s.has(day)) s.delete(day); else s.add(day)
      return s
    })

  const saveReminder = () => {
    if (!newTitle.trim() || newDays.size === 0) return
    const r: Reminder = {
      id: `r${Date.now()}`,
      title: newTitle.trim(),
      time: newTime,
      days: DAY_LABELS.filter(d => newDays.has(d)),
      isEnabled: true,
    }
    dispatch({ type: 'ADD_REMINDER', reminder: r })
    syncStateToSupabase(state.userId, state)
    setShowReminderForm(false); setNewTitle(''); setNewTime('08:00'); setNewDays(new Set(['Пн', 'Вт', 'Ср', 'Чт', 'Пт']))
  }

  const deleteReminder = (id: string) => {
    dispatch({ type: 'DELETE_REMINDER', id })
    syncStateToSupabase(state.userId, state)
  }

  const toggleReminder = (reminder: Reminder) => {
    dispatch({ type: 'UPDATE_REMINDER', reminder: { ...reminder, isEnabled: !reminder.isEnabled } })
    syncStateToSupabase(state.userId, state)
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  if (selectedProgram) {
    return (
      <ProgramDetailView
        program={selectedProgram}
        onBack={() => setSelectedProgram(null)}
        onNavigate={onNavigate}
      />
    )
  }

  const planFormValid = formTitle.trim().length > 0
  const manualItems = planItems.filter(p => p.source === 'manual')
  const programItems = planItems.filter(p => p.source === 'program')
  const allProgramItemsDone = programItems.length > 0 && programItems.every(p => doneItems.has(p.id))

  // Show active program progress
  const activeProgDetails = activeProgram ? programs.find(p => p.id === activeProgram.programId) : null
  const totalProgramDays = activeProgDetails?.days?.length ?? 0
  const timeline = activeProgram && totalProgramDays > 0 ? getProgramTimeline(activeProgram, totalProgramDays) : []
  const adherenceStats = activeProgram && totalProgramDays > 0
    ? getProgramAdherence(activeProgram, totalProgramDays, todayKey)
    : null
  // Gap detection: user returns to plan after at least one calendar day with no program activity.
  const lastActive = activeProgram ? getLastProgramActivityDate(activeProgram) : null
  const gapSinceLast = lastActive ? daysBetween(lastActive, todayKey) : 0
  const showReturnChip = activeProgram != null && lastActive != null && lastActive !== todayKey && gapSinceLast >= 1

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-3 header-pt">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
          style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
        >
          <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">План</h1>
          <p className="label-upper" style={{ marginTop: 2 }}>Путь к цели</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Tabs */}
        <div
          ref={pillsRef}
          className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2 md:flex-col md:overflow-x-visible md:gap-1 md:px-3 md:py-3 md:w-44 md:flex-shrink-0 md:border-r"
          style={{ borderColor: 'rgba(255,220,170,0.06)' }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                data-active={isActive}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all duration-300 md:whitespace-normal md:flex-shrink-1 md:w-full md:rounded-xl md:px-3 md:py-2.5"
                style={{
                  borderRadius: '100px',
                  background: isActive ? 'rgba(201,150,90,0.18)' : 'rgba(255,248,235,0.05)',
                  border: isActive ? '1px solid rgba(201,150,90,0.25)' : '1px solid rgba(255,220,170,0.06)',
                  color: isActive ? 'var(--amber)' : 'rgba(255,248,235,0.4)',
                }}
              >
                <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />
                {label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" {...touchHandlers}>
          <div
            ref={contentRef}
            key={animKey}
            className={cn('px-4 pb-28 md:pb-8 pt-1 min-h-full', animClass)}
            onAnimationEnd={() => setSwipeDir(null)}
          >

            {/* ── Программы ── */}
            {activeTab === 'programs' && (
              <div className="flex flex-col gap-3 mt-2 max-w-lg">
                {/* Active program progress card */}
                {activeProgram && activeProgDetails && adherenceStats && (
                  <GlassCard accent="amber" className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold" style={{ color: 'var(--amber)' }}>Активная программа</p>
                      <span className="text-xs" style={{ color: 'rgba(255,220,170,0.5)' }}>
                        День {activeProgram.currentDay} из {totalProgramDays}
                      </span>
                    </div>
                    <p className="text-white font-medium text-sm mb-3">{activeProgDetails.title}</p>

                    {/* Timeline dots */}
                    <div className="flex items-center gap-1 mb-3">
                      {timeline.map(({ programDay, status }) => {
                        const isCurrent = status === 'current'
                        const bg =
                          status === 'completed' ? 'var(--amber)' :
                          status === 'current' ? 'rgba(201,150,90,0.18)' :
                          status === 'skipped' ? 'rgba(255,248,235,0.10)' :
                          'rgba(255,248,235,0.04)'
                        const border =
                          status === 'skipped' ? '1px dashed rgba(255,220,170,0.25)' :
                          status === 'current' ? '1px solid rgba(201,150,90,0.55)' :
                          status === 'future' ? '1px solid rgba(255,220,170,0.07)' :
                          'none'
                        return (
                          <div
                            key={programDay}
                            className="flex-1 rounded-full"
                            style={{
                              height: isCurrent ? 10 : 6,
                              background: bg,
                              border,
                              boxShadow: isCurrent ? 'var(--glow-amber)' : 'none',
                              transition: 'all 300ms',
                            }}
                            title={`День ${programDay} — ${status}`}
                          />
                        )
                      })}
                    </div>

                    {/* Two-number metrics */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.06)' }}>
                        <p className="text-xs" style={{ color: 'rgba(255,220,170,0.45)' }}>Прошли</p>
                        <p className="text-white font-semibold text-sm">
                          {activeProgram.completedDays.length} <span style={{ color: 'rgba(255,220,170,0.4)', fontSize: 11 }}>/ {totalProgramDays}</span>
                        </p>
                      </div>
                      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.06)' }}>
                        <p className="text-xs" style={{ color: 'rgba(255,220,170,0.45)' }}>Активность</p>
                        <p className="text-white font-semibold text-sm">
                          {Math.round(adherenceStats.adherence * 100)}%
                          {adherenceStats.gapDays > 0 && (
                            <span style={{ color: 'rgba(255,220,170,0.4)', fontSize: 11 }}> · {adherenceStats.gapDays} пропуск{adherenceStats.gapDays === 1 ? '' : 'а'}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {programs.map(program => {
                  const isActiveProg = activeProgram?.programId === program.id
                  return (
                    <GlassCard key={program.id} accent={isActiveProg ? 'amber' : 'none'} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium text-sm">{program.title}</p>
                            {isActiveProg && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(201,150,90,0.15)', color: 'var(--amber)' }}>Активна</span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>{program.description}</p>
                          <div className="flex gap-3 mt-2 text-xs" style={{ color: 'rgba(255,220,170,0.3)' }}>
                            <span>{program.duration}</span>
                            <span>·</span>
                            <span>{program.sessions} сессий</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          {!isActiveProg && (
                            <button
                              onClick={() => handleStartProgram(program)}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 active:scale-95"
                              style={{ background: 'rgba(201,150,90,0.15)', color: 'var(--amber)', border: '1px solid rgba(201,150,90,0.2)' }}
                            >
                              Начать
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedProgram(program)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 active:scale-95"
                            style={{ background: 'rgba(255,248,235,0.06)', color: 'rgba(255,248,235,0.35)', border: '1px solid rgba(255,220,170,0.08)' }}
                          >
                            {isActiveProg ? 'Детали' : 'Просмотр'}
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            )}

            {/* ── Мой план ── */}
            {activeTab === 'myplan' && (
              <div className="flex flex-col gap-3 mt-2 max-w-lg">

                {/* Return-after-gap chip */}
                {showReturnChip && activeProgDetails && activeProgram && !allProgramItemsDone && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                    style={{ background: 'rgba(139,117,207,0.10)', border: '1px solid rgba(139,117,207,0.20)' }}
                  >
                    <ArrowDownLeft size={14} style={{ color: 'var(--violet)', flexShrink: 0 }} />
                    <p className="text-xs flex-1" style={{ color: 'rgba(255,248,235,0.7)' }}>
                      {gapSinceLast === 1 ? 'Не были вчера' : `Не были ${gapSinceLast} дн`}. Сегодня — день {activeProgram.currentDay} «{activeProgDetails.title}»
                    </p>
                  </div>
                )}

                {/* Program completion card */}
                {allProgramItemsDone && activeProgram && (
                  <GlassCard accent="amber" className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,150,90,0.2)' }}>
                        <CheckCircle2 size={20} style={{ color: 'var(--amber)' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">День {activeProgram.currentDay} завершён!</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.5)' }}>Все практики выполнены</p>
                      </div>
                      <button
                        onClick={handleAdvanceProgram}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all duration-300 active:scale-95"
                        style={{ background: 'rgba(201,150,90,0.8)', color: 'rgba(255,240,210,0.95)', border: '1px solid rgba(201,150,90,0.3)' }}
                      >
                        Дальше
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </GlassCard>
                )}

                {/* Program items */}
                {programItems.length > 0 && (
                  <GlassCard accent="amber" className="overflow-hidden">
                    <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(255,220,170,0.08)' }}>
                      <p className="font-semibold text-sm" style={{ color: 'var(--amber)' }}>
                        {activeProgDetails?.title ?? 'Программа'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>
                        День {activeProgram?.currentDay}
                      </p>
                    </div>
                    {programItems.map((item, i) => {
                      const done = doneItems.has(item.id)
                      const isLast = i === programItems.length - 1
                      return (
                        <div
                          key={item.id}
                          className={cn('flex items-center gap-3 px-4 py-3', !isLast && 'border-b')}
                          style={{ borderColor: 'rgba(255,220,170,0.06)' }}
                        >
                          <button onClick={() => toggleDone(item)} className="flex-shrink-0 transition-all duration-300 active:scale-90">
                            {done
                              ? <CheckCircle2 size={16} style={{ color: 'var(--amber)' }} />
                              : <Circle size={16} style={{ color: 'rgba(255,255,255,0.18)' }} />}
                          </button>

                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: item.practiceType === 'breathing' ? 'rgba(201,150,90,0.12)' : 'rgba(139,117,207,0.12)' }}
                          >
                            {item.practiceType === 'breathing'
                              ? <Wind size={12} style={{ color: 'var(--amber)' }} />
                              : <Brain size={12} style={{ color: 'var(--violet)' }} />}
                          </div>

                          <p className={cn('text-sm flex-1 min-w-0 truncate', done ? 'line-through' : 'text-white')} style={done ? { color: 'rgba(255,220,170,0.3)' } : {}}>
                            {item.title}
                          </p>

                          <div className="text-right flex-shrink-0">
                            <p className="text-xs" style={{ color: 'rgba(255,220,170,0.35)' }}>{item.time}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,220,170,0.25)' }}>{item.duration}</p>
                          </div>

                          {item.practiceType && item.practiceRefId && (
                            <button
                              onClick={() => onNavigate(item.practiceType as SectionId, item.practiceRefId)}
                              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-300 active:scale-90"
                              style={{ background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.12)' }}
                            >
                              <ChevronRight size={12} style={{ color: 'var(--amber)' }} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </GlassCard>
                )}

                {/* Manual items */}
                <GlassCard className="overflow-hidden">
                  <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(255,220,170,0.08)' }}>
                    <p className="font-semibold text-sm" style={{ color: 'var(--amber)' }}>Сегодня</p>
                    <p className="text-xs mt-0.5 capitalize" style={{ color: 'rgba(255,220,170,0.4)' }}>{todayLabel}</p>
                  </div>

                  {manualItems.length === 0 && (
                    <p className="px-4 py-6 text-sm text-center" style={{ color: 'rgba(255,220,170,0.3)' }}>
                      Пока нет пунктов — добавьте первый
                    </p>
                  )}

                  {SECTIONS.map(section => {
                    const items = manualItems.filter(item => item.section === section)
                    if (items.length === 0) return null
                    return (
                      <div key={section}>
                        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,220,170,0.35)' }}>{section}</p>
                        {items.map((item, i) => {
                          const done = doneItems.has(item.id)
                          const isLast = i === items.length - 1
                          return (
                            <div
                              key={item.id}
                              className={cn('flex items-center gap-3 px-4 py-3', !isLast && 'border-b')}
                              style={{ borderColor: 'rgba(255,220,170,0.06)' }}
                            >
                              <button onClick={() => toggleDone(item)} className="flex-shrink-0 transition-all duration-300 active:scale-90">
                                {done
                                  ? <CheckCircle2 size={16} style={{ color: 'var(--amber)' }} />
                                  : <Circle size={16} style={{ color: 'rgba(255,255,255,0.18)' }} />}
                              </button>

                              <p className={cn('text-sm flex-1 min-w-0 truncate', done ? 'line-through' : 'text-white')} style={done ? { color: 'rgba(255,220,170,0.3)' } : {}}>
                                {item.title}
                              </p>

                              <div className="text-right flex-shrink-0">
                                <p className="text-xs" style={{ color: 'rgba(255,220,170,0.35)' }}>{item.time}</p>
                                <p className="text-xs" style={{ color: 'rgba(255,220,170,0.25)' }}>{item.duration}</p>
                              </div>

                              <button
                                onClick={(e) => { e.stopPropagation(); openEditForm(item) }}
                                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-300 active:scale-90 ml-1"
                                style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.06)' }}
                              >
                                <Pencil size={12} style={{ color: 'rgba(255,220,170,0.35)' }} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </GlassCard>

                {/* Plan form */}
                {showPlanForm ? (
                  <GlassCard className="p-4 flex flex-col gap-4">
                    <p className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>
                      {editingItem ? 'Редактировать пункт' : 'Новый пункт'}
                    </p>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,220,170,0.4)' }}>Название</p>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        placeholder="Напр. Утренняя медитация"
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
                        style={{ background: 'rgba(255,248,235,0.05)', border: '1px solid rgba(255,220,170,0.12)' }}
                        autoFocus
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,220,170,0.4)' }}>Секция</p>
                      <div className="flex gap-2">
                        {SECTIONS.map(s => (
                          <button
                            key={s}
                            onClick={() => setFormSection(s)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-300"
                            style={{
                              background: formSection === s ? 'rgba(201,150,90,0.18)' : 'rgba(255,248,235,0.04)',
                              border: formSection === s ? '1px solid rgba(201,150,90,0.3)' : '1px solid rgba(255,220,170,0.06)',
                              color: formSection === s ? 'var(--amber)' : 'rgba(255,220,170,0.35)',
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,220,170,0.4)' }}>Время</p>
                      <div className="flex flex-wrap gap-2">
                        {TIME_PRESETS.map(t => (
                          <button key={t} onClick={() => setFormTime(t)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                            style={{ background: formTime === t ? 'rgba(201,150,90,0.2)' : 'rgba(255,248,235,0.05)', border: formTime === t ? '1px solid rgba(201,150,90,0.35)' : '1px solid rgba(255,220,170,0.08)', color: formTime === t ? 'var(--amber)' : 'rgba(255,220,170,0.4)' }}
                          >{t}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,220,170,0.4)' }}>Длительность</p>
                      <div className="flex flex-wrap gap-2">
                        {DURATION_PRESETS.map(d => (
                          <button key={d} onClick={() => setFormDuration(d)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                            style={{ background: formDuration === d ? 'rgba(201,150,90,0.2)' : 'rgba(255,248,235,0.05)', border: formDuration === d ? '1px solid rgba(201,150,90,0.35)' : '1px solid rgba(255,220,170,0.08)', color: formDuration === d ? 'var(--amber)' : 'rgba(255,220,170,0.4)' }}
                          >{d}</button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {editingItem && (
                        <button
                          onClick={() => deletePlanItem(editingItem.id)}
                          className="py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all duration-300 active:scale-95"
                          style={{ background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.15)', color: 'rgba(255,120,100,0.7)' }}
                        >
                          <Trash2 size={13} />Удалить
                        </button>
                      )}
                      <div className="flex gap-2 flex-1">
                        <button onClick={closePlanForm}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-300"
                          style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)', color: 'rgba(255,248,235,0.35)' }}
                        >
                          <X size={13} />Отмена
                        </button>
                        <button onClick={savePlanItem}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.97]"
                          style={{ background: planFormValid ? 'rgba(201,150,90,0.8)' : 'rgba(255,248,235,0.06)', color: planFormValid ? 'rgba(255,240,210,0.95)' : 'rgba(255,220,170,0.25)', border: '1px solid rgba(201,150,90,0.2)' }}
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ) : (
                  <button
                    onClick={openAddForm}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all duration-300 active:scale-[0.98]"
                    style={{ background: 'rgba(255,248,235,0.04)', border: '1px dashed rgba(255,220,170,0.15)', color: 'rgba(255,220,170,0.4)' }}
                  >
                    <Plus size={15} />
                    Добавить пункт
                  </button>
                )}
              </div>
            )}

            {/* ── Напоминания ── */}
            {activeTab === 'reminders' && (
              <div className="flex flex-col gap-3 mt-2 max-w-lg">
                {storeReminders.map((reminder) => (
                  <GlassCard key={reminder.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: reminder.isEnabled ? 'rgba(201,150,90,0.1)' : 'rgba(255,255,255,0.04)' }}>
                        <Clock size={18} style={{ color: reminder.isEnabled ? 'var(--amber)' : 'rgba(255,255,255,0.2)' }} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: reminder.isEnabled ? 'white' : 'rgba(255,255,255,0.3)' }}>{reminder.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.3)' }}>{reminder.time} · {reminder.days.join(', ')}</p>
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-300 active:scale-90"
                        style={{ background: 'rgba(220,60,60,0.06)', border: '1px solid rgba(220,60,60,0.1)' }}
                      >
                        <Trash2 size={13} style={{ color: 'rgba(255,100,80,0.5)' }} />
                      </button>
                      <button
                        onClick={() => toggleReminder(reminder)}
                        className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                        style={{ background: reminder.isEnabled ? 'var(--amber)' : 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300" style={{ left: reminder.isEnabled ? '26px' : '2px' }} />
                      </button>
                    </div>
                  </GlassCard>
                ))}

                {showReminderForm ? (
                  <GlassCard className="p-4 flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,220,170,0.4)' }}>Название</p>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Напр. Утренняя медитация"
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
                        style={{ background: 'rgba(255,248,235,0.05)', border: '1px solid rgba(255,220,170,0.12)' }}
                        autoFocus
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,220,170,0.4)' }}>Время</p>
                      <div className="flex flex-wrap gap-2">
                        {TIME_PRESETS.map(t => (
                          <button key={t} onClick={() => setNewTime(t)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                            style={{ background: newTime === t ? 'rgba(201,150,90,0.2)' : 'rgba(255,248,235,0.05)', border: newTime === t ? '1px solid rgba(201,150,90,0.35)' : '1px solid rgba(255,220,170,0.08)', color: newTime === t ? 'var(--amber)' : 'rgba(255,220,170,0.4)' }}
                          >{t}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,220,170,0.4)' }}>Дни недели</p>
                      <div className="flex gap-1.5">
                        {DAY_LABELS.map(day => {
                          const active = newDays.has(day)
                          return (
                            <button key={day} onClick={() => toggleDay(day)}
                              className="flex-1 py-2 rounded-xl text-[11px] font-medium transition-all duration-300"
                              style={{ background: active ? 'rgba(201,150,90,0.18)' : 'rgba(255,248,235,0.04)', border: active ? '1px solid rgba(201,150,90,0.3)' : '1px solid rgba(255,220,170,0.06)', color: active ? 'var(--amber)' : 'rgba(255,220,170,0.3)' }}
                            >{day}</button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowReminderForm(false); setNewTitle(''); setNewTime('08:00'); setNewDays(new Set(['Пн', 'Вт', 'Ср', 'Чт', 'Пт'])) }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-300"
                        style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)', color: 'rgba(255,248,235,0.35)' }}
                      >
                        <X size={13} />Отмена
                      </button>
                      <button onClick={saveReminder}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.97]"
                        style={{ background: newTitle.trim() && newDays.size > 0 ? 'rgba(201,150,90,0.8)' : 'rgba(255,248,235,0.06)', color: newTitle.trim() && newDays.size > 0 ? 'rgba(255,240,210,0.95)' : 'rgba(255,220,170,0.25)', border: '1px solid rgba(201,150,90,0.2)' }}
                      >
                        Сохранить
                      </button>
                    </div>
                  </GlassCard>
                ) : (
                  <button
                    onClick={() => setShowReminderForm(true)}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all duration-300 active:scale-[0.98]"
                    style={{ background: 'rgba(255,248,235,0.04)', border: '1px dashed rgba(255,220,170,0.15)', color: 'rgba(255,220,170,0.4)' }}
                  >
                    <Plus size={15} />
                    Добавить напоминание
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
