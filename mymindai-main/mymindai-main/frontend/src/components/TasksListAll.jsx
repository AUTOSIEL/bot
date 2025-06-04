import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { message } from "antd";
import moment from 'moment';
import Modal from '../components/Modal';
import TaskAddForm from './TaskAddForm';
import { updatetask, createtask } from '../store/task';
import 'moment/dist/locale/ru';

moment.locale('ru');

const TasksList = ({ tasks, onUpdated, userID, onTaskCreated }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleCreateTask = async (taskData) => {
      setLoading(true);
      try {
          const response = await createtask(taskData, userID);
          messageApi.success("Задача успешно создана!");
          onTaskCreated(response.task_info);
          setIsModalOpen(false);
      } catch (error) {
          console.error("Ошибка при создании заметки:", error);
          messageApi.error("Ошибка при создании заметки: " + (error.message || "попробуйте позже"));
      } finally {
          setLoading(false);
      }
  };
  
  if (!tasks || tasks.length === 0) {
    return (
      <>
        <div className="no-events">Нет доступных задач</div>
        <AddTaskButtonAndModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            handleCreateTask={handleCreateTask}
            loading={loading}
        />
      </>
    );
  }

  const handleCheckboxChange = async (taskId, currentStatus, e) => {
    e.stopPropagation();
    try {
        const newStatus = currentStatus === 0 ? 1 : 0;
        const updatedTask = tasks.find(task => task.id === taskId);
        updatedTask.status = newStatus;
        const response = await updatetask(updatedTask, taskId);
        if (!response) {
            throw new Error("Нет ответа от сервера");
        }
        messageApi.success("Статус задачи изменен!");
        const updatedTasks = tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
        );
        if (onUpdated) {
            onUpdated(updatedTasks);
        }
    } catch (error) {

    }
  };

  // Группировка заметок по датам
  const groupedTasks = tasks.reduce((acc, task) => {
    const date = moment(task.created_at).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  // Преобразование в массив для рендеринга
  const tasksByDate = Object.entries(groupedTasks).map(([date, tasks]) => ({
    date,
    tasks: tasks
  }));

  return (
    <>{contextHolder}
    <div className='task-container'>
      {tasksByDate.map(({ date, tasks }) => (
        <div key={date} className='note-date-group'>
          <h3 className='note-date-header'>
            {moment(date).format('D MMMM YYYY')}
          </h3>
          <div className='grid-task'>
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className='task-item' 
              onClick={() => navigate(`/task/${task.id}`)}
            >
                <div className='task-item-row'>
                    <div className='task-item-title-row'>
                        <div 
                          className={`task-checkbox ${task.status != 0 && 'active'}`}
                          onClick={(e) => handleCheckboxChange(task.id, task.status, e)}
                        >
                            {task.status != 0 && (<div>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.5 3.75L5.625 10.625L2.5 7.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>)}
                        </div>
                        <h3 className='task-title'>{task.title || 'Без названия'}</h3>
                    </div>
                    {task.status == 0 ? (
                      <span className='task-status-text'>Не готово</span>
                    ) : (
                      <span className='task-status-text done'>Готово</span>
                    )}
                </div>
                <div className='task-time'>
                    {moment.utc(task.created_at).format('HH:mm')}
                </div>
            </div>
          ))}
          </div>
        </div>
      ))}
      <AddTaskButtonAndModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          handleCreateTask={handleCreateTask}
          loading={loading}
      />
    </div>
    </>
  );
};

const AddTaskButtonAndModal = ({ isModalOpen, setIsModalOpen, handleCreateTask, loading }) => {
    return (
        <>
            <div className="add-event" onClick={() => setIsModalOpen(true)}>
                <div className="add-event-btn">
                    <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 0.5V15.5" stroke="white" strokeWidth="2" />
                        <path d="M0 8L15 8" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                width="100%"
                onClose={() => setIsModalOpen(false)}
                animation="slide"
                title="Создание задачи"
                closeButton={true}
            >
                <TaskAddForm
                    onFinish={handleCreateTask}
                    loading={loading}
                    initialValues={{
                        title: "",
                        content: "",
                    }}
                />
            </Modal>
        </>
    );
};

TasksList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string,
      content: PropTypes.string,
      status: PropTypes.number,
      created_at: PropTypes.string.isRequired,
      update_at: PropTypes.string,
      user_id: PropTypes.number.isRequired
    })
  ).isRequired,
  onUpdated: PropTypes.func.isRequired
};

export default TasksList;