import TaskCard from "./TaskCard";
import EmptyState from "../UI/EmptyState";

const TaskList = ({ tasks, onEditTask, onViewTask, onCreateTask }) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return <EmptyState onCreateTask={onCreateTask} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task._id || task.id}
          task={task}
          onEdit={() => onEditTask(task)}
          onView={onViewTask}
        />
      ))}
    </div>
  );
};

export default TaskList;
