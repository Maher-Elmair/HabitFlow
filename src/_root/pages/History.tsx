import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitCard } from "@/components/shared/HabitCard";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useOutletContext } from "react-router";
import { dataService } from "@/services/dataService";
import type { HabitWithCompletion, Habit, HabitCompletion } from "@/types";

// Define the context type
interface HistoryContext {
  habits: Habit[];
  setHabits: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;
}

export function History(): React.JSX.Element {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const { habits, setHabits } = useOutletContext<HistoryContext>();

  // Helper function to format date as YYYY-MM-DD
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Load completions for all habits
  useEffect(() => {
    const loadCompletions = async () => {
      try {
        const allCompletions: HabitCompletion[] = [];

        for (const habit of habits) {
          const habitCompletions = await dataService.getHabitCompletions(
            habit.id
          );
          allCompletions.push(...habitCompletions);
        }

        setCompletions(allCompletions);
      } catch (error) {
        console.error("Error loading completions:", error);
      }
    };

    if (habits.length > 0) {
      loadCompletions();
    }
  }, [habits]);

  // Format date for display
  function formatDisplayDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (formatDate(date) === formatDate(today)) {
      return "Today";
    } else if (formatDate(date) === formatDate(yesterday)) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  }

  // Calculate streak for a habit up to a specific date
  function calculateStreak(habitId: string, upToDate: string): number {
    let streak = 0;
    const dateObj = new Date(upToDate + "T00:00:00");

    for (let i = 0; i < 365; i++) {
      const checkDate = formatDate(new Date(dateObj.getTime() - i * 86400000));
      const completion = completions.find(
        (c) => c.habitId === habitId && c.date === checkDate
      );

      if (completion?.completed) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Get habits with completion for a specific date
  function getHabitsForDate(dateStr: string): HabitWithCompletion[] {
    return habits.map((habit) => {
      const completion = completions.find(
        (c) => c.habitId === habit.id && c.date === dateStr
      );

      return {
        ...habit,
        completed: completion?.completed || false,
        streak: calculateStreak(habit.id, dateStr),
      };
    });
  }

  // Get completion stats for a date
  function getDateStats(dateStr: string) {
    const habitsForDate = getHabitsForDate(dateStr);
    const completed = habitsForDate.filter((h) => h.completed).length;
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  // Handle date selection
  function handleDateSelect(date: Date): void {
    setSelectedDate(date);
    // Update current month to the selected date's month
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  // Handle "Today" button click
  function handleTodayClick(): void {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  }

  // Handle habit toggle
  const handleToggleHabit = async (
    habitId: string,
    date: string
  ): Promise<void> => {
    try {
      const habitIndex = habits.findIndex((h) => h.id === habitId);
      if (habitIndex === -1) return;

      const habit = habits[habitIndex];
      const completion = completions.find(
        (c) => c.habitId === habitId && c.date === date
      );

      const newCompleted = !completion?.completed;

      // Update completion in data service
      if (completion) {
        await dataService.updateHabitCompletion(habitId, date, newCompleted);
      } else {
        await dataService.addHabitCompletion({
          habitId,
          date,
          completed: newCompleted,
        });
      }

      // Update local completions state
      setCompletions((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c.habitId === habitId && c.date === date
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            completed: newCompleted,
          };
          return updated;
        } else {
          return [...prev, { habitId, date, completed: newCompleted }];
        }
      });

      // Update habit streak in the habits list
      const updatedHabits = [...habits];
      let newStreak = habit.streak || 0;

      if (newCompleted) {
        newStreak += 1;
      } else {
        newStreak = Math.max(0, newStreak - 1);
      }

      updatedHabits[habitIndex] = {
        ...habit,
        streak: newStreak,
        current: newCompleted
          ? (habit.current || 0) + 1
          : Math.max(0, (habit.current || 0) - 1),
      };

      setHabits(updatedHabits);
    } catch (error) {
      console.error("Error toggling habit completion:", error);
    }
  };

  // Check if a date has any completed habits
  function hasCompletedHabits(date: Date): boolean {
    const dateStr = formatDate(date);
    return completions.some((c) => c.date === dateStr && c.completed);
  }

  // Get habits for a specific date to show in calendar
  function getHabitsForCalendarDate(date: Date): Habit[] {
    const dateStr = formatDate(date);
    return habits.filter(habit => {
      const completion = completions.find(c => c.habitId === habit.id && c.date === dateStr);
      return completion?.completed;
    });
  }

  // Calendar functions
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - (i + 1));
      days.push(prevDate);
    }

    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to fill the last week
    const totalCells = 42; // 6 weeks
    while (days.length < totalCells) {
      const nextDate = new Date(days[days.length - 1]);
      nextDate.setDate(nextDate.getDate() + 1);
      days.push(nextDate);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next'): void => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Check if navigation is allowed (only one month forward from current)
  const canNavigate = (direction: 'prev' | 'next'): boolean => {
    const today = new Date();
    const maxFutureMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    if (direction === 'next') {
      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      return nextMonth <= maxFutureMonth;
    }
    
    // Always allow going to previous months
    return true;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const today = new Date();
  const isTodaySelected = formatDate(selectedDate) === formatDate(today);

  const selectedDateStr = formatDate(selectedDate);
  const habitsForSelectedDate = getHabitsForDate(selectedDateStr);
  const stats = getDateStats(selectedDateStr);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format month display as "14 November 2025"
  const formattedMonthDisplay = `${currentMonth.getDate()} ${currentMonth.toLocaleDateString("en-US", { month: "long" })} ${currentMonth.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Header - Updated styling */}
      <div className="text-center pt-6">
        <h2 className="text-2xl font-medium">Habit History</h2>
        <p className="text-md text-muted-foreground pt-2">
          Track your habits over time and maintain your consistency streak
        </p>
      </div>

      {/* Custom Calendar Section */}
      <Card className="overflow-hidden bg-card border-border rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col items-center">
          {/* Calendar Header */}
          <div className="flex items-center justify-between w-full max-w-full sm:max-w-[80%] mb-6 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="h-10 w-10 p-0 cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-foreground">
                {formattedMonthDisplay}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isTodaySelected && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTodayClick}
                  className="h-8 text-xs"
                >
                  Today
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
                className={`h-10 w-10 p-0 ${canNavigate('next') ? 'cursor-pointer' : 'cursor-no-drop opacity-50'}`}
                disabled={!canNavigate('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="w-full max-w-full sm:max-w-[80%]">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div
                  key={day}
                  className="text-center py-3 text-sm font-semibold text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isToday = formatDate(date) === formatDate(today);
                const isSelected = formatDate(date) === formatDate(selectedDate);
                const hasHabits = hasCompletedHabits(date);
                const dayHabits = getHabitsForCalendarDate(date);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      relative h-20 p-1 rounded-lg border-2 transition-all duration-200
                      flex flex-col items-center justify-start cursor-pointer
                      ${isCurrentMonth 
                        ? 'bg-card text-foreground' 
                        : 'bg-muted/20 text-muted-foreground opacity-60'
                      }
                      ${isToday && !isSelected 
                        ? 'border-primary/50 bg-primary/10' 
                        : 'border-transparent'
                      }
                      ${isSelected 
                        ? 'border-primary bg-primary/20' 
                        : 'hover:bg-accent hover:border-accent'
                      }
                    `}
                  >
                    {/* Date Number */}
                    <span className={`
                      text-sm font-medium mb-1
                      ${isSelected ? 'text-primary' : ''}
                      ${isToday && !isSelected ? 'text-primary' : ''}
                    `}>
                      {date.getDate()}
                    </span>

                    {/* Habit Indicators */}
                    <div className="flex flex-wrap gap-1 justify-center w-full">
                      {dayHabits.slice(0, 3).map(habit => (
                        <div
                          key={habit.id}
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: habit.color || '#2563eb',
                            opacity: 0.8
                          }}
                          title={habit.name}
                        />
                      ))}
                      {dayHabits.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayHabits.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Completed habits count for larger screens */}
                    {hasHabits && (
                      <div className="absolute bottom-1 right-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Selected Date Info and Habits */}
      <Card className="overflow-hidden bg-card border-border rounded-2xl shadow-sm">
        {/* Date Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stats.percentage === 100
                    ? "bg-primary/20"
                    : stats.percentage > 0
                    ? "bg-chart-2/20"
                    : "bg-muted"
                }`}
              >
                <CalendarIcon
                  className={`w-6 h-6 ${
                    stats.percentage === 100
                      ? "text-primary"
                      : stats.percentage > 0
                      ? "text-chart-2"
                      : "text-muted-foreground"
                  }`}
                />
              </div>

              <div>
                <h3 className="text-foreground">
                  {formatDisplayDate(selectedDate)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {stats.completed} / {stats.total}
                </span>
                {stats.percentage === 100 && stats.total > 0 && (
                  <span className="text-xl">🎉</span>
                )}
              </div>
              <div
                className={`text-xs ${
                  stats.percentage === 100
                    ? "text-primary"
                    : stats.percentage > 0
                    ? "text-chart-2"
                    : "text-muted-foreground"
                }`}
              >
                {stats.percentage}% complete
              </div>
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className="px-5 pb-5 pt-4 space-y-3 bg-muted/20">
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No habits created yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Create your first habit to start tracking
              </p>
            </div>
          ) : (
            habitsForSelectedDate.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={(id) => handleToggleHabit(id, selectedDateStr)}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))
          )}
        </div>
      </Card>

      {/* Info Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Click on any date in the calendar to view habits for that day
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Days with completed habits are marked with colored dots
        </p>
      </div>
    </div>
  );
}

export default History;