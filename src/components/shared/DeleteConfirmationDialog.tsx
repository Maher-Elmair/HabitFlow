import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitName?: string;
  isLoading?: boolean;
  title?: string;
  description?: string | React.ReactNode; // Allow both string and JSX
  confirmButtonText?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  habitName,
  isLoading = false,
  title,
  description,
  confirmButtonText,
}: DeleteConfirmationDialogProps): React.JSX.Element {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Default values for single habit deletion
  const dialogTitle = title || "Delete Habit";
  
  // For single habit deletion, show habit name prominently
  // For bulk deletion, use the provided description
  const dialogDescription = description || (
    <>
      Are you sure you want to delete{" "}
      <span className="font-medium text-foreground bg-muted/50 px-2 py-1 rounded-md  ">
        {habitName || "this habit"}
      </span>
      ? This will permanently remove the habit and all its tracking data. This action cannot be undone.
    </>
  );

  const buttonText = confirmButtonText || (isLoading ? "Deleting..." : "Delete");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[85vw] bg-card border-border rounded-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}