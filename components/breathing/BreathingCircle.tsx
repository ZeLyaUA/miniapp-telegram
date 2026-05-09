'use client'

import { Wind } from 'lucide-react'

type Phase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

const phaseLabel: Record<Phase, string> = {
  idle: 'Готов',
  inhale: 'Вдох',
  holdIn: 'Задержка',
  exhale: 'Выдох',
  holdOut: 'Задержка',
}

const phaseColor: Record<Phase, string> = {
  idle: 'rgba(255,255,255,0.3)',
  inhale: 'var(--neon-cyan)',
  holdIn: 'rgba(255,255,255,0.8)',
  exhale: 'var(--neon-orange)',
  holdOut: 'rgba(255,107,53,0.6)',
}

interface BreathingCircleProps {
  phase: Phase
  secondsLeft: number
  totalSeconds: number
  round: number
  totalRounds: number
}

export function BreathingCircle({ phase, secondsLeft, totalSeconds, round, totalRounds }: BreathingCircleProps) {
  const radius = 90
  const strokeWidth = 6
  const circumference = 2 * Math.PI * radius
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1
  const dashOffset = circumference * (1 - progress)

  const scale = phase === 'inhale'
    ? 1 + (1 - progress) * 0.15
    : phase === 'exhale'
      ? 1 + progress * 0.15
      : 1

  const color = phaseColor[phase]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        <svg width="220" height="220" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease' }}
          />
        </svg>

        <div
          className="flex flex-col items-center justify-center rounded-full"
          style={{
            width: 160,
            height: 160,
            background: `radial-gradient(circle, rgba(${phase === 'exhale' || phase === 'holdOut' ? '255,107,53' : '0,212,255'}, 0.15) 0%, transparent 70%)`,
            transform: `scale(${scale})`,
            transition: 'transform 0.5s ease, background 0.4s ease',
            boxShadow: `0 0 40px rgba(${phase === 'exhale' || phase === 'holdOut' ? '255,107,53' : '0,212,255'}, 0.2)`,
          }}
        >
          <Wind size={32} style={{ color, transition: 'color 0.4s ease' }} />
          <span
            className="text-3xl font-bold mt-1"
            style={{ color, transition: 'color 0.4s ease' }}
          >
            {totalSeconds > 0 ? secondsLeft : ''}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-white text-xl font-semibold" style={{ color, transition: 'color 0.4s ease' }}>
          {phaseLabel[phase]}
        </p>
        {totalRounds > 0 && (
          <p className="text-white/30 text-sm mt-1">
            Круг {round} из {totalRounds}
          </p>
        )}
      </div>
    </div>
  )
}
