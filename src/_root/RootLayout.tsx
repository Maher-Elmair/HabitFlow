import { useState, useEffect } from "react";
import { Navigate, Outlet, NavLink } from "react-router";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { LayoutDashboard, User, BarChart3, HistoryIcon } from "lucide-react";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import type { Habit } from "@/types";
import { dataService } from "@/services/dataService";

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
    return (
      <div className="flex justify-center items-center min-h-screen text-muted-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          Loading your habits...
        </div>
      </div>
    );
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
          <div className="inline-flex h-9.5 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navigation-link inline-flex items-center ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted-foreground/20"
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `navigation-link inline-flex items-center ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted-foreground/20"
                }`
              }
            >
              <HistoryIcon className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">History</span>
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `navigation-link inline-flex items-center ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted-foreground/20"
                }`
              }
            >
              <BarChart3 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Analytics</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `navigation-link inline-flex items-center ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted-foreground/20"
                }`
              }
            >
              <User className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Profile</span>
            </NavLink>
          </div>

          {/* Page Content */}
          <div className="w-full sm:w-[90%] text-start p-6 m-auto">
            <Outlet context={{ habits, setHabits: updateHabits }} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Bottombar />
    </div>
  );
};

export default ProtectedRootLayout;