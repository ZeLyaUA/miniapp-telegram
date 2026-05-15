'use client'

import { useState, useSyncExternalStore } from 'react'
import { Wind, Brain, CalendarCheck, BarChart3, Sparkles, X, ChevronRight, Sun } from 'lucide-react'

const STORAGE_KEY = 'onboarding_v1_done'

const onboardingListeners = new Set<() => void>()
const subscribeOnboarding = (l: () => void) => {
  onboardingListeners.add(l)
  return () => { onboardingListeners.delete(l) }
}
const notifyOnboarding = () => onboardingListeners.forEach(l => l())
const getOnboardingDone = () => {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}
const getOnboardingDoneServer = () => true  // на сервере не показываем тур

const steps = [
  {
    tag: 'ДОБРО ПОЖАЛОВАТЬ',
    icon: Sparkles,
    iconColor: 'var(--amber)',
    iconBg: 'rgba(201,150,90,0.12)',
    title: 'Ваше пространство\nдля практик',
    description: 'Здесь живут дыхание, медитация и осознанность. Мы покажем, что есть в приложении — это займёт полминуты.',
    visual: <WelcomeVisual />,
  },
  {
    tag: 'КАРТА ДНЯ',
    icon: Sun,
    iconColor: 'var(--amber)',
    iconBg: 'rgba(201,150,90,0.12)',
    title: 'Каждый день\nновая карта',
    description: 'Открывайте день с намерением: карта предлагает практику, аффирмацию и вопрос для рефлексии.',
    visual: <DayCardVisual />,
  },
  {
    tag: 'ДЫХАНИЕ',
    icon: Wind,
    iconColor: 'var(--violet)',
    iconBg: 'rgba(139,117,207,0.12)',
    title: 'Управляйте\nсостоянием',
    description: 'Техники для бодрости, концентрации и расслабления. Работают за 3–5 минут в любом месте.',
    visual: <BreathingVisual />,
  },
  {
    tag: 'МЕДИТАЦИЯ',
    icon: Brain,
    iconColor: 'var(--violet)',
    iconBg: 'rgba(139,117,207,0.12)',
    title: 'Библиотека\nмедитаций',
    description: 'Сессии от 5 до 45 минут — для утра, вечера или сложного момента дня. Всегда есть то, что нужно.',
    visual: <MeditationVisual />,
  },
  {
    tag: 'ПЛАН',
    icon: CalendarCheck,
    iconColor: 'var(--amber)',
    iconBg: 'rgba(201,150,90,0.12)',
    title: 'Персональный\nплан практик',
    description: 'Следуйте расписанию на неделю. Приложение подберёт практики под ваш ритм.',
    visual: <PlanVisual />,
  },
  {
    tag: 'ТРЕКЕР',
    icon: BarChart3,
    iconColor: '#6A9B7E',
    iconBg: 'rgba(106,155,126,0.12)',
    title: 'Серия и прогресс',
    description: 'Каждая сессия считается. Смотрите серию дней, минуты практик и рост осознанности.',
    visual: <TrackerVisual />,
  },
]

