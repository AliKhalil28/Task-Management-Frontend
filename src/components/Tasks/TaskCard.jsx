"use client";

import { useState, useRef, useEffect } from "react";
import { useTask } from "../../context/TaskContext";
import { Calendar, Edit3, Trash2, MoreVertical, Eye } from "lucide-react";
import StatusBadge from "../UI/StatusBadge";
import PriorityBadge from "../UI/PriorityBadge";
import ConfirmDialog from "../UI/ConfirmDialog";

const TaskCard = ({ task, onEdit, onView }) => {
  const { updateTaskStatus, deleteTask } = useTask();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuPosition, setMenuPosition] = useState("bottom");
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (showMenu && menuButtonRef.current) {
      const buttonRect = menuButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // If there's not enough space below, show menu above
      if (spaceBelow < 120 && spaceAbove > 120) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
  }, [showMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTaskStatus(task._id, newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task._id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  // Safety check for task object
  if (!task || !task._id) {
    return null;
  }

  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-700 p-6 hover:shadow-md hover:border-gray-600 transition-all h-[200px] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 truncate">
              {task.title || "Untitled Task"}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {task.description || "No description"}
            </p>
          </div>
          <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
            <button
              ref={menuButtonRef}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
            {showMenu && (
              <>
                {/* Backdrop for mobile */}
                <div
                  className="fixed inset-0 z-40 md:hidden"
                  onClick={() => setShowMenu(false)}
                />

                {/* Menu */}
                <div
                  className={`absolute right-0 w-32 bg-gray-800 rounded-md shadow-xl border border-gray-700 z-50 ${
                    menuPosition === "top"
                      ? "bottom-full mb-1"
                      : "top-full mt-1"
                  }`}
                  style={{
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <button
                    onClick={() => {
                      onView(task);
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-t-md transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteDialog(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-b-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2 mb-4 overflow-visible">
          <StatusBadge
            status={task.status || "pending"}
            onChange={handleStatusChange}
          />
          <PriorityBadge priority={task.priority || "Medium"} />
        </div>

        {/* Due Date - Push to bottom */}
        <div className="flex items-center text-sm text-gray-400 mt-auto">
          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className={isOverdue ? "text-red-400 font-medium" : ""}>
            Due {formatDate(task.dueDate)}
            {isOverdue && " (Overdue)"}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  );
};

export default TaskCard;
