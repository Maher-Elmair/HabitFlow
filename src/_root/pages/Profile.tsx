import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOutIcon, Pencil } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const Profile = () => {
  // State to hold the authenticated user's data
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("You have been logged out successfully!");
      navigate("/sign-in"); // Redirect after logout
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to logout: " + error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <div className="text-center mt-10 text-muted-foreground">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  // Extract user information
  const displayName = user.displayName || "Anonymous User";
  const email = user.email || "No email provided";
  const photoURL =
    user.photoURL ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const bio = "Building consistent habits, one day at a time.";

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-2xl font-medium">My Profile</h2>
        <p className="text-md text-muted-foreground pt-2 pb-4">
          Manage your personal information and view your habits
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-card border-border rounded-2xl">
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={photoURL} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="mb-1">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            <p className="text-muted-foreground mb-3 mt-2">{bio}</p>
          </div>
        </div>
      </Card>

      {/* Account Actions Card */}
      <Card className="p-6 mt-6 bg-card border-border rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="mb-1">Account Actions</h4>
            <p className="text-sm text-muted-foreground">
              Manage your session and account settings
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="rounded-lg cursor-pointer"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
