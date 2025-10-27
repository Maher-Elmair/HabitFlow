import { CheckCircle2, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

export function HabitVisualization() {
  const habitData = [
    { day: "Mon", completed: true },
    { day: "Tue", completed: true },
    { day: "Wed", completed: true },
    { day: "Thu", completed: true },
    { day: "Fri", completed: true },
    { day: "Sat", completed: false },
    { day: "Sun", completed: false },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-12 space-y-12">
      {/* Brand Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <h1 className="text-6xl tracking-tight text-primary-foreground">
          HabitFlow
        </h1>
        <p className="text-xl text-primary-foreground/80">
          Build better habits, one day at a time
        </p>
      </motion.div>

      {/* Visual Elements */}
      <div className="w-full max-w-md space-y-8">
        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-primary-foreground/90">Weekly Streak</h3>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-foreground" />
              <span className="text-2xl text-primary-foreground">5</span>
            </div>
          </div>
          
          <div className="flex justify-between gap-2">
            {habitData.map((item, index) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    item.completed
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary-foreground/20 text-primary-foreground/40"
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-5 h-5" />}
                </div>
                <span className="text-xs text-primary-foreground/70">
                  {item.day}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <Target className="w-4 h-4" />
              <span className="text-sm">Goals</span>
            </div>
            <p className="text-3xl text-primary-foreground">12</p>
          </div>
          
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Progress</span>
            </div>
            <p className="text-3xl text-primary-foreground">87%</p>
          </div>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center space-y-2"
        >
          <p className="text-lg italic text-primary-foreground/80">
            "Success is the sum of small efforts repeated day in and day out."
          </p>
          <p className="text-sm text-primary-foreground/60">- Robert Collier</p>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <svg
          className="absolute -top-20 -right-20 w-96 h-96"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            className="text-primary-foreground"
            d="M47.1,-57.8C59.9,-45.6,68.5,-29.2,71.4,-11.8C74.3,5.6,71.5,24,63.1,39.9C54.7,55.8,40.7,69.2,24.3,74.4C7.9,79.6,-10.9,76.6,-27.5,69.3C-44.1,62,-58.5,50.4,-66.3,35.3C-74.1,20.2,-75.3,1.6,-71.8,-15.5C-68.3,-32.6,-60.1,-48.2,-47.5,-60.5C-34.9,-72.8,-17.4,-81.8,0.3,-82.2C18,-82.6,36,-74.4,47.1,-57.8Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute -bottom-20 -left-20 w-96 h-96"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            className="text-primary-foreground"
            d="M41.3,-51.5C53.4,-39.3,62.7,-25.9,65.3,-11.1C67.9,3.7,63.8,20,55.1,34.3C46.4,48.6,33.1,61,17.8,67C2.5,73,-14.8,72.6,-30.3,66.8C-45.8,61,-59.5,49.8,-66.9,35.2C-74.3,20.6,-75.4,2.6,-71.5,-13.9C-67.6,-30.4,-58.7,-45.4,-46.3,-57.5C-33.9,-69.6,-17,-78.8,-0.7,-77.9C15.6,-77,29.2,-63.7,41.3,-51.5Z"
            transform="translate(100 100)"
          />
        </svg>
      </motion.div>
    </div>
  );
}
