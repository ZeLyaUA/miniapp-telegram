'use client'

import { useMemo } from 'react'
import {
  Brain, Wind, Trophy, Bell, Sun, Moon, Flame, Sparkles, X, CheckCheck,
  type LucideIcon,
} from 'lucide-react'
import { useWellness } from '@/lib/store/WellnessContext'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '@/lib/types'

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, Wind, Trophy, Bell, Sun, Moon, Flame, Sparkles,
}

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Bell
}

function tintForKind(kind: NotificationItem['kind']): { color: string; bg: string } {
  switch (kind) {
    case 'reminder':
    case 'summary_morning':
      return { color: 'var(--amber)', bg: 'rgba(201,150,90,0.1)' }
    case 'streak':
    case 'achievement':
      return { color: 'var(--amber)', bg: 'rgba(201,150,90,0.12)' }
    case 'program':
      return { color: 'var(--violet)', bg: 'rgba(139,117,207,0.1)' }
    case 'summary_evening':
      return { color: 'var(--violet)', bg: 'rgba(139,117,207,0.1)' }
    default:
      return { color: 'rgba(255,248,235,0.5)', bg: 'rgba(255,255,255,0.04)' }
  }
}

function formatRelativeTime(ts: number, now: number): string {
  const diffMs = now - ts
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин назад`
  const hours = Math.floor(min / 60)
  if (hours < 6) return `${hours} ч назад`
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function groupByDay(notifications: NotificationItem[], todayKey: string): Array<{ label: string; items: NotificationItem[] }> {
  const today: NotificationItem[] = []
  const yesterday: NotificationItem[] = []
  const earlier: NotificationItem[] = []
  const todayDate = new Date(todayKey + 'T00:00:00')
  const yesterdayKey = new Date(todayDate.getTime() - 86_400_000).toISOString().split('T')[0]
  for (const n of notifications) {
    if (n.dateKey === todayKey) today.push(n)
    else if (n.dateKey === yesterdayKey) yesterday.push(n)
    else earlier.push(n)
  }
  const out: Array<{ label: string; items: NotificationItem[] }> = []
  if (today.length > 0) out.push({ label: 'Сегодня', items: today })
  if (yesterday.length > 0) out.push({ label: 'Вчера', items: yesterday })
  if (earlier.length > 0) out.push({ label: 'Ранее', items: earlier })
  return out
}

export function NotificationsView() {
  const { state, dispatch } = useWellness()
  const sorted = useMemo(
    () => [...state.notifications].sort((a, b) => b.createdAt - a.createdAt),
    [state.notifications],
  )
  const groups = useMemo(() => groupByDay(sorted, state.todayKey), [sorted, state.todayKey])
  const unreadCount = useMemo(() => state.notifications.filter(n => !n.isRead).length, [state.notifications])
  const now = Date.now()

  const markRead = (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', id })
  const dismiss = (id: string) => dispatch({ type: 'DISMISS_NOTIFICATION', id })
  const markAllRead = () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 header-pt">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Уведомления</h1>
            <p className="label-upper mt-1.5">
              {unreadCount > 0 ? `${unreadCount} непрочитан${pluralUnread(unreadCount)}` : 'все прочитаны'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 active:scale-95"
              style={{ background: 'rgba(201,150,90,0.12)', border: '1px solid rgba(201,150,90,0.25)', color: 'var(--amber)' }}
            >
              <CheckCheck size={12} strokeWidth={2} />
              Прочитать всё
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-4 mt-2">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
            >
              <Bell size={26} strokeWidth={1.5} style={{ color: 'rgba(255,220,170,0.35)' }} />
            </div>
            <p className="text-white text-sm font-medium">Пока тихо</p>
            <p className="text-xs mt-1 max-w-[260px]" style={{ color: 'rgba(255,220,170,0.4)', lineHeight: 1.5 }}>
              Здесь будут ваши напоминания, достижения и итоги дня
            </p>
          </div>
        ) : (
          groups.map(group => (
            <section key={group.label} className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,220,170,0.4)' }}>
                {group.label}
              </p>
              {group.items.map(item => {
                const Icon = resolveIcon(item.icon)
                const tint = tintForKind(item.kind)
                return (
                  <div
                    key={item.id}
                    className={cn('ritual-card p-4 flex items-start gap-3 transition-opacity')}
                    style={{ opacity: item.isRead ? 0.7 : 1 }}
                    onClick={() => !item.isRead && markRead(item.id)}
                    role={item.isRead ? undefined : 'button'}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: tint.bg }}
                    >
                      <Icon size={18} style={{ color: tint.color }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm truncate">{item.title}</p>
                        {!item.isRead && (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: 'var(--amber)' }}
                          />
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,248,235,0.45)', lineHeight: 1.4 }}>
                        {item.body}
                      </p>
                      <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,220,170,0.3)' }}>
                        {formatRelativeTime(item.createdAt, now)}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); dismiss(item.id) }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200 active:scale-90"
                      style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.06)' }}
                      aria-label="Удалить уведомление"
                    >
                      <X size={13} style={{ color: 'rgba(255,220,170,0.4)' }} />
                    </button>
                  </div>
                )
              })}
            </section>
          ))
        )}
      </div>
    </div>
  )
}

function pluralUnread(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'о'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'ых'
  return 'ых'
}
