import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { updateUserInfo } from '../store/user';

const { Option } = Select;

const questions = [
  {
    key: "name",
    label: "Как мне к Вам обращаться?",
    type: "input",
  },
  {
    key: "communication_style",
    label: "Выбери своего ассистента",
    type: "select",
    options: ["Наставник", "Стратег", "Тренер", "Партнёр"],
  },
  {
    key: "focus",
    label: "📝На чём ты сейчас держишь фокус?",
    type: "select",
    options: [
      "Работа/бизнес", "Семья", "Саморазвитие", "Освоение новых навыков", "Спорт"
    ],
  },
  {
    key: "task_put_off",
    label: "📝Какие задачи ты чаще всего откладываешь?",
    type: "select",
    options: [
      "Начать новое", "Доделать начатое", "Сесть и подумать", "Разговоры которые откладываю месяцами", "Финансовые вопросы"
    ],
  },
  {
    key: "important_now",
    label: "🎯Что для тебя сейчас главное?",
    type: "select",
    options: [
      "Рост в доходах",
      "Карьерный рост",
      "Поиск настоящего счастья",
      "Избавление от не нужных привычек",
      "Повысить ритм жизни",
      "Преодоление страхов",
      "Улучшить себя как личность",
    ],
  },
  {
    key: "assistant_goals",
    label:
      "🤖 Основные цели использования ассистента:\nВыбери вариант ниже или напиши свой ответ",
    type: "select",
    options: [
      "Личный рост и развитие",
      "Управление временем",
      "Повышение продуктивности",
      "Напоминания",
      "Ведение идей и заметок",
    ],
  },
  {
    key: "timezone",
    label: "🌍 Ваш часовой пояс или место проживания?",
    type: "input",
  },
  {
    key: "work_schedule",
    label:
      "⏰ В какое время дня вам удобнее получать напоминания?",
    type: "input",
  },
  {
    key: "target_improvement",
    label: "Что вы хотите начать или улучшить в ближайшем месяце?",
    type: "select",
    options: [
      "Здоровье и энергия",
      "Продуктивность и фокус",
      "Обучение и рост",
      "Полезные привычки",
      "Баланс и отдых",
    ],
  },
];

const AntForm = ({ userInfo, userID, onUpdate }) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await updateUserInfo(values, userID);
      console.log("Ответ сервера:", response); // Для отладки
      
      if (!response) {
        throw new Error("Нет ответа от сервера");
      }

      messageApi.success("Данные сохранены!");
      onUpdate(values);
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

  if (!userInfo) {
    return (
      <div style={{ textAlign: "center", padding: "24px" }}>
        <p>Загрузка данных пользователя...</p>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div style={{ maxWidth: 600, margin: "0 auto", rowGap: 15}}>
        <Form
          form={form}
          className="formUserInfo"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            name: userInfo.name,
            communication_style: userInfo.communication_style,
            focus: userInfo.focus,
            task_put_off: userInfo.task_put_off,
            important_now: userInfo.important_now,
            assistant_goals: userInfo.assistant_goals,
            timezone: userInfo.timezone,
            work_schedule: userInfo.work_schedule,
            target_improvement: userInfo.target_improvement,
          }}
        >
          {questions.map((item) => (
            <Form.Item
              key={item.key}
              name={item.key}
              label={<span style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}>{item.label}</span>}
              rules={[{ required: true, message: "Поле обязательно для заполнения" }]}
            >
              {item.type === "input" ? (
                <Input style={{ height: 50}} placeholder="Введите ответ" />
              ) : (
                <Select style={{ height: 50}} placeholder="Выберите вариант">
                  {item.options.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ))}

          <Form.Item>
            <Button style={{ height: 50}} type="primary" htmlType="submit" loading={loading} block>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default AntForm;