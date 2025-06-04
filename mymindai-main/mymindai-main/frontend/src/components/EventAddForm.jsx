import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, InputNumber, Col, Row } from "antd";
import { DatePicker } from 'antd-mobile'
import moment from 'moment';
import { Picker } from 'antd-mobile';

const EventForm = ({ onFinish, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [startDateVisible, setStartDateVisible] = useState(false);
  const [startTimeVisible, setStartTimeVisible] = useState(false);
  const [endDateVisible, setEndDateVisible] = useState(false);
  const [endTimeVisible, setEndTimeVisible] = useState(false);
  const [notifyDateVisible, setNotifyDateVisible] = useState(false);
  const [notifyTimeVisible, setNotifyTimeVisible] = useState(false);
  const [notifyBeforeVisible, setNotifyBeforeVisible] = useState(false);
  const [intervalVisible, setIntervalVisible] = useState(false);

  const getMaxInterval = () => {
    const freq = form.getFieldValue('frequency');
    switch (freq) {
      case 'daily': return 24; // часы
      case 'weekly': return 7; // дни
      case 'monthly': return 30; // дни
      case 'every_n_minutes': return 1440; // минуты в сутки
      default: return 30;
    }
  };

  const getIntervalLabel = () => {
    const freq = form.getFieldValue('frequency');
    switch (freq) {
      case 'daily': return 'ч.';
      case 'weekly': return 'дн.';
      case 'monthly': return 'дн.';
      case 'every_n_minutes': return 'мин.';
      default: return '';
    }
  };

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    return moment.utc(date)
      .set({
        hour: time.hour(),
        minute: time.minute(),
        second: 0
      })
      .toISOString();
  };

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      start_date: combineDateTime(values.start_date, values.start_time),
      end_date: combineDateTime(values.end_date, values.end_time),
      notify_date: combineDateTime(values.notify_date, values.notify_time),
      ...(values.event_type === 'recurring' && values.frequency === 'every_n_minutes' && {
        recurrence: {
          frequency: values.frequency,
          interval: values.interval
        }
      }),
      ...(values.event_type === 'recurring' && values.frequency !== 'every_n_minutes' && {
        recurrence: {
          frequency: values.frequency
        }
      }),
      start_time: undefined,
      end_time: undefined,
      notify_time: undefined
    };
    onFinish(formattedValues);
  };

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
                  style={{ height: 50 }}
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
                  style={{ height: 50 }}
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

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Form.Item
        name="title"
        label="Название события"
        rules={[{ required: true, message: 'Введите название события' }]}
      >
        <Input style={{ height: 50 }} placeholder="Введите название" />
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
        form={form}
        timeLabel="время"
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
        rules={[{ message: 'Укажите время напоминания' }]}
      >
        <div onClick={() => setNotifyBeforeVisible(true)}>
          <Input
            style={{ height: 50 }}
            placeholder="Выберите количество минут"
            readOnly
            value={form.getFieldValue('notify_before') || ''}
          />
        </div>
      </Form.Item>

      <Form.Item
        name="event_type"
        label="Тип события"
        rules={[{ required: true, message: 'Выберите тип события' }]}
      >
        <Select style={{ height: 50 }}>
          <Select.Option value="single">Однократное</Select.Option>
          <Select.Option value="recurring">Регулярное</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item noStyle shouldUpdate={(prev, curr) =>
        prev.event_type !== curr.event_type || prev.frequency !== curr.frequency
      }>
        {({ getFieldValue }) => {
          const eventType = getFieldValue('event_type');
          const frequency = getFieldValue('frequency');

          return eventType === 'recurring' ? (
            <>
              <Form.Item
                name="frequency"
                label="Периодичность"
                rules={[{ required: true, message: 'Выберите периодичность' }]}
              >
                <Select style={{ height: 50 }}>
                  <Select.Option value="daily">Ежедневно</Select.Option>
                  <Select.Option value="weekly">Еженедельно</Select.Option>
                  <Select.Option value="monthly">Ежемесячно</Select.Option>
                  <Select.Option value="every_n_minutes">Каждые N минут</Select.Option>
                </Select>
              </Form.Item>

              {frequency === 'every_n_minutes' && (
                <Form.Item
                  name="interval"
                  label="Интервал в минутах"
                  rules={[{ required: true, message: 'Укажите интервал' }]}
                >
                  <div onClick={() => setIntervalVisible(true)}>
                    <Input
                      style={{ height: 50 }}
                      placeholder="Укажите интервал"
                      readOnly
                      value={form.getFieldValue('interval') || ''}
                    />
                  </div>
                </Form.Item>
              )}
            </>
          ) : null;
        }}
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ width: '100%', height: 50 }}
        >
          Создать событие
        </Button>
      </Form.Item>

      <Picker
        columns={[Array.from({ length: 999 }, (_, i) => ({
          label: `${i + 1}`,
          value: i + 1
        }))]}
        visible={notifyBeforeVisible}
        onClose={() => setNotifyBeforeVisible(false)}
        onConfirm={(val) => {
          form.setFieldsValue({ notify_before: val[0] });
          setNotifyBeforeVisible(false);
        }}
        cancelText="Отмена"
        confirmText="ОК"
      />

      <Picker
        columns={[
          Array.from({ length: getMaxInterval() }, (_, i) => ({
            label: `${i + 1} ${getIntervalLabel()}`,
            value: i + 1
          }))
        ]}
        visible={intervalVisible}
        onClose={() => setIntervalVisible(false)}
        onConfirm={(val) => {
          form.setFieldsValue({ interval: val[0] });
          setIntervalVisible(false);
        }}
        cancelText="Отмена"
        confirmText="ОК"
      />

      <DatePicker
        visible={startDateVisible}
        onClose={() => setStartDateVisible(false)}
        cancelText="Отмена"
        confirmText="OK"
        precision="day"
        className="custom-datepicker-order"
        onConfirm={date => {
          form.setFieldsValue({ start_date: moment(date) });
          setStartDateVisible(false);
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
          form.setFieldsValue({ start_time: moment(time) });
          setStartTimeVisible(false);
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
          form.setFieldsValue({ end_date: moment(date) });
          setEndDateVisible(false);
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
          form.setFieldsValue({ end_time: moment(time) });
          setEndTimeVisible(false);
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
          form.setFieldsValue({ notify_date: moment(date) });
          setNotifyDateVisible(false);
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
          form.setFieldsValue({ notify_time: moment(time) });
          setNotifyTimeVisible(false);
        }}
      />
    </Form>
  );
};

export default EventForm;