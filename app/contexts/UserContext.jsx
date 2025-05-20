"use client";
import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // New: global toast toggle

  // Load user and notification preference from localStorage on first load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Restore user from storage
    }

    const storedNotify = localStorage.getItem("notificationsEnabled");
    if (storedNotify !== null) {
      setNotificationsEnabled(storedNotify === "true"); // Restore notification setting
    }
  }, []);

  // Save notification preference whenever it changes
  useEffect(() => {
    localStorage.setItem("notificationsEnabled", notificationsEnabled);
  }, [notificationsEnabled]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Save user
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Remove user
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        notificationsEnabled,       // expose to context
        setNotificationsEnabled,    // expose setter
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for easy access
export function useUser() {
  return useContext(UserContext);
}