import logging
import os
from datetime import datetime

LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE = os.path.join(LOG_DIR, f"bot_log_{datetime.now().strftime('%Y-%m-%d')}.log")

def setup_logger():
    logger = logging.getLogger("BotLogger")
    logger.setLevel(logging.INFO)

    # Проверяем, есть ли у логгера уже настроенные обработчики
    if not logger.handlers:
        # Формат логов с добавлением информации о файле, строке и функции
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s - [%(filename)s:%(lineno)d in %(funcName)s]'
        )

        # Логирование в файл
        file_handler = logging.FileHandler(LOG_FILE, encoding='utf-8')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        # Логирование в консоль
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    return logger