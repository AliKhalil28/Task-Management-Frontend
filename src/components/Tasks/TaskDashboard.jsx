"use client";

import { useState } from "react";
import { useTask } from "../../context/TaskContext";
import TaskStats from "./TaskStats";
import TaskFilters from "./TaskFilters";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import TaskDetailModal from "./TaskDetailModal";
import TaskSearchBar from "./TaskSearchBar";
import Pagination from "../UI/Pagination";
import { Plus, RefreshCw } from "lucide-react";
import Button from "../UI/Button";

const TaskDashboard = () => {
  const {
    tasks,
    loading,
    error,
    pagination,
    changePage,
    fetchTasks,
    fetchAllTasksStats,
    filters,
  } = useTask();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
    setViewingTask(null); // Close detail modal if open
  };

  const handleViewTask = (task) => {
    setViewingTask(task);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleCloseDetail = () => {
    setViewingTask(null);
  };

  const handlePageChange = (page) => {
    changePage(page);
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.search.trim() !== "";

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Task Dashboard</h1>
            <p className="mt-2 text-gray-400">
              Manage and track your tasks efficiently
              {hasActiveFilters && (
                <span className="ml-2 text-blue-400">
                  • Filtered results ({pagination.totalTasks} tasks)
                </span>
              )}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Show loading state */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Loading tasks...</div>
        </div>
      )}

      {/* Show error state */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-lg">Error: {error}</div>
        </div>
      )}

      {/* Show dashboard content when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Stats - Shows total across all pages (only when no filters) */}
          {!hasActiveFilters && <TaskStats />}

          {/* Search and Filters - Always show */}
          <div className="mb-6 space-y-4">
            <TaskSearchBar />
            <TaskFilters />
          </div>

          {/* Task List */}
          <div className="mb-6">
            <TaskList
              tasks={tasks}
              onEditTask={handleEditTask}
              onViewTask={handleViewTask}
              onCreateTask={() => setShowTaskForm(true)}
            />
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={handlePageChange}
            totalItems={pagination.totalTasks}
            itemsPerPage={pagination.limit}
          />
        </>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm task={editingTask} onClose={handleCloseForm} />
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          onClose={handleCloseDetail}
          onEdit={handleEditTask}
        />
      )}
    </div>
  );
};

export default TaskDashboard;
