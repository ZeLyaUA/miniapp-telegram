"use client";

import { useState, useMemo } from "react";
import { GlassCard } from "@/components/layout/GlassCard";
import { useWellnessState } from "@/lib/store/WellnessContext";
import {
  getPeriodStats,
  getWeekPeriod,
  getMonthPeriod,
  getYearPeriod,
  getStreakDays,
} from "@/lib/store/analytics";
import type { PeriodStats } from "@/lib/types";

type Period = "week" | "month" | "year";

const PERIODS: { id: Period; label: string }[] = [
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "year", label: "Год" },
];

const RU_MONTHS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];
const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function delta(cur: number, prev: number) {
  if (prev === 0 && cur === 0) return null;
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

function DeltaBadge({ value }: { value: number | null }) {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span
      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-1"
      style={{
        background: up ? "rgba(201,150,90,0.15)" : "rgba(255,248,235,0.06)",
        color: up ? "var(--amber)" : "rgba(255,248,235,0.35)",
      }}
    >
      {up ? "↑" : "↓"}
      {Math.abs(value)}%
    </span>
  );
}

function BarChart({
  current,
  period,
}: {
  current: PeriodStats;
  previous: PeriodStats;
  period: Period;
}) {
  const bars =
    period === "week"
      ? current.dailyBreakdown.map((d, i) => ({
          label: DAY_LABELS[i],
          value: d.meditationMinutes + d.breathingMinutes,
          dateKey: d.dateKey,
        }))
      : period === "month"
        ? Array.from({ length: 4 }, (_, wi) => {
            const weekDays = current.dailyBreakdown.slice(wi * 7, (wi + 1) * 7);
            const value = weekDays.reduce(
              (s, d) => s + d.meditationMinutes + d.breathingMinutes,
              0,
            );
            return {
              label: `Нед ${wi + 1}`,
              value,
              dateKey: weekDays[0]?.dateKey ?? "",
            };
          })
        : Array.from({ length: 12 }, (_, mi) => {
            const monthDays = current.dailyBreakdown.filter(
              (d) => parseInt(d.dateKey.split("-")[1]) - 1 === mi,
            );
            const value = monthDays.reduce(
              (s, d) => s + d.meditationMinutes + d.breathingMinutes,
              0,
            );
            return { label: RU_MONTHS[mi], value, dateKey: "" };
          });

  const today = new Date().toISOString().split("T")[0];
  const maxVal = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="flex items-end gap-1.5 h-16">
      {bars.map((bar, i) => {
        const height = Math.max(
          (bar.value / maxVal) * 100,
          bar.value > 0 ? 8 : 3,
        );
        const isToday = bar.dateKey === today;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-sm transition-all duration-700"
              style={{
                height: `${height}%`,
                minHeight: 3,
                background:
                  bar.value > 0
                    ? isToday
                      ? "var(--amber)"
                      : "linear-gradient(to top, rgba(201,150,90,0.7), rgba(139,117,207,0.5))"
                    : "rgba(255,255,255,0.05)",
                boxShadow:
                  isToday && bar.value > 0 ? "var(--glow-amber)" : "none",
              }}
            />
            <span
              className="text-[9px]"
              style={{ color: "rgba(255,220,170,0.3)" }}
            >
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StatsTabInner() {
  const [period, setPeriod] = useState<Period>("week");
  const { events, assessmentsByDay, dailySnapshots, todayKey } =
    useWellnessState();

  const { start: curStart, end: curEnd } =
    period === "week"
      ? getWeekPeriod(0)
      : period === "month"
        ? getMonthPeriod(0)
        : getYearPeriod(0);
  const { start: prevStart, end: prevEnd } =
    period === "week"
      ? getWeekPeriod(1)
      : period === "month"
        ? getMonthPeriod(1)
        : getYearPeriod(1);

  const current = useMemo(
    () => getPeriodStats(events, assessmentsByDay, curStart, curEnd, "Текущий"),
    [events, assessmentsByDay, curStart, curEnd],
  );

  const previous = useMemo(
    () =>
      getPeriodStats(
        events,
        assessmentsByDay,
        prevStart,
        prevEnd,
        "Предыдущий",
      ),
    [events, assessmentsByDay, prevStart, prevEnd],
  );

  const streak = useMemo(
    () => getStreakDays(dailySnapshots, todayKey),
    [dailySnapshots, todayKey],
  );

  const periodLabel =
    period === "week" ? "неделю" : period === "month" ? "месяц" : "год";
  const prevLabel =
    period === "week"
      ? "прошлой"
      : period === "month"
        ? "прошлого"
        : "прошлого";

  const stats = [
    {
      label: "Медитация",
      value: `${current.meditationMinutes} мин`,
      sub: `vs ${previous.meditationMinutes} мин`,
      d: delta(current.meditationMinutes, previous.meditationMinutes),
      color: "var(--violet)",
    },
    {
      label: "Дыхание",
      value: `${current.breathingSessionCount}`,
      sub: `vs ${previous.breathingSessionCount} сессий`,
      d: delta(current.breathingSessionCount, previous.breathingSessionCount),
      color: "var(--amber)",
    },
    {
      label: "Активных дней",
      value: `${current.activeDays}`,
      sub: `vs ${previous.activeDays}`,
      d: delta(current.activeDays, previous.activeDays),
      color: "var(--amber)",
    },
    {
      label: "Серия",
      value: `${streak} дн`,
      sub: "сейчас",
      d: null,
      color: "var(--amber)",
    },
  ];

  return (
    <div className="flex flex-col gap-3 mt-2 max-w-lg">
      {/* Period selector */}
      <div
        className="flex gap-1 p-1 rounded-2xl"
        style={{
          background: "rgba(255,248,235,0.04)",
          border: "1px solid rgba(255,220,170,0.06)",
        }}
      >
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-300"
            style={
              period === p.id
                ? {
                    background: "rgba(201,150,90,0.2)",
                    color: "var(--amber)",
                    border: "1px solid rgba(201,150,90,0.2)",
                  }
                : {
                    color: "rgba(255,248,235,0.35)",
                  }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Comparison label */}
      <p className="text-xs px-1" style={{ color: "rgba(255,220,170,0.35)" }}>
        Эт{periodLabel === "неделю" ? "а" : "от"} {periodLabel} vs {prevLabel}{" "}
        {periodLabel === "неделю" ? "неделя" : periodLabel}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-4">
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <DeltaBadge value={s.d} />
            </div>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(255,220,170,0.3)" }}
            >
              {s.sub}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(255,248,235,0.4)" }}
            >
              {s.label}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Bar chart */}
      <GlassCard className="p-4">
        <p className="label-upper mb-3">Активность за {periodLabel}</p>
        <BarChart current={current} previous={previous} period={period} />
        {current.meditationMinutes === 0 &&
          current.breathingSessionCount === 0 && (
            <p
              className="text-xs text-center mt-3"
              style={{ color: "rgba(255,220,170,0.25)" }}
            >
              Начните первую практику, чтобы увидеть статистику
            </p>
          )}
      </GlassCard>
    </div>
  );
}
