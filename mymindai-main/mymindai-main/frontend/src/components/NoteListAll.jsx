import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import moment from 'moment';
import 'moment/dist/locale/ru';
import NoteAddForm from './NoteAddForm';
import { createNote } from '../store/note';
import { message } from "antd";

moment.locale('ru');

const NoteList = ({ notes, userID, onNoteCreated }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const handleCreateNote = async (noteData) => {
        setLoading(true);
        try {
            const response = await createNote(noteData, userID);
            messageApi.success("Заметка успешно создана!");
            onNoteCreated(response.note_info);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Ошибка при создании заметки:", error);
            messageApi.error("Ошибка при создании заметки: " + (error.message || "попробуйте позже"));
        } finally {
            setLoading(false);
        }
    };

    if (!notes || notes.length === 0) {
        return (
            <>
                {contextHolder}
                <div className="no-events">Нет доступных заметок</div>
                <AddNoteButtonAndModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    handleCreateNote={handleCreateNote}
                    loading={loading}
                />
            </>
        );
    }

    const groupedNotes = notes.reduce((acc, note) => {
        const date = moment(note.created_at).format('YYYY-MM-DD');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(note);
        return acc;
    }, {});

    const notesByDate = Object.entries(groupedNotes).map(([date, notes]) => ({
        date,
        notes: notes
    }));

    return (
        <>
            {contextHolder}
            <div className='note-container'>
                {notesByDate.map(({ date, notes }) => (
                    <div key={date} className='note-date-group'>
                        <h3 className='note-date-header'>
                            {moment(date).format('D MMMM YYYY')}
                        </h3>
                        <div className='grid-notes'>
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className='note-item'
                                    onClick={() => navigate(`/note/${note.id}`)}
                                >
                                    <div className='note-time'>
                                        {moment.utc(note.created_at).format('HH:mm')}
                                    </div>
                                    <h3 className='note-title'>{note.title || 'Без названия'}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <AddNoteButtonAndModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    handleCreateNote={handleCreateNote}
                    loading={loading}
                />
            </div>
        </>
    );
};

const AddNoteButtonAndModal = ({ isModalOpen, setIsModalOpen, handleCreateNote, loading }) => {
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
                title="Создание заметки"
                closeButton={true}
            >
                <NoteAddForm
                    onFinish={handleCreateNote}
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

NoteList.propTypes = {
    notes: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string,
            content: PropTypes.string,
            created_at: PropTypes.string.isRequired,
            update_at: PropTypes.string,
            user_id: PropTypes.number.isRequired
        })
    ).isRequired
};

export default NoteList;