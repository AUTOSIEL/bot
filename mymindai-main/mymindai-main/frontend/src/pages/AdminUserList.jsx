import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tag, Typography, List, Input, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../store/user';

const { Text } = Typography;
const { Search } = Input;

const ITEMS_PER_PAGE = 10;

const AdminUserList = ({ currentUser, onSelectedUserAdmin }) => {
  const [allUsers, setAllUsers] = useState([]); // Все пользователи с бэкенда
  const [displayedUsers, setDisplayedUsers] = useState([]); // Отображаемые пользователи
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Загрузка всех пользователей
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      try {
        const response = await getUsers(currentUser);
        if (!response?.success) throw new Error(response?.error || 'Ошибка загрузки');
        setAllUsers(response.users || []);
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchAllUsers();
  }, [currentUser]);

  // Фильтрация и пагинация
  useEffect(() => {
    if (allUsers.length === 0) return;

    // Фильтрация по поисковому запросу
    const filtered = allUsers.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.username?.toLowerCase().includes(searchLower) ||
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower) ||
        user.talagramID?.toString().includes(searchQuery)
      );
    });

    // Пагинация
    const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);
    setDisplayedUsers(paginated);
  }, [allUsers, searchQuery, page]);

  // Обработчик скролла для подгрузки
  const handleScroll = useCallback(() => {
    if (loading || loadingMore) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight - 100;

    if (scrollPosition > pageHeight) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
      setLoadingMore(false);
    }
  }, [loading, loadingMore]);

  // Подписываемся на скролл
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const selectUser = (user) => {
    onSelectedUserAdmin(user);
    navigate(`/admin/user/${user.id}`);
  }

  return (
    <div style={{ padding: '0 12px' }}>
      <Search
        placeholder="Поиск по имени, username или ID"
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setPage(1); // Сброс пагинации при новом поиске
        }}
        style={{ marginBottom: 16 }}
      />

      <Spin spinning={loading}>
        <List
          dataSource={displayedUsers}
          renderItem={(user) => (
            <Card 
              onClick={() => selectUser(user)}
              key={user.id}
              style={{ 
                marginBottom: 16,
                borderRadius: 8,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  {user.first_name} {user.last_name}
                </Text>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">@{user.username}</Text>
                  {user.talagramID && <Text type="secondary">ID: {user.talagramID}</Text>}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Tag color={user.role === 1 ? 'red' : 'blue'}>
                  {user.role === 1 ? 'Админ' : 'Пользователь'}
                </Tag>
                <Tag color={user.status === 1 ? 'green' : 'orange'}>
                  {user.status === 1 ? 'Активен' : 'Неактивен'}
                </Tag>
                {user.created_at && (
                  <Tag>Рег: {formatDate(user.created_at)}</Tag>
                )}
              </div>
            </Card>
          )}
        />
        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Spin size="small" />
          </div>
        )}
        {!loading && displayedUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Text type="secondary">Пользователи не найдены</Text>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default AdminUserList;