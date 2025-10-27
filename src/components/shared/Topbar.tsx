import { ThemeToggle } from "@/theme/theme-provider";
import { Sparkles } from "lucide-react";

const Topbar = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Header with Theme Toggle*/}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col items-start ">
              <h1 className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent text-xl rtl">
                HabitFlow
              </h1>
              <p className="text-xs text-muted-foreground">
                Build better habits
              </p>
            </div>
          </div>
          <ThemeToggle showLabel={true} />
        </div>
      </header>
    </div>
  );
};

export default Topbar;
