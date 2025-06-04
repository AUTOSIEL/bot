import { makeAutoObservable } from 'mobx';
import { message } from 'antd';
import axios from 'axios';

class FileStore {
    uploadProgress = 0;
    isUploading = false;
    error = null;

    constructor() {
        makeAutoObservable(this);
    }

    async uploadFile(file) {
        // Проверка размера файла
        if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
            throw new Error('Видео должно быть меньше 50MB');
        }
        if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
            throw new Error('Изображение должно быть меньше 2MB');
        }

        this.isUploading = true;
        this.uploadProgress = 0;
        this.error = null;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiClient = axios.create({
                baseURL: 'https://mindmyai.ru/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await apiClient.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        this.uploadProgress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                    }
                },
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Ошибка загрузки файла');
            }

            return response.data.url; // Возвращаем URL загруженного файла
        } catch (error) {
            this.error = this.getErrorMessage(error);
            message.error(this.error);
            throw error;
        } finally {
            this.isUploading = false;
        }
    }

    getErrorMessage(error) {
        if (error.response) {
            return error.response.data.message || 'Ошибка сервера';
        } else if (error.request) {
            return 'Не удалось соединиться с сервером';
        } else {
            return error.message || 'Произошла ошибка';
        }
    }

    reset() {
        this.uploadProgress = 0;
        this.isUploading = false;
        this.error = null;
    }
}

export default new FileStore();