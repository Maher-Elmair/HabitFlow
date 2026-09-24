import type { Habit } from "@/types";
import { formatDateForApp } from "@/lib/streak";

/**
 * Normalize any date-ish value to a local YYYY-MM-DD string.
 * Accepts a Date, an ISO timestamp, or an already-normalized date string.
 */
export function normalizeDateString(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Single shared implementation of "is this habit active on this date?".
 * Used by Home, History and Analytics so filtering can never drift.
 */
export function isHabitActiveOnDate(habit: Habit, dateStr: string): boolean {
  const checkDate = new Date(dateStr + "T00:00:00");
  const startDate = new Date(habit.startDate || "2025-01-01");
  const endDate = habit.endDate ? new Date(habit.endDate) : null;

  const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const normalizedCheck = normalize(checkDate);
  const normalizedStart = normalize(startDate);
  const normalizedEnd = endDate ? normalize(endDate) : null;

  return normalizedCheck >= normalizedStart && (!normalizedEnd || normalizedCheck <= normalizedEnd);
}

/**
 * Generate an array of local YYYY-MM-DD strings for the last `n` days,
 * counting backwards from `from` (inclusive).
 */
export function getLastNDateStrings(n: number, from: Date = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    return formatDateForApp(d);
  });
}

/** Generate every local YYYY-MM-DD string of the month containing `date`. */
export function getMonthDateStrings(date: Date): string[] {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    formatDateForApp(new Date(date.getFullYear(), date.getMonth(), i + 1)),
  );
}

/** How many habits are active on a single date. */
export function countActiveHabitsOnDate(habits: Habit[], dateStr: string): number {
  return habits.filter((h) => isHabitActiveOnDate(h, dateStr)).length;
}

/**
 * Total "possible completions": the number of active habits summed
 * across a set of dates. Replaces the repeated loops in Analytics.
 */
export function countActiveHabitsAcrossDates(habits: Habit[], dateStrings: string[]): number {
  return dateStrings.reduce(
    (total, dateStr) => total + countActiveHabitsOnDate(habits, dateStr),
    0,
  );
}
