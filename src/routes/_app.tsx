import { useState, useEffect } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import NavigationLinks from "@/components/shared/NavigationLinks";
import { HabitsProvider } from "@/context/HabitsContext";
import type { Habit } from "@/types";
import { dataService } from "@/services/dataService";
import { getGuestId } from "@/lib/guestId";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// Offline-first layout: no auth gate. The app is fully usable without an
// account — habits are stored locally via dataService. Sign-in remains an
// optional extra (offered from the Profile page, not required to browse).
function AppLayout() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Load habits once. dataService is the single writer: every page calls
  // addHabit / updateHabit / deleteHabit directly, so there is no
  // "save the whole list again" effect here (it caused double writes).
  useEffect(() => {
    // Ensure this browser has a stable anonymous id (used later to link or
    // merge guest data when the user optionally signs in).
    getGuestId();

    const loadHabits = async () => {
      try {
        setLoading(true);
        setHabits(await dataService.getHabits());
      } catch (error) {
        console.error("Error loading habits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your habits..." />;
  }

  return (
    <HabitsProvider value={{ habits, setHabits, isLoading: loading }}>
      <div className="min-h-screen bg-background text-foreground">
        <Topbar />

        <main className="pt-28">
          <div className="mx-auto text-center">
            <NavigationLinks />

            <div className="w-full sm:w-[90%] text-start p-6 m-auto">
              <Outlet />
            </div>
          </div>
        </main>

        <Bottombar />
      </div>
    </HabitsProvider>
  );
}
