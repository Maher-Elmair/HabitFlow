import type { HabitCompletion } from "@/types";

/**
 * Format a Date as a local YYYY-MM-DD string (no timezone shift).
 */
export const formatDateForApp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Single source of truth for streak calculation.
 * Counts consecutive completed days backwards from `upToDate`,
 * comparing YYYY-MM-DD strings so timezones can never shift a day.
 */
export function calculateHabitStreak(
  habitId: string,
  completions: HabitCompletion[],
  upToDate: string = formatDateForApp(new Date()),
): number {
  let streak = 0;
  const startDate = new Date(upToDate + "T00:00:00");

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = formatDateForApp(checkDate);

    const completion = completions.find((c) => c.habitId === habitId && c.date === checkDateStr);

    if (completion?.completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
