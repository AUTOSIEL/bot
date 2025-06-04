import telebot
import os
from db import (
    get_or_create_user,
    get_db_connection,
    update_user_info,
    update_user_state,
    update_user_timezone,
    get_user_state,
    save_msg,
    get_user_data,
    save_event,
    save_note,
    save_task,
    get_msg_history_event,
    get_msg_history_note,
    get_last_history,
    update_event,
    update_note,
    update_task,
    delete_event,
    delete_task,
    delete_note
)
from logger import setup_logger
from telebot import types
from AiRequests import request_ai
import json
from datetime import datetime
import time
import subprocess
import speech_recognition as sr
from helpers.get_system_prompt import get_system_prompt
from helpers.get_questions import get_questions

if not os.path.exists("voices"):
    os.makedirs("voices")

logger = setup_logger()

QUESTIONS = get_questions(types=types)

def save_answer(user_id, field, answer):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Получаем текущие данные пользователя
        cursor.execute("SELECT userInfo FROM users WHERE talagramID = %s", (user_id,))
        result = cursor.fetchone()
        
        if result and result["userInfo"]:
            user_info = json.loads(result["userInfo"])
        else:
            user_info = {}
        
        # Обновляем конкретное поле
        user_info[field] = answer
        
        # Сохраняем обновленные данные обратно в базу
        cursor.execute(
            "UPDATE users SET userInfo = %s WHERE talagramID = %s",
            (json.dumps(user_info), user_id),
        )
        conn.commit()
        logger.info(f"Saved answer for user {user_id}: {field} = {answer}")
    
    except Exception as e:
        logger.error(f"Error saving answer for user {user_id}: {e}")
        conn.rollback()
    
    finally:
        cursor.close()
        conn.close()

def initialize_user_info(user_id):
    for field, _, _ in QUESTIONS:
        save_answer(user_id, field, None)

def check_new_user(user):
    is_new_user = get_or_create_user(user)
    return is_new_user

def check_user_info(user):
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT userInfo FROM users WHERE talagramID = %s", (user.id,))
        result = cursor.fetchone()
        
        if result and result["userInfo"]:
            try:
                user_info = json.loads(result["userInfo"])
                if not all(user_info.values()):
                    return {"userInfo": None, "state": get_user_state(user.id)}
                
                return {"userInfo": user_info, "state": get_user_state(user.id)}
            except json.JSONDecodeError:
                return {"userInfo": None, "state": get_user_state(user.id)}
        
        return {"userInfo": None, "state": get_user_state(user.id)}
    
    except Exception as e:
        logger.error(f"Error checking user info for user {user.id}: {e}")
        return {"userInfo": None, "state": None}
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def format_event_response(event_data):
    title = event_data.get('title', '—')
    
    start_date = event_data.get('start_date', 0)
    end_date = event_data.get('end_date', 0)
    notify_date = event_data.get('notify_date', 0)
    notify_before = event_data.get('notify_before', 0)
    event_type = event_data.get('event_type', 'single')

    type_text = 'Однократное 🕐' if event_type == 'single' else 'Регулярное 🔄'

    recurrence = ''
    if event_type == 'recurring' and 'recurrence' in event_data:
        freq = event_data['recurrence'].get('frequency', '—')
        interval = event_data['recurrence'].get('interval', '—')
        recurrence = f"\n🔁 <b>Повторение:</b> {freq}, каждые {interval}"

    message = (
        f"📅 <b>Событие:</b> {title}\n"
        f"⏰ <b>Начало:</b> {start_date}\n"
        f"🏁 <b>Окончание:</b> {end_date}\n"
        f"📅 <b>Когда напомнить:</b> {notify_date}\n"
        f"🔔 <b>Напомнить за:</b> {notify_before} мин\n"
        f"📌 <b>Тип:</b> {type_text}{recurrence}"
    )

    return message

