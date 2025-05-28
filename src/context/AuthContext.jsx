"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        console.log("Stored user data:", storedUser);

        if (storedUser) {
          // Parse stored user data
          const userData = JSON.parse(storedUser);
          console.log("Parsed user data:", userData);
          setUser(userData);

          // Try to verify the session is still valid
          try {
            const response = await authAPI.getUserProfile();
            console.log("Profile verification successful:", response);

            // Update user data with fresh data from server
            const freshUserData = response.data?.user || response.data;
            setUser(freshUserData);
            localStorage.setItem("user", JSON.stringify(freshUserData));
          } catch (error) {
            console.warn("Profile verification failed:", error);
            // Don't clear user data immediately - let them try to use the app
            // The authenticatedFetch will handle token refresh if needed
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        // Clear storage on any error
        localStorage.removeItem("user");
        setUser(null);
        console.error("Auth initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const userData = response.data?.user || response.data;

      console.log("Setting user after login:", userData);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const newUser = response.data?.user || response.data;

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      return response;
    } catch (error) {
      // If it's an authentication error, logout the user
      if (
        error.message.includes("Authentication required") ||
        error.message.includes("Session expired")
      ) {
        logout();
      }
      throw new Error(error.message || "Failed to update password");
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data?.user || response.data;

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      // If it's an authentication error, logout the user
      if (
        error.message.includes("Authentication required") ||
        error.message.includes("Session expired")
      ) {
        logout();
      }
      throw new Error(error.message || "Failed to update profile");
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updatePassword,
    updateProfile,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
