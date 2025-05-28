"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X, AlertTriangle } from "lucide-react";

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { type, message } = event.detail;
      const id = Date.now();

      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    };

    window.addEventListener("toast", handleToast);
    return () => window.removeEventListener("toast", handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg shadow-lg border max-w-sm backdrop-blur-sm ${
            toast.type === "success"
              ? "bg-green-500/20 border-green-500/30 text-green-400"
              : toast.type === "error"
              ? "bg-red-500/20 border-red-500/30 text-red-400"
              : "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-3" />
          ) : toast.type === "error" ? (
            <XCircle className="h-5 w-5 mr-3" />
          ) : (
            <AlertTriangle className="h-5 w-5 mr-3" />
          )}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 text-gray-400 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
