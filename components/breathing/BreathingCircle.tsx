'use client'

type Phase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

const PARTICLE_COUNT = 8

function AirParticles({ phase, outerR, innerR }: { phase: Phase; outerR: number; innerR: number }) {
  if (phase === 'idle') return null

  const midR = Math.round((outerR + innerR) / 2)
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    angleDeg: (i / PARTICLE_COUNT) * 360,
    delay: (i / PARTICLE_COUNT) * 1.4,
  }))

  if (phase === 'inhale' || phase === 'exhale') {
    const isIn = phase === 'inhale'
    const color = isIn ? 'var(--amber)' : 'rgba(139,117,207,0.9)'
    const glow  = isIn ? '0 0 8px var(--amber)' : '0 0 8px rgba(139,117,207,0.7)'
    const kf    = isIn ? 'air-inhale 2s' : 'air-exhale 2s'

    return (
      <>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 0, height: 0,
              transform: `rotate(${p.angleDeg}deg)`,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: -2.5, top: -2.5,
                width: 5, height: 5,
                borderRadius: '50%',
                background: color,
                boxShadow: glow,
                ['--outer-y' as string]: `-${outerR}px`,
                ['--inner-y' as string]: `-${innerR}px`,
                animation: `${kf} ${p.delay}s infinite ease-${isIn ? 'in' : 'out'}`,
              }}
            />
          </div>
        ))}
      </>
    )
  }

  // holdIn / holdOut — orbit
  const isHoldIn  = phase === 'holdIn'
  const orbitDur  = isHoldIn ? 5 : 9
  const orbitColor = isHoldIn ? 'rgba(255,248,235,0.75)' : 'rgba(139,117,207,0.45)'
  const orbitGlow  = isHoldIn ? '0 0 6px rgba(255,248,235,0.55)' : '0 0 6px rgba(139,117,207,0.35)'

  return (
    <div
      style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 0, height: 0,
        animation: `air-orbit ${orbitDur}s linear infinite`,
        pointerEvents: 'none',
      }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: -2, top: -2,
            width: 4, height: 4,
            borderRadius: '50%',
            background: orbitColor,
            boxShadow: orbitGlow,
            transform: `rotate(${p.angleDeg}deg) translateY(-${midR}px)`,
          }}
        />
      ))}
    </div>
  )
}

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
  size?: 'sm' | 'md' | 'lg'
}

export function BreathingCircle({ phase, secondsLeft, totalSeconds, round, totalRounds, size = 'sm' }: BreathingCircleProps) {
  const colors = phaseColors[phase]
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1

  const sizeMap = { sm: 230, md: 280, lg: 320 }
  const radiusScale = { sm: 1, md: 1.22, lg: 1.39 }
  const svgSizeOverride = sizeMap[size]
  const scale = radiusScale[size]

  const rings = [
    { r: Math.round(95 * scale), sw: 2, speed: 1.2, opacity: 0.5 },
    { r: Math.round(75 * scale), sw: 2.5, speed: 1.0, opacity: 0.7 },
    { r: Math.round(55 * scale), sw: 3, speed: 0.8, opacity: 1 },
  ]

  const isExpanding = phase === 'inhale'
  const isContracting = phase === 'exhale'

  const ringScale = (speedFactor: number) => {
    const base = 1
    if (isExpanding) return base + (1 - progress) * 0.12 * speedFactor
    if (isContracting) return base + progress * 0.12 * speedFactor
    return base
  }

  const svgSize = svgSizeOverride
  const outerR  = rings[0].r
  const innerR  = rings[2].r

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

        {/* Air circulation particles */}
        <AirParticles key={phase} phase={phase} outerR={outerR} innerR={innerR} />

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
