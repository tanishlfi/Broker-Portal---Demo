"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  email: string;
  brokerId: string;
  representativeId: string;
  name?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize user from localStorage or URL params
    const initializeUser = () => {
      try {
        // Check for user data in URL params (from Client Connect redirect)
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get("email");
        const brokerIdParam = params.get("brokerId");
        const representativeIdParam = params.get("representativeId");
        const nameParam = params.get("name");

        // Check localStorage for existing user data
        const storedEmail = localStorage.getItem("userEmail");
        const storedBrokerId = localStorage.getItem("bp_broker_id");
        const storedRepresentativeId = localStorage.getItem("bp_representative_id");
        const storedName = localStorage.getItem("userName");

        // Prioritize URL params, then localStorage
        const email = emailParam || storedEmail;
        const brokerId = brokerIdParam || storedBrokerId;
        const representativeId = representativeIdParam || storedRepresentativeId;
        const name = nameParam || storedName;

        if (email) {
          const userData: User = {
            email,
            brokerId: brokerId || "",
            representativeId: representativeId || "",
            name: name || undefined,
          };

          setUser(userData);

          // Store in localStorage for persistence
          localStorage.setItem("userEmail", email);
          if (brokerId) localStorage.setItem("bp_broker_id", brokerId);
          if (representativeId) localStorage.setItem("bp_representative_id", representativeId);
          if (name) localStorage.setItem("userName", name);

          // Clean up URL params after reading them
          if (emailParam || brokerIdParam || representativeIdParam || nameParam) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
