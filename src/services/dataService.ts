// dataService.ts
import type { Habit, UserProfile, StoredData, HabitCompletion } from '@/types';

/**
 * Data service for managing habits, user profiles, and completions
 * Provides centralized data management with local storage persistence
 */
class DataService {
  private readonly STORAGE_KEY = 'habitflow_data';
  private readonly DATA_VERSION = '1.0.0';

  /**
   * Get all application data from local storage
   * Returns default data if no stored data exists or if data is invalid
   */
  async getData(): Promise<StoredData> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        
        if (this.validateData(data)) {
          return data;
        }
      }
      
      return this.getDefaultData();
    } catch (error) {
      console.error('Error reading data from storage:', error);
      return this.getDefaultData();
    }
  }

  /**
   * Save all application data to local storage
   * Includes timestamp and version for data management
   */
  async saveData(data: StoredData): Promise<void> {
    try {
      const dataToSave: StoredData = {
        ...data,
        lastSync: new Date().toISOString(),
        version: this.DATA_VERSION
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data to storage:', error);
      throw new Error('Failed to save data');
    }
  }

  /**
   * Get habits that are active on a specific date
   * Filters habits based on start date and end date constraints
   * Handles same-day habit creation by comparing dates without time
   */
  async getHabitsForDate(date: string): Promise<Habit[]> {
    const data = await this.getData();
    const targetDate = new Date(date);
    
    return data.habits.filter(habit => {
      const startDate = new Date(habit.startDate || '2025-01-01');
      const endDate = habit.endDate ? new Date(habit.endDate) : null;
      
      // Normalize dates to compare only year, month, and day (ignore time)
      const normalizedTargetDate = new Date(
        targetDate.getFullYear(), 
        targetDate.getMonth(), 
        targetDate.getDate()
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
      // Include habits where start date is on or before target date
      const isAfterStart = normalizedTargetDate >= normalizedStartDate;
      // If end date exists, target date should be on or before end date
      const isBeforeEnd = !normalizedEndDate || normalizedTargetDate <= normalizedEndDate;
      
      return isAfterStart && isBeforeEnd;
    });
  }

  /**
   * Get habit completions for a specific date
   * Returns all completion records for the given date
   */
  async getHabitCompletionsForDate(date: string): Promise<HabitCompletion[]> {
    const data = await this.getData();
    return data.habitCompletions?.filter(c => c.date === date) || [];
  }

  /**
   * Toggle habit completion status for a specific date
   * Creates new completion record if none exists, updates existing otherwise
   */
  async toggleHabitCompletionForDate(habitId: string, date: string): Promise<HabitCompletion> {
    const data = await this.getData();
    
    if (!data.habitCompletions) {
      data.habitCompletions = [];
    }
    
    const existingCompletion = data.habitCompletions.find(
      c => c.habitId === habitId && c.date === date
    );
    
    const completed = !existingCompletion?.completed;
    
    if (existingCompletion) {
      existingCompletion.completed = completed;
      existingCompletion.completedAt = completed ? new Date().toISOString() : undefined;
    } else {
      data.habitCompletions.push({
        habitId,
        date,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined
      });
    }
    
    await this.saveData(data);
    
    // Update habit streak after completion change
    await this.updateHabitStreak(habitId);
    
    return data.habitCompletions.find(c => c.habitId === habitId && c.date === date)!;
  }

  /**
   * Calculate and update streak for a habit based on completion history
   * Streak is calculated as consecutive days of completion up to current date
   */
  private async updateHabitStreak(habitId: string): Promise<void> {
    const data = await this.getData();
    const habit = data.habits.find(h => h.id === habitId);
    
    if (!habit) return;
    
    const completions = data.habitCompletions?.filter(c => c.habitId === habitId && c.completed) || [];
    
    // Sort completions by date descending (most recent first)
    completions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    // Calculate current streak by checking consecutive days
    for (let i = 0; i < completions.length; i++) {
      const completionDate = new Date(completions[i].date);
      const diffTime = Math.abs(currentDate.getTime() - completionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak + 1) {
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }
    
    habit.streak = streak;
    await this.saveData(data);
  }

  /**
   * Create a new habit with proper initialization
   * Sets default values for required fields and validates dates
   */
  async addHabit(habit: Habit): Promise<void> {
    const data = await this.getData();
    
    // Ensure start date is today if not provided, and format it correctly
    if (!habit.startDate) {
      habit.startDate = this.formatDate(new Date());
    } else {
      // Ensure the provided start date is properly formatted
      habit.startDate = this.formatDate(new Date(habit.startDate));
    }
    
    // If end date is provided, ensure it's properly formatted
    if (habit.endDate) {
      habit.endDate = this.formatDate(new Date(habit.endDate));
    }
    
    // Initialize completion status and tracking fields
    habit.completed = false;
    habit.streak = 0;
    habit.current = 0;
    
    data.habits.push(habit);
    await this.saveData(data);
  }

  /**
   * Get all habits (for management purposes)
   * Returns complete list of all user habits regardless of date constraints
   */
  async getHabits(): Promise<Habit[]> {
    const data = await this.getData();
    return data.habits;
  }

  /**
   * Save complete list of habits
   * Overwrites existing habits with new list
   */
  async saveHabits(habits: Habit[]): Promise<void> {
    const data = await this.getData();
    data.habits = habits;
    await this.saveData(data);
  }

  /**
   * Update specific habit with new data
   * Merges updates with existing habit properties
   */
  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    const data = await this.getData();
    const habitIndex = data.habits.findIndex(h => h.id === habitId);
    
    if (habitIndex !== -1) {
      data.habits[habitIndex] = { ...data.habits[habitIndex], ...updates };
      await this.saveData(data);
    } else {
      throw new Error(`Habit with ID ${habitId} not found`);
    }
  }

  /**
   * Delete habit and all associated completion records
   * Removes habit from habits list and related completions
   */
  async deleteHabit(habitId: string): Promise<void> {
    const data = await this.getData();
    data.habits = data.habits.filter(h => h.id !== habitId);
    
    // Also remove related completions
    if (data.habitCompletions) {
      data.habitCompletions = data.habitCompletions.filter(c => c.habitId !== habitId);
    }
    
    await this.saveData(data);
  }

  /**
   * Get all completion records for a specific habit
   * Returns completion history for individual habit tracking
   */
  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    const data = await this.getData();
    return data.habitCompletions?.filter(c => c.habitId === habitId) || [];
  }

  /**
   * Get all completion records across all habits
   * Returns complete completion history for analytics and reporting
   */
  async getAllCompletions(): Promise<HabitCompletion[]> {
    const data = await this.getData();
    return data.habitCompletions || [];
  }

  /**
   * Get habit completions by habit ID
   * Returns all completion records for a specific habit
   */
  async getHabitCompletionsByHabitId(habitId: string): Promise<HabitCompletion[]> {
    const data = await this.getData();
    return data.habitCompletions?.filter(c => c.habitId === habitId) || [];
  }

  /**
   * Update completion status for a specific habit and date
   * Creates new record if none exists, otherwise updates existing
   */
  async updateHabitCompletion(habitId: string, date: string, completed: boolean): Promise<void> {
    const data = await this.getData();
    
    // Initialize habitCompletions array if it doesn't exist
    if (!data.habitCompletions) {
      data.habitCompletions = [];
    }
    
    const completionIndex = data.habitCompletions.findIndex(
      c => c.habitId === habitId && c.date === date
    );
    
    if (completionIndex !== -1) {
      // Update existing completion
      data.habitCompletions[completionIndex].completed = completed;
      data.habitCompletions[completionIndex].completedAt = completed ? new Date().toISOString() : undefined;
    } else {
      // Create new completion
      data.habitCompletions.push({
        habitId,
        date,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined
      });
    }
    
    await this.saveData(data);
    
    // Update streak after completion change
    await this.updateHabitStreak(habitId);
  }

  /**
   * Add new completion record
   * Ensures only one completion record exists per habit per date
   */
  async addHabitCompletion(completion: HabitCompletion): Promise<void> {
    const data = await this.getData();
    
    // Initialize habitCompletions array if it doesn't exist
    if (!data.habitCompletions) {
      data.habitCompletions = [];
    }
    
    // Remove existing completion for the same habit and date
    data.habitCompletions = data.habitCompletions.filter(
      c => !(c.habitId === completion.habitId && c.date === completion.date)
    );
    
    // Add new completion
    data.habitCompletions.push(completion);
    await this.saveData(data);
    
    // Update streak after adding completion
    await this.updateHabitStreak(completion.habitId);
  }

  // User profile management methods

  /**
   * Get current user profile
   * Returns null if no profile exists
   */
  async getUserProfile(): Promise<UserProfile | null> {
    const data = await this.getData();
    return data.userProfile;
  }

  /**
   * Save user profile
   * Creates or replaces existing user profile
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const data = await this.getData();
    data.userProfile = profile;
    await this.saveData(data);
  }

  /**
   * Update user profile with partial data
   * Merges updates with existing profile properties
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const data = await this.getData();
    
    if (!data.userProfile) {
      throw new Error('No user profile found');
    }

    const updatedProfile: UserProfile = {
      ...data.userProfile,
      ...updates
    };

    data.userProfile = updatedProfile;
    await this.saveData(data);
    return updatedProfile;
  }

  /**
   * Create user profile from Firebase authentication data
   * Automatically generates profile from Firebase user object
   */
  async createUserProfileFromFirebase(firebaseUser: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null }): Promise<UserProfile> {
    const profile: UserProfile = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || '',
      bio: 'Building consistent habits, one day at a time.',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await this.saveUserProfile(profile);
    return profile;
  }

  /**
   * Clear user profile (on logout)
   * Removes user profile while keeping habit data
   */
  async clearUserProfile(): Promise<void> {
    const data = await this.getData();
    data.userProfile = null;
    await this.saveData(data);
  }

  // Data export/import methods

  /**
   * Export all application data as JSON string
   * Useful for backup and data transfer
   */
  async exportData(): Promise<string> {
    const data = await this.getData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import application data from JSON string
   * Validates data structure before importing
   */
  async importData(jsonData: string): Promise<void> {
    try {
      const importedData: StoredData = JSON.parse(jsonData);
      
      if (this.validateData(importedData)) {
        await this.saveData(importedData);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }

  /**
   * Clear all application data from storage
   * Removes all habits, completions, and user profile
   */
  async clearData(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Private helper methods

  /**
   * Get default application data structure
   * Used when no stored data exists or data is corrupted
   */
  private getDefaultData(): StoredData {
    return {
      habits: this.getDefaultHabits(),
      userProfile: null,
      habitCompletions: this.getDefaultCompletions(),
      lastSync: new Date().toISOString(),
      version: this.DATA_VERSION
    };
  }

  /**
   * Generate diverse set of default habits for demonstration
   * Includes habits with various start/end dates, frequencies, and completion states
   */
  private getDefaultHabits(): Habit[] {
    const today = this.formatDate(new Date());
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Calculate date ranges for different habit scenarios
    const startOfCurrentMonth = this.formatDate(new Date(currentYear, currentMonth, 1));
    const endOfCurrentMonth = this.formatDate(new Date(currentYear, currentMonth + 1, 0));
    const startOfLastMonth = this.formatDate(new Date(currentYear, currentMonth - 1, 1));
    const startOfNextMonth = this.formatDate(new Date(currentYear, currentMonth + 1, 1));
    const endOfNextMonth = this.formatDate(new Date(currentYear, currentMonth + 2, 0));

    return [
      // Habits starting and ending in current month
      {
        id: "1",
        name: "Morning Meditation",
        description: "10 minutes of mindful breathing to start the day",
        category: "Mindfulness",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
        color: "#8B5CF6",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: startOfCurrentMonth,
        endDate: endOfCurrentMonth,
        priorityLevel: "High",
        reminderTime: "06:00",
        completed: false,
        streak: 5,
        current: 5,
      },
      {
        id: "2",
        name: "Read for 30 minutes",
        description: "Read books that inspire growth and learning",
        category: "Learning",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
        color: "#F59E0B",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: startOfCurrentMonth,
        endDate: endOfCurrentMonth,
        priorityLevel: "Medium",
        reminderTime: "20:00",
        completed: true,
        streak: 12,
        current: 12,
      },

      // Ongoing habits started last month
      {
        id: "3",
        name: "Exercise Routine",
        description: "Daily workout to stay fit and healthy",
        category: "Health",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
        color: "#EF4444",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: startOfLastMonth,
        priorityLevel: "High",
        reminderTime: "07:00",
        completed: true,
        streak: 45,
        current: 45,
      },
      {
        id: "4",
        name: "Drink 8 glasses of water",
        description: "Stay hydrated throughout the day",
        category: "Health",
        color: "#3B82F6",
        frequencyType: "Daily",
        targetCount: 8,
        startDate: startOfLastMonth,
        priorityLevel: "Medium",
        completed: false,
        streak: 38,
        current: 6,
      },

      // Future habits starting next month
      {
        id: "5",
        name: "Learn Spanish",
        description: "Practice Spanish for 15 minutes daily",
        category: "Learning",
        image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop",
        color: "#10B981",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: startOfNextMonth,
        endDate: endOfNextMonth,
        priorityLevel: "Medium",
        reminderTime: "19:00",
        completed: false,
        streak: 0,
        current: 0,
      },

      // Ongoing habits without end date
      {
        id: "6",
        name: "Gratitude Journal",
        description: "Write down 3 things I'm grateful for",
        category: "Mindfulness",
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop",
        color: "#EC4899",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: startOfLastMonth,
        priorityLevel: "Low",
        reminderTime: "21:00",
        completed: true,
        streak: 60,
        current: 60,
      },

      // Weekly habits
      {
        id: "7",
        name: "Weekly Planning",
        description: "Plan the upcoming week every Sunday",
        category: "Productivity",
        color: "#8B5CF6",
        frequencyType: "Weekly",
        targetCount: 1,
        startDate: startOfCurrentMonth,
        priorityLevel: "High",
        reminderTime: "09:00",
        completed: true,
        streak: 4,
        current: 4,
      },

      // Monthly habits
      {
        id: "8",
        name: "Budget Review",
        description: "Review and plan monthly budget",
        category: "Finance",
        color: "#F59E0B",
        frequencyType: "Monthly",
        targetCount: 1,
        startDate: startOfCurrentMonth,
        priorityLevel: "Medium",
        completed: false,
        streak: 2,
        current: 0,
      },

      // Partially completed habits
      {
        id: "9",
        name: "Yoga Practice",
        description: "30 minutes of yoga for flexibility",
        category: "Health",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
        color: "#10B981",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: startOfCurrentMonth,
        priorityLevel: "Medium",
        reminderTime: "08:00",
        completed: false,
        streak: 8,
        current: 8,
      },

      // New habits starting today
      {
        id: "10",
        name: "Digital Detox",
        description: "No screens 1 hour before bed",
        category: "Wellness",
        color: "#3B82F6",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: today,
        priorityLevel: "Low",
        reminderTime: "22:00",
        completed: false,
        streak: 0,
        current: 0,
      }
    ];
  }

  /**
   * Generate realistic completion data for default habits
   * Creates completion records that reflect different habit completion patterns
   */
  private getDefaultCompletions(): HabitCompletion[] {
    const completions: HabitCompletion[] = [];
    const today = new Date();
    
    // Generate completion data for the past 60 days
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      
      // Habit 1: Meditation - consistently completed for current month
      if (i < 5 && this.isDateInCurrentMonth(date)) {
        completions.push({
          habitId: "1",
          date: dateStr,
          completed: true,
          completedAt: date.toISOString()
        });
      }
      
      // Habit 2: Reading - consistently completed for current month
      if (i < 12 && this.isDateInCurrentMonth(date)) {
        completions.push({
          habitId: "2",
          date: dateStr,
          completed: true,
          completedAt: date.toISOString()
        });
      }
      
      // Habit 3: Exercise - consistently completed for long period
      if (i < 45) {
        completions.push({
          habitId: "3",
          date: dateStr,
          completed: true,
          completedAt: date.toISOString()
        });
      }
      
      // Habit 4: Water - partially completed (6 out of last 8 days)
      if (i < 6) {
        completions.push({
          habitId: "4",
          date: dateStr,
          completed: true,
          completedAt: date.toISOString()
        });
      }
      
      // Habit 6: Gratitude - consistently completed for long period
      if (i < 60) {
        completions.push({
          habitId: "6",
          date: dateStr,
          completed: true,
          completedAt: date.toISOString()
        });
      }
      
      // Habit 7: Weekly Planning - completed weekly on Sundays
      if (i % 7 === 0 && i < 28) {
        completions.push({
          habitId: "7",
          date: dateStr,
          completed: true,
          completedAt: date.toISOString()
        });
      }
      
      // Habit 8: Budget Review - completed monthly
      if (this.isFirstDayOfMonth(date) && i < 60) {
        completions.push({
          habitId: "8",
          date: dateStr,
          completed: true,
          completedAt: date.toISOString()
        });
      }
      
      // Habit 9: Yoga - partially completed (8 out of 30 days)
      if (i < 8 && this.isDateInCurrentMonth(date)) {
        completions.push({
          habitId: "9",
          date: dateStr,
          completed: true,
          completedAt: date.toISOString()
        });
      }
    }
    
    return completions;
  }

  /**
   * Format date as YYYY-MM-DD string
   * Utility function for consistent date formatting
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Check if date is in current month
   * Helper for generating realistic completion data
   */
  private isDateInCurrentMonth(date: Date): boolean {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  /**
   * Check if date is first day of month
   * Helper for monthly habit completion generation
   */
  private isFirstDayOfMonth(date: Date): boolean {
    return date.getDate() === 1;
  }

  /**
   * Validate data structure meets application requirements
   * Ensures data integrity and compatibility
   */
  private validateData(data: unknown): data is StoredData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'habits' in data &&
      'userProfile' in data &&
      'lastSync' in data &&
      'version' in data &&
      Array.isArray((data as StoredData).habits) &&
      ((data as StoredData).userProfile === null || typeof (data as StoredData).userProfile === 'object')
    );
  }

  /**
   * Public method to format dates consistently across the application
   * This ensures all dates are stored and compared in the same format
   */
  public formatDateForApp(date: Date): string {
    return this.formatDate(date);
  }
}

export const dataService = new DataService();