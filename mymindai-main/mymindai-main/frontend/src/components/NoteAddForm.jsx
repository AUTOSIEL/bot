import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message } from "antd";
import fileStore from '../store/fileStore';

const NoteAddForm = ({ onFinish, loading }) => {
  const [form] = Form.useForm();
  const [editedTitle, setEditedTitle] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const contentEditableRef = useRef(null);
  const titleInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = initialContent
        .replace(/\n/g, '<br>')
        .replace(/<br><br>/g, '<br>');

      moveCaretToEnd(contentEditableRef.current);
    }
  }, [initialContent]);

  const moveCaretToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  };

  const handleSubmit = (values) => {
    let updatedContent = contentEditableRef.current?.innerHTML || '';
    updatedContent = updatedContent.replace(/<br>$/g, '');
    onFinish({
      ...values,
      content: updatedContent.replace(/<br>/g, '\n').replace(/<\/li>\n<li>/g, '</li><li>')
    });
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

  return (
    <div className="note-form-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="Название заметки"
          rules={[{ required: true, message: 'Введите название заметки' }]}
        >
          <input
            ref={titleInputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Введите заголовок"
            className="note-title-input"
          />
        </Form.Item>

        <div className="note-content-container">
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
        </div>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ width: '100%', height: 50 }}
          >
            Создать заметку
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NoteAddForm;