export function OnboardingTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const current = steps[step]
  const isLast = step === steps.length - 1

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1')
    onDone()
  }

  function goNext() {
    if (isLast) { finish(); return }
    setDirection('next')
    setExiting(true)
    setTimeout(() => { setStep(s => s + 1); setExiting(false) }, 180)
  }

  function goPrev() {
    if (step === 0) return
    setDirection('prev')
    setExiting(true)
    setTimeout(() => { setStep(s => s - 1); setExiting(false) }, 180)
  }

  const slideStyle: React.CSSProperties = {
    transform: exiting
      ? `translateX(${direction === 'next' ? '-8%' : '8%'})`
      : 'translateX(0)',
    opacity: exiting ? 0 : 1,
    transition: 'transform 0.18s ease-in, opacity 0.18s ease-in',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: 'rgba(9,7,15,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Skip button */}
      <div className="flex justify-end px-5 pt-5">
        <button
          onClick={finish}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-opacity opacity-40 hover:opacity-70"
          style={{ color: 'rgba(255,220,170,0.8)', border: '1px solid rgba(255,220,170,0.15)' }}
        >
          <X size={12} />
          Пропустить
        </button>
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-4" style={slideStyle}>
        {/* Visual */}
        <div className="w-full max-w-xs mb-8">
          {current.visual}
        </div>

        {/* Tag */}
        <span
          className="text-[10px] font-semibold tracking-widest mb-3"
          style={{ color: current.iconColor, opacity: 0.7, letterSpacing: '0.14em' }}
        >
          {current.tag}
        </span>

        {/* Title */}
        <h2
          className="text-center font-bold leading-tight mb-3 whitespace-pre-line"
          style={{ fontSize: 26, color: 'rgba(255,248,235,0.95)', letterSpacing: '-0.02em' }}
        >
          {current.title}
        </h2>

        {/* Description */}
        <p
          className="text-center text-sm leading-relaxed max-w-[280px]"
          style={{ color: 'rgba(255,220,170,0.55)', lineHeight: 1.65 }}
        >
          {current.description}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-5 px-5 pb-10">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const d = i > step ? 'next' : 'prev'
                setDirection(d)
                setExiting(true)
                setTimeout(() => { setStep(i); setExiting(false) }, 180)
              }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                background: i === step
                  ? current.iconColor
                  : 'rgba(255,220,170,0.15)',
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          {step > 0 && (
            <button
              onClick={goPrev}
              className="flex-1 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-95"
              style={{
                background: 'rgba(255,248,235,0.06)',
                border: '1px solid rgba(255,220,170,0.1)',
                color: 'rgba(255,220,170,0.6)',
              }}
            >
              Назад
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(201,150,90,0.3) 0%, rgba(139,117,207,0.2) 100%)',
              border: '1px solid rgba(201,150,90,0.3)',
              color: 'rgba(255,220,170,0.95)',
              boxShadow: '0 0 20px rgba(201,150,90,0.15)',
            }}
          >
            {isLast ? 'Начать' : 'Далее'}
            {!isLast && <ChevronRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function useOnboarding() {
  const isDone = useSyncExternalStore(subscribeOnboarding, getOnboardingDone, getOnboardingDoneServer)
  return {
    show: !isDone,
    done: () => {
      try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
      notifyOnboarding()
    },
    reset: () => {
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      notifyOnboarding()
    },
  }
}

/* ─── Step visuals ──────────────────────────────────────────────── */

function WelcomeVisual() {
  return (
    <div className="relative flex items-center justify-center" style={{ height: 180 }}>
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(201,150,90,0.18) 0%, transparent 70%)' }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {[Wind, Brain, CalendarCheck, BarChart3].map((Icon, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,248,235,0.06)',
                border: '1px solid rgba(255,220,170,0.1)',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <Icon size={22} style={{ color: i % 2 === 0 ? 'var(--amber)' : 'var(--violet)', opacity: 0.85 }} />
            </div>
          ))}
        </div>
        <div
          className="px-4 py-2 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(201,150,90,0.1)',
            border: '1px solid rgba(201,150,90,0.2)',
            color: 'rgba(255,220,170,0.7)',
            letterSpacing: '0.06em',
          }}
        >
          Midnight Ritual
        </div>
      </div>
    </div>
  )
}

function DayCardVisual() {
  return (
    <div className="relative" style={{ height: 180 }}>
      <div
        className="absolute inset-x-0 top-4 mx-auto rounded-3xl p-4 flex flex-col gap-2"
        style={{
          background: 'linear-gradient(135deg, rgba(201,150,90,0.18) 0%, rgba(139,117,207,0.12) 100%)',
          border: '1px solid rgba(255,220,170,0.12)',
          maxWidth: 260,
        }}
      >
        <div
          className="absolute -top-6 -right-6 w-28 h-28 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,150,90,0.2) 0%, transparent 70%)', filter: 'blur(14px)' }}
        />
        <span
          className="text-[10px] font-semibold px-3 py-1 rounded-full self-start"
          style={{ background: 'rgba(255,220,170,0.1)', color: 'rgba(255,220,170,0.65)', letterSpacing: '0.08em' }}
        >
          КАРТА ДНЯ
        </span>
        <p className="text-white font-bold" style={{ fontSize: 17 }}>14 мая</p>
        <p style={{ color: 'rgba(255,248,235,0.4)', fontSize: 13 }}>среда</p>
        <div className="flex justify-end mt-1">
          <span
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ background: 'rgba(255,220,170,0.12)', color: 'rgba(255,220,170,0.8)', border: '1px solid rgba(255,220,170,0.15)' }}
          >
            Открыть →
          </span>
        </div>
      </div>
    </div>
  )
}

