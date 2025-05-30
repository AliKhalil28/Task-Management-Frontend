"use client";
import { useTask } from "../../context/TaskContext";
import { Search } from "lucide-react";

const TaskSearchBar = () => {
  const { filters, setFilters } = useTask();

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setFilters((prev) => ({
      ...prev,
      search: searchValue,
    }));
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search tasks..."
        value={filters.search}
        onChange={handleSearchChange}
        className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg leading-5 placeholder-gray-400 text-white focus:outline-none focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default TaskSearchBar;