def format_note_response(note_data):
    title = note_data.get('title', '—')
    content = note_data.get('content', '—')

    message = (
        "📌<b>Заметка сохранена</b>\n\n"
        "<b>Название:</b>\n"
        f"{title}\n\n"
        "<b>Содержание:</b>\n"
        f"{content}\n\n"
    )

    return message

def format_task_response(task_data):
    title = task_data.get('title', '—')
    content = task_data.get('content', '—')

    message = (
        "✅<b>Задача сохранена</b>\n\n"
        "<b>Название:</b>\n"
        f"{title}\n\n"
        "<b>Содержание:</b>\n"
        f"{content}\n\n"
    )

    return message

def checkStatusUser(telegramID, bot, message):
    user_data = get_user_data(telegramID)
    if user_data["status"] == 0:
        bot.send_message(message.chat.id, "Ваш аккаунт не активирован, пожалуйста, свяжитесь с администратором @MindMy_Start", reply_markup='')
        return True
    return False

# Регистрация обработчиков
def register_handlers(bot):
    @bot.message_handler(commands=["start"])
    def send_welcome(message):
        markupWeb_app = types.ReplyKeyboardMarkup(resize_keyboard=True)
        web_app = types.WebAppInfo("https://mindmyai.ru/")
        button = types.KeyboardButton(text="Открыть приложение", web_app=web_app)
        markupWeb_app.add(button)

        user = message.from_user
        logger.info(f"Received /start command from user: ID={user.id}, Username={user.username}")

        if checkStatusUser(user.id, bot, message):
            return

        update_user_state(user.id, None)
        try:
            is_new_user = check_new_user(user)
            user_data = check_user_info(user)

            if is_new_user or (user_data and user_data["userInfo"] is None):
                markup = types.InlineKeyboardMarkup()
                markup.add(types.InlineKeyboardButton("✅ Начнём знакомство", callback_data="start_questionnaire"))
                greeting = f"Привет! Рад познакомиться!" if is_new_user else f"С возвращением, {user.first_name}!"
                bot.send_message(message.chat.id, f"{greeting}", reply_markup=markup)
                
                initialize_user_info(user.id)  # Инициализируем пустую анкету
                update_user_state(user.id, {"current_question": 0, "chat_id": message.chat.id})
                
                # ask_next_question(bot, user.id)
            else:
                bot.send_message(message.chat.id, f"С возвращением, {user.first_name}!")
                logger.info(f"Existing user interacted: ID={user.id}, Username={user.username}")

        except Exception as e:
            logger.error(f"Error processing /start command: {e}")
            bot.send_message(message.chat.id, "⚠️ Произошла ошибка. Попробуйте позже.")

    def ask_next_question(bot, user_id):
        state = get_user_state(user_id)
        if not state:
            return
        
        current_question = state.get("current_question", 0)
        
        if current_question >= len(QUESTIONS):
            complete_user_info_collection(bot, user_id)
            return
        
        field, question_text, reply_markup = QUESTIONS[current_question]
        try:
            bot.send_message(
                state["chat_id"], 
                question_text, 
                reply_markup=reply_markup,
                parse_mode='HTML'
            )
        except Exception as e:
            logger.error(f"Error sending question to user {user_id}: {e}")
            update_user_state(user_id, None)

    def complete_user_info_collection(bot, user_id):
        update_user_state(user_id, None)
        try:
            markup = types.InlineKeyboardMarkup()
            markup.add(types.InlineKeyboardButton("Запланировать событие", callback_data="add_event"))
            markup.add(types.InlineKeyboardButton("Создать заметку", callback_data="add_note"))
            markup.add(types.InlineKeyboardButton("Создать задачу", callback_data="add_task"))
            web_app = types.WebAppInfo("https://mindmyai.ru/")
            markup.add(types.InlineKeyboardButton("Открыть приложение", web_app=web_app))
            bot.send_message(
                user_id,
                "🎉 Спасибо! Вся информация сохранена. \n\n" \
                "Вот что я могу для вас сделать:",
                reply_markup=markup
            )
        except Exception as e:
            logger.error(f"Error sending completion message to user {user_id}: {e}")
        logger.info(f"User info completed for user ID: {user_id}")

    @bot.message_handler(func=lambda message: True)
    def handle_all_messages(message):
        markupWeb_app = types.ReplyKeyboardMarkup(resize_keyboard=True)
        web_app = types.WebAppInfo("https://mindmyai.ru/")
        button = types.KeyboardButton(text="Открыть приложение", web_app=web_app)
        markupWeb_app.add(button)

        user = message.from_user
        if checkStatusUser(user.id, bot, message):
            return
        user_id = user.id
        logger.info(f"Message from {user_id} ({user.username}): {message.text}")
        try:
            user_data = check_user_info(user)
            state = user_data.get("state")
            user_info = user_data.get("userInfo")

            if state is not None:
                checkAiRequest = state.get("ai_request", None)
                if checkAiRequest is None:
                    handle_questionnaire_flow(bot, message, user_id, state)
                    return

            if user_info is None:
                is_new_user = check_new_user(user)
                if is_new_user:
                    markup = types.InlineKeyboardMarkup()
                    markup.add(types.InlineKeyboardButton("✅ Начнём знакомство", callback_data="start_questionnaire"))
                    greeting = f"Привет! Рад познакомиться!" if is_new_user else f"С возвращением, {user.first_name}!"
                    bot.send_message(message.chat.id, f"{greeting}", reply_markup=markup)
                    initialize_user_info(user.id)
                    update_user_state(user.id, {"current_question": 0, "chat_id": message.chat.id})
                    # ask_next_question(bot, user.id)
                else:
                    suggest_questionnaire_start(bot, message, user)
                return
            handle_registered_user(bot, message, user_info)

        except Exception as e:
            logger.exception(f"Error for user {user_id}: {e}")
            bot.send_message(message.chat.id, "⚠️ Произошла ошибка. Попробуйте позже.")

    def suggest_questionnaire_start(bot, message, user):
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("✅ Заполнить анкету", callback_data="start_questionnaire"))
        
        bot.send_message(
            chat_id=message.chat.id,
            text=f"{user.first_name}, я вижу, что вы еще не заполнили анкету. Это поможет мне лучше вам помогать!",
            reply_markup=markup,
        )

    def handle_questionnaire_flow(bot, message, user_id, state):
        current_question = state.get("current_question", 0)
        if current_question < len(QUESTIONS):
            field, _, reply_markup = QUESTIONS[current_question]
            save_answer(user_id, field, message.text)

            if current_question == 6:
                ai_response = request_ai("Пришли в ответ только timezone в формате IANA на 2025 год по запросу пользователя. Не используй устаревшие или некорректные варианты вроде Europe/Yekaterinburg.Примеры правильных ответов: Asia/Yekaterinburg, Europe/Moscow, America/New_York.", message.text, "default")
                if ai_response and "result" in ai_response:
                    result = ai_response['result']['text']
                    update_user_timezone(user_id, result)
            
            if reply_markup:
                bot.send_message(message.chat.id, "Ответ принят!", reply_markup=types.ReplyKeyboardRemove())
            
            new_state = {
                "current_question": current_question + 1,
                "chat_id": message.chat.id,
            }
            update_user_state(user_id, new_state)
            ask_next_question(bot, user_id)

    def handle_registered_user(bot, message, user_info):
        talagramID = message.from_user.id
        if checkStatusUser(talagramID, bot, message):
            return
        user_data = get_user_data(talagramID)
        name = user_info.get("name", message.from_user.first_name)
        state = get_user_state(talagramID)
        if state is None:
            state = {}
            update_user_state(talagramID, state)
        system_prompt = get_system_prompt(name, user_data)
        checkAiRequest = state.get("ai_request", None)
        if checkAiRequest:
            history_records = get_last_history(user_data["id"])
            history_records_arr = []
            if history_records:
                for record in history_records:
                    history_records_arr.append({
                        "role": "assistant" if record["is_bot"] else "user",
                        "content": record["msg"]
                    })
                
            msg_history = history_records_arr
            save_msg(user_data["id"], message.text, False, None, None, None)
        
            ai_response = request_ai(system_prompt, message.text, "default", msg_history=msg_history)
            if ai_response and "result" in ai_response:
                try:
                    if ai_response['result']['type'] == 'function_call':
                        if ai_response['result']['name'] == 'create_event':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['reminders']:
                                event_data = save_event(user_data["id"])
                                update_success = update_event(event_data["id"], event)
                                if update_success:
                                         bot.reply_to(message, format_event_response(event), parse_mode="HTML")
                                         save_msg(user_data["id"], json.dumps(event, ensure_ascii=False), True, event_data["id"], None, None)
                                else:
                                    bot.reply_to(message, "⚠️ Ошибка при обновлении события.")
                        elif ai_response['result']['name'] == 'update_event':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['reminders']:
                                update_success = update_event(event.get('id'), event)
                                if update_success:
                                         bot.reply_to(message, f"Напоминание обновлено: \n\n{format_event_response(event)}", parse_mode="HTML")
                                         save_msg(user_data["id"], json.dumps(event, ensure_ascii=False), True, event.get('id'), None, None)
                                else:
                                    bot.reply_to(message, "⚠️ Ошибка при обновлении события.")
                        elif ai_response['result']['name'] == 'remove_event':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['reminders']:
                                update_success = delete_event(event.get('id'))
                                bot.reply_to(message, "❌ Напоминание было удалено.", parse_mode="HTML")
                                save_msg(user_data["id"], json.dumps(event, ensure_ascii=False), True, event.get('id'), None, None)
                        elif ai_response['result']['name'] == 'create_task':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['tasks']:
                                task_data = save_task(user_data["id"])
                                update_success = update_task(task_id=task_data["id"], task_data=event)
                                if update_success:
                                    bot.reply_to(message, format_task_response(event), parse_mode="HTML")
                                    save_msg(user_data["id"], json.dumps(result_data, ensure_ascii=False), True, None, task_data["id"], None)
                                else:
                                    bot.reply_to(message, "⚠️ Ошибка при обновлении задачи.")
                        elif ai_response['result']['name'] == 'update_task':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['tasks']:
                                update_success = update_task(task_id=event.get('id'), task_data=event)
                                if update_success:
                                    bot.reply_to(message, f"Задача обновлена: \n\n{format_task_response(event)}", parse_mode="HTML")
                                    save_msg(user_data["id"], json.dumps(result_data, ensure_ascii=False), True, None, event.get('id'), None)
                                else:
                                    bot.reply_to(message, "⚠️ Ошибка при обновлении задачи.")
                        elif ai_response['result']['name'] == 'remove_task':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['tasks']:
                                update_success = delete_task(event.get('id'))
                                bot.reply_to(message, "❌ Задача была удалена.", parse_mode="HTML")
                                save_msg(user_data["id"], json.dumps(event, ensure_ascii=False), True, event.get('id'), None, None)
                        elif ai_response['result']['name'] == 'create_note':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['notes']:
                                note_data = save_note(user_data["id"])
                                update_success = update_note(note_id=note_data["id"], note_data=event)
                                if update_success:
                                    bot.reply_to(message, format_note_response(event), parse_mode="HTML")
                                    save_msg(user_data["id"], json.dumps(event, ensure_ascii=False), True, None, None, note_data["id"])
                                else:
                                    bot.reply_to(message, "⚠️ Ошибка при обновлении заметки.")
                        elif ai_response['result']['name'] == 'update_note':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['notes']:
                                update_success = update_note(note_id=event.get('id'), note_data=event)
                                if update_success:
                                    bot.reply_to(message, format_note_response(event), parse_mode="HTML")
                                    save_msg(user_data["id"], json.dumps(event, ensure_ascii=False), True, None, None, event.get('id'))
                                else:
                                    bot.reply_to(message, "⚠️ Ошибка при обновлении заметки.")
                        elif ai_response['result']['name'] == 'remove_note':
                            result_data = json.loads(ai_response['result']['args'])
                            for event in result_data['notes']:
                                update_success = delete_note(event.get('id'))
                                bot.reply_to(message, "❌ Заметка была удалена.", parse_mode="HTML")
                                save_msg(user_data["id"], json.dumps(event, ensure_ascii=False), True, event.get('id'), None, None)
                    else:
                        save_msg(user_data["id"], f"{ai_response['result']['text']}", True, None, None, None)
                        bot.reply_to(message, ai_response['result']['text'], parse_mode=None)
                except json.JSONDecodeError:
                    bot.reply_to(message, f"{ai_response['result']}")
                    save_msg(user_data["id"], f"{ai_response['result']}", True, None, None, None)
            else:
                bot.reply_to(message, "⚠️ Не удалось сформировать ответ. Попробуйте позже.")
                save_msg(user_data["id"], "⚠️ Не удалось сформировать ответ. Попробуйте позже.", True, None, None, None)
        else:
            markup = types.InlineKeyboardMarkup()
            markup.add(types.InlineKeyboardButton("Запланировать событие", callback_data="add_event"))
            markup.add(types.InlineKeyboardButton("Создать заметку", callback_data="add_note"))
            markup.add(types.InlineKeyboardButton("Создать задачу", callback_data="add_task"))
            web_app = types.WebAppInfo("https://mindmyai.ru/")
            markup.add(types.InlineKeyboardButton("Открыть приложение", web_app=web_app))
            bot.reply_to(
                message,
                f"{name}, чем могу помочь?",
                reply_markup=markup,
            )
            save_msg(user_data["id"], f"{name}, чем могу помочь?", True, None, None, None)
            update_user_state(talagramID, {'ai_request': True})

    @bot.callback_query_handler(func=lambda call: call.data == "start_questionnaire")
    def start_questionnaire(call):
        user = call.from_user
        initialize_user_info(user.id)
        update_user_state(user.id, {"current_question": 0, "chat_id": call.message.chat.id})
        ask_next_question(bot, user.id)
        bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text=f"{user.first_name}, начинаем заполнение анкеты!",
        )

    @bot.callback_query_handler(func=lambda call: call.data.startswith("rm_evnt_"))
    def handle_delete_event(call):
        try:
            event_id = int(call.data.split("_")[2])
            user = call.from_user

            delete_event(event_id)
            bot.answer_callback_query(call.id, text="Напоминание удалено")
            bot.edit_message_text(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                text="❌ Это напоминание было удалено."
            )

        except Exception as e:
            bot.answer_callback_query(call.id, text="Ошибка при удалении")
            logger.error(f"Error remove event {event_id} to user {user.id}: {e}")

    @bot.callback_query_handler(func=lambda call: call.data.startswith("cancel"))
    def cancel(call):
        try:
            user = call.from_user
            update_user_state(user.id, {'ai_request': True})
            bot.answer_callback_query(call.id, text="Действие отменено")
            bot.edit_message_text(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                text="Дейтсвие отменено, можете продолжить общение"
            )

        except Exception as e:
            bot.answer_callback_query(call.id, text="Ошибка при отмене")
            logger.error(f"Error cancel action to user {user.id}: {e}")

    @bot.callback_query_handler(func=lambda call: call.data == "add_event")
    def add_event(call):
        bot.answer_callback_query(call.id)
        user = call.from_user
        add_event_func(user)

    def add_event_func(user):
        user_data = get_user_data(user.id)
        update_user_state(user.id, {'ai_request': True})
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("Назад", callback_data="cancel"))
        bot.send_message(
            user.id,
            "Напишите подробнее, какое событие вы хотите запланировать?\n"
            "Укажите следующее:\n\n"
            
            "📅 <b>Дата</b> события: когда должно произойти событие?\n"
            "🕗 <b>Время</b>: во сколько?\n"
            "🔔 <b>Напоминание</b>: за сколько минут/часов/дней вас предупредить?\n"
            "🔁 <b>Периодичность</b>: это разовое событие или повторяющееся? "
            "Если повторяется — уточните, как часто (например, ежедневно, каждые 10 минут, раз в неделю и т.п.)\n\n"
            
            "Пример:\n"
            "Завтра в 15:00 у меня встреча с командой. Напомни за 15 минут. Это одноразовое событие.",
            parse_mode="HTML",
            reply_markup=markup
        )

    @bot.callback_query_handler(func=lambda call: call.data == "add_note")
    def add_note(call):
        bot.answer_callback_query(call.id)
        user = call.from_user
        add_event_func(user)

    def add_note_func(user):
        user_data = get_user_data(user.id)
        update_user_state(user.id, {'ai_request': True})
        bot.send_message(
            user.id,
            "✍️ Напишите текст вашей заметки. "
            "Можете указать заголовок, содержание, теги или что-то ещё — как вам удобно.\n\n"
            "Пример:\n"
            "Заголовок: Список покупок\n"
            "Содержание:\n"
            "Обои\n"
            "Клей\n"
            "Плитка\n"
            "Теги: #ремонт"
        )

    @bot.callback_query_handler(func=lambda call: True)
    def handle_query(call):
        user_id = call.from_user.id
        state = get_user_state(user_id)
        
        if state and 'current_question' in state:
            current_question = state['current_question']
            field, _, _ = QUESTIONS[current_question]

            save_answer(user_id, field, call.data)

            new_state = {
                "current_question": current_question + 1,
                "chat_id": call.message.chat.id,
            }
            update_user_state(user_id, new_state)
            ask_next_question(bot, user_id)

            bot.edit_message_reply_markup(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                reply_markup=None
            )

    def convert_ogg_to_wav(input_path, output_path):
        command = ['ffmpeg', '-i', input_path, output_path]
        subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    def recognize_speech(wav_path):
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio = recognizer.record(source)
        try:
            return recognizer.recognize_google(audio, language="ru-RU")
        except sr.UnknownValueError:
            return None
        except sr.RequestError as e:
            logger.error(f"Ошибка распознавания речи: {e}")
            return None

    @bot.message_handler(content_types=['voice'])
    def handle_voice_message(message):
        user = message.from_user
        if checkStatusUser(user.id, bot, message):
            return
        user_id = user.id
        logger.info(f"Voice message from {user_id} ({user.username})")
        ogg_path = wav_path = None
        try:
            file_info = bot.get_file(message.voice.file_id)
            file_path = file_info.file_path
            file = bot.download_file(file_path)

            ogg_path = f"voices/{user_id}_{int(time.time())}.ogg"
            with open(ogg_path, 'wb') as f:
                f.write(file)

            wav_path = ogg_path.replace('.ogg', '.wav')
            convert_ogg_to_wav(ogg_path, wav_path)

            text = recognize_speech(wav_path)

            state = get_user_state(user_id)
            if state is None:
                update_user_state(user_id, {'ai_request': True})

            
            if text:
                logger.info(f"Распознанный текст от {user_id}: {text}")
                message.text = text
                handle_all_messages(message)
            else:
                bot.send_message(message.chat.id, "Не удалось распознать голосовое сообщение. Попробуйте ещё раз.")

        except Exception as e:
            logger.exception(f"Ошибка обработки голосового сообщения от {user_id}: {e}")
            bot.send_message(message.chat.id, "⚠️ Произошла ошибка при обработке голосового сообщения.")

        finally:
            for path in [ogg_path, wav_path]:
                if path and os.path.exists(path):
                    try:
                        os.remove(path)
                        logger.info(f"Удалён временный файл: {path}")
                    except Exception as del_err:
                        logger.warning(f"Не удалось удалить файл {path}: {del_err}")