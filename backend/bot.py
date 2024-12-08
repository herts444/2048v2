from aiogram import Bot, Dispatcher
from aiogram.types import (
    InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, Message
)
from aiogram.filters import Command
import asyncio

bot = Bot(token='7842471718:AAFcwBAh-qpntz2Y0-s5BGQ2TTCM4gtCFM0')
dp = Dispatcher()

@dp.message(Command("start"))
async def send_welcome(message: Message):
    mini_app_button = InlineKeyboardButton(
        text="Запустить игру",
        web_app=WebAppInfo(url="https://hotgaming.lol")
    )

    # Передаем сразу inline_keyboard в виде вложенного списка списков
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[mini_app_button]])
    await message.answer("Запустить игру:", reply_markup=keyboard)

async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
