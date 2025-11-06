import { BarChart3, HistoryIcon, LayoutDashboard, User } from "lucide-react";
import { NavLink } from "react-router";

const NavigationLinks = () => {
  const navItems = [
    { to: "/", end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/history", icon: HistoryIcon, label: "History" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="inline-flex h-9.5 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground">
      {navItems.map(({ to, end, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `navigation-link inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
            }`
          }
        >
          <Icon className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">{label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default NavigationLinks;