'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Play, Pause, RotateCcw, Wind, ArrowUp, ArrowDown, RefreshCw, ArrowLeftRight, Film, X, CheckCircle2 } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { ViewShell } from '@/components/layout/ViewShell'
import { BreathingCircle } from './BreathingCircle'
import { breathingPractices } from '@/lib/demo-data'
import { breathingAudio } from '@/lib/breathingSound'
import { useWellness } from '@/lib/store/WellnessContext'
import type { BreathingPhase } from '@/lib/breathingSound'
import type { BreathingPractice } from '@/lib/types'

type Phase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  Wind, ArrowUp, ArrowDown, RefreshCw, ArrowLeftRight,
}

interface BreathingViewProps {
  onBack: () => void
  initialPracticeId?: string
  onSessionStart?: (practiceId: string, practiceName: string, plannedRounds: number) => void
  onSessionComplete?: (
    practiceId: string,
    practiceName: string,
    actualRounds: number,
    activeDurationSeconds: number,
    targetRounds: number,
    completedFull: boolean,
    pausedSeconds: number,
  ) => void
}

export function BreathingView({ onBack, initialPracticeId, onSessionStart, onSessionComplete }: BreathingViewProps) {
  const { state: wellness, dispatch } = useWellness()
  const [selectedPractice, setSelectedPractice] = useState<BreathingPractice | null>(
    initialPracticeId ? (breathingPractices.find(p => p.id === initialPracticeId) ?? null) : null
  )
  const [videoPractice, setVideoPractice] = useState<BreathingPractice | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [round, setRound] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [justCompletedFor, setJustCompletedFor] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef<number>(0)
  const pausedMsRef = useRef<number>(0)
  const pauseStartAtRef = useRef<number>(0)
  const sessionActiveRef = useRef<boolean>(false)
  const sessionPracticeRef = useRef<BreathingPractice | null>(null)
  const roundRef = useRef<number>(1)
  useEffect(() => { roundRef.current = round }, [round])

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const endSession = (completedFull: boolean) => {
    if (!sessionActiveRef.current || !sessionPracticeRef.current) return
    const practice = sessionPracticeRef.current
    if (pauseStartAtRef.current > 0) {
      pausedMsRef.current += Date.now() - pauseStartAtRef.current
      pauseStartAtRef.current = 0
    }
    const totalMs = Date.now() - startedAtRef.current
    const activeSeconds = Math.max(0, Math.round((totalMs - pausedMsRef.current) / 1000))
    const pausedSeconds = Math.round(pausedMsRef.current / 1000)
    onSessionComplete?.(
      practice.id,
      practice.name,
      roundRef.current,
      activeSeconds,
      practice.rounds,
      completedFull,
      pausedSeconds,
    )
    sessionActiveRef.current = false
    sessionPracticeRef.current = null
  }

  const goToNextPhase = (practice: BreathingPractice, currentPhase: Phase, currentRound: number) => {
    const sequence = ([
      { phase: 'inhale' as BreathingPhase, duration: practice.inhale },
      { phase: 'holdIn' as BreathingPhase, duration: practice.holdIn },
      { phase: 'exhale' as BreathingPhase, duration: practice.exhale },
      { phase: 'holdOut' as BreathingPhase, duration: practice.holdOut },
    ] as { phase: BreathingPhase; duration: number }[]).filter(p => p.duration > 0)

    const currentIdx = sequence.findIndex(s => s.phase === currentPhase)
    const nextIdx = currentIdx + 1

    if (nextIdx >= sequence.length) {
      if (currentRound >= practice.rounds) {
        breathingAudio.playComplete()
        endSession(true)
        setPhase('idle'); setSecondsLeft(0); setTotalSeconds(0); setIsRunning(false); setRound(1)
        setJustCompletedFor(practice.id)
        return
      }
      const next = sequence[0]
      breathingAudio.playPhase(next.phase)
      setRound(currentRound + 1); setPhase(next.phase); setSecondsLeft(next.duration); setTotalSeconds(next.duration)
    } else {
      const next = sequence[nextIdx]
      breathingAudio.playPhase(next.phase)
      setPhase(next.phase); setSecondsLeft(next.duration); setTotalSeconds(next.duration)
    }
  }

  useEffect(() => {
    if (!isRunning || !selectedPractice) { clearTimer(); return }
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { goToNextPhase(selectedPractice, phase, round); return 0 }
        return prev - 1
      })
    }, 1000)
    return clearTimer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, selectedPractice, round])

  const handleStart = (practice: BreathingPractice) => {
    startedAtRef.current = Date.now()
    pausedMsRef.current = 0
    pauseStartAtRef.current = 0
    sessionPracticeRef.current = practice
    sessionActiveRef.current = true
    setJustCompletedFor(null)
    onSessionStart?.(practice.id, practice.name, practice.rounds)
    breathingAudio.playStart()
    setTimeout(() => breathingAudio.playPhase('inhale'), 620)
    setPhase('inhale'); setSecondsLeft(practice.inhale); setTotalSeconds(practice.inhale); setRound(1); setIsRunning(true)
  }
  const handleReset = () => {
    if (sessionActiveRef.current) endSession(false)
    clearTimer(); setPhase('idle'); setSecondsLeft(0); setTotalSeconds(0); setRound(1); setIsRunning(false)
  }

  // Track pause accumulation when user pauses/resumes mid-session.
  useEffect(() => {
    if (!sessionActiveRef.current) return
    if (!isRunning) {
      if (pauseStartAtRef.current === 0) pauseStartAtRef.current = Date.now()
    } else if (pauseStartAtRef.current > 0) {
      pausedMsRef.current += Date.now() - pauseStartAtRef.current
      pauseStartAtRef.current = 0
    }
  }, [isRunning])

  // Unmount safety: log abandoned session if user leaves view while it's running.
  useEffect(() => {
    return () => {
      if (sessionActiveRef.current) endSession(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (selectedPractice) {
    const isActive = phase !== 'idle'
    return (
      <>
      {videoPractice && <VideoModal practice={videoPractice} onClose={() => setVideoPractice(null)} />}
      <ViewShell
        header={
          <div className="flex items-center gap-3 p-4 pb-3 header-pt">
            <button
              onClick={() => { handleReset(); setSelectedPractice(null) }}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
              style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
            >
              <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
            </button>
            <div>
              <h1 className="text-white font-bold text-base">{selectedPractice.name}</h1>
              <p className="label-upper" style={{ marginTop: 2 }}>{selectedPractice.subtitle}</p>
            </div>
          </div>
        }
      >
        {/* Mobile: vertical stack | md: side-by-side */}
        <div className="px-4 pb-28 md:pb-8">
          <div className="flex flex-col md:flex-row md:gap-8 md:items-center md:justify-center md:h-full gap-6 pt-2">

            {/* Breathing circle */}
            <div className="flex justify-center md:flex-shrink-0">
              <BreathingCircle
                phase={phase}
                secondsLeft={secondsLeft}
                totalSeconds={totalSeconds}
                round={round}
                totalRounds={selectedPractice.rounds}
                size="md"
              />
            </div>

            {/* Info + controls */}
            <div className="flex flex-col gap-4 md:flex-1 md:max-w-xs">
              <GlassCard className="p-4">
                <p className="text-sm text-center md:text-left" style={{ color: 'rgba(255,248,235,0.45)' }}>
                  {selectedPractice.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3 justify-center md:justify-start">
                  {selectedPractice.inhale > 0 && <TimingBadge label="Вдох" seconds={selectedPractice.inhale} />}
                  {selectedPractice.holdIn > 0 && <TimingBadge label="Задержка" seconds={selectedPractice.holdIn} />}
                  {selectedPractice.exhale > 0 && <TimingBadge label="Выдох" seconds={selectedPractice.exhale} />}
                  {selectedPractice.holdOut > 0 && <TimingBadge label="Задержка" seconds={selectedPractice.holdOut} />}
                </div>
              </GlassCard>

              {/* Just-completed card */}
              {justCompletedFor === selectedPractice.id && (
                <GlassCard accent="amber" className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <p className="text-white font-semibold text-sm">Сессия завершена</p>
                  </div>
                  {wellness.lastAutoChecks
                    && wellness.lastAutoChecks.sessionType === 'breathing'
                    && wellness.lastAutoChecks.refId === selectedPractice.id
                    && (wellness.lastAutoChecks.taskTitles.length + wellness.lastAutoChecks.planItemTitles.length > 0) && (
                    <div className="flex flex-col gap-1 mt-1">
                      {wellness.lastAutoChecks.taskTitles.map((t, i) => (
                        <div key={`t${i}`} className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                          <span style={{ color: 'rgba(255,220,170,0.85)', fontSize: 11 }}>
                            Зачтено: <span style={{ color: 'rgba(255,248,235,0.95)' }}>{t}</span>
                          </span>
                        </div>
                      ))}
                      {wellness.lastAutoChecks.planItemTitles.map((t, i) => (
                        <div key={`p${i}`} className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                          <span style={{ color: 'rgba(255,220,170,0.85)', fontSize: 11 }}>
                            План: <span style={{ color: 'rgba(255,248,235,0.95)' }}>{t}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { setJustCompletedFor(null); dispatch({ type: 'CLEAR_AUTO_CHECKS' }) }}
                    className="self-end mt-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300"
                    style={{ background: 'rgba(255,220,170,0.1)', color: 'rgba(255,220,170,0.7)', border: '1px solid rgba(255,220,170,0.15)' }}
                  >
                    Хорошо
                  </button>
                </GlassCard>
              )}

              {/* Video demo button */}
              {selectedPractice.howTo && selectedPractice.howTo.length > 0 && (
                <button
                  onClick={() => setVideoPractice(selectedPractice)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 active:scale-[0.97]"
                  style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)', color: 'rgba(255,220,170,0.45)' }}
                >
                  <Film size={15} strokeWidth={1.5} />
                  Видео-инструкция
                </button>
              )}

              <div className="flex gap-3">
                {isActive && (
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
                    style={{ background: 'rgba(255,248,235,0.05)', border: '1px solid rgba(255,220,170,0.08)', color: 'rgba(255,248,235,0.4)' }}
                  >
                    <RotateCcw size={15} />
                    Сброс
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!isActive) handleStart(selectedPractice)
                    else if (isRunning) setIsRunning(false)
                    else setIsRunning(true)
                  }}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-400 active:scale-[0.97]"
                  style={{
                    background: isRunning
                      ? 'linear-gradient(135deg, rgba(139,117,207,0.4), rgba(139,117,207,0.2))'
                      : 'linear-gradient(135deg, rgba(201,150,90,0.8), rgba(201,150,90,0.5))',
                    border: `1px solid ${isRunning ? 'rgba(139,117,207,0.3)' : 'rgba(201,150,90,0.3)'}`,
                    boxShadow: isRunning ? 'var(--glow-violet)' : 'var(--glow-amber)',
                    color: isRunning ? 'var(--violet)' : 'rgba(255,240,210,0.95)',
                  }}
                >
                  {isRunning ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: 1 }} />}
                  {!isActive ? 'Начать' : isRunning ? 'Пауза' : 'Продолжить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ViewShell>
      </>
    )
  }

  return (
    <>
    <ViewShell
      header={
        <div className="flex items-center gap-3 p-4 pb-3 header-pt">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
            style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Дыхательные практики</h1>
            <p className="label-upper" style={{ marginTop: 2 }}>Техника и осознанность</p>
          </div>
        </div>
      }
    >
      {/* Grid: 1-col mobile, 2-col md+ */}
      <div className="px-4 pb-28 md:pb-8 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {breathingPractices.map(practice => {
            const Icon = iconMap[practice.icon] ?? Wind
            return (
              <button
                key={practice.id}
                onClick={() => setSelectedPractice(practice)}
                className="text-left w-full transition-all duration-400 active:scale-[0.98]"
              >
                <GlassCard accent="amber" className="p-4 flex items-center gap-4 h-full">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,150,90,0.12)' }}>
                    <Icon size={22} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{practice.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>{practice.subtitle}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {practice.inhale > 0 && <TimingBadge label="Вдох" seconds={practice.inhale} />}
                      {practice.holdIn > 0 && <TimingBadge label="Задержка" seconds={practice.holdIn} />}
                      {practice.exhale > 0 && <TimingBadge label="Выдох" seconds={practice.exhale} />}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--amber)' }}>{practice.rounds}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,220,170,0.3)' }}>кругов</p>
                  </div>
                </GlassCard>
              </button>
            )
          })}
        </div>
      </div>
    </ViewShell>
    </>
  )
}

