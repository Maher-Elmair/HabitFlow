import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import type { Habit } from "@/types";
import { dataService } from "@/services/dataService";
import NavigationLinks from "@/components/shared/NavigationLinks";

// Define the context type for better TypeScript support
export interface RootLayoutContext {
  habits: Habit[];
  setHabits: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  isLoading: boolean;
}

const ProtectedRootLayout = () => {
  const { isAuthenticated } = useAuthStatus();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Load habits from data service on component mount
  useEffect(() => {
    const loadHabits = async () => {
      try {
        setLoading(true);
        const savedHabits = await dataService.getHabits();
        setHabits(savedHabits);
      } catch (error) {
        console.error('Error loading habits:', error);
        // If there's an error, habits will remain as empty array
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadHabits();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Save habits whenever they change
  useEffect(() => {
    const saveHabits = async () => {
      if (habits.length > 0 && !loading) {
        try {
          await dataService.saveHabits(habits);
        } catch (error) {
          console.error('Error saving habits:', error);
        }
      }
    };

    saveHabits();
  }, [habits, loading]);

  // Update habit function that syncs with data service
  const updateHabits = async (newHabits: Habit[] | ((prev: Habit[]) => Habit[])) => {
    if (typeof newHabits === 'function') {
      setHabits(newHabits);
    } else {
      setHabits(newHabits);
    }
  };

  // Show loading state while checking authentication or loading data
  if (isAuthenticated === null || loading) {
    return <LoadingSpinner message="Loading your habits..." />;
  }

  // Redirect to sign-in if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Render protected layout for authenticated users
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Theme Toggle */}
      <Topbar />

      {/* Main Content */}
      <main className="pt-28">
        <div className="mx-auto text-center">
          {/* Navigation Links */}
          <NavigationLinks />

          {/* Page Content */}
          <div className="w-full sm:w-[90%] text-start p-6 m-auto">
            <Outlet context={{ habits, setHabits: updateHabits, isLoading: loading }} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Bottombar />
    </div>
  );
};

export default ProtectedRootLayout;