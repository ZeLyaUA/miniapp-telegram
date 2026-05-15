'use client'

import { useEffect } from 'react'
import {
  ChevronLeft, Bell, Brain, Wind, Trophy, Sun, Moon, Flame, Sparkles, MessageCircle, Smartphone,
} from 'lucide-react'
import { useWellness } from '@/lib/store/WellnessContext'
import type { NotificationCategorySettings, NotificationSettings } from '@/lib/types'

const LEGACY_KEY = 'notifications_enabled_v1'

interface NotificationSettingsViewProps {
  onBack: () => void
}

interface CategoryRow {
  key: keyof NotificationCategorySettings
  label: string
  hint: string
  icon: typeof Bell
  color: string
}

const CATEGORIES: CategoryRow[] = [
  { key: 'reminder', label: 'Напоминания', hint: 'Ваши пользовательские reminders', icon: Bell, color: 'var(--amber)' },
  { key: 'program', label: 'Программа', hint: 'Шаги активной программы', icon: Sparkles, color: 'var(--violet)' },
  { key: 'streak', label: 'Стрики', hint: 'Поддержание непрерывности (3, 7, 14, 30…)', icon: Flame, color: 'var(--amber)' },
  { key: 'achievement', label: 'Достижения', hint: 'Разблокированные награды', icon: Trophy, color: 'var(--amber)' },
  { key: 'summaryMorning', label: 'Утренняя сводка', hint: 'План на день', icon: Sun, color: 'var(--amber)' },
  { key: 'summaryEvening', label: 'Вечерняя сводка', hint: 'Итоги дня', icon: Moon, color: 'var(--violet)' },
]

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{
        background: on ? 'rgba(201,150,90,0.5)' : 'rgba(255,248,235,0.1)',
        border: '1px solid ' + (on ? 'rgba(201,150,90,0.6)' : 'rgba(255,220,170,0.12)'),
      }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{
          left: on ? 'calc(100% - 18px)' : '2px',
          background: on ? 'var(--amber)' : 'rgba(255,248,235,0.5)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      />
    </div>
  )
}

