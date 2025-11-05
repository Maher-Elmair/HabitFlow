import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Flame, Target, TrendingUp, Calendar, Zap, Star, Trophy, Activity } from "lucide-react";
import { useOutletContext } from "react-router";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import type { Habit, HabitCompletion } from "@/types";
import { dataService } from "@/services/dataService";
import { useEffect, useState } from "react";

interface OutletContext {
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
}

const Analytics = () => {
  const { habits } = useOutletContext<OutletContext>();
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load completions - FIXED: Remove habits dependency to prevent unnecessary re-renders
  useEffect(() => {
    const loadCompletions = async () => {
      try {
        const allCompletions = await dataService.getAllCompletions();
        setCompletions(allCompletions || []);
      } catch (error) {
        console.error("Error loading completions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCompletions();
  }, []); // Empty dependency array - load only once

  // Calculate today's date for accurate daily calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calculate habits active today - FIXED: More accurate calculation
  const getActiveHabitsToday = () => {
    return habits.filter(habit => {
      const startDate = new Date(habit.startDate || "2025-01-01");
      const endDate = habit.endDate ? new Date(habit.endDate) : null;

      // Normalize dates for comparison
      const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

      const isAfterStart = normalizedToday >= normalizedStartDate;
      const isBeforeEnd = !normalizedEndDate || normalizedToday <= normalizedEndDate;

      return isAfterStart && isBeforeEnd;
    });
  };

  const activeHabitsToday = getActiveHabitsToday();
  const totalHabits = habits.length;
  const totalActiveHabitsToday = activeHabitsToday.length;

  // Calculate today's completed habits - FIXED: Use completions data instead of habit.completed
  const completedToday = completions.filter(comp => 
    comp.date === todayStr && comp.completed
  ).length;

  // Calculate completion rate for today - FIXED: Use active habits today as denominator
  const completionRateToday = totalActiveHabitsToday > 0 
    ? Math.round((completedToday / totalActiveHabitsToday) * 100) 
    : 0;

  // Calculate streaks - FIXED: More accurate streak calculation
  const streaks = habits.map((habit) => habit.streak || 0);
  const bestStreak = Math.max(...streaks, 0);
  const averageStreak = streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0;
  const activeStreaks = streaks.filter(streak => streak > 0).length;

  // Calculate weekly consistency - FIXED: More accurate calculation
  const getLast7DaysCompletions = () => {
    const last7Days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(formatDate(date));
    }

    return completions.filter((comp) => 
      last7Days.includes(comp.date) && comp.completed
    );
  };

  const last7DaysCompletions = getLast7DaysCompletions();

  // Calculate total possible completions in last 7 days
  const getTotalPossibleCompletionsLast7Days = () => {
    let totalPossible = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      const activeHabitsOnDate = habits.filter(habit => {
        const startDate = new Date(habit.startDate || "2025-01-01");
        const endDate = habit.endDate ? new Date(habit.endDate) : null;
        const checkDate = new Date(dateStr + "T00:00:00");

        const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
        const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const normalizedEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

        const isActive = normalizedCheckDate >= normalizedStartDate && 
                        (!normalizedEndDate || normalizedCheckDate <= normalizedEndDate);

        return isActive;
      }).length;

      totalPossible += activeHabitsOnDate;
    }
    return totalPossible;
  };

  const totalPossibleCompletionsLast7Days = getTotalPossibleCompletionsLast7Days();
  const weeklyConsistency = totalPossibleCompletionsLast7Days > 0
    ? Math.round((last7DaysCompletions.length / totalPossibleCompletionsLast7Days) * 100)
    : 0;

  // Calculate monthly consistency - FIXED: More accurate calculation
  const getLast30DaysCompletions = () => {
    const last30Days: string[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last30Days.push(formatDate(date));
    }

    return completions.filter((comp) => 
      last30Days.includes(comp.date) && comp.completed
    );
  };

  const last30DaysCompletions = getLast30DaysCompletions();

  // Calculate total possible completions in last 30 days
  const getTotalPossibleCompletionsLast30Days = () => {
    let totalPossible = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      const activeHabitsOnDate = habits.filter(habit => {
        const startDate = new Date(habit.startDate || "2025-01-01");
        const endDate = habit.endDate ? new Date(habit.endDate) : null;
        const checkDate = new Date(dateStr + "T00:00:00");

        const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
        const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const normalizedEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

        const isActive = normalizedCheckDate >= normalizedStartDate && 
                        (!normalizedEndDate || normalizedCheckDate <= normalizedEndDate);

        return isActive;
      }).length;

      totalPossible += activeHabitsOnDate;
    }
    return totalPossible;
  };

  const totalPossibleCompletionsLast30Days = getTotalPossibleCompletionsLast30Days();
  const monthlyConsistency = totalPossibleCompletionsLast30Days > 0
    ? Math.round((last30DaysCompletions.length / totalPossibleCompletionsLast30Days) * 100)
    : 0;

  // Calculate total completion time (estimate based on habit frequency)
  const totalCompletionTime = habits.reduce((total, habit) => {
    const habitCompletions = completions.filter(c => c.habitId === habit.id && c.completed).length;
    // Estimate 15 minutes per completion
    return total + (habitCompletions * 15);
  }, 0);

  // Generate realistic weekly data based on actual completions - FIXED: More accurate
  const getWeeklyData = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    return daysOfWeek.map((day, index) => {
      // Calculate date for each day of current week
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + index);
      const dateStr = formatDate(date);

      // Count completions for that day
      const dayCompletions = completions.filter(
        (comp) => comp.date === dateStr && comp.completed
      ).length;

      // Count active habits for that day
      const activeHabitsOnDate = habits.filter(habit => {
        const startDate = new Date(habit.startDate || "2025-01-01");
        const endDate = habit.endDate ? new Date(habit.endDate) : null;
        const checkDate = new Date(dateStr + "T00:00:00");

        const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
        const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const normalizedEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

        const isActive = normalizedCheckDate >= normalizedStartDate && 
                        (!normalizedEndDate || normalizedCheckDate <= normalizedEndDate);

        return isActive;
      }).length;

      return {
        day,
        completed: dayCompletions,
        active: activeHabitsOnDate,
        date: dateStr,
      };
    });
  };

  // Generate monthly trend data - FIXED: More accurate
  const getMonthlyTrendData = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      // Count completions for this month
      const monthCompletions = completions.filter(comp => {
        const compDate = new Date(comp.date);
        return comp.completed && 
               compDate.getMonth() === date.getMonth() && 
               compDate.getFullYear() === date.getFullYear();
      }).length;

      // Count total possible completions for this month
      let totalPossibleCompletions = 0;
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        const dateStr = formatDate(currentDate);
        
        const activeHabitsOnDate = habits.filter(habit => {
          const startDate = new Date(habit.startDate || "2025-01-01");
          const endDate = habit.endDate ? new Date(habit.endDate) : null;
          const checkDate = new Date(dateStr + "T00:00:00");

          const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
          const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const normalizedEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

          const isActive = normalizedCheckDate >= normalizedStartDate && 
                          (!normalizedEndDate || normalizedCheckDate <= normalizedEndDate);

          return isActive;
        }).length;

        totalPossibleCompletions += activeHabitsOnDate;
      }

      const consistency = totalPossibleCompletions > 0 
        ? Math.round((monthCompletions / totalPossibleCompletions) * 100)
        : 0;

      months.push({
        month: `${monthName} '${String(year).slice(2)}`,
        completions: monthCompletions,
        possible: totalPossibleCompletions,
        consistency: consistency
      });
    }
    
    return months;
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyTrendData();

  // Calculate category data
  const categoryData = habits.reduce((acc: Record<string, Habit[]>, habit) => {
    const category = habit.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(habit);
    return acc;
  }, {});

  // Calculate priority distribution
  const priorityData = habits.reduce((acc: Record<string, number>, habit) => {
    const priority = habit.priorityLevel || "Medium";
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  // Calculate completion rate by category - FIXED: More accurate
  const categoryCompletion = Object.entries(categoryData).map(
    ([category, categoryHabits]) => {
      const totalCompletions = completions.filter((c) =>
        categoryHabits.some((h) => h.id === c.habitId && c.completed)
      ).length;

      // Calculate total possible completions for these habits
      let totalPossibleCompletions = 0;
      const last30Days: string[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last30Days.push(formatDate(date));
      }

      last30Days.forEach(dateStr => {
        const activeHabitsOnDate = categoryHabits.filter(habit => {
          const startDate = new Date(habit.startDate || "2025-01-01");
          const endDate = habit.endDate ? new Date(habit.endDate) : null;
          const checkDate = new Date(dateStr + "T00:00:00");

          const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
          const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const normalizedEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

          const isActive = normalizedCheckDate >= normalizedStartDate && 
                          (!normalizedEndDate || normalizedCheckDate <= normalizedEndDate);

          return isActive;
        }).length;

        totalPossibleCompletions += activeHabitsOnDate;
      });

      const consistency = totalPossibleCompletions > 0 
        ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
        : 0;

      return {
        category,
        totalCompletions,
        totalPossibleCompletions,
        consistency: consistency,
        habitCount: categoryHabits.length
      };
    }
  );

  // Calculate habit performance ranking - FIXED: More accurate
  const habitPerformance = habits
    .map((habit) => {
      const habitCompletions = completions.filter(
        (c) => c.habitId === habit.id && c.completed
      );

      // Calculate total possible completions for this habit in last 30 days
      let totalPossibleCompletions = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        
        const isActiveOnDate = (() => {
          const startDate = new Date(habit.startDate || "2025-01-01");
          const endDate = habit.endDate ? new Date(habit.endDate) : null;
          const checkDate = new Date(dateStr + "T00:00:00");

          const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
          const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const normalizedEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

          return normalizedCheckDate >= normalizedStartDate && 
                 (!normalizedEndDate || normalizedCheckDate <= normalizedEndDate);
        })();

        if (isActiveOnDate) {
          totalPossibleCompletions++;
        }
      }

      const completionRate = totalPossibleCompletions > 0 
        ? Math.round((habitCompletions.length / totalPossibleCompletions) * 100)
        : 0;

      const dailyAverage = habitCompletions.length > 0 
        ? (habitCompletions.length / 30).toFixed(1)
        : "0";

      return {
        ...habit,
        completionRate: completionRate,
        totalCompletions: habitCompletions.length,
        totalPossibleCompletions: totalPossibleCompletions,
        dailyAverage: dailyAverage,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate);

  // Calculate streak distribution
  const streakDistribution = [
    { range: "1-7 days", count: streaks.filter(s => s >= 1 && s <= 7).length },
    { range: "8-30 days", count: streaks.filter(s => s >= 8 && s <= 30).length },
    { range: "31-90 days", count: streaks.filter(s => s >= 31 && s <= 90).length },
    { range: "90+ days", count: streaks.filter(s => s > 90).length },
  ];

  // Calculate success rate - FIXED: More accurate
  const successfulHabits = habitPerformance.filter(h => h.completionRate >= 70).length;
  const successRate = totalHabits > 0 ? Math.round((successfulHabits / totalHabits) * 100) : 0;

  // Calculate daily average completions - FIXED: More accurate
  const totalCompletions = completions.filter(c => c.completed).length;
  const dailyAverageCompletions = totalCompletions > 0 ? (totalCompletions / 30).toFixed(1) : "0";

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Custom tooltip for pie chart
  interface PieTooltipPayloadItem {
    name?: string;
    value?: number;
    payload?: { value?: number };
    color?: string;
  }

  const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: PieTooltipPayloadItem[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0] as PieTooltipPayloadItem;
      const totalHabitsInCategory = data.payload?.value ?? 0;
      const percentage = ((totalHabitsInCategory / totalHabits) * 100).toFixed(1);
      
      return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-foreground">{data.name}</p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Habits:</span>
              <span className="font-medium text-foreground">{totalHabitsInCategory}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-medium text-primary">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading habits analytics...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center pt-6">
        <h2 className="text-2xl font-medium">Advanced Analytics & Insights</h2>
        <p className="text-md text-muted-foreground pt-2 pb-4">
          Deep dive into your habit performance, trends, and growth opportunities
        </p>
      </div>

      {/* Enhanced Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 h-36 bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Progress</p>
              <h2 className="mt-1 text-2xl font-bold">
                {completionRateToday}%
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {completedToday}/{totalActiveHabitsToday} habits completed
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
          <Progress value={completionRateToday} className="mt-4 h-2" />
        </Card>

        <Card className="p-5 h-36 bg-linear-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Weekly Consistency
              </p>
              <h2 className="mt-1 text-2xl font-bold">{weeklyConsistency}%</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {last7DaysCompletions.length} completions this week
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-chart-3" />
            </div>
          </div>
        </Card>

        <Card className="p-5 h-36 bg-linear-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <h2 className="mt-1 text-2xl font-bold">{bestStreak} days</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {activeStreaks} active streaks
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-chart-4/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-chart-4" />
            </div>
          </div>
        </Card>

        <Card className="p-5 h-36 bg-linear-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Completions</p>
              <h2 className="mt-1 text-2xl font-bold">
                {totalCompletions}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.floor(totalCompletionTime / 60)}h invested
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-chart-1/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-chart-1" />
            </div>
          </div>
        </Card>
      </div>

      {/* Second Row of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 h-36 bg-linear-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Consistency</p>
              <h2 className="mt-1 text-2xl font-bold">{monthlyConsistency}%</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {last30DaysCompletions.length} completions
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-5 h-36 bg-linear-to-br from-green-500/10 to-green-500/5 border-green-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Streak</p>
              <h2 className="mt-1 text-2xl font-bold">{averageStreak} days</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Across all habits
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-5 h-36 bg-linear-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <h2 className="mt-1 text-2xl font-bold">
                {successRate}%
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Habits with 70%+ completion
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-5 h-36 bg-linear-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <h2 className="mt-1 text-2xl font-bold">
                {dailyAverageCompletions}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Completions per day
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Weekly Activity</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your habit completions throughout the current week
            </p>
          </div>

          <ChartContainer
            config={chartConfig}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Monthly Trend Chart */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-1">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Monthly Trend</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              6-month completion trend and consistency
            </p>
          </div>

          <ChartContainer
            config={trendConfig}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="var(--color-trend)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-trend)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-1">Category Distribution</h3>
            <p className="text-sm text-muted-foreground">
              How your habits are distributed across categories
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(categoryData).map(([category, habits]) => ({
                    name: category,
                    value: habits.length
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {Object.keys(categoryData).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-1">Priority Distribution</h3>
            <p className="text-sm text-muted-foreground">
              Distribution of habit priority levels
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(priorityData).map(([priority, count]) => {
              const percentage = (count / totalHabits) * 100;
              const getPriorityColor = (priority: string) => {
                switch (priority) {
                  case "High":
                    return "#EF4444";
                  case "Medium":
                    return "#F59E0B";
                  case "Low":
                    return "#10B981";
                  default:
                    return "#6B7280";
                }
              };
              const color = getPriorityColor(priority);

              return (
                <div
                  key={priority}
                  className="p-4 bg-background/50 rounded-xl border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color }}>
                      {priority} Priority
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                      }}
                    >
                      {count}
                    </Badge>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    style={{
                      backgroundColor: `${color}15`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{Math.round(percentage)}% of habits</span>
                    <span>
                      {count} habit{count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Streak Distribution */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-1">
              <Flame className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Streak Distribution</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              How your habits are performing in terms of streaks
            </p>
          </div>

          <div className="space-y-4">
            {streakDistribution.map((item, index) => {
              const percentage = (item.count / totalHabits) * 100;
              const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
              
              return (
                <div key={item.range} className="p-4 bg-background/50 rounded-xl border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: colors[index] }}>
                      {item.range}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${colors[index]}15`,
                        color: colors[index],
                      }}
                    >
                      {item.count}
                    </Badge>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    style={{
                      backgroundColor: `${colors[index]}15`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{Math.round(percentage)}% of habits</span>
                    <span>
                      {item.count} habit{item.count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Performing Habits */}
      <Card className="p-6 bg-linear-to-br from-primary/5 to-chart-2/5 border-primary/10 rounded-2xl">
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Top Performing Habits</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your most consistent habits ranked by completion rate and streak
          </p>
        </div>

        {habitPerformance.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Start building habits to see performance data!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habitPerformance.slice(0, 6).map((habit, index) => (
              <div
                key={habit.id}
                className="p-4 bg-background/50 backdrop-blur-sm border border-border rounded-xl relative group hover:shadow-lg transition-all duration-200"
              >
                {index < 3 && (
                  <Badge
                    className={`absolute -top-2 -right-2 border-0 ${
                      index === 0
                        ? "bg-linear-to-br from-yellow-400 to-yellow-600"
                        : index === 1
                        ? "bg-linear-to-br from-gray-400 to-gray-600"
                        : "bg-linear-to-br from-orange-400 to-orange-600"
                    } text-white`}
                  >
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </Badge>
                )}
                <div className="flex items-center gap-3">
                  {habit.image ? (
                    <div
                      className="w-12 h-12 rounded-lg overflow-hidden border-2"
                      style={{ borderColor: habit.color || "#0D9488" }}
                    >
                      <img
                        src={habit.image}
                        alt={habit.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl border-2"
                      style={{
                        backgroundColor: `${habit.color || "#0D9488"}20`,
                        borderColor: habit.color || "#0D9488",
                      }}
                    >
                      ⭐
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {habit.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="font-medium">{habit.streak || 0}d</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-green-600">
                          {habit.completionRate}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-blue-500" />
                        <span>{habit.dailyAverage}/day</span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">
                          {habit.totalCompletions} total
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Advanced Insights */}
      <Card className="p-6 bg-linear-to-br from-primary/5 to-chart-2/5 border-primary/10 rounded-2xl">
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-1">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Advanced Insights</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Detailed analysis of your habit tracking performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">PERFORMANCE METRICS</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-background/50 rounded-lg border">
                <div className="text-muted-foreground">Best Category</div>
                <div className="font-semibold mt-1">
                  {categoryCompletion.length > 0
                    ? categoryCompletion.sort((a, b) => b.consistency - a.consistency)[0].category
                    : "N/A"}
                </div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border">
                <div className="text-muted-foreground">Weekly Goal</div>
                <div className="font-semibold mt-1">
                  {Math.round(totalPossibleCompletionsLast7Days * 0.8)} completes
                </div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border">
                <div className="text-muted-foreground">Success Rate</div>
                <div className="font-semibold mt-1">
                  {successRate}%
                </div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border">
                <div className="text-muted-foreground">Avg. Completion</div>
                <div className="font-semibold mt-1">
                  {monthlyConsistency}%
                </div>
              </div>
            </div>
          </div>

          {/* Improvement Opportunities */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">IMPROVEMENT OPPORTUNITIES</h4>
            <div className="space-y-3">
              {habitPerformance
                .filter(habit => habit.completionRate < 50)
                .slice(0, 3)
                .map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                    <div>
                      <div className="font-medium text-sm">{habit.name}</div>
                      <div className="text-xs text-muted-foreground">{habit.completionRate}% completion</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Needs focus
                    </Badge>
                  </div>
                ))}
              {habitPerformance.filter(habit => habit.completionRate < 50).length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Great job! All habits are performing well.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Motivational Insights */}
      <Card className="p-6 bg-linear-to-br from-primary/5 to-chart-2/5 border-primary/10 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-2xl">
            💪
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Performance Insights & Recommendations</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {monthlyConsistency === 100 && totalHabits > 0
                ? "Outstanding! You've achieved perfect consistency across all habits. Consider adding more challenging goals or mentoring others."
                : monthlyConsistency >= 80
                ? "Excellent work! You're maintaining exceptional consistency. Focus on optimizing your routine and helping habits become automatic."
                : monthlyConsistency >= 60
                ? "Strong progress! You're building reliable habits. Try implementing habit stacking to improve consistency further."
                : monthlyConsistency >= 40
                ? "Good foundation! Consistency is improving. Focus on your top 3 priorities and build momentum from there."
                : "Every master was once a beginner. Focus on building one consistent habit at a time - small wins lead to big results."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Next Level Goal: </span>
                <span className="font-medium">
                  {monthlyConsistency < 100 ? `Reach ${Math.min(100, Math.round(monthlyConsistency) + 10)}% consistency` : "Maintain 100% streak"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Recommended Focus: </span>
                <span className="font-medium">
                  {habitPerformance.length > 0 && habitPerformance[habitPerformance.length - 1].name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Chart configurations
const chartConfig = {
  completed: {
    label: "Habits Completed",
    color: "#0D9488",
  },
};

const trendConfig = {
  trend: {
    label: "Monthly Completions",
    color: "#8B5CF6",
  },
};

export default Analytics;