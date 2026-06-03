"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, isAdmin as checkAdmin } from "@/config/supabase";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  mobile_number: string;
  date_of_birth: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (
    fullName: string,
    email: string,
    password: string,
    mobileNumber: string,
    dateOfBirth: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to load profile details
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Monitor Auth Changes
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setIsAdmin(checkAdmin(session.user.email));
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Failed to initialize session:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(checkAdmin(session.user.email));
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // SignUp with 5 Parameters
  const signUp = async (
    fullName: string,
    email: string,
    password: string,
    mobileNumber: string,
    dateOfBirth: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            mobile_number: mobileNumber,
            date_of_birth: dateOfBirth,
          },
        },
      });

      if (error) return { error };

      // If user profile is not immediately loaded via trigger sync on local state
      if (data?.user) {
        setUser(data.user);
        setIsAdmin(checkAdmin(data.user.email));
        // We will fetch profile after a small delay to let the trigger run
        setTimeout(() => fetchProfile(data.user!.id), 1000);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Standard Login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data?.user) {
        setUser(data.user);
        setIsAdmin(checkAdmin(data.user.email));
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Standard Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
