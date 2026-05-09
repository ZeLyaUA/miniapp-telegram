'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Play, Pause, RotateCcw, Wind, ArrowUp, ArrowDown, RefreshCw, ArrowLeftRight } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import { BreathingCircle } from './BreathingCircle'
import { breathingPractices } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import type { BreathingPractice } from '@/lib/types'

type Phase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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
        setPhase('idle')
        setSecondsLeft(0)
        setTotalSeconds(0)
        setIsRunning(false)
        setRound(1)
        return
      }
      const next = sequence[0]
      setRound(currentRound + 1)
      setPhase(next.phase)
      setSecondsLeft(next.duration)
      setTotalSeconds(next.duration)
    } else {
      const next = sequence[nextIdx]
      setPhase(next.phase)
      setSecondsLeft(next.duration)
      setTotalSeconds(next.duration)
    }
  }

  useEffect(() => {
    if (!isRunning || !selectedPractice) {
      clearTimer()
      return
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          goToNextPhase(selectedPractice, phase, round)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, selectedPractice, round])

  const handleStart = (practice: BreathingPractice) => {
    setPhase('inhale')
    setSecondsLeft(practice.inhale)
    setTotalSeconds(practice.inhale)
    setRound(1)
    setIsRunning(true)
  }

  const handlePause = () => setIsRunning(false)
  const handleResume = () => setIsRunning(true)

  const handleReset = () => {
    clearTimer()
    setPhase('idle')
    setSecondsLeft(0)
    setTotalSeconds(0)
    setRound(1)
    setIsRunning(false)
  }

  if (selectedPractice) {
    const isActive = phase !== 'idle'
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 pb-2">
          <button
            onClick={() => { handleReset(); setSelectedPractice(null) }}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">{selectedPractice.name}</h1>
            <p className="text-white/40 text-xs">{selectedPractice.subtitle}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 flex flex-col items-center gap-6">
          <div className="mt-4">
            <BreathingCircle
              phase={phase}
              secondsLeft={secondsLeft}
              totalSeconds={totalSeconds}
              round={round}
              totalRounds={selectedPractice.rounds}
            />
          </div>

          <GlassCard className="w-full p-4 text-center">
            <p className="text-white/50 text-sm">{selectedPractice.description}</p>
            <div className="flex justify-center gap-4 mt-3 text-xs text-white/30">
              {selectedPractice.inhale > 0 && <span>Вдох {selectedPractice.inhale}с</span>}
              {selectedPractice.holdIn > 0 && <span>Задержка {selectedPractice.holdIn}с</span>}
              {selectedPractice.exhale > 0 && <span>Выдох {selectedPractice.exhale}с</span>}
              {selectedPractice.holdOut > 0 && <span>Задержка {selectedPractice.holdOut}с</span>}
            </div>
          </GlassCard>

          <div className="flex gap-3 w-full">
            {isActive && (
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 rounded-2xl font-medium text-white/60 flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <RotateCcw size={16} />
                Сброс
              </button>
            )}
            <button
              onClick={() => {
                if (!isActive) handleStart(selectedPractice)
                else if (isRunning) handlePause()
                else handleResume()
              }}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{
                background: isRunning
                  ? 'rgba(255,107,53,0.2)'
                  : 'linear-gradient(135deg, var(--neon-cyan), rgba(0,180,220,1))',
                boxShadow: isRunning ? 'var(--glow-orange)' : 'var(--glow-cyan)',
                border: isRunning ? '1px solid rgba(255,107,53,0.3)' : 'none',
              }}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
              {!isActive ? 'Начать' : isRunning ? 'Пауза' : 'Продолжить'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 pb-2">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Дыхательные практики</h1>
          <p className="text-white/40 text-xs">Техника и осознанность</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 flex flex-col gap-3">
        {breathingPractices.map(practice => {
          const Icon = iconMap[practice.icon] ?? Wind
          return (
            <button
              key={practice.id}
              onClick={() => setSelectedPractice(practice)}
              className="text-left w-full transition-transform duration-150 active:scale-[0.98]"
            >
              <GlassCard accent="orange" className="p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,107,53,0.12)', boxShadow: 'var(--glow-orange)' }}
                >
                  <Icon size={22} className="text-neon-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{practice.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{practice.subtitle}</p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {practice.inhale > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-white/40"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        Вдох {practice.inhale}с
                      </span>
                    )}
                    {practice.holdIn > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-white/40"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        Задержка {practice.holdIn}с
                      </span>
                    )}
                    {practice.exhale > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-white/40"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        Выдох {practice.exhale}с
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-neon-orange font-semibold text-sm">{practice.rounds}</p>
                  <p className="text-white/30 text-xs">кругов</p>
                </div>
              </GlassCard>
            </button>
          )
        })}
      </div>
    </div>
  )
}
