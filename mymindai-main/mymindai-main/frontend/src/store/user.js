import axios from 'axios';
import { debugLog } from '../utils/debugLog';

const apiClient = axios.create({
  baseURL: 'https://mindmyai.ru/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function authUser(user) {
  try {
    const response = await apiClient.post('/auth-user', {
      user: {  
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code
      }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных пользователя:', error);
    debugLog('Ошибка при отправке данных пользователя:', error);
    throw error;
  }
}

export async function updateUserInfo(user_info, userID) {
  try {
    const response = await apiClient.post('/update-user-info', {
      user_info: user_info,
      user_id: userID
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных пользователя:', error);
    debugLog('Ошибка при отправке данных пользователя:', error);
    throw error;
  }
}

export async function getUsers(user) {
  try {
    const response = await apiClient.post('/get-users', {
      user: user
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных пользователя:', error);
    debugLog('Ошибка при отправке данных пользователя:', error);
    throw error;
  }
}

export async function updateUser(user_info, admin) {
  try {
    const response = await apiClient.post('/update-user', {
      user_info: user_info,
      admin: admin
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных пользователя:', error);
    debugLog('Ошибка при отправке данных пользователя:', error);
    throw error;
  }
}