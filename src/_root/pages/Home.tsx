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

const completedToday: number = 3;
const totalHabits: number = 5;
const completionRate: number = (completedToday / totalHabits) * 100;
const isToday: boolean = true;
const Home = () => {
  return (
    <div className="w-full">
      <div className=" text-center">
        <h2 className="text-2xl font-medium">Today's Habits</h2>
        <p className="text-md text-muted-foreground pt-2 pb-4">
          Complete your habits to build momentum and consistency
        </p>
      </div>
      {/* Date Navigator */}
      <Card className="p-4 mb-6 mt-4 bg-card border-border rounded-xl">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            // onClick={}
            className="rounded-lg hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 " />
          </Button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-foreground">{"Today"}</h3>
              <p className="text-xs text-muted-foreground">
                {"October 24, 2025"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                // onClick={}
                className="rounded-lg text-xs"
              >
                Today
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              // onClick={}
              // disabled={}
              className="rounded-lg hover:bg-muted disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <Card className="p-5 h-38 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-xl">
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
        <Card className="p-5 h-38 bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20 rounded-xl">
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
        <Card className="p-5 h-38 bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <h2 className="mt-1">
                {/* {Math.max(...habits.map((h) => h.streak), 0)} days */}
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
      <div className="flex items-center justify-between py-4">
        <div>
          <h2 className="text-start text-xl">Today's Habits</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {completedToday === totalHabits && totalHabits > 0
              ? "Amazing! You've completed all your habits today! 🎉"
              : "Keep going! Complete your daily habits to build strong routines."}
          </p>
        </div>
        <Button
          // onClick={handleAddHabit}
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer rounded-xl shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Habit
        </Button>
      </div>
      {/* Habits List */}
      {[].length === 0 ? (
        <Card className="p-12 mt-2 text-center bg-card border-border rounded-2xl">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building better habits today! Click the "Add Habit" button
              to create your first habit.
            </p>
            <Button
              // onClick={}
              className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Habit
            </Button>
          </div>
        </Card>
      ) : (
        " "
      )}
    </div>
  );
};

export default Home;
