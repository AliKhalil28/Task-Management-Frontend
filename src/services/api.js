// Get the API URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    const userData = JSON.parse(user);
    return userData.token || userData.accessToken || null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Helper function to make authenticated requests - HYBRID approach
const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();

  if (!token && !isAuthenticated()) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const fetchOptions = {
      ...options,
      credentials: "include", // Still include cookies for desktop
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), // Add token header if available
        ...options.headers,
      },
    };

    console.log("Making request to:", url);
    console.log("With token:", token ? "Present" : "Missing");

    const response = await fetch(url, fetchOptions);

    // If unauthorized, try refresh token once
    if (response.status === 401) {
      console.log("401 Unauthorized - attempting token refresh");

      try {
        // Try to refresh the token using both methods
        const refreshResponse = await fetch(`${BASE_URL}/users/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();

          // Update stored token if provided in response
          if (refreshData.data?.accessToken || refreshData.accessToken) {
            const currentUser = JSON.parse(
              localStorage.getItem("user") || "{}"
            );
            const newToken =
              refreshData.data?.accessToken || refreshData.accessToken;
            const updatedUser = {
              ...currentUser,
              token: newToken,
              accessToken: newToken,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            // Retry original request with new token
            const retryOptions = {
              ...fetchOptions,
              headers: {
                ...fetchOptions.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            const retryResponse = await fetch(url, retryOptions);
            return handleResponse(retryResponse);
          }

          console.log(
            "Token refreshed successfully, retrying original request"
          );
          // Retry the original request
          const retryResponse = await fetch(url, fetchOptions);
          return handleResponse(retryResponse);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("user");
        throw new Error("Session expired. Please log in again.");
      }
    }

    return handleResponse(response);
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    try {
      console.log("Registering user to:", `${BASE_URL}/users/register`);

      const response = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await handleResponse(response);
      console.log("Register response:", data);

      if (data.data?.user) {
        // Store user data with token for mobile compatibility
        const userToStore = {
          ...data.data.user,
          token: data.data.token || data.data.accessToken || data.token,
          accessToken: data.data.token || data.data.accessToken || data.token,
        };
        localStorage.setItem("user", JSON.stringify(userToStore));
        console.log("User stored:", userToStore);
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log("Logging in to:", `${BASE_URL}/users/login`);

      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await handleResponse(response);
      console.log("Login response:", data);

      if (data.data?.user) {
        // Store user data with token for mobile compatibility
        const userToStore = {
          ...data.data.user,
          token: data.data.token || data.data.accessToken || data.token,
          accessToken: data.data.token || data.data.accessToken || data.token,
        };
        localStorage.setItem("user", JSON.stringify(userToStore));
        console.log("User stored after login:", userToStore);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = getAuthToken();
      await fetch(`${BASE_URL}/users/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("user");
    }
  },

  getUserProfile: async () => {
    return authenticatedFetch(`${BASE_URL}/users/profile`);
  },

  updateProfile: async (profileData) => {
    return authenticatedFetch(`${BASE_URL}/users/update-profile`, {
      method: "PATCH",
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (passwordData) => {
    return authenticatedFetch(`${BASE_URL}/users/change-password`, {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  },
};

// Tasks API - keeping the same structure
export const tasksAPI = {
  getAllTasks: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters.priority && filters.priority !== "all") {
        params.append("priority", filters.priority);
      }
      if (filters.search && filters.search.trim()) {
        params.append("search", filters.search.trim());
      }
      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append("sortOrder", filters.sortOrder);
      }

      const url = `${BASE_URL}/tasks?${params.toString()}`;
      const result = await authenticatedFetch(url);
      return result;
    } catch (error) {
      throw error;
    }
  },

  getAllTasksForStats: async () => {
    try {
      const result = await authenticatedFetch(
        `${BASE_URL}/tasks?page=1&limit=1000`
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  getTaskById: async (taskId) => {
    return authenticatedFetch(`${BASE_URL}/tasks/${taskId}`);
  },

  createTask: async (taskData) => {
    try {
      const result = await authenticatedFetch(`${BASE_URL}/tasks`, {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      if (result.data && result.data.task) {
        return {
          ...result,
          data: result.data.task,
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const result = await authenticatedFetch(`${BASE_URL}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(taskData),
      });

      if (result.data && result.data.task) {
        return {
          ...result,
          data: result.data.task,
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const result = await authenticatedFetch(
        `${BASE_URL}/tasks/status/${taskId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      if (result.data && result.data.task) {
        return {
          ...result,
          data: result.data.task,
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    return authenticatedFetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};

// Export helper functions
export { isAuthenticated };
