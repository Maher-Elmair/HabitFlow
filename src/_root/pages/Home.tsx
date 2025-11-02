import { useState, useEffect } from "react"; // أضف useEffect هنا
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
import type { Habit } from "@/types";
import { AddEditHabit } from "@/components/shared/addEditHabit";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { toast } from "sonner";
import { dataService } from "@/services/dataService"; // أضف استيراد dataService

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
  const isToday: boolean = true;
  const [completedToday, setCompletedToday] = useState(0);

  // Calculate completed habits from actual data
  useEffect(() => {
    const completed = habits.filter(habit => habit.completed).length;
    setCompletedToday(completed);
  }, [habits]);

  // Handle habit toggle with data service
  const handleToggleHabit = async (id: string) => {
    try {
      const updatedHabit = await dataService.toggleHabitCompletion(id);
      
      // Update local state
      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === id ? updatedHabit : habit
        )
      );
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast.error("Failed to update habit");
    }
  };

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

  // Handle actual habit deletion with data service
  const handleConfirmDelete = async () => {
    if (!habitToDelete) return;

    setIsDeleting(true);
    
    try {
      await dataService.deleteHabit(habitToDelete.id);
      
      const deletedHabitName = habitToDelete.name;
      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== habitToDelete.id));
      
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

  // Handle adding new habit
  const handleAddHabit = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  // Handle saving habit with data service
  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    try {
      if (editingHabit) {
        // Update existing habit
        await dataService.updateHabit(editingHabit.id, habitData);
        
        setHabits(prevHabits => 
          prevHabits.map(habit => 
            habit.id === editingHabit.id 
              ? { ...habit, ...habitData }
              : habit
          )
        );
      } else {
        // Create new habit
        const newHabit: Habit = {
          id: Date.now().toString(),
          name: habitData.name || '',
          description: habitData.description,
          category: habitData.category,
          image: habitData.image,
          color: habitData.color || '#0D9488',
          frequencyType: habitData.frequencyType || 'Daily',
          targetCount: habitData.targetCount || 1,
          startDate: habitData.startDate || new Date().toISOString(),
          endDate: habitData.endDate,
          priorityLevel: habitData.priorityLevel || 'Medium',
          reminderTime: habitData.reminderTime,
          completed: false,
          streak: 0,
          current: 0,
        };
        
        await dataService.addHabit(newHabit);
        setHabits(prevHabits => [...prevHabits, newHabit]);
      }
    } catch (error) {
      console.error('Error saving habit:', error);
      toast.error("Failed to save habit");
    }
  };

  // Add safety check for habits
  const totalHabits: number = habits?.filter(habit => 
    habit.frequencyType === 'Daily'
  ).length || 0;
  
  const completionRate: number = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  const todayHabits = habits?.filter(habit => habit.frequencyType === 'Daily') || [];

  // Show loading state if habits are not loaded yet
  if (!habits) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading habits...</span>
      </div>
    );
  }

  return (
    <div className="w-full ">
      <div className="text-center pt-6">
        <h2 className="text-2xl font-medium">Today's Habits</h2>
        <p className="text-md text-muted-foreground pt-2">
          Complete your habits to build momentum and consistency
        </p>
      </div>

      {/* Date Navigator */}
      <Card className="p-4 mt-6 mb-6 bg-card border-border rounded-xl ">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-foreground">Today</h3>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs"
              >
                Today
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-muted disabled:opacity-30 cursor-pointer"
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
              <h2 className="mt-1">{habits.length}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center text-xl">
              ✨
            </div>
          </div>
        </Card>
        
        <Card className="p-5 h-38 bg-linear-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <h2 className="mt-1">
                15 days
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
    <h2 className="text-start text-xl sm:text-2xl">Today's Habits</h2>
    <p className="text-muted-foreground text-sm mt-1">
      {completedToday === totalHabits && totalHabits > 0
        ? "Amazing! You've completed all your habits today! 🎉"
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
            <h3 className="mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building better habits today! Click the "Add Habit" button
              to create your first habit.
            </p>
            <Button
              onClick={handleAddHabit}
              className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Habit
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={{
                ...habit,
                completed: habit.completed ?? false, // Ensure completed is always boolean
                streak: habit.streak ?? 0, // Ensure streak is always number
              }}
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
        habitName={habitToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Home;