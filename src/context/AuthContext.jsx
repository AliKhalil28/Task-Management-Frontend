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
  const [authToken, setAuthToken] = useState(null);

  // Function to safely store token in multiple places
  const storeAuthToken = (token) => {
    if (!token) return false;

    // Store in state
    setAuthToken(token);

    // Try localStorage
    try {
      localStorage.setItem("authToken", token);
    } catch (e) {
      console.warn("Failed to store token in localStorage:", e);
    }

    // Try sessionStorage as fallback
    try {
      sessionStorage.setItem("authToken", token);
    } catch (e) {
      console.warn("Failed to store token in sessionStorage:", e);
    }

    return true;
  };

  // Function to retrieve token from any available storage
  const getStoredAuthToken = () => {
    // First check state
    if (authToken) return authToken;

    // Then try localStorage
    try {
      const localToken = localStorage.getItem("authToken");
      if (localToken) return localToken;
    } catch (e) {
      console.warn("Failed to get token from localStorage:", e);
    }

    // Then try sessionStorage
    try {
      const sessionToken = sessionStorage.getItem("authToken");
      if (sessionToken) return sessionToken;
    } catch (e) {
      console.warn("Failed to get token from sessionStorage:", e);
    }

    return null;
  };

  // Function to clear token from all storages
  const clearAuthToken = () => {
    setAuthToken(null);

    try {
      localStorage.removeItem("authToken");
    } catch (e) {
      console.warn("Failed to remove token from localStorage:", e);
    }

    try {
      sessionStorage.removeItem("authToken");
    } catch (e) {
      console.warn("Failed to remove token from sessionStorage:", e);
    }
  };

  useEffect(() => {
    // Check for stored user data and token
    const initializeAuth = async () => {
      try {
        // First check for token
        const token = getStoredAuthToken();

        // Then check for user data
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          // Parse stored user data
          const userData = JSON.parse(storedUser);

          // Set user in state
          setUser(userData);

          // Verify session is still valid
          try {
            const response = await authAPI.getUserProfile(token);

            // Update user data with fresh data from server
            const freshUserData = response.data?.user || response.data;
            setUser(freshUserData);
            localStorage.setItem("user", JSON.stringify(freshUserData));

            // Make sure token is stored
            if (response.data?.token || response.data?.accessToken) {
              storeAuthToken(
                response.data?.token || response.data?.accessToken
              );
            }
          } catch (error) {
            console.warn("Profile verification failed:", error);
            // Try token refresh
            try {
              const refreshResponse = await authAPI.refreshToken(token);
              if (
                refreshResponse.data?.accessToken ||
                refreshResponse.data?.token
              ) {
                storeAuthToken(
                  refreshResponse.data?.accessToken ||
                    refreshResponse.data?.token
                );
              } else {
                throw new Error("No token in refresh response");
              }
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              clearAuthToken();
              setUser(null);
              localStorage.removeItem("user");
            }
          }
        } else {
          // Clear any partial data
          clearAuthToken();
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        // Clear storage on any error
        clearAuthToken();
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

      // Store token in multiple places
      const token = response.data?.token || response.data?.accessToken;
      if (token) {
        storeAuthToken(token);
      } else {
        console.warn("No token received in login response");
      }

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

      // Store token in multiple places
      const token = response.data?.token || response.data?.accessToken;
      if (token) {
        storeAuthToken(token);
      }

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const token = getStoredAuthToken();
      const response = await authAPI.changePassword(passwordData, token);
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
      const token = getStoredAuthToken();
      const response = await authAPI.updateProfile(profileData, token);
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
      const token = getStoredAuthToken();
      await authAPI.logout(token);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearAuthToken();
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
    isAuthenticated: !!user && !!getStoredAuthToken(),
    getAuthToken: getStoredAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
