"use client";

import { CheckSquare, Plus } from "lucide-react";
import Button from "./Button";

const EmptyState = ({ onCreateTask }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <CheckSquare className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
      <p className="text-gray-400 mb-6">
        Get started by creating your first task or adjust your filters.
      </p>
      {onCreateTask && (
        <Button
          onClick={onCreateTask}
          className="flex items-center space-x-2 mx-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Create Your First Task</span>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
