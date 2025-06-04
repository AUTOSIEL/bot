import React, { useEffect, useState, useRef } from 'react';
import { message } from "antd";
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import EventAddForm from './EventAddForm';
import moment from 'moment';
import { createEvent } from '../store/event';

// Подкомпонент для выбора дня недели
const WeekDaySelector = ({ selectedDay, onSelectDay, events }) => {
  const parseLocalDate = (dateString) => {
    // Если это Moment-объект, преобразуем в строку в ISO формате
    if (dateString._isAMomentObject) {
      const isoString = dateString.toISOString(); // "2025-05-20T10:00:00.000Z"
      return new Date(isoString);
    }

    // Если это строка, обрабатываем как раньше
    if (typeof dateString === 'string') {
      const localDateString = dateString.endsWith('Z') 
        ? dateString.slice(0, -1) 
        : dateString;
      return new Date(localDateString);
    }

    // Если это уже Date-объект, возвращаем как есть
    if (dateString instanceof Date) {
      return dateString;
    }

    throw new Error('Unsupported date format');
  };

  const hasEventsForDay = (day) => {
    return events.some(event => {
      const eventDate = parseLocalDate(event.notify_date);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const days = [];
  const startOfWeek = new Date(selectedDay);
  startOfWeek.setDate(selectedDay.getDate() - selectedDay.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const hasEvents = hasEventsForDay(day);
    
    days.push(
      <div 
        key={i}
        className={`week-day ${day.toDateString() === selectedDay.toDateString() ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
        onClick={() => onSelectDay(day)}
      >
        <div className='text-day'>{day.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
        <div className='number-day'>{day.getDate()}</div>
        {hasEvents && <div className="event-dot"></div>}
      </div>
    );
  }
  
  return <div className="week-days-selector">{days}</div>;
};

// Подкомпонент для отображения календаря месяца
const MonthCalendar = ({ currentMonth, onDaySelect, events, selectedDay }) => {
  const parseLocalDate = (dateString) => {
    // Если это Moment-объект, преобразуем в строку в ISO формате
    if (dateString._isAMomentObject) {
      const isoString = dateString.toISOString(); // "2025-05-20T10:00:00.000Z"
      return new Date(isoString);
    }

    // Если это строка, обрабатываем как раньше
    if (typeof dateString === 'string') {
      const localDateString = dateString.endsWith('Z') 
        ? dateString.slice(0, -1) 
        : dateString;
      return new Date(localDateString);
    }

    // Если это уже Date-объект, возвращаем как есть
    if (dateString instanceof Date) {
      return dateString;
    }

    throw new Error('Unsupported date format');
  };

  const hasEventsForDay = (day) => {
    return events.some(event => {
      const eventDate = parseLocalDate(event.notify_date);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const isSameDay = (day1, day2) => {
    return (
      day1.getDate() === day2.getDate() &&
      day1.getMonth() === day2.getMonth() &&
      day1.getFullYear() === day2.getFullYear()
    );
  };

  const renderHeader = () => {
    return (
      <div className="month-header">
        <div className="month-title">
          {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </div>
        <div className="week-days">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="week-day-name">{day}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(monthStart.getDate() - monthStart.getDay() + (monthStart.getDay() === 0 ? -6 : 1));
    const endDate = new Date(monthEnd);
    endDate.setDate(monthEnd.getDate() + (7 - monthEnd.getDay()));

    const days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
      const cloneDay = new Date(day);
      const hasEvents = hasEventsForDay(cloneDay);
      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
      const isSelected = selectedDay && isSameDay(cloneDay, selectedDay);
      
      days.push(
        <div
          key={day.toString()}
          className={`calendar-day 
            ${!isCurrentMonth ? 'other-month' : ''} 
            ${hasEvents ? 'has-events' : ''}
            ${isSelected ? 'selected' : ''}`}
          onClick={() => isCurrentMonth && onDaySelect(cloneDay)}
        >
          <span className="day-number">{day.getDate()}</span>
          {hasEvents && <div className="event-dot"></div>}
        </div>
      );
      day.setDate(day.getDate() + 1);
    }

    return <div className="days-grid">{days}</div>;
  };

  return (
    <div className="month-calendar">
      {renderHeader()}
      {renderDays()}
    </div>
  );
};

// Подкомпонент для отображения заголовка с выбором режима просмотра
const ViewHeader = ({ sort, today, onSortChange, onMonthChange }) => {
  return (
    <header className="event-header">
      <div className="date-range">
        <span>{today.toLocaleDateString('ru-RU', { weekday: 'long' })}</span>
        <span>{today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
      </div>
      <nav className="view-mode">
        <div 
          className={`view-mode-btn ${sort === 'day' ? 'active' : ''}`}
          onClick={() => onSortChange('day')}
        >
          День
        </div>
        <div 
          className={`view-mode-btn ${sort === 'week' ? 'active' : ''}`}
          onClick={() => onSortChange('week')}
        >
          Неделя
        </div>
        <div 
          className={`view-mode-btn ${sort === 'month' ? 'active' : ''}`}
          onClick={() => onSortChange('month')}
        >
          Месяц
        </div>
      </nav>
      {sort === 'month' && (
        <div className="month-navigation">
          <button onClick={() => onMonthChange(-1)}>
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.4853 9.49909H1.51472M1.51472 9.49909L10 17.9844M1.51472 9.49909L10 1.01381" stroke="black" stroke-width="2"/>
            </svg>
          </button>
          <button onClick={() => onMonthChange(1)}>
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-0.000906313 9.49909H16.9697M16.9697 9.49909L8.48438 17.9844M16.9697 9.49909L8.48438 1.01381" stroke="black" stroke-width="2"/>
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

// Подкомпонент для отображения временных слотов и событий
const TimeColumn = ({ events, sort, selectedDay, navigate }) => {
  const timeColumnRef = useRef(null);
  const [eventsByHour, setEventsByHour] = useState({});
  const [firstEventHour, setFirstEventHour] = useState(null);
  const [hasEvents, setHasEvents] = useState(false);

  const parseLocalDate = (dateString) => {
    // Если это Moment-объект, преобразуем в строку в ISO формате
    if (dateString._isAMomentObject) {
      const isoString = dateString.toISOString(); // "2025-05-20T10:00:00.000Z"
      return new Date(isoString);
    }

    // Если это строка, обрабатываем как раньше
    if (typeof dateString === 'string') {
      const localDateString = dateString.endsWith('Z') 
        ? dateString.slice(0, -1) 
        : dateString;
      return new Date(localDateString);
    }

    // Если это уже Date-объект, возвращаем как есть
    if (dateString instanceof Date) {
      return dateString;
    }

    throw new Error('Unsupported date format');
  };

  const formatTime = (dateString) => {
    const date = new Date(parseLocalDate(dateString));
    if (isNaN(date.getTime())) return '--:--';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getEventsForDay = (day) => {
    const dayEvents = events.filter(event => {
      const eventDate = parseLocalDate(event.notify_date);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
    setHasEvents(dayEvents.length > 0);
    return dayEvents;
  };

  useEffect(() => {
    let displayedEvents = [];
    
    if (sort === 'day') {
      const today = new Date();
      displayedEvents = getEventsForDay(today);
    } else if (sort === 'week' || sort === 'month') {
      displayedEvents = getEventsForDay(selectedDay);
    } else {
      displayedEvents = events;
      setHasEvents(events.length > 0);
    }

    const getEventHour = (dateString) => {
      const date = parseLocalDate(dateString);
      return date.getHours();
    };

    const groupedEvents = displayedEvents.reduce((acc, event) => {
      const hour = getEventHour(event.notify_date);
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(event);
      return acc;
    }, {});

    setEventsByHour(groupedEvents);
    setFirstEventHour(
      displayedEvents.length > 0 
        ? Math.min(...Object.keys(groupedEvents).map(Number))
        : null
    );
  }, [events, sort, selectedDay]);

  useEffect(() => {
    if ((sort === 'day' || sort === 'week' || sort === 'month') && firstEventHour !== null && timeColumnRef.current) {
      const timer = setTimeout(() => {
        const hourElement = document.querySelector(`[data-hour-slot="${firstEventHour}"]`);
        if (hourElement) {
          hourElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sort, firstEventHour, eventsByHour, selectedDay]);

  return (
    <div className="time-column" ref={timeColumnRef}>
      {hasEvents ? (
        [...Array(24)].map((_, hour) => (
          <div key={hour} className="time-slot" data-hour-slot={hour}>
            <span className='time'>{`${hour}:00`}</span>
            {(sort === 'day' || sort === 'week' || sort === 'month') && eventsByHour[hour]?.length > 0 && (
              <div className="events-container">
                {eventsByHour[hour].map(event => (
                  <div 
                    key={event.id} 
                    className="event-item"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    <div className='time'>{formatTime(event.notify_date)}</div>
                    <div className='title'>{event.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="no-events-message">
          События не запланированы
        </div>
      )}
    </div>
  );
};

// Основной компонент
const EventListAll = ({ events, sort: initialSort, onEventCreated, userID }) => {
  const navigate = useNavigate();
  const [sort, setSort] = useState(initialSort);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  

  const handleMonthChange = (monthsToAdd) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + monthsToAdd);
    setCurrentMonth(newMonth);
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  if (!events) {
    return (
      <div style={{ textAlign: "center", padding: "24px" }}>
        <p>Загрузка данных событий...</p>
      </div>
    );
  }

  const handleCreateEvent = async (eventData) => {
    setLoading(true);
    try {
      const response = await createEvent(eventData, userID);
      messageApi.success("Событие успешно создано!");
      onEventCreated(response.event_info); // Обновляем список событий в родительском компоненте
      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка при создании события:", error);
      messageApi.error("Ошибка при создании события: " + (error.message || "попробуйте позже"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="event-list">
        <ViewHeader 
          sort={sort} 
          today={today} 
          onSortChange={setSort}
          onMonthChange={handleMonthChange}
        />

        {sort === 'week' && (
          <WeekDaySelector 
            selectedDay={selectedDay}
            onSelectDay={handleDaySelect}
            events={events}
          />
        )}

        {sort === 'month' && (
          <MonthCalendar 
            currentMonth={currentMonth}
            onDaySelect={setSelectedDay}
            events={events}
            selectedDay={selectedDay}
          />
        )}

        <div className="event-grid">
          {(sort === 'day' || sort === 'week' || (sort === 'month' && selectedDay)) && (
            <TimeColumn 
              events={events} 
              sort={sort} 
              selectedDay={sort === 'month' ? selectedDay : sort === 'week' ? selectedDay : today} 
              navigate={navigate} 
            />
          )}
        </div>

        <div className="add-event" onClick={() => setIsModalOpen(true)}>
          <div className="add-event-btn">
            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 0.5V15.5" stroke="white" strokeWidth="2"/>
              <path d="M0 8L15 8" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
        </div>
        
        <Modal
          isOpen={isModalOpen}
          width="100%"
          onClose={() => setIsModalOpen(false)}
          animation="slide"
          title="Создание события"
          closeButton={true}
        >
          <EventAddForm 
            onFinish={handleCreateEvent}
            loading={loading}
            initialValues={{
              title: "",
              start_date: moment(),
              recurrence: {
                frequency: null,
                interval: null,
              },
              start_time: moment(),
              end_date: moment(),
              end_time: moment(),
              notify_date: moment(),
              notify_time: moment(),
              event_type: "single",
              notify_before: 15
            }}
          />
        </Modal>
      </div>
    </>
  );
};

EventListAll.propTypes = {
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
      participants: PropTypes.arrayOf(
        PropTypes.shape({
          avatar: PropTypes.string,
          name: PropTypes.string,
        })
      ),
    })
  ),
  sort: PropTypes.string,
};

EventListAll.defaultProps = {
  sort: 'day',
};

export default EventListAll;