function BreathingVisual() {
  return (
    <div className="relative flex items-center justify-center" style={{ height: 180 }}>
      <div
        className="absolute rounded-full"
        style={{ width: 120, height: 120, background: 'radial-gradient(circle, rgba(139,117,207,0.25) 0%, transparent 70%)', filter: 'blur(16px)' }}
      />
      <div
        className="absolute rounded-full"
        style={{ width: 80, height: 80, background: 'rgba(139,117,207,0.12)', border: '1px solid rgba(139,117,207,0.25)' }}
      />
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: 52, height: 52, background: 'rgba(139,117,207,0.18)', border: '1px solid rgba(139,117,207,0.35)' }}
      >
        <Wind size={22} style={{ color: 'var(--violet)' }} />
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {['4-7-8', 'Бокс', 'Огонь'].map((name) => (
          <span
            key={name}
            className="text-[10px] px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(139,117,207,0.1)', border: '1px solid rgba(139,117,207,0.15)', color: 'rgba(139,117,207,0.8)' }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

function MeditationVisual() {
  const sessions = [
    { title: 'Утреннее пробуждение', mins: '10 мин' },
    { title: 'Снятие тревоги', mins: '15 мин' },
    { title: 'Глубокий сон', mins: '30 мин' },
  ]
  return (
    <div className="flex flex-col gap-2" style={{ height: 180, justifyContent: 'center' }}>
      {sessions.map((s, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(139,117,207,0.08)',
            border: '1px solid rgba(139,117,207,0.12)',
            opacity: i === 0 ? 1 : i === 1 ? 0.75 : 0.45,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,117,207,0.15)' }}
            >
              <Brain size={14} style={{ color: 'var(--violet)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'rgba(255,248,235,0.8)' }}>{s.title}</span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(139,117,207,0.7)' }}>{s.mins}</span>
        </div>
      ))}
    </div>
  )
}

function PlanVisual() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const done = [true, true, true, false, false, false, false]
  const today = 3
  return (
    <div className="flex flex-col gap-3" style={{ height: 180, justifyContent: 'center' }}>
      <div className="flex justify-between px-1">
        {days.map((d, i) => (
          <div key={d} className="flex flex-col items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: done[i]
                  ? 'linear-gradient(135deg, var(--amber), rgba(201,150,90,0.6))'
                  : i === today ? 'rgba(201,150,90,0.12)' : 'rgba(255,255,255,0.04)',
                border: done[i] ? 'none' : i === today ? '1px solid rgba(201,150,90,0.4)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: done[i] ? '0 0 12px rgba(201,150,90,0.3)' : 'none',
              }}
            >
              {done[i] && <div className="w-2 h-2 rounded-full bg-white opacity-90" />}
            </div>
            <span className="text-[10px]" style={{ color: done[i] ? 'var(--amber)' : i === today ? 'rgba(201,150,90,0.6)' : 'rgba(255,255,255,0.2)' }}>{d}</span>
          </div>
        ))}
      </div>
      <div
        className="mx-1 px-4 py-2.5 rounded-2xl flex items-center justify-between"
        style={{ background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.12)' }}
      >
        <div className="flex items-center gap-2">
          <CalendarCheck size={14} style={{ color: 'var(--amber)', opacity: 0.7 }} />
          <span className="text-sm" style={{ color: 'rgba(255,248,235,0.7)' }}>Медитация · 15 мин</span>
        </div>
        <span className="text-xs" style={{ color: 'rgba(201,150,90,0.6)' }}>Сегодня</span>
      </div>
    </div>
  )
}

function TrackerVisual() {
  const bars = [40, 65, 30, 80, 55, 90, 45]
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  return (
    <div className="flex flex-col gap-4" style={{ height: 180, justifyContent: 'center' }}>
      <div className="flex items-end justify-between gap-1.5 px-2" style={{ height: 80 }}>
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-lg"
              style={{
                height: `${h}%`,
                background: i === 5
                  ? 'linear-gradient(180deg, var(--amber) 0%, rgba(201,150,90,0.4) 100%)'
                  : 'rgba(255,220,170,0.1)',
                border: i === 5 ? '1px solid rgba(201,150,90,0.3)' : '1px solid rgba(255,220,170,0.06)',
                boxShadow: i === 5 ? '0 0 10px rgba(201,150,90,0.2)' : 'none',
              }}
            />
            <span className="text-[9px]" style={{ color: i === 5 ? 'var(--amber)' : 'rgba(255,255,255,0.2)' }}>{days[i]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 px-1">
        {[
          { label: 'Серия', value: '7 дней', color: 'var(--amber)' },
          { label: 'Неделя', value: '95 мин', color: 'var(--violet)' },
          { label: 'Всего', value: '42 сес.', color: '#6A9B7E' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex flex-col items-center py-2 rounded-xl"
            style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.06)' }}
          >
            <span className="text-xs font-bold" style={{ color }}>{value}</span>
            <span className="text-[10px]" style={{ color: 'rgba(255,220,170,0.3)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
