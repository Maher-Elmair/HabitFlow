import { useEffect, useState } from "react";
import { onAuthChanged } from "@/lib/auth";

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChanged((user) => {
      setIsAuthenticated(!!user); // true when a user is signed in, false otherwise
    });

    return () => unsubscribe();
  }, []);

  return { isAuthenticated };
};
