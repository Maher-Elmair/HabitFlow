import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Upload, Link, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner"; 
import type {
  AddEditHabitModalProps,
  Habit,
  FrequencyType,
  PriorityLevel,
} from "@/types";

const PRESET_COLORS: string[] = [
  "#0D9488",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#10B981",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
];

const CATEGORIES: string[] = [
  "Health",
  "Productivity",
  "Mindfulness",
  "Learning",
  "Fitness",
  "Creativity",
  "Social",
  "Finance",
  "Other",
];

const MAX_DESCRIPTION_LENGTH = 2200;

export function AddEditHabit({
  isOpen,
  onClose,
  onSave,
  habit,
}: AddEditHabitModalProps): React.JSX.Element {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [color, setColor] = useState<string>("#0D9488");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("Daily");
  const [targetCount, setTargetCount] = useState<string>("1");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>("Medium");
  const [reminderTime, setReminderTime] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  // React Dropzone for handling image uploads
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const imageUrl = URL.createObjectURL(file);
        setImagePreview(imageUrl);
        setImageUrl(imageUrl);
      }
    },
  });

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || "");
      setCategory(habit.category || "");
      setImageUrl(habit.image || "");
      setImagePreview(habit.image || null);
      setColor(habit.color || "#0D9488");
      setFrequencyType(habit.frequencyType || "Daily");
      setTargetCount(habit.targetCount?.toString() || "1");
      setStartDate(habit.startDate ? new Date(habit.startDate) : new Date());
      setEndDate(habit.endDate ? new Date(habit.endDate) : undefined);
      setPriorityLevel(habit.priorityLevel || "Medium");
      setReminderTime(habit.reminderTime || "");
    } else {
      resetForm();
    }
  }, [habit, isOpen]);

  const resetForm = (): void => {
    setName("");
    setDescription("");
    setCategory("");
    setImageUrl("");
    setImagePreview(null);
    setColor("#0D9488");
    setFrequencyType("Daily");
    setTargetCount("1");
    setStartDate(new Date());
    setEndDate(undefined);
    setPriorityLevel("Medium");
    setReminderTime("");
  };

  const handleImageUrlChange = (url: string): void => {
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
    }
  };

  const handleRemoveImage = (): void => {
    setImageUrl("");
    setImagePreview(null);
  };

  const handleSave = (): void => {
    if (!name.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    const habitData: Partial<Habit> = {
      name: name.trim(),
      description: description.trim() || undefined,
      category: category || undefined,
      image: imageUrl.trim() || undefined,
      color: color,
      frequencyType: frequencyType,
      targetCount: parseInt(targetCount) || 1,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      priorityLevel: priorityLevel,
      reminderTime: reminderTime || undefined,
    };

    if (habit) {
      habitData.id = habit.id;
    }

    onSave(habitData);
    resetForm();
    
    // save successful message 
    if (habit) {
      toast.success("Habit updated successfully!", {
        description: `"${name.trim()}" has been updated.`,
        duration: 3000,
      });
    } else {
      toast.success("Habit created successfully!", {
        description: `"${name.trim()}" has been added to your habits.`,
        duration: 3000,
      });
    }
    
    onClose();
  };

  // Function to format time
  const formatTime = (timeString: string): string => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  // Function to handle date selection
  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      setIsCalendarOpen(false);
    } else {
      setEndDate(date);
      setIsEndCalendarOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-[90vw] bg-card border-border rounded-lg max-h-[90vh] p-0">
        <DialogHeader className="sm:px-6 px-4 pt-6 pb-4">
          <DialogTitle>{habit ? "Edit Habit" : "Create New Habit"}</DialogTitle>
          <DialogDescription className="pt-4">
            {habit
              ? "Update your habit details below."
              : "Fill in the details to create a new habit and start tracking your progress."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="sm:max-h-[calc(88vh-200px)] max-h-[calc(90vh-260px)] sm:px-6 px-4 ">
          <div className="space-y-4 px-1">
            {/* Habit Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Habit Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="e.g., Morning meditation"
                className="bg-background border-border rounded-lg"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description" className="text-sm">
                  Description{" "}
                  <span className="text-muted-foreground text-xs">
                    (Optional)
                  </span>
                </Label>
                <span className={`text-xs ${description.length > MAX_DESCRIPTION_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
                placeholder="Add a short description or motivation..."
                className="bg-background border-border rounded-lg resize-none min-h-[100px]"
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
              {description.length > MAX_DESCRIPTION_LENGTH - 100 && (
                <p className="text-xs text-muted-foreground">
                  {MAX_DESCRIPTION_LENGTH - description.length} characters remaining
                </p>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background border-border rounded-lg">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="rounded-md">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Habit Color Picker */}
            <div className="space-y-2">
              <Label className="text-sm">Habit Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      color === presetColor
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: presetColor }}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setColor(e.target.value)
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border border-border"
                    aria-label="Custom color picker"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Selected:{" "}
                <span className="font-medium" style={{ color }}>
                  {color}
                </span>
              </p>
            </div>

            {/* Unified Image Section */}
            <div className="space-y-2">
              <Label className="text-sm">
                Habit Image{" "}
                <span className="text-muted-foreground text-xs">
                  (Optional)
                </span>
              </Label>
              
              <div className="space-y-4">
                {/* Image URL Input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="imageUrl" className="text-sm">
                      Image URL
                    </Label>
                  </div>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleImageUrlChange(e.target.value)
                    }
                    placeholder="Enter image URL"
                    className="bg-background border-border rounded-lg"
                  />
                </div>

                {/* Divider with "OR" text */}
                <div className="relative flex items-center">
                  <div className="grow border-t border-border"></div>
                  <span className="mx-4 text-xs text-muted-foreground">OR</span>
                  <div className="grow border-t border-border"></div>
                </div>

                {/* Upload Area */}
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-linear-to-br from-primary/10 to-primary/5 border border-border">
                      <img
                        src={imagePreview}
                        alt="Habit preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview(null)}
                      />
                      <div
                        {...getRootProps()}
                        className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-6 w-6 text-white mb-2" />
                        <p className="text-white text-sm text-center">
                          Click or drag to replace image
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="text-xs text-muted-foreground hover:text-foreground rounded-md flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete Image
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive
                        ? "Drop the image here..."
                        : "Drag & drop an image here, or click to select"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Frequency Type */}
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-sm">
                Frequency Type
              </Label>
              <Select
                value={frequencyType}
                onValueChange={(value) =>
                  setFrequencyType(value as FrequencyType)
                }
              >
                <SelectTrigger className="bg-background border-border rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="Daily" className="rounded-md">
                    Daily
                  </SelectItem>
                  <SelectItem value="Weekly" className="rounded-md">
                    Weekly
                  </SelectItem>
                  <SelectItem value="Monthly" className="rounded-md">
                    Monthly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Count */}
            <div className="space-y-2">
              <Label htmlFor="targetCount" className="text-sm">
                Target Count
              </Label>
              <Input
                id="targetCount"
                type="number"
                min="1"
                value={targetCount}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTargetCount(e.target.value)
                }
                placeholder="1"
                className="bg-background border-border rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                How many times per {frequencyType.toLowerCase()} period
              </p>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm">Start Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-background border-border rounded-lg"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      dayjs(startDate).format("MMMM D, YYYY")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 rounded-lg" 
                  align="start"
                  ref={calendarRef}
                  style={{ maxWidth: 'calc(100vw - 2rem)' }}
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => handleDateSelect(date, 'start')}
                    initialFocus
                    className="w-[280px] max-w-full"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-sm">
                End Date{" "}
                <span className="text-muted-foreground text-xs">
                  (Optional)
                </span>
              </Label>
              <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-background border-border rounded-lg"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      dayjs(endDate).format("MMMM D, YYYY")
                    ) : (
                      <span>Pick a date (optional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 rounded-lg" 
                  align="start"
                  style={{ maxWidth: 'calc(100vw - 2rem)' }}
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => handleDateSelect(date, 'end')}
                    disabled={(date) => (startDate ? date < startDate : false)}
                    initialFocus
                    className="w-[280px] max-w-full"
                  />
                </PopoverContent>
              </Popover>
              {endDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEndDate(undefined)}
                  className="text-xs text-muted-foreground hover:text-foreground rounded-md"
                >
                  Clear end date
                </Button>
              )}
            </div>

            {/* Priority Level */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm">
                Priority Level
              </Label>
              <Select
                value={priorityLevel}
                onValueChange={(value) =>
                  setPriorityLevel(value as PriorityLevel)
                }
              >
                <SelectTrigger className="bg-background border-border rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="High" className="rounded-md">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      High Priority
                    </span>
                  </SelectItem>
                  <SelectItem value="Medium" className="rounded-md">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      Medium Priority
                    </span>
                  </SelectItem>
                  <SelectItem value="Low" className="rounded-md">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Low Priority
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reminder Time */}
            <div className="space-y-2">
              <Label htmlFor="reminderTime" className="text-sm">
                Reminder Time{" "}
                <span className="text-muted-foreground text-xs">
                  (Optional)
                </span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reminderTime"
                  type="time"
                  value={reminderTime}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setReminderTime(e.target.value)
                  }
                  className="bg-background border-border rounded-lg pl-10"
                />
              </div>
              {reminderTime && (
                <p className="text-xs text-muted-foreground">
                  Daily reminder at {formatTime(reminderTime)}
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 px-6 py-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {habit ? "Save Changes" : "Create Habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}