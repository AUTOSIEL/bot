import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import './App.css';
import { authUser } from './store/user';
import MainPage from './pages/MainPage';
import EventsPage from './pages/EventsPage';
import UserInfo from './pages/UserInfo';
import Header from './components/Header';
import EventDetailPage from './pages/EventDetailPage';
import NotesPage from './pages/NotesPage';
import NoteDetailPage from './pages/NoteDetailPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import AdminUserList from './pages/AdminUserList';
import AdminUserDetail from './pages/AdminUserDetail';

function App() {
  const [user, setUser] = useState(null);
  const [userDB, setUserDB] = useState(null);
  const [isUserSent, setIsUserSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectUserAdmin, setSelectUserAdmin] = useState([]);
  const navigate = useNavigate();

  // Инициализация Telegram WebApp
  useEffect(() => {
    WebApp.expand();
    WebApp.ready();

    if (WebApp.initDataUnsafe?.user) {
      const tgUser = WebApp.initDataUnsafe.user;
      setUser(tgUser);
      console.log('Telegram User:', tgUser);
    }
  }, []);

  // Отправка данных пользователя на сервер
  useEffect(() => {
    const sendUserData = async () => {
      if (!user || isUserSent) return;

      setLoading(true);
      setError(null);

      try {
        const userDB = await authUser(user);
        setUserDB(userDB);
        setIsUserSent(true);
        if (userDB?.user_data?.role === 1) {
          setIsAdmin(true);
        }
        
        // Если пользователь неактивен, перенаправляем на страницу блокировки
        if (userDB?.user_data?.status === 0) {
          navigate('/blocked');
        }
        
        console.log('Пользователь успешно авторизован', userDB);
      } catch (err) {
        console.error('Ошибка при авторизации пользователя:', err);
        setError('Ошибка авторизации. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    sendUserData();
  }, [user, isUserSent, navigate]);

  const handleClose = () => {
    WebApp.close();
  };

  const updateUserDB = (newUserInfo) => {
    setUserDB(prev => ({
      ...prev,
      user_data: {
        ...prev.user_data,
        userInfo: newUserInfo
      }
    }));
  };

  const updateEvents = (updatedEvents) => {
    setUserDB(prev => ({
      ...prev,
      user_event: updatedEvents
    }));
  };

  const updateNotes = (updatedNotes) => {
    setUserDB(prev => ({
      ...prev,
      user_note: updatedNotes
    }));
  };

  const updateTasks = (updatedTasks) => {
    setUserDB(prev => ({
      ...prev,
      user_task: updatedTasks
    }));
  };

  const AdminRoute = ({ element, isAdmin, ...props }) => {
    return isAdmin ? (
      element
    ) : (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h3>Доступ запрещен</h3>
        <p>Эта страница доступна только администраторам</p>
        <Link to="/">Вернуться на главную</Link>
      </div>
    );
  };

  const ProtectedRoute = ({ element, userStatus, ...props }) => {
    if (userStatus === 0) {
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h3>Доступ ограничен</h3>
          <p>Ваш аккаунт деактивирован. Обратитесь к администратору. <Link to="https://t.me/MindMy_Start">@MindMy_Start</Link></p>
          <Link to="/">Вернуться на главную</Link>
        </div>
      );
    }
    return element;
  };

  const BlockedPage = () => (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h3>Доступ ограничен</h3>
      <p>Ваш аккаунт деактивирован. Обратитесь к администратору. <Link to="https://t.me/MindMy_Start">@MindMy_Start</Link></p>
    </div>
  );

  return (
    <div className="App">
      <Header user={user} userDB={userDB} />

      <main>
        <Routes>
          <Route path="/blocked" element={<BlockedPage />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute 
                userStatus={userDB?.user_data?.status} 
                element={<MainPage user={user} user_data={userDB} onUpdatedTasks={updateTasks} />} 
              />
            } 
          />
          
          <Route
            path="/events"
            element={
              <ProtectedRoute
                userStatus={userDB?.user_data?.status}
                element={
                  loading ? (
                    <div>Загрузка...</div>
                  ) : error ? (
                    <div>{error}</div>
                  ) : userDB ? (
                    <EventsPage 
                      events={userDB?.user_event}
                      userID={userDB?.user_data.id}
                      onUpdateEvents={updateEvents} 
                    />
                  ) : (
                    <div>Нет доступных событий</div>
                  )
                }
              />
            }
          />
          
          {/* Админские маршруты */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute
                isAdmin={isAdmin}
                element={<AdminUserList currentUser={userDB?.user_data || []} onSelectedUserAdmin={setSelectUserAdmin} />}
              />
            }
          />
          <Route
            path="/admin/user/:id"
            element={
              <AdminRoute
                isAdmin={isAdmin}
                element={<AdminUserDetail admin={userDB?.user_data || []} user={selectUserAdmin || {}} />}
              />
            }
          />
          
          {/* Остальные защищенные маршруты */}
          <Route 
            path="/user-info" 
            element={
              <ProtectedRoute
                userStatus={userDB?.user_data?.status}
                element={<UserInfo userInfo={userDB?.user_data.userInfo} userID={userDB?.user_data.id} onUpdate={updateUserDB} />}
              />
            } 
          />
          
          <Route 
            path="/event/:id" 
            element={
              <ProtectedRoute
                userStatus={userDB?.user_data?.status}
                element={<EventDetailPage events={userDB?.user_event || []} onUpdate={updateEvents} />}
              />
            } 
          />
          
          <Route
            path="/notes"
            element={
              <ProtectedRoute
                userStatus={userDB?.user_data?.status}
                element={
                  loading ? (
                    <div>Загрузка...</div>
                  ) : error ? (
                    <div>{error}</div>
                  ) : userDB ? (
                    <NotesPage 
                      notes={userDB?.user_note}
                      userID={userDB?.user_data.id}
                      onUpdateNotes={updateNotes} 
                    />
                  ) : (
                    <div>Нет доступных заметок</div>
                  )
                }
              />
            }
          />
          
          <Route 
            path="/note/:id" 
            element={
              <ProtectedRoute
                userStatus={userDB?.user_data?.status}
                element={<NoteDetailPage notes={userDB?.user_note || []} onUpdate={updateNotes} />}
              />
            } 
          />
          
          <Route
            path="/tasks"
            element={
              <ProtectedRoute
                userStatus={userDB?.user_data?.status}
                element={
                  loading ? (
                    <div>Загрузка...</div>
                  ) : error ? (
                    <div>{error}</div>
                  ) : userDB ? (
                    <TasksPage 
                      tasks={userDB?.user_task}
                      userID={userDB?.user_data.id}
                      onUpdateTasks={updateTasks} 
                    />
                  ) : (
                    <div>Нет доступных задач</div>
                  )
                }
              />
            }
          />
          
          <Route 
            path="/task/:id" 
            element={
              <ProtectedRoute
                userStatus={userDB?.user_data?.status}
                element={<TaskDetailPage tasks={userDB?.user_task || []} onUpdate={updateTasks} />}
              />
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;