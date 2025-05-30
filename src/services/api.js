// Get the API URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL;

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

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  // Check multiple storage locations
  try {
    if (localStorage.getItem("authToken")) return true;
  } catch (e) {}

  try {
    if (sessionStorage.getItem("authToken")) return true;
  } catch (e) {}

  return false;
};

// Get auth token from any available storage
const getAuthToken = () => {
  // Try localStorage
  try {
    const localToken = localStorage.getItem("authToken");
    if (localToken) return localToken;
  } catch (e) {
    console.warn("Failed to get token from localStorage:", e);
  }

  // Try sessionStorage
  try {
    const sessionToken = sessionStorage.getItem("authToken");
    if (sessionToken) return sessionToken;
  } catch (e) {
    console.warn("Failed to get token from sessionStorage:", e);
  }

  return null;
};

// Helper function to make authenticated requests - ROBUST approach
const authenticatedFetch = async (url, options = {}, token = null) => {
  // Use provided token or get from storage
  const authToken = token || getAuthToken();

  if (!authToken && !isAuthenticated()) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const fetchOptions = {
      ...options,
      credentials: "include", // Include cookies for desktop
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }), // Always include token header
        ...options.headers,
      },
    };

    console.log("Making request to:", url);
    console.log("With auth header:", authToken ? "Present" : "Missing");

    const response = await fetch(url, fetchOptions);

    // If unauthorized, try refresh token once
    if (response.status === 401) {
      console.log("401 Unauthorized - attempting token refresh");

      try {
        // Try to refresh the token
        const refreshResponse = await fetch(`${BASE_URL}/users/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
          body: JSON.stringify({ token: authToken }), // Also send token in body
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();

          // Update stored token if provided in response
          const newToken =
            refreshData.data?.accessToken ||
            refreshData.accessToken ||
            refreshData.data?.token ||
            refreshData.token;

          if (newToken) {
            // Store token in multiple places
            try {
              localStorage.setItem("authToken", newToken);
            } catch (e) {
              console.warn("Failed to store token in localStorage:", e);
            }

            try {
              sessionStorage.setItem("authToken", newToken);
            } catch (e) {
              console.warn("Failed to store token in sessionStorage:", e);
            }

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
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Clear tokens from all storages
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        } catch (e) {}

        try {
          sessionStorage.removeItem("authToken");
        } catch (e) {}

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

      // Store token in multiple places
      const token = data.data?.token || data.data?.accessToken || data.token;
      if (token) {
        try {
          localStorage.setItem("authToken", token);
        } catch (e) {
          console.warn("Failed to store token in localStorage:", e);
        }

        try {
          sessionStorage.setItem("authToken", token);
        } catch (e) {
          console.warn("Failed to store token in sessionStorage:", e);
        }
      }

      if (data.data?.user) {
        // Store user data
        try {
          localStorage.setItem("user", JSON.stringify(data.data.user));
        } catch (e) {
          console.warn("Failed to store user in localStorage:", e);
        }
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
        // credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await handleResponse(response);
      console.log("Login response:", data);

      // Store token in multiple places
      const token = data.data?.token || data.data?.accessToken || data.token;
      if (token) {
        console.log("Storing auth token:", token.substring(0, 10) + "...");
        try {
          localStorage.setItem("authToken", token);
        } catch (e) {
          console.warn("Failed to store token in localStorage:", e);
        }

        try {
          sessionStorage.setItem("authToken", token);
        } catch (e) {
          console.warn("Failed to store token in sessionStorage:", e);
        }
      } else {
        console.warn("No token found in login response");
      }

      if (data.data?.user) {
        // Store user data
        try {
          localStorage.setItem("user", JSON.stringify(data.data.user));
        } catch (e) {
          console.warn("Failed to store user in localStorage:", e);
        }
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: async (token) => {
    try {
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
      // Clear tokens from all storages
      try {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } catch (e) {}

      try {
        sessionStorage.removeItem("authToken");
      } catch (e) {}
    }
  },

  refreshToken: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify({ token }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  },

  getUserProfile: async (token) => {
    return authenticatedFetch(`${BASE_URL}/users/profile`, {}, token);
  },

  updateProfile: async (profileData, token) => {
    return authenticatedFetch(
      `${BASE_URL}/users/update-profile`,
      {
        method: "PATCH",
        body: JSON.stringify(profileData),
      },
      token
    );
  },

  changePassword: async (passwordData, token) => {
    return authenticatedFetch(
      `${BASE_URL}/users/change-password`,
      {
        method: "POST",
        body: JSON.stringify({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      },
      token
    );
  },
};

// Tasks API - using the same authenticatedFetch with token
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
export { isAuthenticated, getAuthToken };
