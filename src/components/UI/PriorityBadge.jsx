const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    High: {
      label: "High",
      className: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    Medium: {
      label: "Medium",
      className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    Low: {
      label: "Low",
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityConfig[priority].className}`}
    >
      {priorityConfig[priority].label}
    </span>
  );
};

export default PriorityBadge;
