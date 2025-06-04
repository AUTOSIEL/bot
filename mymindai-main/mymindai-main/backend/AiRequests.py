from openai import OpenAI
import json
import os
from dotenv import load_dotenv
from pathlib import Path
import time
from functions import get_functions
from logger import setup_logger

dotenv_path = Path("/var/www/www-root/data/www/mindmyai.ru/backend/.env")
load_dotenv(dotenv_path)

logger = setup_logger()

clientAssist = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY_ASSIST"),
    organization="org-KnDhFAL5KZ3A2YOCOuPbg6ia",
    timeout=60
)

def request_ai(prompt, user_msg, msg_type, msg_history = None, thread_id = None):
    try:
        messages = [{"role": "system", "content": prompt}]
        if isinstance(msg_history, list):
            messages.extend(msg_history)
            messages.append({"role": "user", "content": user_msg})
        functions = get_functions()
        
        response = clientAssist.responses.create(
            model="gpt-4.1-mini",
            input=messages,
            text={"format": {"type": "text"}},
            reasoning={},
            tools=functions,
            temperature=1,
            max_output_tokens=5980,
            top_p=1,
            store=True
        )

        result = {}
        for item in response.output:
            if getattr(item, 'type', None) == 'message':
                content_item = item.content[0]
                text_content = content_item.text
                annotations = getattr(content_item, 'annotations', [])

                links = []
                for a in annotations:
                    link = {}
                    if hasattr(a, 'url'):  # Обычная ссылка
                        link = {
                            "type": "url",
                            "title": getattr(a, 'title', 'Без названия'),
                            "url": a.url
                        }
                    elif hasattr(a, 'file_id'):  # Цитата из файла
                        link = {
                            "type": "file_citation",
                            "file_id": a.file_id,
                            "text": getattr(a, 'text', '')
                        }
                    elif hasattr(a, 'vector_store_ids'):  # Поиск в файлах
                        link = {
                            "type": "file_search",
                            "vector_store_ids": a.vector_store_ids
                        }
                    if link:
                        links.append(link)

                result = {
                    "text": text_content,
                    "type": 'message',
                    "links": links
                }
            elif getattr(item, 'type', None) == 'function_call':
                result = {
                    "type": 'function_call',
                    "name": getattr(item, 'name', None),
                    "args": getattr(item, 'arguments', {})
                }
            else:
                result = str(item)

        return {"result": result}

    except Exception as e:
        logger.error(f"Error response ai: {e}")