import type { Habit, UserProfile, StoredData, HabitCompletion } from '@/types';

class DataService {
  private readonly STORAGE_KEY = 'habitflow_data';
  private readonly DATA_VERSION = '1.0.0';

  // Get all data from storage
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

  // Save all data to storage
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

  // 🔹 Get user profile
  async getUserProfile(): Promise<UserProfile | null> {
    const data = await this.getData();
    return data.userProfile;
  }

  // 🔹 Save user profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const data = await this.getData();
    data.userProfile = profile;
    await this.saveData(data);
  }

  // 🔹 Update user profile
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

  // 🔹 Create user profile from Firebase auth
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

  // 🔹 Clear user profile (on logout)
  async clearUserProfile(): Promise<void> {
    const data = await this.getData();
    data.userProfile = null;
    await this.saveData(data);
  }

  // Habit methods
  async getHabits(): Promise<Habit[]> {
    const data = await this.getData();
    return data.habits;
  }

  async saveHabits(habits: Habit[]): Promise<void> {
    const data = await this.getData();
    data.habits = habits;
    await this.saveData(data);
  }

  async addHabit(habit: Habit): Promise<void> {
    const data = await this.getData();
    data.habits.push(habit);
    await this.saveData(data);
  }

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

  async deleteHabit(habitId: string): Promise<void> {
    const data = await this.getData();
    data.habits = data.habits.filter(h => h.id !== habitId);
    await this.saveData(data);
  }

  async toggleHabitCompletion(habitId: string): Promise<Habit> {
    const data = await this.getData();
    const habitIndex = data.habits.findIndex(h => h.id === habitId);
    
    if (habitIndex !== -1) {
      const habit = data.habits[habitIndex];
      const completed = !habit.completed;
      
      let newStreak = habit.streak || 0;
      if (completed) {
        newStreak += 1;
      } else {
        newStreak = Math.max(0, newStreak - 1);
      }
      
      const updatedHabit = {
        ...habit,
        completed,
        streak: newStreak,
        current: completed ? (habit.current || 0) + 1 : Math.max(0, (habit.current || 0) - 1)
      };
      
      data.habits[habitIndex] = updatedHabit;
      await this.saveData(data);
      return updatedHabit;
    } else {
      throw new Error(`Habit with ID ${habitId} not found`);
    }
  }

  // 🔹 NEW: Get habit completions
  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    const data = await this.getData();
    return data.habitCompletions?.filter(c => c.habitId === habitId) || [];
  }

  // 🔹 NEW: Get all completions
  async getAllCompletions(): Promise<HabitCompletion[]> {
    const data = await this.getData();
    return data.habitCompletions || [];
  }

  // 🔹 NEW: Add habit completion
  async addHabitCompletion(completion: HabitCompletion): Promise<void> {
    const data = await this.getData();
    if (!data.habitCompletions) {
      data.habitCompletions = [];
    }
    
    // Remove existing completion for the same habit and date
    data.habitCompletions = data.habitCompletions.filter(
      c => !(c.habitId === completion.habitId && c.date === completion.date)
    );
    
    data.habitCompletions.push(completion);
    await this.saveData(data);
  }

  // 🔹 NEW: Update habit completion
  async updateHabitCompletion(habitId: string, date: string, completed: boolean): Promise<void> {
    const data = await this.getData();
    if (!data.habitCompletions) {
      data.habitCompletions = [];
    }
    
    const completionIndex = data.habitCompletions.findIndex(
      c => c.habitId === habitId && c.date === date
    );
    
    if (completionIndex !== -1) {
      data.habitCompletions[completionIndex].completed = completed;
      await this.saveData(data);
    } else {
      await this.addHabitCompletion({ habitId, date, completed });
    }
  }

  // 🔹 NEW: Delete habit completion
  async deleteHabitCompletion(habitId: string, date: string): Promise<void> {
    const data = await this.getData();
    if (!data.habitCompletions) {
      return;
    }
    
    data.habitCompletions = data.habitCompletions.filter(
      c => !(c.habitId === habitId && c.date === date)
    );
    
    await this.saveData(data);
  }

  // 🔹 NEW: Get completions for a specific date
  async getCompletionsForDate(date: string): Promise<HabitCompletion[]> {
    const data = await this.getData();
    return data.habitCompletions?.filter(c => c.date === date) || [];
  }

  // Export/Import methods
  async exportData(): Promise<string> {
    const data = await this.getData();
    return JSON.stringify(data, null, 2);
  }

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

  async clearData(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Private methods
  private getDefaultData(): StoredData {
    return {
      habits: this.getDefaultHabits(),
      userProfile: null,
      habitCompletions: this.getDefaultCompletions(),
      lastSync: new Date().toISOString(),
      version: this.DATA_VERSION
    };
  }

  private getDefaultHabits(): Habit[] {
    return [
      {
        id: "1",
        name: "Morning Meditation",
        description: "10 minutes of mindful breathing to start the day",
        category: "Mindfulness",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
        color: "#8B5CF6",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: new Date("2025-01-01").toISOString(),
        priorityLevel: "High",
        reminderTime: "06:00",
        completed: false,
        streak: 5,
        current: 0,
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
        startDate: new Date("2025-01-01").toISOString(),
        priorityLevel: "Medium",
        reminderTime: "20:00",
        completed: true,
        streak: 12,
        current: 1,
      },
      {
        id: "3",
        name: "Exercise",
        description: "Get moving with a workout or walk",
        category: "Health",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
        color: "#EF4444",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: new Date("2025-01-10").toISOString(),
        priorityLevel: "Low",
        reminderTime: "07:00",
        completed: false,
        streak: 3,
        current: 0,
      },
      {
        id: "4",
        name: "Drink 8 glasses of water",
        description: "Stay hydrated throughout the day",
        category: "Health",
        color: "#3B82F6",
        frequencyType: "Daily",
        targetCount: 8,
        startDate: new Date("2025-01-15").toISOString(),
        priorityLevel: "Medium",
        completed: true,
        streak: 8,
        current: 8,
      },
      {
        id: "5",
        name: "Gratitude Journal",
        description: "Write down 3 things I'm grateful for",
        category: "Mindfulness",
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop",
        color: "#10B981",
        frequencyType: "Daily",
        targetCount: 1,
        startDate: new Date("2024-12-25").toISOString(),
        priorityLevel: "Medium",
        reminderTime: "21:00",
        completed: false,
        streak: 15,
        current: 0,
      },
    ];
  }

  private getDefaultCompletions(): HabitCompletion[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    return [
      // Today's completions
      {
        habitId: "2",
        date: this.formatDateForCompletion(today),
        completed: true
      },
      {
        habitId: "4",
        date: this.formatDateForCompletion(today),
        completed: true
      },
      // Yesterday's completions
      {
        habitId: "2",
        date: this.formatDateForCompletion(yesterday),
        completed: true
      },
      {
        habitId: "4",
        date: this.formatDateForCompletion(yesterday),
        completed: true
      },
      {
        habitId: "5",
        date: this.formatDateForCompletion(yesterday),
        completed: true
      },
      // Two days ago completions
      {
        habitId: "2",
        date: this.formatDateForCompletion(twoDaysAgo),
        completed: true
      },
      {
        habitId: "4",
        date: this.formatDateForCompletion(twoDaysAgo),
        completed: true
      }
    ];
  }

  private formatDateForCompletion(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private validateData(data: unknown): data is StoredData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'habits' in data &&
      'userProfile' in data &&
      'lastSync' in data &&
      'version' in data &&
      Array.isArray((data as StoredData).habits) &&
      ((data as StoredData).userProfile === null || typeof (data as StoredData).userProfile === 'object') &&
      // Add validation for habitCompletions (optional field)
      (!('habitCompletions' in data) || Array.isArray((data as StoredData).habitCompletions))
    );
  }
}

export const dataService = new DataService();