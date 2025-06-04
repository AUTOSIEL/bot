from db import (
    get_or_create_user,
    get_user_data,
    get_user_events,
    get_user_notes,
    get_user_task,
    update_user_info,
    update_event,
    update_task,
    save_event,
    delete_event,
    get_event,
    update_note,
    save_note,
    save_task,
    delete_note,
    delete_task,
    get_note,
    get_task,
    check_user_admin,
    get_users,
    update_user
)
import json
from logger import setup_logger
from datetime import datetime

logger = setup_logger()

def parse_user_info(user_info):
    """Парсит строку userInfo в словарь Python"""
    if isinstance(user_info, str):
        try:
            return json.loads(user_info)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse user_info: {user_info}")
            return {}
    return user_info or {}

def auth_user(user):
    logger.info(f"Auth user info: {user}")
    is_new_user = get_or_create_user(user)
    user_data = get_user_data(user["id"])
    
    if user_data and "userInfo" in user_data:
        user_data["userInfo"] = parse_user_info(user_data["userInfo"])
    
    user_event = get_user_events(user_data["id"]) if user_data else None
    user_note = get_user_notes(user_data["id"]) if user_data else None
    user_task = get_user_task(user_data["id"]) if user_data else None

    if user_event:
        for event in user_event:
            for field in ['created_at', 'end_date', 'notify_date', 'start_date', 'updated_at']:
                if field in event and event[field]:
                    if isinstance(event[field], datetime):
                        event[field] = event[field].isoformat() + 'Z'

            if event['recurrence']:
                event['recurrence'] = json.loads(event['recurrence'])
    
    return {
        "is_new_user": is_new_user,
        "user_data": user_data,
        "user_event": user_event,
        "user_note": user_note,
        "user_task": user_task
    }

def update_user_info_api(user_info, user_id):
    return update_user_info(user_id, user_info)

def update_event_api(event_info, event_id):
    return update_event(event_id, event_info)

def create_event_api(event_info, user_id):
    event_data = save_event(user_id)
    update_event(event_data["id"], event_info)
    user_event = get_event(event_data["id"])
    if user_event:
        for field in ['created_at', 'end_date', 'notify_date', 'start_date', 'updated_at']:
            if field in user_event and user_event[field]:
                if isinstance(user_event[field], datetime):
                    user_event[field] = user_event[field].isoformat() + 'Z'

        if user_event['recurrence']:
            user_event['recurrence'] = json.loads(user_event['recurrence'])
    return user_event

def remove_event_api(event_id):
    return delete_event(event_id)

def get_users_api(user):
    if check_user_admin(user):
        return get_users()
    else:
        return None

def update_note_api(note_info, note_id):
    return update_note(note_id, note_info)

def create_note_api(note_info, user_id):
    note_data = save_note(user_id)
    update_note(note_data["id"], note_info)
    user_note = get_note(note_data["id"])
    return user_note

def remove_note_api(note_id):
    return delete_note(note_id)

def update_task_api(task_info, task_id):
    return update_task(task_id, task_info)

def create_task_api(task_info, user_id):
    task_data = save_task(user_id)
    update_task(task_data["id"], task_info)
    user_task = get_task(task_data["id"])
    return user_task

def remove_task_api(task_id):
    return delete_task(task_id)

def update_user_api(user_info, admin):
    return update_user(user_info, admin)