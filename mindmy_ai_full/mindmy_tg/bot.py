import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from loguru import logger
from .config import get_settings

settings = get_settings()
bot = Bot(token=settings.tg_bot_token, parse_mode="HTML")
dp = Dispatcher()

@dp.message(CommandStart())
async def handle_start(m: types.Message):
    await m.answer("👋 Привет! Я MindMy AI.")

@dp.message(Command("help"))
async def handle_help(m: types.Message):
    await m.answer("/start /help")

@dp.message()
async def handle_echo(m: types.Message):
    await m.answer(m.text or "")

def run_polling():
    logger.info("Bot polling...")
    asyncio.run(dp.start_polling(bot))

if __name__ == "__main__":
    run_polling()
