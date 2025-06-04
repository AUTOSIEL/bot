import os
import telebot
from flask import Flask, request, jsonify
import bot_logic
from api_logic import (
    auth_user,
    update_user_info_api,
    update_event_api,
    create_event_api,
    remove_event_api,
    update_note_api,
    create_note_api,
    remove_note_api,
    update_task_api,
    create_task_api,
    remove_task_api,
    get_users_api,
    update_user_api
)
from logger import setup_logger
from file_handler import validate_and_save_file
# from flask_cors import CORS

logger = setup_logger()

app = Flask(__name__)

TOKEN = os.getenv("TOKEN")
bot = telebot.TeleBot(TOKEN)

# Регистрируем обработчики из bot_logic.py
bot_logic.register_handlers(bot)

# === Flask маршруты ===
@app.route('/api/webhook', methods=['POST'])
def getMessage():
    bot.process_new_updates([telebot.types.Update.de_json(request.stream.read().decode("utf-8"))])
    return "OK", 200


@app.route("/api/set-webhook")
def webhook():
    bot.remove_webhook()
    bot.set_webhook(url='https://mindmyai.ru/api/webhook')
    return "Webhook установлен", 200


@app.route("/api")
def api():
    return "HELLO API", 200

@app.route("/api/auth-user", methods=['POST'])
def api_auth_user():
    try:
        data = request.get_json()
        user = data.get("user", None)
        
        result = auth_user(user)
        
        return jsonify({
            "success": True,
            "is_new_user": result["is_new_user"],
            "user_data": result["user_data"],
            "user_event": result["user_event"],
            "user_note": result["user_note"],
            "user_task": result["user_task"]
        })
    except Exception as e:
        logger.error(f"Error auth user: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/update-user-info", methods=['POST'])
def api_update_user_info():
    try:
        data = request.get_json()
        user_info = data.get("user_info", None)
        user_id = data.get("user_id", None)
        logger.info(user_info)
        result = update_user_info_api(user_info, user_id)
        
        return jsonify({
            "success": True,
            "user_info": result
        })
    except Exception as e:
        logger.error(f"Error update user info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/update-event", methods=['POST'])
def api_update_event():
    try:
        data = request.get_json()
        event_info = data.get("event_info", None)
        event_id = data.get("event_id", None)
        logger.info(event_info)
        result = update_event_api(event_info, event_id)
        
        return jsonify({
            "success": True,
            "event_info": result
        })
    except Exception as e:
        logger.error(f"Error update user info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/create-event", methods=['POST'])
def api_create_event():
    try:
        data = request.get_json()
        event_info = data.get("event_info", None)
        user_id = data.get("user_id", None)
        logger.info(event_info)
        result = create_event_api(event_info, user_id)
        
        return jsonify({
            "success": True,
            "event_info": result
        })
    except Exception as e:
        logger.error(f"Error update user info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/remove-event", methods=['POST'])
def api_remove_event():
    try:
        data = request.get_json()
        event_id = data.get("event_id", None)
        result = remove_event_api(event_id)
        
        return jsonify({
            "success": True,
            "event_info": result
        })
    except Exception as e:
        logger.error(f"Error update user info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    

@app.route("/api/update-note", methods=['POST'])
def api_update_note():
    try:
        data = request.get_json()
        note_info = data.get("note_info", None)
        note_id = data.get("note_id", None)
        logger.info(note_info)
        result = update_note_api(note_info, note_id)
        
        return jsonify({
            "success": True,
            "note_info": result
        })
    except Exception as e:
        logger.error(f"Error update note info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/create-note", methods=['POST'])
def api_create_note():
    try:
        data = request.get_json()
        note_info = data.get("note_info", None)
        user_id = data.get("user_id", None)
        logger.info(note_info)
        result = create_note_api(note_info, user_id)
        
        return jsonify({
            "success": True,
            "note_info": result
        })
    except Exception as e:
        logger.error(f"Error create note info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/remove-note", methods=['POST'])
def api_remove_note():
    try:
        data = request.get_json()
        note_id = data.get("note_id", None)
        result = remove_note_api(note_id)
        
        return jsonify({
            "success": True,
            "note_info": result
        })
    except Exception as e:
        logger.error(f"Error remove note info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/update-task", methods=['POST'])
def api_update_task():
    try:
        data = request.get_json()
        task_info = data.get("task_info", None)
        task_id = data.get("task_id", None)
        logger.info(task_info)
        result = update_task_api(task_info, task_id)
        
        return jsonify({
            "success": True,
            "task_info": result
        })
    except Exception as e:
        logger.error(f"Error update task info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/create-task", methods=['POST'])
def api_create_task():
    try:
        data = request.get_json()
        task_info = data.get("task_info", None)
        user_id = data.get("user_id", None)
        logger.info(task_info)
        result = create_task_api(task_info, user_id)
        
        return jsonify({
            "success": True,
            "task_info": result
        })
    except Exception as e:
        logger.error(f"Error create task info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/remove-task", methods=['POST'])
def api_remove_task():
    try:
        data = request.get_json()
        task_id = data.get("task_id", None)
        result = remove_task_api(task_id)
        
        return jsonify({
            "success": True,
            "task_info": result
        })
    except Exception as e:
        logger.error(f"Error remove task info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/upload", methods=['POST'])
def api_upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'Файл не найден'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Файл не выбран'}), 400
        file_path = validate_and_save_file(file, file.content_type)
        file_url = f"https://mindmyai.ru/backend/{file_path}"
        return jsonify({'success': True, 'url': file_url}), 200
    
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': 'Произошла ошибка сервера'}), 500

@app.route("/api/get-users", methods=['POST'])
def api_get_users():
    try:
        data = request.get_json()
        user = data.get("user", None)
        result = get_users_api(user)
        return jsonify({
            "success": True,
            "users": result
        })
    except Exception as e:
        logger.error(f"Error return users: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/update-user", methods=['POST'])
def api_update_user():
    try:
        data = request.get_json()
        admin = data.get("admin", None)
        user_info = data.get("user_info", None)
        result = update_user_api(user_info, admin)
        return jsonify({
            "success": True,
            "user": result
        })
    except Exception as e:
        logger.error(f"Error return users: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8443)