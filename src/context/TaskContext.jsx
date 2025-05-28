"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { tasksAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [allTasksStats, setAllTasksStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalTasks: 0,
    limit: 15,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    search: "",
  });
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");

  // Helper function to handle authentication errors
  const handleAuthError = (error) => {
    if (
      error.message.includes("Authentication required") ||
      error.message.includes("Session expired")
    ) {
      logout();
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: "Session expired. Please log in again.",
          },
        })
      );
      return true;
    }
    return false;
  };

  // Fetch all tasks stats (without pagination) for dashboard stats
  const fetchAllTasksStats = async () => {
    if (!user) return;

    try {
      const response = await tasksAPI.getAllTasksForStats();

      if (response.data && response.data.tasks) {
        const allTasks = response.data.tasks;
        const stats = {
          total: allTasks.length,
          completed: allTasks.filter((task) => task.status === "completed")
            .length,
          inProgress: allTasks.filter((task) => task.status === "in-progress")
            .length,
          pending: allTasks.filter((task) => task.status === "pending").length,
        };
        setAllTasksStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch task stats:", error);
    }
  };

  // Fetch tasks from API with pagination and filters
  const fetchTasks = async (
    page = 1,
    limit = 15,
    currentFilters = null,
    currentSortBy = null,
    currentSortOrder = null
  ) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      // Use current filters and sortBy if not provided
      const filtersToUse = currentFilters || filters;
      const sortByToUse = currentSortBy || sortBy;
      const sortOrderToUse = currentSortOrder || sortOrder;

      const response = await tasksAPI.getAllTasks(page, limit, {
        ...filtersToUse,
        sortBy: sortByToUse,
        sortOrder: sortOrderToUse,
      });

      // Handle the response data structure
      if (response.data) {
        setTasks(response.data.tasks || []);
        setPagination({
          totalTasks: response.data.totalTasks || 0,
          limit: response.data.limit || 15,
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          hasNextPage: response.data.hasNextPage || false,
          hasPrevPage: response.data.hasPrevPage || false,
        });
      }

      // Also fetch stats for the dashboard (only if no filters applied)
      if (
        !currentFilters ||
        (filtersToUse.status === "all" &&
          filtersToUse.priority === "all" &&
          !filtersToUse.search)
      ) {
        await fetchAllTasksStats();
      }
    } catch (error) {
      if (!handleAuthError(error)) {
        setError(error.message);
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              type: "error",
              message: error.message || "Failed to fetch tasks",
            },
          })
        );
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when user is available
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setError(null);
      setAllTasksStats({
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
      });
      setPagination({
        totalTasks: 0,
        limit: 15,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    }
  }, [user]);

  // Fix the useEffect that triggers when filters change
  // Replace the existing useEffect for filters with this:

  useEffect(() => {
    if (user) {
      // Add a small delay to debounce rapid filter changes
      const timeoutId = setTimeout(() => {
        // Reset to page 1 when filters change
        fetchTasks(1, pagination.limit, filters, sortBy, sortOrder);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [
    filters.status,
    filters.priority,
    filters.search,
    sortBy,
    sortOrder,
    user,
    pagination.limit,
  ]);

  const createTask = async (taskData) => {
    if (!user) {
      throw new Error("Please log in to create tasks");
    }

    try {
      const response = await tasksAPI.createTask(taskData);

      // Refresh tasks and stats after creating
      await fetchTasks(pagination.currentPage, pagination.limit);
      await fetchAllTasksStats();

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", message: "Task created successfully!" },
        })
      );

      return response.data;
    } catch (error) {
      if (!handleAuthError(error)) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              type: "error",
              message: error.message || "Failed to create task",
            },
          })
        );
      }
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    if (!user) {
      throw new Error("Please log in to update tasks");
    }

    try {
      const response = await tasksAPI.updateTask(taskId, updates);

      // Refresh current page and stats
      await fetchTasks(pagination.currentPage, pagination.limit);
      await fetchAllTasksStats();

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", message: "Task updated successfully!" },
        })
      );

      return response.data;
    } catch (error) {
      if (!handleAuthError(error)) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              type: "error",
              message: error.message || "Failed to update task",
            },
          })
        );
      }
      throw error;
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    if (!user) {
      throw new Error("Please log in to update tasks");
    }

    try {
      const response = await tasksAPI.updateTaskStatus(taskId, status);

      // Refresh current page and stats
      await fetchTasks(pagination.currentPage, pagination.limit);
      await fetchAllTasksStats();

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", message: `Task marked as ${status}!` },
        })
      );

      return response.data;
    } catch (error) {
      if (!handleAuthError(error)) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              type: "error",
              message: error.message || "Failed to update task status",
            },
          })
        );
      }
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    if (!user) {
      throw new Error("Please log in to delete tasks");
    }

    try {
      await tasksAPI.deleteTask(taskId);

      // Refresh tasks and stats after deleting
      await fetchTasks(pagination.currentPage, pagination.limit);
      await fetchAllTasksStats();

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", message: "Task deleted successfully!" },
        })
      );
    } catch (error) {
      if (!handleAuthError(error)) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              type: "error",
              message: error.message || "Failed to delete task",
            },
          })
        );
      }
      throw error;
    }
  };

  const changePage = (page) => {
    fetchTasks(page, pagination.limit, filters, sortBy, sortOrder);
  };

  // Also fix the updateFilters function to ensure immediate update
  const updateFilters = (newFilters) => {
    console.log("Updating filters:", newFilters); // Debug log
    setFilters(newFilters);
  };

  const updateSortBy = (newSortBy) => {
    setSortBy(newSortBy);
    // fetchTasks will be called automatically by useEffect
  };

  const updateSortOrder = (newSortOrder) => {
    setSortOrder(newSortOrder);
    // fetchTasks will be called automatically by useEffect
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      search: "",
    });
    setSortBy("dueDate");
    setSortOrder("asc");
  };

  const value = {
    tasks,
    allTasksStats,
    loading,
    error,
    pagination,
    filters,
    setFilters: updateFilters,
    sortBy,
    setSortBy: updateSortBy,
    sortOrder,
    setSortOrder: updateSortOrder,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    fetchTasks,
    fetchAllTasksStats,
    changePage,
    clearFilters,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
