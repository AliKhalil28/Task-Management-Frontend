import { useTask } from "../../context/TaskContext";
import { CheckCircle, Clock, AlertCircle, ListTodo } from "lucide-react";

const TaskStats = () => {
  const { allTasksStats } = useTask();

  const statCards = [
    {
      title: "Total Tasks",
      value: allTasksStats.total,
      icon: ListTodo,
      color: "bg-blue-500",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-400",
    },
    {
      title: "Completed",
      value: allTasksStats.completed,
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-500/20",
      textColor: "text-green-400",
    },
    {
      title: "In Progress",
      value: allTasksStats.inProgress,
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
    },
    {
      title: "Pending",
      value: allTasksStats.pending,
      icon: AlertCircle,
      color: "bg-red-500",
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-700 p-6 relative z-10"
        >
          <div className="flex items-center">
            <div className={`${stat.bgColor} p-3 rounded-lg flex-shrink-0`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-400 truncate">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskStats;
