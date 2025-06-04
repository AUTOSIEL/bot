import axios from 'axios';
import { debugLog } from '../utils/debugLog';

const apiClient = axios.create({
  baseURL: 'https://mindmyai.ru/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function updateNote(note_data, noteId) {
  try {
    const response = await apiClient.post('/update-note', {
      note_info: note_data,
      note_id: noteId
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных события:', error);
    debugLog('Ошибка при отправке данных события:', error);
    throw error;
  }
}

export async function createNote(note_data, userID) {
  try {
    const response = await apiClient.post('/create-note', {
      note_info: note_data,
      user_id: userID
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке данных заметки:', error);
    debugLog('Ошибка при отправке данных заметки:', error);
    throw error;
  }
}

export async function deleteNote(noteId) {
  try {
    const response = await apiClient.post('/remove-note', {
      note_id: noteId
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении заметки:', error);
    debugLog('Ошибка при удалении заметки:', error);
    throw error;
  }
}
