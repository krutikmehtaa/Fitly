import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        
        // Check if user has already registered family members
        try {
          const response = await axios.get(
            `http://localhost:5000/api/family/family?userId=${user.uid}`
          );
          const family = response.data.family || [];
          // If family exists and has members, mark as registered
          setIsRegistered(family.length > 0);
        } catch (err) {
          // 404 means no family found, which is fine
          if (err.response?.status !== 404) {
            console.error("Error checking family:", err);
          }
          setIsRegistered(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsRegistered(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, isRegistered, setIsRegistered, currentUser, loading }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-surface-950">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center animate-pulse">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <p className="text-white/50 text-sm">Loading...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
