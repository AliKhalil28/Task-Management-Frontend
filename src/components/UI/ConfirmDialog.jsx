"use client";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <Modal onClose={onCancel}>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <div className="bg-red-500/20 p-2 rounded-full mr-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>

        <p className="text-gray-400 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
