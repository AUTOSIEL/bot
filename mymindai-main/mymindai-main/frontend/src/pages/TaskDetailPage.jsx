import React, { useState, useRef, useEffect } from 'react';
import { Button, message } from "antd";
import { useParams, useNavigate } from 'react-router-dom';
import fileStore from '../store/fileStore';
import { updatetask, deletetask } from '../store/task';
import Modal from '../components/Modal';
import './NoteDetailPage.css';

const TaskDetailPage = ({ tasks, onUpdate }) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [IsModalRemoveOpen, setIsModalRemoveOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const contentEditableRef = useRef(null);
  const titleInputRef = useRef(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { uploadProgress, isUploading, error } = fileStore;

  const task = tasks.find(n => n.id === parseInt(id));

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title || '');
      setInitialContent(task.content || '');

      if (isEditing && titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }
  }, [task, isEditing]);

  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.innerHTML = initialContent
        .replace(/\n/g, '<br>')
        .replace(/<br><br>/g, '<br>');

      moveCaretToEnd(contentEditableRef.current);
    }
  }, [isEditing, initialContent]);

  const moveCaretToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  };

  if (!task) {
    return <div className="note-not-found">Задача не найдена</div>;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    let updatedContent = contentEditableRef.current?.innerHTML || '';
    updatedContent = updatedContent.replace(/<br>$/g, '');

    const response = await updatetask({title: editedTitle, content: updatedContent.replace(/<br>/g, '\n').replace(/<\/li>\n<li>/g, '</li><li>')}, task.id);
    console.log("Ответ сервера:", response); // Для отладки
    
    if (!response) {
      throw new Error("Нет ответа от сервера");
    }
  
    messageApi.success("Данные сохранены!");

    const updatedTask = {
      ...task,
      title: editedTitle,
      content: updatedContent
        .replace(/<br>/g, '\n')
        .replace(/<\/li>\n<li>/g, '</li><li>'),
      update_at: new Date().toISOString()
    };

    onUpdate(tasks.map(n => n.id === updatedTask.id ? updatedTask : n));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(task.title || '');
    setInitialContent(task.content || '');
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    contentEditableRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      const node = selection.anchorNode;

      // Если находимся внутри списка, разрешаем стандартное поведение
      if (node && (node.parentElement?.tagName === 'LI' ||
        node.parentElement?.parentElement?.tagName === 'LI')) {
        return;
      }

      // Для обычного текста
      if (!e.shiftKey) {
        e.preventDefault();
        // Вставляем новый параграф вместо br
        document.execCommand('insertHTML', false, '<p><br></p>');
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileUrl = await fileStore.uploadFile(file);

      if (file.type.startsWith('image/')) {
        insertMedia(`<img src="${fileUrl}" alt="Uploaded content" class="note-media" />`);
      } else if (file.type.startsWith('video/')) {
        insertMedia(`
          <video controls class="note-media">
            <source src="${fileUrl}" type="${file.type}" />
            Ваш браузер не поддерживает видео тег.
          </video>
        `);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      e.target.value = '';
    }
  };

  const insertMedia = (html) => {
    if (!contentEditableRef.current) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const node = document.createElement('div');
      node.innerHTML = html;

      // Вставляем медиа в текущую позицию курсора
      range.deleteContents();
      range.insertNode(node);

      // Перемещаем курсор после вставленного элемента
      const newRange = document.createRange();
      newRange.setStartAfter(node);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    contentEditableRef.current.focus();
  };

  const handleAddMedia = () => {
    fileInputRef.current?.click();
  };

  const removeNote = async (noteId) => {
    setLoading(true);
    try {
      await deletetask(noteId); // Вызов API для удаления
      messageApi.success('Заметка успешно удалена');
      const updatedTasks = Array.isArray(tasks)
      ? tasks.filter(e => e.id !== noteId)
      : [];
      onUpdate(updatedTasks);
      setIsModalRemoveOpen(false);
      navigate(`/tasks`)
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      messageApi.error('Не удалось удалить задачу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>{contextHolder}
    <div className="note-detail-container">
      <div className="note-header">
        {isEditing ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Введите заголовок"
            className="note-title-input"
          />
        ) : (
          <h1 className="note-title" onClick={handleEdit}>
            {task.title || 'Без названия'}
          </h1>
        )}
      </div>

      <div className="note-meta">
        <span className="note-date">
          Создано: {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="note-content-container">
        {isEditing ? (
          <>
            <div className="formatting-toolbar">
              <button onClick={() => formatText('bold')} title="Жирный">
                <strong>B</strong>
              </button>
              <button onClick={() => formatText('italic')} title="Курсив">
                <em>I</em>
              </button>
              <button onClick={() => formatText('underline')} title="Подчеркивание">
                <u>U</u>
              </button>
              <button onClick={() => formatText('strikeThrough')} title="Зачеркивание">
                <s>S</s>
              </button>
              <button onClick={() => formatText('insertUnorderedList')} title="Маркированный список">
                • List
              </button>
              <button onClick={() => formatText('insertOrderedList')} title="Нумерованный список">
                1. List
              </button>
              <button onClick={() => {
                const url = prompt('Введите URL:');
                if (url) formatText('createLink', url);
              }} title="Ссылка">
                🔗
              </button>
              <button onClick={handleAddMedia} title="Добавить медиа">
                📷
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              style={{ display: 'none' }}
            />
            <div
              ref={contentEditableRef}
              className="note-content-editable"
              contentEditable
              onKeyDown={handleKeyDown}
              placeholder="Введите текст заметки..."
              suppressContentEditableWarning
            />
          </>
        ) : (
          <div
            className="note-content"
            onClick={handleEdit}
            dangerouslySetInnerHTML={{
              __html: formatContentForDisplay(task.content)
            }}
          />
        )}
      </div>
      {isEditing ? (
        <div className="note-actions">
          <Button style={{ height: 50 }} block onClick={handleCancel}>
            Отмена
          </Button>
          <Button style={{ height: 50 }} loading={loading} type="primary" block onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      ): (
        <Button style={{ height: 50 }} className='btn-remove' type="danger" block onClick={() => setIsModalRemoveOpen(true)}>
          Удалить
        </Button>
      )}
    </div>
    <Modal
      isOpen={IsModalRemoveOpen}
      onClose={() => setIsModalRemoveOpen(false)}
      animation="slide"
      width="100%"
      title="Вы уверены, что хотите удалить заметку?"
      closeButton={true}
    >
      <p>Это действие нельзя отменить.</p>
      <div className='event-actions'>
        <Button style={{ height: 50}} block onClick={() => setIsModalRemoveOpen(false)}>
          Отмена
        </Button>
        <Button style={{ height: 50}} type="primary" block onClick={() => removeNote(task.id)}>
          Да
        </Button>
      </div>
    </Modal>
    </>
  );
};

const formatContentForDisplay = (content) => {
  if (!content) return '<em>Нажмите, чтобы добавить текст</em>';

  if (content.includes('<ul>') || content.includes('<ol>')) {
    return content;
  }

  return content.replace(/\n/g, '<br>');
};

export default TaskDetailPage;