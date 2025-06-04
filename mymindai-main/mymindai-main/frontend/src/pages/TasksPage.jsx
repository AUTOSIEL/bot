import React, { useState } from 'react';
import TasksListAll from '../components/TasksListAll';

const TaskPage = ({ tasks: initialTasks, onUpdateTasks, userID}) => {
  const [tasks, setTasks] = useState(initialTasks || []);

  const handleTaskCreated = (newTask) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    onUpdateTasks(updatedTasks);
  };

  return (
    <div className="events-page">
      <h2>Все задачи</h2>
      <TasksListAll tasks={tasks} userID={userID} onUpdated={(updatedTasks) => onUpdateTasks(updatedTasks)} onTaskCreated={handleTaskCreated} />
    </div>
  );
};

export default TaskPage;