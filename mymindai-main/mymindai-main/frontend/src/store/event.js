import axios from 'axios';
import { debugLog } from '../utils/debugLog';

const apiClient = axios.create({
  baseURL: 'https://mindmyai.ru/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function updateEvent(event_info, eventID) {
  try {
    const response = await apiClient.post('/update-event', {
      event_info: event_info,
      event_id: eventID
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных события:', error);
    debugLog('Ошибка при отправке данных события:', error);
    throw error;
  }
}

export async function createEvent(event_info, userID) {
  try {
    const response = await apiClient.post('/create-event', {
      event_info: event_info,
      user_id: userID
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных события:', error);
    debugLog('Ошибка при отправке данных события:', error);
    throw error;
  }
}

export async function deleteEvent(eventId) {
  try {
    const response = await apiClient.post('/remove-event', {
      event_id: eventId
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении события:', error);
    debugLog('Ошибка при удалении события:', error);
    throw error;
  }
}
