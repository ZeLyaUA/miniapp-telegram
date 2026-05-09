'use client'

type Phase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

const phaseLabel: Record<Phase, string> = {
  idle: 'Готов',
  inhale: 'Вдох',
  holdIn: 'Задержка',
  exhale: 'Выдох',
  holdOut: 'Задержка',
}

const phaseColors: Record<Phase, { ring: string; ambient: string; dot: string }> = {
  idle:    { ring: 'rgba(255,220,170,0.3)', ambient: 'rgba(201,150,90,0.08)', dot: 'rgba(255,220,170,0.5)' },
  inhale:  { ring: 'var(--amber)',          ambient: 'rgba(201,150,90,0.18)', dot: 'var(--amber)' },
  holdIn:  { ring: 'rgba(255,248,235,0.7)', ambient: 'rgba(255,248,235,0.12)', dot: 'rgba(255,248,235,0.9)' },
  exhale:  { ring: 'var(--violet)',         ambient: 'rgba(139,117,207,0.18)', dot: 'var(--violet)' },
  holdOut: { ring: 'rgba(139,117,207,0.5)', ambient: 'rgba(139,117,207,0.08)', dot: 'rgba(139,117,207,0.7)' },
}

interface BreathingCircleProps {
  phase: Phase
  secondsLeft: number
  totalSeconds: number
  round: number
  totalRounds: number
}

export function BreathingCircle({ phase, secondsLeft, totalSeconds, round, totalRounds }: BreathingCircleProps) {
  const colors = phaseColors[phase]
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1

  const rings = [
    { r: 95, sw: 2, speed: 1.2, opacity: 0.5 },
    { r: 75, sw: 2.5, speed: 1.0, opacity: 0.7 },
    { r: 55, sw: 3, speed: 0.8, opacity: 1 },
  ]

  const isExpanding = phase === 'inhale'
  const isContracting = phase === 'exhale'

  const ringScale = (speedFactor: number) => {
    const base = 1
    if (isExpanding) return base + (1 - progress) * 0.12 * speedFactor
    if (isContracting) return base + progress * 0.12 * speedFactor
    return base
  }

  const svgSize = 230

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Ambient glow behind the circles */}
      <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.ambient} 0%, transparent 70%)`,
            transition: 'background 1.2s ease',
            animation: 'ambient-breathe 4s ease-in-out infinite',
          }}
        />

        {/* Three concentric SVG rings */}
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ position: 'absolute' }}
        >
          {rings.map((ring, i) => {
            const cx = svgSize / 2
            const cy = svgSize / 2
            const circumference = 2 * Math.PI * ring.r
            const dashOffset = circumference * progress
            const scale = ringScale(1 - i * 0.2)
            return (
              <g
                key={i}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: `transform ${0.8 + i * 0.2}s ease`,
                }}
              >
                {/* Track */}
                <circle
                  cx={cx} cy={cy} r={ring.r}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={ring.sw}
                />
                {/* Progress ring */}
                <circle
                  cx={cx} cy={cy} r={ring.r}
                  fill="none"
                  stroke={colors.ring}
                  strokeWidth={ring.sw}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeOpacity={ring.opacity}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  style={{
                    transition: `stroke-dashoffset ${totalSeconds > 0 ? 0.9 : 0}s linear, stroke 1.2s ease, stroke-opacity 0.8s ease`,
                  }}
                />
              </g>
            )
          })}
        </svg>

        {/* Center content */}
        <div className="relative flex flex-col items-center justify-center gap-1">
          {/* Pulsing dot */}
          <div
            className="pulse-dot rounded-full mb-1"
            style={{
              width: 10,
              height: 10,
              background: colors.dot,
              boxShadow: `0 0 12px ${colors.dot}`,
              transition: 'background 1.2s ease, box-shadow 1.2s ease',
            }}
          />
          {/* Seconds */}
          <span
            className="font-bold tabular-nums"
            style={{
              fontSize: totalSeconds > 0 ? 44 : 0,
              color: 'rgba(255,248,235,0.9)',
              lineHeight: 1,
              transition: 'color 1.2s ease, font-size 0.3s ease',
            }}
          >
            {totalSeconds > 0 ? secondsLeft : ''}
          </span>
        </div>
      </div>

      {/* Phase label */}
      <div className="text-center">
        <p
          className="text-xl font-semibold"
          style={{ color: colors.ring, transition: 'color 1.2s ease', letterSpacing: '0.02em' }}
        >
          {phaseLabel[phase]}
        </p>
        {totalRounds > 0 && (
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,220,170,0.3)', letterSpacing: '0.08em' }}>
            КРУГ {round} ИЗ {totalRounds}
          </p>
        )}
      </div>
    </div>
  )
}
