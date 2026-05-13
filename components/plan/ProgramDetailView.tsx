'use client'

import { ChevronLeft, Play, Wind, Brain, ChevronRight, CalendarDays, Layers } from 'lucide-react'
import { GlassCard } from '@/components/layout/GlassCard'
import type { Program, SectionId } from '@/lib/types'

interface ProgramDetailViewProps {
  program: Program
  onBack: () => void
  onNavigate: (section: SectionId, itemId: string) => void
}

export function ProgramDetailView({ program, onBack, onNavigate }: ProgramDetailViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3 header-pt">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90"
          style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
        >
          <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">{program.title}</h1>
          <p className="label-upper" style={{ marginTop: 2 }}>Программа</p>
        </div>
        {program.isActive && (
          <span className="ml-auto text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(201,150,90,0.15)', color: 'var(--amber)', border: '1px solid rgba(201,150,90,0.2)' }}>
            Активна
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 md:pb-8 pt-1">
        <div className="flex flex-col gap-4 max-w-lg">

          {/* Video placeholder */}
          <div
            className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center"
            style={{
              height: 200,
              background: 'linear-gradient(135deg, rgba(201,150,90,0.12) 0%, rgba(139,117,207,0.12) 100%)',
              border: '1px solid rgba(255,220,170,0.1)',
            }}
          >
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 32px)' }} />

            {/* Play button */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 active:scale-95"
              style={{ background: 'rgba(201,150,90,0.2)', border: '1px solid rgba(201,150,90,0.3)', boxShadow: 'var(--glow-amber)' }}
            >
              <Play size={26} style={{ color: 'var(--amber)', marginLeft: 3 }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,220,170,0.6)' }}>Видео-инструкция</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,220,170,0.3)' }}>Скоро будет доступно</p>
          </div>

          {/* Overview card */}
          <GlassCard accent={program.isActive ? 'amber' : 'none'} className="p-4">
            <p className="text-white text-sm leading-relaxed mb-3">{program.description}</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                <span className="text-xs" style={{ color: 'rgba(255,220,170,0.5)' }}>{program.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers size={13} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                <span className="text-xs" style={{ color: 'rgba(255,220,170,0.5)' }}>{program.sessions} сессий</span>
              </div>
            </div>
          </GlassCard>

          {/* Days */}
          {program.days && program.days.length > 0 ? (
            <div className="flex flex-col gap-3">
              {program.days.map(day => (
                <div key={day.day}>
                  <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'rgba(255,220,170,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    День {day.day} — {day.title}
                  </p>
                  <GlassCard className="overflow-hidden">
                    {day.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                        style={{ borderColor: 'rgba(255,220,170,0.06)' }}
                      >
                        {/* Type icon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: step.type === 'breathing' ? 'rgba(201,150,90,0.1)' : 'rgba(139,117,207,0.1)' }}
                        >
                          {step.type === 'breathing'
                            ? <Wind size={15} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                            : <Brain size={15} style={{ color: 'var(--violet)' }} strokeWidth={1.5} />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{step.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.35)' }}>{step.duration}</p>
                        </div>

                        {/* Open button */}
                        <button
                          onClick={() => onNavigate(step.type === 'breathing' ? 'breathing' : 'meditation', step.refId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all duration-300 active:scale-95"
                          style={{
                            background: step.type === 'breathing' ? 'rgba(201,150,90,0.12)' : 'rgba(139,117,207,0.12)',
                            border: step.type === 'breathing' ? '1px solid rgba(201,150,90,0.18)' : '1px solid rgba(139,117,207,0.18)',
                            color: step.type === 'breathing' ? 'var(--amber)' : 'var(--violet)',
                          }}
                        >
                          Открыть
                          <ChevronRight size={11} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </GlassCard>
                </div>
              ))}
            </div>
          ) : (
            <GlassCard className="p-6 text-center">
              <p className="text-sm" style={{ color: 'rgba(255,220,170,0.35)' }}>Детальная программа скоро будет доступна</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
