'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Play, Pause, RotateCcw, Wind, ArrowUp, ArrowDown, RefreshCw, ArrowLeftRight } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { BreathingCircle } from './BreathingCircle'
import { breathingPractices } from '@/lib/demo-data'
import { breathingAudio } from '@/lib/breathingSound'
import type { BreathingPractice } from '@/lib/types'

type Phase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  Wind, ArrowUp, ArrowDown, RefreshCw, ArrowLeftRight,
}

interface BreathingViewProps {
  onBack: () => void
}

export function BreathingView({ onBack }: BreathingViewProps) {
  const [selectedPractice, setSelectedPractice] = useState<BreathingPractice | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [round, setRound] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const goToNextPhase = (practice: BreathingPractice, currentPhase: Phase, currentRound: number) => {
    const sequence = ([
      { phase: 'inhale' as Phase, duration: practice.inhale },
      { phase: 'holdIn' as Phase, duration: practice.holdIn },
      { phase: 'exhale' as Phase, duration: practice.exhale },
      { phase: 'holdOut' as Phase, duration: practice.holdOut },
    ] as { phase: Phase; duration: number }[]).filter(p => p.duration > 0)

    const currentIdx = sequence.findIndex(s => s.phase === currentPhase)
    const nextIdx = currentIdx + 1

    if (nextIdx >= sequence.length) {
      if (currentRound >= practice.rounds) {
        breathingAudio.playComplete()
        setPhase('idle'); setSecondsLeft(0); setTotalSeconds(0); setIsRunning(false); setRound(1)
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
    breathingAudio.playStart()
    setTimeout(() => breathingAudio.playPhase('inhale'), 620)
    setPhase('inhale'); setSecondsLeft(practice.inhale); setTotalSeconds(practice.inhale); setRound(1); setIsRunning(true)
  }
  const handleReset = () => { clearTimer(); setPhase('idle'); setSecondsLeft(0); setTotalSeconds(0); setRound(1); setIsRunning(false) }

  if (selectedPractice) {
    const isActive = phase !== 'idle'
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 pb-3 pt-4 md:pt-20 lg:pt-4">
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

        {/* Mobile: vertical stack | md: side-by-side */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 md:pb-8">
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
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-3 pt-4 md:pt-20 lg:pt-4">
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

      {/* Grid: 1-col mobile, 2-col md+ */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 md:pb-8 pt-2">
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
    </div>
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
