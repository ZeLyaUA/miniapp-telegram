'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Pause, Play, CheckCircle2 } from 'lucide-react'
import type { MeditationSession } from '@/lib/types'
import { useWellness } from '@/lib/store/WellnessContext'

const guidance = [
  'Позвольте мыслям приходить и уходить',
  'Наблюдайте за дыханием, не меняя его',
  'Если ум отвлёкся — мягко возвращайтесь',
  'Почувствуйте, как расслабляется тело',
  'Вы здесь. Вы в безопасности. Всё хорошо.',
  'Просто существуйте в этом моменте',
  'Позвольте себе ничего не делать',
]

type PlayerState = 'playing' | 'paused' | 'completed'

interface SessionPlayerProps {
  session: MeditationSession
  onClose: () => void
  onStart?: (sessionId: string, sessionTitle: string, plannedMinutes: number) => void
  onComplete?: (
    sessionId: string,
    sessionTitle: string,
    durationMinutes: number,
    completedFull: boolean,
    actualMinutes: number,
    pausedSeconds: number,
  ) => void
  streak?: number
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function SessionPlayer({ session, onClose, onStart, onComplete, streak = 0 }: SessionPlayerProps) {
  const { state: wellness, dispatch } = useWellness()
  const totalSeconds = session.duration * 60
  const [state, setState] = useState<PlayerState>('playing')
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [guidanceIdx, setGuidanceIdx] = useState(0)
  const [guidanceKey, setGuidanceKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const guidanceRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number>(0)
  const pausedMsRef = useRef<number>(0)
  const pauseStartAtRef = useRef<number>(0)
  const completedRef = useRef(false)

  // Fire session_started once on mount; capture true start time here.
  useEffect(() => {
    startedAtRef.current = Date.now()
    onStart?.(session.id, session.title, session.duration)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finalize = useCallback((completedFull: boolean) => {
    if (completedRef.current) return
    completedRef.current = true
    if (pauseStartAtRef.current > 0) {
      pausedMsRef.current += Date.now() - pauseStartAtRef.current
      pauseStartAtRef.current = 0
    }
    const totalMs = Date.now() - startedAtRef.current
    const actualMinutes = Math.max(0, (totalMs - pausedMsRef.current) / 60000)
    const pausedSeconds = Math.round(pausedMsRef.current / 1000)
    onComplete?.(session.id, session.title, session.duration, completedFull, actualMinutes, pausedSeconds)
  }, [onComplete, session.id, session.title, session.duration])

  // Safety net: log abandoned session if user navigates away (e.g., system back).
  useEffect(() => {
    return () => {
      if (!completedRef.current) finalize(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clear = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (guidanceRef.current) clearInterval(guidanceRef.current)
  }

  useEffect(() => {
    if (state === 'paused') {
      if (pauseStartAtRef.current === 0) pauseStartAtRef.current = Date.now()
    } else if (state === 'playing' && pauseStartAtRef.current > 0) {
      pausedMsRef.current += Date.now() - pauseStartAtRef.current
      pauseStartAtRef.current = 0
    }

    if (state !== 'playing') { clear(); return }

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          finalize(true)
          setState('completed')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    guidanceRef.current = setInterval(() => {
      setGuidanceIdx(prev => (prev + 1) % guidance.length)
      setGuidanceKey(prev => prev + 1)
    }, 30000)

    return clear
  }, [state, finalize])

  const progress = (totalSeconds - secondsLeft) / totalSeconds
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  if (state === 'completed') {
    const autoChecks = wellness.lastAutoChecks
    const showAutoChecks = autoChecks
      && autoChecks.sessionType === 'meditation'
      && autoChecks.refId === session.id
      && (autoChecks.taskTitles.length > 0 || autoChecks.planItemTitles.length > 0)
    const handleDismiss = () => {
      dispatch({ type: 'CLEAR_AUTO_CHECKS' })
      onClose()
    }
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 gap-6"
        style={{ background: session.moodColor ?? 'linear-gradient(135deg, rgba(201,150,90,0.3) 0%, rgba(139,117,207,0.2) 100%)', backdropFilter: 'blur(40px)' }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(9,7,15,0.55)' }} />

        <div className="relative flex flex-col items-center gap-6 text-center">
          <div className="pop-in text-6xl">✨</div>
          <div>
            <p className="text-white font-bold" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Готово</p>
            <p className="mt-1" style={{ color: 'rgba(255,220,170,0.6)', fontSize: 15 }}>
              «{session.title}» завершена
            </p>
          </div>

          <div
            className="flex flex-col items-center gap-3 px-8 py-5 rounded-3xl"
            style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.1)' }}
          >
            <p className="text-white text-2xl font-bold">{session.duration} мин</p>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(session.duration, 7) }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: 'var(--amber)',
                    boxShadow: 'var(--glow-amber)',
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
            <p style={{ color: 'rgba(255,220,170,0.5)', fontSize: 13 }}>
              🔥 Серия: {streak + 1} дней
            </p>
          </div>

          {showAutoChecks && (
            <div
              className="flex flex-col gap-1.5 px-5 py-3 rounded-2xl max-w-xs"
              style={{ background: 'rgba(201,150,90,0.10)', border: '1px solid rgba(201,150,90,0.18)' }}
            >
              {autoChecks!.taskTitles.map((t, i) => (
                <div key={`t${i}`} className="flex items-center gap-2 text-left">
                  <CheckCircle2 size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,220,170,0.85)', fontSize: 12 }}>
                    Зачтено: <span style={{ color: 'rgba(255,248,235,0.95)' }}>{t}</span>
                  </span>
                </div>
              ))}
              {autoChecks!.planItemTitles.map((t, i) => (
                <div key={`p${i}`} className="flex items-center gap-2 text-left">
                  <CheckCircle2 size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,220,170,0.85)', fontSize: 12 }}>
                    План: <span style={{ color: 'rgba(255,248,235,0.95)' }}>{t}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, rgba(201,150,90,0.8), rgba(201,150,90,0.5))',
              boxShadow: 'var(--glow-amber)',
              color: 'rgba(255,240,210,0.95)',
            }}
          >
            Отлично!
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Mood background — blurred */}
      <div
        className="absolute inset-0"
        style={{
          background: session.moodColor ?? 'linear-gradient(135deg, rgba(201,150,90,0.3) 0%, rgba(139,117,207,0.2) 100%)',
          filter: 'blur(60px)',
          transform: 'scale(1.1)',
          opacity: 0.6,
        }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(9,7,15,0.7)' }} />

      {/* Centered content wrapper for md+ */}
      <div className="relative flex flex-col h-full w-full md:max-w-lg md:mx-auto">

      {/* Controls */}
      <div
        className="relative flex items-center justify-between px-5"
        style={{ paddingTop: 'max(20px, var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top)))' }}
      >
        <button
          onClick={() => {
            finalize(false)
            onClose()
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
          style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
        >
          <X size={18} style={{ color: 'rgba(255,248,235,0.5)' }} />
        </button>
        <div className="text-center">
          <p className="text-white font-medium text-sm truncate max-w-[180px]">{session.title}</p>
          <p className="label-upper" style={{ marginTop: 2 }}>{session.duration} мин</p>
        </div>
        <button
          onClick={() => setState(s => s === 'playing' ? 'paused' : 'playing')}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
          style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
        >
          {state === 'playing'
            ? <Pause size={18} style={{ color: 'rgba(255,248,235,0.5)' }} />
            : <Play size={18} style={{ color: 'var(--amber)', marginLeft: 1 }} />}
        </button>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {/* Ambient orb behind ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 260,
            height: 260,
            background: `radial-gradient(circle, ${
              session.moodColor ? 'rgba(201,150,90,0.12)' : 'rgba(201,150,90,0.1)'
            } 0%, transparent 70%)`,
            animation: 'ambient-breathe 8s ease-in-out infinite',
          }}
        />

        {/* Progress ring + timer */}
        <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
          <svg width="240" height="240" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="120" cy="120" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            {/* Progress */}
            <circle
              cx="120" cy="120" r={radius}
              fill="none"
              stroke="var(--amber)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeOpacity="0.7"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          <div className="flex flex-col items-center gap-3">
            {/* Pulsing dot */}
            <div
              className="med-pulse rounded-full"
              style={{
                width: 12,
                height: 12,
                background: state === 'paused' ? 'rgba(255,220,170,0.3)' : 'var(--amber)',
                boxShadow: state === 'paused' ? 'none' : 'var(--glow-amber)',
                animationPlayState: state === 'playing' ? 'running' : 'paused',
              }}
            />
            {/* Countdown */}
            <span
              className="font-bold tabular-nums"
              style={{ fontSize: 52, color: 'rgba(255,248,235,0.92)', lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              {formatTime(secondsLeft)}
            </span>
            {state === 'paused' && (
              <span className="label-upper" style={{ color: 'rgba(255,220,170,0.4)' }}>ПАУЗА</span>
            )}
          </div>
        </div>

        {/* Guidance text */}
        <div className="text-center px-4" style={{ minHeight: 56 }}>
          <p
            key={guidanceKey}
            className="guidance-enter"
            style={{
              color: 'rgba(255,248,235,0.55)',
              fontSize: 15,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {guidance[guidanceIdx]}
          </p>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div
        className="relative px-6"
        style={{ paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 16px))' }}
      >
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(to right, var(--amber), var(--violet))',
              transition: 'width 1s linear',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="label-upper" style={{ color: 'rgba(255,220,170,0.25)' }}>
            {formatTime(totalSeconds - secondsLeft)}
          </span>
          <span className="label-upper" style={{ color: 'rgba(255,220,170,0.25)' }}>
            {formatTime(totalSeconds)}
          </span>
        </div>
      </div>
      </div>{/* end centered wrapper */}
    </div>
  )
}
