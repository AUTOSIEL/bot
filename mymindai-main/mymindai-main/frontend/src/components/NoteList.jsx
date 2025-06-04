import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/dist/locale/ru';

moment.locale('ru');

const NoteList = ({ notes }) => {
  const navigate = useNavigate();
  
  if (!notes || notes.length === 0) {
    return <div className="no-events">Нет доступных заметок</div>;
  }

  // Группировка заметок по датам
  const groupedNotes = notes.reduce((acc, note) => {
    const date = moment(note.created_at).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(note);
    return acc;
  }, {});

  // Преобразование в массив для рендеринга
  const notesByDate = Object.entries(groupedNotes).map(([date, notes]) => ({
    date,
    notes: notes.slice(0, 4) // Берем первые 4 заметки для каждой даты
  }));

  return (
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
      <a 
        onClick={() => navigate('/notes')} 
        className="view-all-link"
      >
        Посмотреть все заметки
      </a>
    </div>
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