import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    Tag,
    Typography,
    message,
    Spin,
    Switch,
    Divider,
    DatePicker
} from 'antd';
import { updateUser } from '../store/user';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;

const AdminUserDetail = ({ user, onUpdatedUsers, admin }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState(null);

    // Находим пользователя по ID
    useEffect(() => {
        if (!user || user.length === 0) return;

        setUserData(user);
        form.setFieldsValue({
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            talagramID: user.talagramID,
            role: user.role,
            status: user.status,
            tariff: user.tariff || 0,
            date_pay_tariff: user.date_pay_tariff ? dayjs(user.date_pay_tariff) : null
        });
    }, [id, user, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const updatedUser = {
                ...userData,
                ...values,
                date_pay_tariff: values.date_pay_tariff ? values.date_pay_tariff.format('YYYY-MM-DD') : null
            };

            const response = await updateUser(updatedUser, admin);

            if (response?.success) {
                message.success('Данные пользователя обновлены');
                setTimeout(() => {
                    navigate('/admin/users');
                }, 500);
            } else {
                throw new Error(response?.error || 'Ошибка при обновлении');
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading || !userData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '0 12px' }}>
            <Button
                type="link"
                onClick={() => navigate('/admin/users')}
                style={{ marginBottom: 15 }}
            >
                ← Назад к списку
            </Button>

            <Card title={`Редактирование пользователя #${userData.id}`}>
                <Form form={form} layout="vertical">
                    <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                        <Form.Item
                            label="Имя"
                            name="first_name"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Имя" readOnly />
                        </Form.Item>

                        <Form.Item
                            label="Фамилия"
                            name="last_name"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Фамилия" readOnly />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                        <Form.Item
                            label="Username"
                            name="username"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="@username" readOnly />
                        </Form.Item>

                        <Form.Item
                            label="Telegram ID"
                            name="talagramID"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="ID в Telegram" readOnly />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                        <Form.Item
                            label="Роль"
                            name="role"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Option value={0}>Пользователь</Option>
                                <Option value={1}>Администратор</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Статус"
                            name="status"
                            style={{ flex: 1 }}
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Тариф"
                        name="tariff"
                    >
                        <Select>
                            <Option value={0}>Бесплатный</Option>
                            <Option value={1}>Платный</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Дата оплаты тарифа"
                        name="date_pay_tariff"
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD.MM.YYYY"
                            placeholder="Выберите дату"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            loading={saving}
                        >
                            Сохранить изменения
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AdminUserDetail;