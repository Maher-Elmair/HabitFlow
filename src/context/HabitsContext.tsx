import { createContext, useContext, type ReactNode } from "react";
import type { Habit } from "@/types";

export interface HabitsContextValue {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  isLoading: boolean;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({
  value,
  children,
}: {
  value: HabitsContextValue;
  children: ReactNode;
}) {
  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabitsContext(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) {
    throw new Error("useHabitsContext must be used inside HabitsProvider");
  }
  return ctx;
}
