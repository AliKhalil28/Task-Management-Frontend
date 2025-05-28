"use client";

import { X, Calendar, Clock, Flag, User } from "lucide-react";
import Modal from "../UI/Modal";
import StatusBadge from "../UI/StatusBadge";
import PriorityBadge from "../UI/PriorityBadge";
import Button from "../UI/Button";

const TaskDetailModal = ({ task, onClose, onEdit }) => {
  if (!task) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "completed";

  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Task Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{task.title}</h3>
            <div className="flex items-center space-x-3">
              <StatusBadge status={task.status} onChange={() => {}} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Description
              </h4>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Due Date */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Due Date
            </h4>
            <p
              className={`text-lg ${
                isOverdue ? "text-red-400 font-medium" : "text-white"
              }`}
            >
              {formatDate(task.dueDate)}
              {isOverdue && " (Overdue)"}
            </p>
          </div>

          {/* Priority */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Flag className="h-4 w-4 mr-2" />
              Priority Level
            </h4>
            <p className="text-white">{task.priority} Priority</p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Created
              </h4>
              <p className="text-gray-400 text-sm">
                {formatDateTime(task.createdAt)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Last Updated
              </h4>
              <p className="text-gray-400 text-sm">
                {formatDateTime(task.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={() => onEdit(task)}>
            Edit Task
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
