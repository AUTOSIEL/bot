import React from 'react';
import EventList from '../components/EventList';
import NoteList from '../components/NoteList';
import TasksList from '../components/TasksList';
const MainPage = ({ user, user_data, onUpdatedTasks }) => {
  return (
    <div className="main-page">
      {user ? (
        <>
          <div className="events-page">
            <h2>Ближайшие события</h2>
            <EventList events={user_data?.user_event} sort="now" />
          </div>
          <div className="tasks-page">
            <h2>Ваши задачи</h2>
            <TasksList tasks={user_data?.user_task} onUpdated={onUpdatedTasks} />
          </div>
          <div className="notes-page">
            <h2>Ваши заметки</h2>
            <NoteList notes={user_data?.user_note} />
          </div>
        </>
      ) : (
        <div className="non-telegram">
          <h3>Приложение запущено вне Telegram</h3>
          <p>Откройте его через Telegram WebApp для авторизации</p>
        </div>
      )}
    </div>
  );
};

export default MainPage;