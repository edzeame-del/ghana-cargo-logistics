import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CleanupButton({ onCleanupComplete }: { onCleanupComplete?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tracking/cleanup", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Cleanup failed");
      }

      const result = await response.json();
      
      toast({
        title: "Cleanup Complete",
        description: `Removed ${result.deletedCount} records older than 90 days`,
      });

      if (onCleanupComplete) {
        onCleanupComplete();
      }
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "Unable to clean up old tracking data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Cleanup Old Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clean Up Old Tracking Data</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all tracking data older than 90 days from upload. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCleanup}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Cleaning..." : "Delete Old Data"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}