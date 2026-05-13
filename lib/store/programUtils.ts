import type { Program, StorePlanItem } from '../types'

const DEFAULT_TIMES: Record<string, string> = {
  breathing: '07:00',
  meditation: '21:00',
}

export function getPlanItemsForProgramDay(program: Program, dayNumber: number): StorePlanItem[] {
  const day = program.days?.find(d => d.day === dayNumber)
  if (!day) return []

  return day.steps.map((step, i) => ({
    id: `prog_${program.id}_day${dayNumber}_step${i}`,
    title: step.title,
    time: DEFAULT_TIMES[step.type] ?? '09:00',
    duration: step.duration,
    section: step.type === 'breathing' ? 'Утро' as const : 'Вечер' as const,
    source: 'program' as const,
    programId: program.id,
    programDayRef: dayNumber,
    practiceType: step.type,
    practiceRefId: step.refId,
  }))
}