export function NotificationSettingsView({ onBack }: NotificationSettingsViewProps) {
  const { state, dispatch } = useWellness()
  const s = state.notificationSettings

  // One-shot migration of legacy enabled flag
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(LEGACY_KEY)
      if (raw === null) return
      const legacyEnabled = raw === '1'
      if (legacyEnabled !== s.enabled) {
        dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', settings: { ...s, enabled: legacyEnabled } })
      }
      window.localStorage.removeItem(LEGACY_KEY)
    } catch { /* ignore */ }
  // intentionally run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (patch: Partial<NotificationSettings>) =>
    dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', settings: { ...s, ...patch } })

  const setCategory = (k: keyof NotificationCategorySettings, value: boolean) =>
    update({ categories: { ...s.categories, [k]: value } })

  return (
    <div className="flex flex-col h-full">
      <div className="header-pt px-4 pb-2">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.08)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,248,235,0.7)' }} />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold" style={{ fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Уведомления
            </h1>
            <p className="label-upper mt-0.5">напоминания о практиках</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-4 mt-2">

        {/* Master toggle */}
        <button
          onClick={() => update({ enabled: !s.enabled })}
          className="w-full p-4 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99]"
          style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: s.enabled ? 'rgba(201,150,90,0.15)' : 'rgba(255,248,235,0.05)' }}
            >
              <Bell size={16} strokeWidth={1.5} style={{ color: s.enabled ? 'var(--amber)' : 'rgba(255,220,170,0.4)' }} />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Включить уведомления</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,220,170,0.45)' }}>
                {s.enabled ? 'Получать напоминания' : 'Все уведомления отключены'}
              </p>
            </div>
          </div>
          <Toggle on={s.enabled} />
        </button>

        {s.enabled && (
          <>
            {/* Channels */}
            <section className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-1 mt-1" style={{ color: 'rgba(255,220,170,0.4)' }}>
                Каналы
              </p>
              <button
                onClick={() => update({ channels: { ...s.channels, inApp: !s.channels.inApp } })}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99]"
                style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <Smartphone size={16} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                  <div className="text-left">
                    <p className="text-white text-sm">В приложении</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>История и тактильная отдача</p>
                  </div>
                </div>
                <Toggle on={s.channels.inApp} />
              </button>
              <button
                onClick={() => update({ channels: { ...s.channels, telegramBot: !s.channels.telegramBot } })}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99]"
                style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={16} style={{ color: 'var(--violet)' }} strokeWidth={1.5} />
                  <div className="text-left">
                    <p className="text-white text-sm">Telegram Bot</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>Скоро — push в чате</p>
                  </div>
                </div>
                <Toggle on={s.channels.telegramBot} />
              </button>
            </section>

            {/* Categories */}
            <section className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-1 mt-1" style={{ color: 'rgba(255,220,170,0.4)' }}>
                Категории
              </p>
              {CATEGORIES.map(c => {
                const on = s.categories[c.key]
                const Icon = c.icon
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key, !on)}
                    className="w-full p-3.5 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99]"
                    style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} style={{ color: on ? c.color : 'rgba(255,220,170,0.3)' }} strokeWidth={1.5} />
                      <div className="text-left">
                        <p className="text-white text-sm">{c.label}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>{c.hint}</p>
                      </div>
                    </div>
                    <Toggle on={on} />
                  </button>
                )
              })}
            </section>

            {/* Summary times */}
            {(s.categories.summaryMorning || s.categories.summaryEvening) && (
              <section className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest px-1 mt-1" style={{ color: 'rgba(255,220,170,0.4)' }}>
                  Время сводки
                </p>
                {s.categories.summaryMorning && (
                  <div
                    className="w-full p-3.5 flex items-center justify-between rounded-2xl"
                    style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Sun size={16} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                      <p className="text-white text-sm">Утром</p>
                    </div>
                    <input
                      type="time"
                      value={s.summaryMorningTime}
                      onChange={e => update({ summaryMorningTime: e.target.value })}
                      className="rounded-lg px-2 py-1 text-sm text-white outline-none"
                      style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.12)' }}
                    />
                  </div>
                )}
                {s.categories.summaryEvening && (
                  <div
                    className="w-full p-3.5 flex items-center justify-between rounded-2xl"
                    style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Moon size={16} style={{ color: 'var(--violet)' }} strokeWidth={1.5} />
                      <p className="text-white text-sm">Вечером</p>
                    </div>
                    <input
                      type="time"
                      value={s.summaryEveningTime}
                      onChange={e => update({ summaryEveningTime: e.target.value })}
                      className="rounded-lg px-2 py-1 text-sm text-white outline-none"
                      style={{ background: 'rgba(255,248,235,0.06)', border: '1px solid rgba(255,220,170,0.12)' }}
                    />
                  </div>
                )}
              </section>
            )}

            {/* Effects */}
            <section className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-1 mt-1" style={{ color: 'rgba(255,220,170,0.4)' }}>
                Эффекты
              </p>
              <button
                onClick={() => update({ haptic: !s.haptic })}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99]"
                style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <Brain size={16} style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
                  <div className="text-left">
                    <p className="text-white text-sm">Тактильная отдача</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>Вибрация в Telegram</p>
                  </div>
                </div>
                <Toggle on={s.haptic} />
              </button>
              <button
                onClick={() => update({ showPopup: !s.showPopup })}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl transition-all active:scale-[0.99]"
                style={{ background: 'rgba(255,248,235,0.04)', border: '1px solid rgba(255,220,170,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <Wind size={16} style={{ color: 'var(--violet)' }} strokeWidth={1.5} />
                  <div className="text-left">
                    <p className="text-white text-sm">Всплывающие окна</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,220,170,0.4)' }}>Для важных уведомлений</p>
                  </div>
                </div>
                <Toggle on={s.showPopup} />
              </button>
            </section>
          </>
        )}

        <p className="text-xs px-1 mt-2" style={{ color: 'rgba(255,220,170,0.35)', lineHeight: 1.5 }}>
          In-app уведомления работают пока приложение открыто. Telegram Bot канал появится позже.
        </p>
      </div>
    </div>
  )
}
