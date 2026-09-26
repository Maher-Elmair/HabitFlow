import { BarChart3, HistoryIcon, LayoutDashboard, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

const baseClass =
  "navigation-link inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-medium transition-colors";

const NavigationLinks = () => {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/history", icon: HistoryIcon, label: "History" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/profile", icon: User, label: "Profile" },
  ] as const;

  return (
    <div className="inline-flex h-9.5 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground">
      {navItems.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          className={baseClass}
          activeProps={{
            className: `${baseClass} bg-primary text-primary-foreground shadow-sm`,
          }}
          inactiveProps={{
            className: `${baseClass} text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground`,
          }}
        >
          <Icon className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </div>
  );
};

export default NavigationLinks;
