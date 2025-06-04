import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const EventList = ({ events, sort }) => {
  const navigate = useNavigate();

  if (!events || events.length === 0) {
    return <div className="no-events">Нет доступных мероприятий</div>;
  }

  // Фильтрация и сортировка событий
  const now = new Date();
  let upcomingEvents = [...events].sort((a, b) => new Date(a.notify_date) - new Date(b.notify_date));

  if (sort !== 'all') {
    upcomingEvents = events
      .filter(event => event.notify_date)
      .filter(event => new Date(event.notify_date) >= now)
      .sort((a, b) => new Date(a.notify_date) - new Date(b.notify_date))
      .slice(0, 2);
  }

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Некорректная дата';

    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC' // Уберите, если нужно локальное время
    };

    return date.toLocaleString('ru-RU', options);
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className='Event-container'>
        <div className="no-events">Нет предстоящих мероприятий</div>
        {sort !== 'all' && (
          <a onClick={() => navigate('/events')} className="view-all-link">
            Посмотреть все события
          </a>
        )}
      </div>
    );
  }

  return (
    <div className='Event-container'>
      {upcomingEvents.map((event) => (
        <div key={event.id} className='Event-item' onClick={() => navigate(`/event/${event.id}`)}>
          <h3>{event.title || 'Без названия'}</h3>
          <div className="event-details">
            <div class="event-time" dateTime={event.notify_date}>
              {formatDate(event.notify_date)}
            </div>
          </div>
        </div>
      ))}
      {sort !== 'all' && (
        <a onClick={() => navigate('/events')} className="view-all-link">
          Посмотреть все события
        </a>
      )}
    </div>
  );
};

EventList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      notify_date: PropTypes.string.isRequired,
      notify_before: PropTypes.number,
      event_type: PropTypes.string,
      recurrence: PropTypes.object,
      status: PropTypes.number,
    })
  ),
  sort: PropTypes.string
};

EventList.defaultProps = {
  sort: 'all'
};

export default EventList;