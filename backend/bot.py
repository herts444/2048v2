from aiogram import Bot, Dispatcher, types, executor

bot = Bot(token='7842471718:AAFcwBAh-qpntz2Y0-s5BGQ2TTCM4gtCFM0')
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def send_welcome(message: types.Message):
    # Inline-кнопка с Mini App
    keyboard = types.InlineKeyboardMarkup()
    mini_app_button = types.InlineKeyboardButton(
        text="Запустить игру",
        web_app=types.WebAppInfo(url="https://ced9-194-242-100-72.ngrok-free.app")
    )
    keyboard.add(mini_app_button)

    await message.reply("Запустить игру:", reply_markup=keyboard)

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
