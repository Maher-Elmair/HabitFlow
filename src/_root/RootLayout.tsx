// src/components/layout/ProtectedRootLayout.tsx
import { Navigate, Outlet, NavLink } from "react-router";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { LayoutDashboard, User, BarChart3, HistoryIcon } from "lucide-react";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";

const ProtectedRootLayout = () => {
  const { isAuthenticated } = useAuthStatus();

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen text-muted-foreground">
        Loading...
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
      <main className="py-8">
        <div className="mx-auto text-center">
          {/* Navigation Links */}
          <div className="inline-flex h-9.5 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground mb-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navigation-link ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted-foreground/20"
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `navigation-link ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted-foreground/20"
                }`
              }
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              History
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `navigation-link ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted-foreground/20"
                }`
              }
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `navigation-link ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-muted-foreground/20"
                }`
              }
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </NavLink>
          </div>

          {/* Page Content */}
          <div className="w-[90%] text-start p-6 m-auto">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Bottombar />
    </div>
  );
};

export default ProtectedRootLayout;