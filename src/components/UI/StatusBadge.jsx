"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const StatusBadge = ({ status, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    completed: {
      label: "Completed",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
  };

  const statuses = ["pending", "in-progress", "completed"];

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // If there's not enough space below, show dropdown above
      if (spaceBelow < 120 && spaceAbove > 120) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleStatusChange = (newStatus) => {
    onChange(newStatus);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[status].className} hover:opacity-80 transition-opacity`}
      >
        {statusConfig[status].label}
        <ChevronDown className="ml-1 h-3 w-3" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div
            className={`absolute left-0 w-32 bg-gray-800 rounded-md shadow-xl border border-gray-700 z-50 ${
              dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
            style={{
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            {statuses.map((statusOption, index) => (
              <button
                key={statusOption}
                onClick={() => handleStatusChange(statusOption)}
                className={`block w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                  index === 0 ? "rounded-t-md" : ""
                } ${index === statuses.length - 1 ? "rounded-b-md" : ""} ${
                  statusOption === status ? "bg-gray-700 text-white" : ""
                }`}
              >
                {statusConfig[statusOption].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusBadge;
