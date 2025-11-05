import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Flame,
  Calendar,
  Target,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HabitCardProps } from "@/types";

export function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
}: HabitCardProps): React.JSX.Element {

  const [isCompleted, setIsCompleted] = useState<boolean>(
    habit.completed,
  );

  // Sync with habit.completed when it changes
  useEffect(() => {
    setIsCompleted(habit.completed);
  }, [habit.completed]);

  const handleToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    onToggle(habit.id);
  };

  // Get priority color
  const getPriorityColor = (): string => {
    switch (habit.priorityLevel) {
      case "High":
        return "#EF4444";
      case "Medium":
        return "#F59E0B";
      case "Low":
        return "#10B981";
      default:
        return habit.color || "#0D9488";
    }
  };

  const priorityColor = getPriorityColor();

  return (
    <Card
      className={`relative overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 rounded-xl ${
        isCompleted ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="p-3 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Image or Icon with Color Dot */}
          <div className="relative shrink-0">
            {habit.image ? (
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2"
                style={{
                  borderColor: habit.color || "#0D9488",
                }}
              >
                <img
                  src={habit.image}
                  alt={habit.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${habit.color || "#0D9488"}15`,
                  borderColor: habit.color || "#0D9488",
                  borderWidth: "2px",
                }}
              >
                <ImageIcon
                  className="w-5 h-5 sm:w-7 sm:h-7"
                  style={{ color: habit.color || "#0D9488" }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={`text-card-foreground font-medium text-sm sm:text-base truncate ${
                  isCompleted ? "line-through" : ""
                }`}
              >
                {habit.name}
              </h3>
            </div>

            {/* Description */}
            {habit.description && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-1 sm:line-clamp-2">
                {habit.description}
              </p>
            )}

            {/* Category and Priority Level */}
            {(habit.category || habit.priorityLevel) && (
              <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                {habit.category && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-full text-xs px-2 py-0.5"
                    style={{
                      backgroundColor: `${habit.color || "#0D9488"}15`,
                      color: habit.color || "#0D9488",
                    }}
                  >
                    {habit.category}
                  </Badge>
                )}

                {habit.priorityLevel && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-full text-xs px-2 py-0.5"
                    style={{
                      backgroundColor: `${priorityColor}15`,
                      color: priorityColor,
                    }}
                  >
                    {habit.priorityLevel}
                  </Badge>
                )}
              </div>
            )}

            {/* Frequency and Target Info */}
            <div className="flex items-center sm:justify-between justify-end gap-1 sm:gap-3  sm:flex-row flex-row-reverse mt-2 sm:mt-3 text-xs text-muted-foreground">
              {habit.frequencyType && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="inline">{habit.frequencyType}</span>
                </div>
              )}

              {habit.targetCount && habit.targetCount > 1 && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">{habit.targetCount}x target</span>
                  <span className="sm:hidden text-xs">{habit.targetCount}x</span>
                </div>
              )}

              {habit.streak > 0 && (
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full sm:ml-auto"
                  style={{
                    backgroundColor: `${habit.color || "#0D9488"}15`,
                    color: habit.color || "#0D9488",
                  }}
                >
                  <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="font-medium text-xs">
                    {habit.streak}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg"
                >
                  <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl"
              >
                <DropdownMenuItem
                  onClick={() => onEdit(habit)}
                  className="rounded-lg"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(habit.id)}
                  className="text-destructive rounded-lg"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* FIX: Wrap Switch in a div with event handlers */}
            <div 
              onClick={handleToggle}
              className="cursor-pointer"
            >
              <Switch
                checked={isCompleted}
                onCheckedChange={() => {}} // Empty function since we handle click manually
                className="data-[state=checked]:bg-primary scale-90 sm:scale-100"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}