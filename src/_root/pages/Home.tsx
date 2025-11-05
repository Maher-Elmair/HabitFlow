import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
} from "lucide-react";
import { HabitCard } from "@/components/shared/HabitCard";
import type { Habit, HabitWithCompletion, HabitCompletion } from "@/types";
import { AddEditHabit } from "@/components/shared/addEditHabit";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { toast } from "sonner";
import { dataService } from "@/services/dataService";

interface HomeContext {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const Home = () => {
  const { habits, setHabits } = useOutletContext<HomeContext>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Date navigation state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if selected date is today
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Load completions for all habits - FIXED VERSION
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
  }, []);

  // Get habits with completion for a specific date - OPTIMIZED VERSION
  const getHabitsForDate = useCallback(
    (dateStr: string): HabitWithCompletion[] => {
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
          const normalizedEndDate = endDate
            ? new Date(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate()
              )
            : null;

          // Check if habit should be active on this date
          const isAfterStart = normalizedSelectedDate >= normalizedStartDate;
          const isBeforeEnd =
            !normalizedEndDate || normalizedSelectedDate <= normalizedEndDate;

          return isAfterStart && isBeforeEnd;
        })
        .map((habit) => {
          const completion = completions.find(
            (c) => c.habitId === habit.id && c.date === dateStr
          );

          // Use the actual completion status from completions array
          const isCompleted = completion?.completed || false;

          // Calculate streak for the habit up to the selected date
          const streak = calculateStreak(habit.id, dateStr);

          return {
            ...habit,
            completed: isCompleted,
            streak: streak,
          };
        });
    },
    [habits, completions]
  );

  // Calculate streak for a habit up to a specific date - FIXED VERSION
  const calculateStreak = (habitId: string, upToDate: string): number => {
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
  };

  // Get today's habits
  const selectedDateStr = formatDate(selectedDate);
  const todayHabits = getHabitsForDate(selectedDateStr);

  // Calculate stats
  const completedToday = todayHabits.filter((habit) => habit.completed).length;
  const totalHabits = todayHabits.length;
  const completionRate =
    totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Date navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Handle habit toggle - IMPROVED VERSION
  const handleToggleHabit = useCallback(
    async (id: string) => {
      try {
        const dateStr = formatDate(selectedDate);
        
        console.log(`Toggling habit ${id} for date ${dateStr}`);

        // Use the data service to toggle completion
        const updatedCompletion = await dataService.toggleHabitCompletionForDate(id, dateStr);

        // Update local completions state
        setCompletions(prev => {
          const existingIndex = prev.findIndex(
            c => c.habitId === id && c.date === dateStr
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
        console.error("Error toggling habit:", error);
        toast.error("Failed to update habit");
      }
    },
    [selectedDate, setHabits]
  );

  // Handle habit edit
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  // Handle habit deletion request
  const handleDeleteHabit = (habit: Habit) => {
    setHabitToDelete(habit);
    setDeleteDialogOpen(true);
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
        description:
          "There was an error deleting your habit. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle adding new habit
  const handleAddHabit = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
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
        // Create new habit
        const newHabit: Habit = {
          id: Date.now().toString(),
          name: habitData.name || "",
          description: habitData.description,
          category: habitData.category,
          image: habitData.image,
          color: habitData.color || "#0D9488",
          frequencyType: habitData.frequencyType || "Daily",
          targetCount: habitData.targetCount || 1,
          startDate:
            habitData.startDate || new Date().toISOString().split("T")[0],
          endDate: habitData.endDate,
          priorityLevel: habitData.priorityLevel || "Medium",
          reminderTime: habitData.reminderTime,
          completed: false,
          streak: 0,
          current: 0,
        };

        await dataService.addHabit(newHabit);
        setHabits((prevHabits) => [...prevHabits, newHabit]);
        
        toast.success("Habit created successfully!");
      }
      
      setIsModalOpen(false);
      setEditingHabit(null);
    } catch (error) {
      console.error("Error saving habit:", error);
      toast.error("Failed to save habit");
    }
  };

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading habits...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center pt-6">
        <h2 className="text-2xl font-medium">Daily Habits</h2>
        <p className="text-md text-muted-foreground pt-2">
          Complete your habits to build momentum and consistency
        </p>
      </div>

      {/* Date Navigator */}
      <Card className="p-4 mt-6 mb-6 bg-card border-border rounded-xl">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-muted cursor-pointer"
            onClick={() => navigateDate("prev")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-foreground">
                {formatDisplayDate(selectedDate)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs cursor-pointer"
                onClick={goToToday}
              >
                Today
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <Card className="p-5 h-38 bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Progress</p>
              <h2 className="mt-1">
                {completedToday} / {totalHabits}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          <Progress value={completionRate} className="mt-10 h-2" />
        </Card>

        <Card className="p-5 h-38 bg-linear-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Habits</p>
              <h2 className="mt-1">{totalHabits}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center text-xl">
              ✨
            </div>
          </div>
        </Card>

        <Card className="p-5 h-38 bg-linear-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Streaks</p>
              <h2 className="mt-1">
                {todayHabits.filter((h) => h.streak > 0).length}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-chart-4/20 flex items-center justify-center text-xl">
              🔥
            </div>
          </div>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-start text-xl sm:text-2xl">
            {formatDisplayDate(selectedDate)}'s Habits
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {completedToday === totalHabits && totalHabits > 0
              ? "Amazing! You've completed all your habits! 🎉"
              : "Keep going! Complete your daily habits to build strong routines."}
          </p>
        </div>
        <Button
          onClick={handleAddHabit}
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer rounded-xl shadow-sm w-full sm:w-auto flex items-center justify-center sm:justify-start"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Habits List */}
      {todayHabits.length === 0 ? (
        <Card className="p-12 mt-2 text-center bg-card border-border rounded-2xl">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="mb-2">No habits for this date</h3>
            <p className="text-muted-foreground mb-6">
              {isToday
                ? "Start building better habits today! Click the 'Add Habit' button to create your first habit."
                : "No habits were scheduled for this date."}
            </p>
            {isToday && (
              <Button
                onClick={handleAddHabit}
                className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Habit
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggleHabit}
              onEdit={handleEditHabit}
              onDelete={() => handleDeleteHabit(habit)}
            />
          ))}
        </div>
      )}

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
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Home;