function TimingBadge({ label, seconds }: { label: string; seconds: number }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(255,248,235,0.06)', color: 'rgba(255,220,170,0.4)', border: '1px solid rgba(255,220,170,0.06)' }}
    >
      {label} {seconds}с
    </span>
  )
}

function VideoModal({ practice, onClose }: { practice: BreathingPractice; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: 'rgba(18,12,30,0.97)', border: '1px solid rgba(255,220,170,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-white font-bold text-base">{practice.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>{practice.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
            style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
          >
            <X size={15} style={{ color: 'rgba(255,248,235,0.6)' }} />
          </button>
        </div>

        {/* Video placeholder */}
        <div
          className="mx-4 rounded-2xl flex flex-col items-center justify-center"
          style={{
            height: 176,
            background: 'linear-gradient(135deg, rgba(201,150,90,0.1) 0%, rgba(139,117,207,0.1) 100%)',
            border: '1px solid rgba(255,220,170,0.08)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
            style={{ background: 'rgba(201,150,90,0.18)', border: '1px solid rgba(201,150,90,0.25)', boxShadow: 'var(--glow-amber)' }}
          >
            <Play size={22} style={{ color: 'var(--amber)', marginLeft: 3 }} />
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,220,170,0.4)' }}>Видео скоро будет доступно</p>
        </div>

        {/* Steps */}
        {practice.howTo && practice.howTo.length > 0 && (
          <div className="px-5 pt-4 pb-6">
            <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,220,170,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Как выполнять
            </p>
            <ol className="flex flex-col gap-2.5">
              {practice.howTo.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(201,150,90,0.15)', color: 'var(--amber)', border: '1px solid rgba(201,150,90,0.2)' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,248,235,0.6)' }}>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
