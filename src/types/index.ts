/**
 * Core data types for HabitFlow application
 */

export type FrequencyType = "Daily" | "Weekly" | "Monthly";
export type PriorityLevel = "High" | "Medium" | "Low";

// Habit template - the habit definition that repeats
export interface Habit {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  color?: string;
  frequencyType?: FrequencyType;
  targetCount?: number;
  startDate?: string;
  endDate?: string;
  priorityLevel?: PriorityLevel;
  reminderTime?: string;
  completed?: boolean; // Add as optional
  streak?: number; // Add as optional
  current?: number; // Add as optional for progress tracking
  createdAt?: string;
}

// Daily habit completion record
export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: string; // ISO timestamp when it was completed
}

// Habit with completion data for a specific date
export interface HabitWithCompletion extends Habit {
  completed: boolean;
  streak: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastLogin: string;
}

export interface StoredData {
  habits: Habit[];
  userProfile: UserProfile | null;
  lastSync: string;
  version: string;
}

/**
 * Component Props Types
 */

export interface DashboardProps {
  habits: Habit[];
  completions: HabitCompletion[];
  selectedDate: string;
  onAddHabit: (habit: Partial<Habit>) => void;
  onEditHabit: (habit: Partial<Habit>) => void;
  onDeleteHabit: (id: string) => void;
  onToggleHabit: (habitId: string, date: string) => void;
  onDateChange: (date: string) => void;
}

export interface HabitCardProps {
  habit: HabitWithCompletion;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export interface AddEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Partial<Habit>) => void;
  habit?: Habit | null;
}

export interface AnalyticsProps {
  habits: Habit[];
  completions: HabitCompletion[];
}

export interface ProfileProps {
  habits: Habit[];
  completions: HabitCompletion[];
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<UserProfile>) => void;
  profile: UserProfile;
}

export interface ProfileStatsProps {
  habits: Habit[];
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
}

/**
 * Chart Data Types
 */

export interface WeeklyData {
  day: string;
  completed: number;
}

export interface ChartConfig {
  completed: {
    label: string;
    color: string;
  };
}

/**
 * Category Data Types
 */

export type CategoryHabits = Record<string, Habit[]>;

/**
 * History Component Props
 */

export interface HistoryProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onToggleHabit: (habitId: string, date: string) => void;
}

export type HabitType = "daily" | "weekly" | "monthly";
export type HabitCategory = "health" | "work" | "personal" | "learning";
export type HabitColor = "blue" | "green" | "purple" | "orange" | "red";
