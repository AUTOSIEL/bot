import axios from 'axios';
import { debugLog } from '../utils/debugLog';

const apiClient = axios.create({
  baseURL: 'https://mindmyai.ru/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function updatetask(task_data, taskId) {
  try {
    const response = await apiClient.post('/update-task', {
      task_info: task_data,
      task_id: taskId
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных задачи:', error);
    debugLog('Ошибка при отправке данных задачи:', error);
    throw error;
  }
}

export async function createtask(task_data, userID) {
  try {
    const response = await apiClient.post('/create-task', {
      task_info: task_data,
      user_id: userID
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных задачи:', error);
    debugLog('Ошибка при отправке данных задачи:', error);
    throw error;
  }
}

export async function deletetask(taskId) {
  try {
    const response = await apiClient.post('/remove-task', {
      task_id: taskId
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    debugLog('Ошибка при удалении задачи:', error);
    throw error;
  }
}
