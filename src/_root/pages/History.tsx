import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitCard } from "@/components/shared/HabitCard";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useOutletContext } from "react-router";
import { dataService } from "@/services/dataService";
import type { HabitWithCompletion, Habit, HabitCompletion } from "@/types";
import { AddEditHabit } from "@/components/shared/addEditHabit";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { toast } from "sonner";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to format date as YYYY-MM-DD
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Load completions for all habits - FIXED: remove habits dependency to prevent re-renders
  useEffect(() => {
    const loadCompletions = async () => {
      try {
        setLoading(true);
        const allCompletions = await dataService.getAllCompletions();
        setCompletions(allCompletions || []);
      } catch (error) {
        console.error("Error loading completions:", error);
        toast.error("Failed to load habit completions");
      } finally {
        setLoading(false);
      }
    };

    loadCompletions();
  }, []); // Empty dependency array - load only once on mount

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

  // Calculate streak for a habit up to a specific date - IMPROVED VERSION
  function calculateStreak(habitId: string, upToDate: string): number {
    let streak = 0;
    const dateObj = new Date(upToDate + "T00:00:00");

    // Check consecutive days starting from the target date backwards
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(dateObj);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = formatDate(checkDate);
      
      const completion = completions.find(
        (c) => c.habitId === habitId && c.date === checkDateStr
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
    const selectedDateObj = new Date(dateStr + "T00:00:00");

    return habits
      .filter((habit) => {
        const startDate = new Date(habit.startDate || "2025-01-01");
        const endDate = habit.endDate ? new Date(habit.endDate) : null;

        // Normalize dates to compare only year, month, and day (ignore time)
        const normalizedSelectedDate = new Date(
          selectedDateObj.getFullYear(),
          selectedDateObj.getMonth(),
          selectedDateObj.getDate()
        );
        const normalizedStartDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const normalizedEndDate = endDate ? new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        ) : null;

        // Check if habit should be active on this date
        const isAfterStart = normalizedSelectedDate >= normalizedStartDate;
        const isBeforeEnd = !normalizedEndDate || normalizedSelectedDate <= normalizedEndDate;

        return isAfterStart && isBeforeEnd;
      })
      .map((habit) => {
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.date === dateStr
        );

        // Use the actual completion status from completions array
        const isCompleted = completion?.completed || false;

        return {
          ...habit,
          completed: isCompleted,
          streak: calculateStreak(habit.id, dateStr),
        };
      });
  }

  // Get completion stats for a date
  function getDateStats(dateStr: string) {
    const habitsForDate = getHabitsForDate(dateStr);
    const completed = habitsForDate.filter((h) => h.completed).length;
    const total = habitsForDate.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  // Handle date selection - ALLOW ALL FUTURE DATES
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

  // Handle navigation with Today button
  const handleNavigationWithToday = (direction: "prev" | "next"): void => {
    const today = new Date();
    const newMonth = new Date(currentMonth);
    
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    
    setCurrentMonth(newMonth);
    
    // If the new month is the current month, set date to today
    const isNewMonthCurrent = 
      newMonth.getMonth() === today.getMonth() && 
      newMonth.getFullYear() === today.getFullYear();
    
    if (isNewMonthCurrent) {
      setSelectedDate(today);
    }
  };

  // Handle habit toggle - UPDATED: Use toggleHabitCompletionForDate for consistency
  const handleToggleHabit = async (
    habitId: string,
    date: string
  ): Promise<void> => {
    try {
      console.log(`Toggling habit ${habitId} for date ${date}`);

      // Use the data service to toggle completion
      const updatedCompletion = await dataService.toggleHabitCompletionForDate(habitId, date);

      // Update local completions state
      setCompletions(prev => {
        const existingIndex = prev.findIndex(
          c => c.habitId === habitId && c.date === date
        );
        
        if (existingIndex !== -1) {
          const newCompletions = [...prev];
          newCompletions[existingIndex] = updatedCompletion;
          return newCompletions;
        } else {
          return [...prev, updatedCompletion];
        }
      });

      // Update habits to reflect streak changes
      const updatedHabits = await dataService.getHabits();
      setHabits(updatedHabits);

      toast.success(
        updatedCompletion.completed 
          ? "Habit marked as completed!" 
          : "Habit marked as incomplete"
      );

    } catch (error) {
      console.error("Error toggling habit completion:", error);
      toast.error("Failed to update habit");
    }
  };

  // Handle habit edit
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  // Handle habit deletion request
  const handleDeleteHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      setHabitToDelete(habit);
      setDeleteDialogOpen(true);
    }
  };

  // Handle actual habit deletion
  const handleConfirmDelete = async () => {
    if (!habitToDelete) return;

    setIsDeleting(true);

    try {
      await dataService.deleteHabit(habitToDelete.id);

      const deletedHabitName = habitToDelete.name;
      
      setHabits((prevHabits) =>
        prevHabits.filter((habit) => habit.id !== habitToDelete.id)
      );

      // Also remove related completions from local state
      setCompletions(prev => 
        prev.filter(c => c.habitId !== habitToDelete.id)
      );

      toast.success("Habit deleted successfully!", {
        description: `"${deletedHabitName}" has been removed from your habits.`,
        duration: 3000,
      });

      setDeleteDialogOpen(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit", {
        description: "There was an error deleting your habit. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle saving habit
  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    try {
      if (editingHabit) {
        // Update existing habit
        await dataService.updateHabit(editingHabit.id, habitData);

        setHabits((prevHabits) =>
          prevHabits.map((habit) =>
            habit.id === editingHabit.id ? { ...habit, ...habitData } : habit
          )
        );
        
        toast.success("Habit updated successfully!");
      } else {
        // Create new habit - use dataService's formatDate method
        const newHabit: Habit = {
          id: Date.now().toString(),
          name: habitData.name || "",
          description: habitData.description,
          category: habitData.category,
          image: habitData.image,
          color: habitData.color || "#0D9488",
          frequencyType: habitData.frequencyType || "Daily",
          targetCount: habitData.targetCount || 1,
          // Use the provided start date or today's date, properly formatted
          startDate: habitData.startDate || dataService.formatDateForApp(new Date()),
          endDate: habitData.endDate,
          priorityLevel: habitData.priorityLevel || "Medium",
          reminderTime: habitData.reminderTime,
          completed: false,
          streak: 0,
          current: 0,
        };

        await dataService.addHabit(newHabit);
        
        // Update habits state only, no need to reload completions
        const updatedHabits = await dataService.getHabits();
        setHabits(updatedHabits);
        
        toast.success("Habit created successfully!");
      }
      
      setIsModalOpen(false);
      setEditingHabit(null);
    } catch (error) {
      console.error('Error saving habit:', error);
      toast.error("Failed to save habit");
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
    const selectedDateObj = new Date(dateStr + "T00:00:00");

    return habits.filter((habit) => {
      // Check if habit is active on this date
      const startDate = new Date(habit.startDate || "2025-01-01");
      const endDate = habit.endDate ? new Date(habit.endDate) : null;
      
      // Normalize dates for comparison
      const normalizedSelectedDate = new Date(
        selectedDateObj.getFullYear(),
        selectedDateObj.getMonth(),
        selectedDateObj.getDate()
      );
      const normalizedStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const normalizedEndDate = endDate ? new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      ) : null;

      const isActive = normalizedSelectedDate >= normalizedStartDate &&
        (!normalizedEndDate || normalizedSelectedDate <= normalizedEndDate);

      if (!isActive) return false;

      // Check if habit is completed on this date
      const completion = completions.find(
        (c) => c.habitId === habit.id && c.date === dateStr
      );
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

  // Show loading state only during initial load
  if (loading) {
    return <LoadingSpinner message="Loading habits history..." />;
  }

  const daysInMonth = getDaysInMonth(currentMonth);
  const today = new Date();
  const isCurrentMonth = 
    currentMonth.getMonth() === today.getMonth() && 
    currentMonth.getFullYear() === today.getFullYear();

  const selectedDateStr = formatDate(selectedDate);
  const habitsForSelectedDate = getHabitsForDate(selectedDateStr);
  const stats = getDateStats(selectedDateStr);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Format month display as "14 November 2025"
  const formattedMonthDisplay = `${currentMonth.getDate()} ${currentMonth.toLocaleDateString(
    "en-US",
    { month: "long" }
  )} ${currentMonth.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
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
              onClick={() => handleNavigationWithToday("prev")}
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
              {/* Show Today button only if current month is not the displayed month */}
              {!isCurrentMonth && (
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
                onClick={() => handleNavigationWithToday("next")}
                className="h-10 w-10 p-0 cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="w-full max-w-full sm:max-w-[80%]">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
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
                const isCurrentMonthDate =
                  date.getMonth() === currentMonth.getMonth();
                const isToday = formatDate(date) === formatDate(today);
                const isSelected =
                  formatDate(date) === formatDate(selectedDate);
                const hasHabits = hasCompletedHabits(date);
                const dayHabits = getHabitsForCalendarDate(date);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      relative h-20 p-1 rounded-lg border-2 transition-all duration-200
                      flex flex-col items-center justify-start cursor-pointer
                      ${
                        isCurrentMonthDate
                          ? "bg-card text-foreground"
                          : "bg-muted/20 text-muted-foreground opacity-60"
                      }
                      ${
                        isToday && !isSelected
                          ? "border-primary/50 bg-primary/10"
                          : "border-transparent"
                      }
                      ${
                        isSelected
                          ? "border-primary bg-primary/20"
                          : "hover:bg-accent hover:border-accent"
                      }
                    `}
                  >
                    {/* Date Number */}
                    <span
                      className={`
                      text-sm font-medium mb-1
                      ${isSelected ? "text-primary" : ""}
                      ${isToday && !isSelected ? "text-primary" : ""}
                    `}
                    >
                      {date.getDate()}
                    </span>

                    {/* Habit Indicators */}
                    <div className="flex flex-wrap gap-1 justify-center w-full">
                      {dayHabits.slice(0, 3).map((habit) => (
                        <div
                          key={habit.id}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: habit.color || "#2563eb",
                            opacity: 0.8,
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

        {/* Habits List - You can edit completion status here */}
        <div className="px-5 pb-5 pt-4 space-y-3 bg-muted/20">
          {habitsForSelectedDate.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No habits for this date</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {habits.length === 0
                  ? "Create your first habit to start tracking"
                  : "No active habits scheduled for this date"}
              </p>
            </div>
          ) : (
            habitsForSelectedDate.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={(id) => handleToggleHabit(id, selectedDateStr)}
                onEdit={handleEditHabit}
                onDelete={() => handleDeleteHabit(habit.id)}
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

      {/* Add/Edit Modal */}
      <AddEditHabit
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        habit={editingHabit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setHabitToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        habitName={habitToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default History;