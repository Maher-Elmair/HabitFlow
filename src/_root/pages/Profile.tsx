import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { signOut, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOutIcon, Pencil, Calendar, Plus, MoreVertical, Edit, Trash2, Trash } from "lucide-react";

import EditProfileModal from "@/components/shared/EditProfile";
import { LogoutConfirmationDialog } from "@/components/shared/LogoutConfirmationDialog";
import { AddEditHabit } from "@/components/shared/addEditHabit";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserProfile, Habit } from "@/types";
import { dataService } from "@/services/dataService";

interface ProfileContext {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Habit management states
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Delete all habits states
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const navigate = useNavigate();
  const { habits, setHabits } = useOutletContext<ProfileContext>();

  // Listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Try to load profile from localStorage first
          let userProfile = await dataService.getUserProfile();
          
          // If no saved profile exists, create one from Firebase data
          if (!userProfile) {
            userProfile = await dataService.createUserProfileFromFirebase(currentUser);
          }
          
          setProfile(userProfile);
        } catch (error) {
          console.error('Error loading user profile:', error);
          // If loading fails, create a default profile
          const defaultProfile: UserProfile = {
            id: currentUser.uid,
            name: currentUser.displayName || "Anonymous User",
            email: currentUser.email || "No email provided",
            avatar: currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            bio: "Building consistent habits, one day at a time.",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          setProfile(defaultProfile);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("You have been logged out successfully!");
      navigate("/sign-in");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to logout: " + error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };

  // Handle opening logout confirmation dialog
  const handleOpenLogoutDialog = () => {
    setIsLogoutDialogOpen(true);
  };

  // Handle saving updated profile info
  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!profile) return;
    
    try {
      // Save changes to localStorage
      const savedProfile = await dataService.updateUserProfile(updatedProfile);
      
      // Update local state
      setProfile(savedProfile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error saving profile:', error);
      // If saving to service fails, save locally only
      setProfile((prev) => {
        if (!prev) return null;
        return { ...prev, ...updatedProfile };
      });
      toast.success("Profile updated (local only)!");
    }
  };

  // Handle habit edit
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
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
    setIsHabitModalOpen(true);
  };

  // Handle saving habit
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
          startDate: habitData.startDate || new Date().toISOString().split('T')[0],
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

  // Handle delete all habits confirmation
  const handleOpenDeleteAllDialog = () => {
    if (habits.length === 0) {
      toast.info("You don't have any habits to delete.");
      return;
    }
    setDeleteAllDialogOpen(true);
  };

  // Handle actual deletion of all habits
  const handleConfirmDeleteAll = async () => {
    setIsDeletingAll(true);
    
    try {
      // Delete all habits one by one
      for (const habit of habits) {
        await dataService.deleteHabit(habit.id);
      }
      
      // Clear the habits list
      setHabits([]);
      
      toast.success("All habits deleted successfully!", {
        description: `All ${habits.length} habits have been removed.`,
        duration: 4000,
      });
      
      setDeleteAllDialogOpen(false);
    } catch (error) {
      console.error("Error deleting all habits:", error);
      toast.error("Failed to delete all habits", {
        description: "There was an error deleting your habits. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="text-center mt-10 text-muted-foreground">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  const { name, email, avatar, bio } = profile;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center pt-6">
        <h2 className="text-2xl font-medium">My Profile</h2>
        <p className="text-md text-muted-foreground pt-2 pb-4">
          Manage your personal information and view your habits
        </p>
      </div>

      {/* Profile Information Card */}
      <Card className="p-4 sm:p-6 mt-4 bg-linear-to-br from-primary/10 via-card to-card border-border rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-primary/20 shrink-0">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-medium mb-1 break-word">
                  {name}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground break-word">
                  {email}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg cursor-pointer w-full sm:w-auto mt-2 sm:mt-0"
                onClick={() => setIsModalOpen(true)}
              >
                <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 sm:mt-0 break-word">
              {bio}
            </p>
          </div>
        </div>
      </Card>

      {/* Current Habits Section */}
      <Card className="p-6 mt-6 bg-card border-border rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3>My Habits</h3>
              <span className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-full font-medium">
                {habits.length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {habits.length === 0 
                ? "No habits yet. Start building your routine!" 
                : "All your active habits and their current status"
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAddHabit}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer rounded-xl shadow-sm w-full sm:w-auto flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
            <Button
              onClick={handleOpenDeleteAllDialog}
              variant="outline"
              className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:cursor-pointer rounded-xl w-full sm:w-auto flex items-center justify-center"
              disabled={habits.length === 0}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete All
            </Button>
          </div>
        </div>

        {!habits || habits.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-muted-foreground mb-4">
              No habits yet. Start tracking your first habit!
            </p>
            <Button
              onClick={handleAddHabit}
              className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Habit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit: Habit) => (
              <div
                key={habit.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {habit.image ? (
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 shrink-0"
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
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg sm:text-xl border-2 shrink-0"
                      style={{
                        backgroundColor: `${habit.color || "#0D9488"}20`,
                        borderColor: habit.color || "#0D9488",
                      }}
                    >
                      ✨
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {habit.name}
                    </h4>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {habit.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                  <div className="flex items-center gap-2">
                    {/* Only show streak if greater than 0 */}
                    {(habit.streak && habit.streak > 0) ? (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{
                          backgroundColor: `${habit.color || "#0D9488"}20`,
                          color: habit.color || "#0D9488",
                        }}
                      >
                        🔥 {habit.streak}d
                      </span>
                    ) : null}
                    {habit.category && (
                      <span className="text-xs px-2.5 py-1 bg-accent/50 text-accent-foreground rounded-full whitespace-nowrap">
                        {habit.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center sm:justify-between justify-end gap-2">
                    {habit.priorityLevel && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          habit.priorityLevel === "High"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : habit.priorityLevel === "Medium"
                            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            : "bg-green-500/10 text-green-600 border-green-500/20"
                        }`}
                      >
                        {habit.priorityLevel}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      {habit.frequencyType}
                    </span>
                  </div>

                  {/* Three dots menu for edit/delete actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        onClick={() => handleEditHabit(habit)}
                        className="rounded-lg cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteHabit(habit)}
                        className="text-destructive rounded-lg cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Account Actions Card */}
      <Card className="p-6 mt-6 bg-card border-border rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="mb-1">Account Actions</h4>
            <p className="text-sm text-muted-foreground">
              Manage your session and account settings
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleOpenLogoutDialog}
            className="rounded-lg cursor-pointer w-full sm:w-auto"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        profile={profile}
      />

      {/* Add/Edit Habit Modal */}
      <AddEditHabit
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        habit={editingHabit}
      />

      {/* Delete Single Habit Confirmation Dialog */}
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

      {/* Delete All Habits Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        onConfirm={handleConfirmDeleteAll}
        title="Delete All Habits"
        description={
          <>
            Are you sure you want to delete all{" "}
            <span className="font-medium text-foreground bg-muted/50 px-2 py-1 rounded-md">
              {habits.length} habits
            </span>
            ? This action will permanently remove all your habits and cannot be undone.
          </>
        }
        confirmButtonText={isDeletingAll ? "Deleting All..." : "Delete All"}
        isLoading={isDeletingAll}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Profile;