"use client";
import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedNotify = localStorage.getItem("notificationsEnabled");
    if (storedNotify !== null) {
      setNotificationsEnabled(storedNotify === "true");
    }

    setLoading(false); // ✅ Done loading from localStorage
  }, []);

  useEffect(() => {
    localStorage.setItem("notificationsEnabled", notificationsEnabled);
  }, [notificationsEnabled]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        notificationsEnabled,
        setNotificationsEnabled,
        loading, // ✅ Expose loading
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
