import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Select, Button, message, InputNumber, Col, Row } from "antd";
import { DatePicker } from 'antd-mobile'
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Modal from '../components/Modal';
import { updateEvent, deleteEvent } from '../store/event';
import './TimePicker.css'

const EventDetailPage = ({ events, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [IsModalRemoveOpen, setIsModalRemoveOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find(event => event.id.toString() === id);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [startDateVisible, setStartDateVisible] = useState(false)
  const [startTimeVisible, setStartTimeVisible] = useState(false)
  const [endDateVisible, setEndDateVisible] = useState(false)
  const [endTimeVisible, setEndTimeVisible] = useState(false)
  const [notifyDateVisible, setNotifyDateVisible] = useState(false)
  const [notifyTimeVisible, setNotifyTimeVisible] = useState(false)

  const DateTimeInput = ({ 
    dateName, 
    timeName, 
    dateLabel, 
    timeLabel,
    form,
    required = false 
  }) => {
    return (
      <Form.Item label={`${dateLabel} и ${timeLabel}`} required={required}>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item
              name={dateName}
              rules={[{ required, message: `Выберите ${dateLabel.toLowerCase()}` }]}
              noStyle
            >
              <div onClick={() => {
                if (dateName === 'start_date') setStartDateVisible(true)
                else if (dateName === 'end_date') setEndDateVisible(true)
                else setNotifyDateVisible(true)
              }}>
                <Input
                  style={{ height: 50}}
                  placeholder={`Выберите ${dateLabel.toLowerCase()}`} 
                  readOnly 
                  value={form.getFieldValue(dateName)?.format('DD.MM.YYYY') || ''}
                />
              </div>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={timeName}
              rules={[{ required, message: `Выберите ${timeLabel.toLowerCase()}` }]}
              noStyle
            >
              <div onClick={() => {
                if (timeName === 'start_time') setStartTimeVisible(true)
                else if (timeName === 'end_time') setEndTimeVisible(true)
                else setNotifyTimeVisible(true)
              }}>
                <Input 
                  style={{ height: 50}}
                  placeholder={`Выберите ${timeLabel.toLowerCase()}`} 
                  readOnly 
                  value={form.getFieldValue(timeName)?.format('HH:mm') || ''}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    )
  }

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

  if (!event) {
    return <div>Событие не найдено</div>;
  }
  if(event.event_type == 'recurring' && !event.recurrence){
    event.recurrence = {
      recurrence: null,
      frequency: null
    };
  }
  let event_type = 'Однократное';
  let recurring_descr = null;
  if(event.event_type == 'recurring'){
    event_type = 'Регулярное';
    
    if(event.recurrence && event.recurrence.frequency == "every_n_minutes"){
      const interval = event.recurrence.interval;
      recurring_descr = (
        <p>
          <span>Напоминать:</span> 
          <span>каждые {interval} {getMinuteWord(interval)}</span>
        </p>
      );
    }
    if(event.recurrence && event.recurrence.frequency == "daily"){
      const interval = event.recurrence.interval;
      recurring_descr = (
        <p>
          <span>Напоминать:</span> 
          <span>каждые {interval} {getDayWord(interval)}</span>
        </p>
      );
    }
    if(event.recurrence && event.recurrence.frequency == "weekly"){
      const interval = event.recurrence.interval;
      recurring_descr = (
        <p>
          <span>Напоминать:</span> 
          <span>каждые {interval} {getWeekWord(interval)}</span>
        </p>
      );
    }
    if(event.recurrence && event.recurrence.frequency == "monthly"){
      const interval = event.recurrence.interval;
      recurring_descr = (
        <p>
          <span>Напоминать:</span> 
          <span>каждые {interval} {getMonthWord(interval)}</span>
        </p>
      );
    }
  }

  function getMinuteWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'минут';
    if (lastDigit === 1) return 'минуту';
    if (lastDigit >= 2 && lastDigit <= 4) return 'минуты';
    return 'минут';
  }

  function getDayWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
  }

  function getWeekWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'недель';
    if (lastDigit === 1) return 'неделю';
    if (lastDigit >= 2 && lastDigit <= 4) return 'недели';
    return 'недель';
  }

  function getMonthWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'месяцев';
    if (lastDigit === 1) return 'месяц';
    if (lastDigit >= 2 && lastDigit <= 4) return 'месяца';
    return 'месяцев';
  }

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const combineDateTime = (date, time) => {
        if (!date || !time) return null;
        
        // Создаем момент в UTC режиме
        return moment.utc(date)
          .set({
            hour: time.hour(),
            minute: time.minute(),
            second: 0
          })
          .toISOString();
      };
      const formattedValues = {
        ...values,
        start_date: combineDateTime(values.start_date, values.start_time),
        end_date: combineDateTime(values.end_date, values.end_time),
        notify_date: combineDateTime(values.notify_date, values.notify_time),
        ...(values.event_type === 'recurring' && {
          recurrence: {
            frequency: values.frequency,
            interval: values.interval
          }
        }),
        // Удаляем временные поля
        start_time: undefined,
        end_time: undefined,
        notify_time: undefined,
        frequency: undefined,
        interval: undefined
      };
      const response = await updateEvent(formattedValues, event.id);
      console.log("Ответ сервера:", response); // Для отладки
      
      if (!response) {
        throw new Error("Нет ответа от сервера");
      }

      messageApi.success("Данные сохранены!");
      const updatedEvents = events.map(e => 
        e.id === event.id ? { ...e, ...values } : e
      );
      onUpdate(updatedEvents);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка:", error);
      messageApi.error("Ошибка: " + (error.message || "попробуйте позже"));
    } finally {
      console.log('Setting loading to false');
      setTimeout(function(){
        setLoading(false);
      }, 1500);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form validation failed:', errorInfo);
    messageApi.error("Проверьте заполнение всех полей");
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteEvent(event.id); // Вызов API для удаления
      messageApi.success('Событие успешно удалено');
      const updatedEvents = Array.isArray(events)
      ? events.filter(e => e.id !== event.id)
      : [];
      onUpdate(updatedEvents);
      setIsModalRemoveOpen(false);
      navigate(`/events`)
    } catch (error) {
      console.error('Ошибка при удалении события:', error);
      messageApi.error('Не удалось удалить событие');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>{contextHolder}
    <div className="event-detail">
      <h2>{event.title}</h2>
      <p>
        <span>Дата начала события:</span> 
        <span>{event.start_date ? new Date(parseLocalDate(event.start_date)).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Не указана'}</span>
      </p>
      <p>
        <span>Дата окончания события:</span>
        <span>{event.end_date ? new Date(parseLocalDate(event.end_date)).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Не указана'}</span>
      </p>
      <p>
        <span>Дата напоминания:</span> 
        <span>{event.notify_date ? new Date(parseLocalDate(event.notify_date)).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Не указана'}</span>
      </p>
      <p>
        <span>Тип:</span> 
        <span>{event_type}</span>
      </p>
      {event.event_type === 'recurring' && recurring_descr}
      <p>
        <span>Напомнить за:</span> 
        <span>{event.notify_before} минут</span>
      </p>
      <div className='event-actions'>
        <Button style={{ height: 50}} type="primary" block onClick={() => setIsModalOpen(true)}>
          Изменить
        </Button>
        <Button className="custom-danger-button" type="danger" onClick={() => setIsModalRemoveOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.25 4.5H3.75H15.75" stroke="#F32828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5" stroke="#F32828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </Button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        animation="slide"
        width="100%"
        title="Изменение события"
        closeButton={true}
      >
        <Form
          form={form}
          className="formUserInfo"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            title: event.title,
            start_date: moment.utc(event.start_date),
            start_time: moment.utc(event.start_date),
            end_date: moment.utc(event.end_date),
            end_time: moment.utc(event.end_date),
            notify_date: moment.utc(event.notify_date),
            notify_time: moment.utc(event.notify_date),
            event_type: event.event_type,
            notify_before: event.notify_before,
            ...(event.event_type === 'recurring' && event.recurrence && {
              frequency: event.recurrence.frequency,
              interval: event.recurrence.interval
            })
          }}
        >
          <Form.Item
            name="title"
            label="Название события"
            rules={[{ required: true, message: 'Введите название события' }]}
          >
            <Input style={{ height: 50}} placeholder="Введите название" />
          </Form.Item>

          <DateTimeInput
            dateName="start_date"
            timeName="start_time"
            dateLabel="Дата начала"
            timeLabel="время"
            form={form}
            required
          />

          <DateTimeInput
            dateName="end_date"
            timeName="end_time"
            dateLabel="Дата окончания"
            timeLabel="время"
            form={form}
          />

          <DateTimeInput
            dateName="notify_date"
            timeName="notify_time"
            dateLabel="Дата напоминания"
            timeLabel="время"
            form={form}
            required
          />

          <Form.Item
            name="notify_before"
            label="Напомнить за (минут)"
            rules={[{ required: true, message: 'Укажите время напоминания' }]}
          >
            <InputNumber min={1} style={{ width: '100%', height: 50 }} />
          </Form.Item>

          <Form.Item
            name="event_type"
            label="Тип события"
            rules={[{ required: true, message: 'Выберите тип события' }]}
          >
            <Select style={{ height: 50}}>
              <Select.Option value="single">Однократное</Select.Option>
              <Select.Option value="recurring">Регулярное</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.event_type !== currentValues.event_type}
          >
            {({ getFieldValue }) => (
              getFieldValue('event_type') === 'recurring' ? (
                <>
                  <Form.Item
                    name="frequency"
                    label="Периодичность"
                    rules={[{ required: true, message: 'Выберите периодичность' }]}
                  >
                    <Select style={{ height: 50}}>
                      <Select.Option value="daily">Ежедневно</Select.Option>
                      <Select.Option value="weekly">Еженедельно</Select.Option>
                      <Select.Option value="monthly">Ежемесячно</Select.Option>
                      <Select.Option value="every_n_minutes">Каждые N минут</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="interval"
                    label="Интервал"
                    rules={[{ required: true, message: 'Укажите интервал' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%', height: 50 }} />
                  </Form.Item>
                </>
              ) : null
            )}
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%', height: 50 }}
            >
              Сохранить изменения
            </Button>
          </Form.Item>

          <DatePicker
            visible={startDateVisible}
            onClose={() => setStartDateVisible(false)}
            cancelText="Отмена"
            confirmText="OK"
            precision="day"
            className="custom-datepicker-order"
            onConfirm={date => {
              form.setFieldsValue({ start_date: moment(date) })
            }}
          />
          <DatePicker
            visible={startTimeVisible}
            cancelText="Отмена"
            confirmText="OK"
            onClose={() => setStartTimeVisible(false)}
            precision="minute"
            className="time-picker-hidden-date"
            onConfirm={time => {
              form.setFieldsValue({ start_time: moment(time) })
            }}
          />

          <DatePicker
            visible={endDateVisible}
            onClose={() => setEndDateVisible(false)}
            cancelText="Отмена"
            confirmText="OK"
            precision="day"
            className="custom-datepicker-order"
            onConfirm={date => {
              form.setFieldsValue({ end_date: moment(date) })
            }}
          />
          <DatePicker
            visible={endTimeVisible}
            cancelText="Отмена"
            confirmText="OK"
            onClose={() => setEndTimeVisible(false)}
            precision="minute"
            className="time-picker-hidden-date"
            onConfirm={time => {
              form.setFieldsValue({ end_time: moment(time) })
            }}
          />

          <DatePicker
            visible={notifyDateVisible}
            onClose={() => setNotifyDateVisible(false)}
            cancelText="Отмена"
            confirmText="OK"
            precision="day"
            className="custom-datepicker-order"
            onConfirm={date => {
              form.setFieldsValue({ notify_date: moment(date) })
            }}
          />
          <DatePicker
            visible={notifyTimeVisible}
            cancelText="Отмена"
            confirmText="OK"
            onClose={() => setNotifyTimeVisible(false)}
            precision="minute"
            className="time-picker-hidden-date"
            onConfirm={time => {
              form.setFieldsValue({ notify_time: moment(time) })
            }}
          />
        </Form>
      </Modal>
      <Modal
        isOpen={IsModalRemoveOpen}
        onClose={() => setIsModalRemoveOpen(false)}
        animation="slide"
        width="100%"
        title="Вы уверены, что хотите удалить событие?"
        closeButton={true}
      >
        <p>Это действие нельзя отменить.</p>
        <div className='event-actions'>
          <Button style={{ height: 50}} block onClick={() => setIsModalRemoveOpen(false)}>
            Отмена
          </Button>
          <Button style={{ height: 50}} type="primary" block onClick={() => handleDelete()}>
            Да
          </Button>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default EventDetailPage;