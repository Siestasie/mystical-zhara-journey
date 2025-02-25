import asyncio
import logging
import httpx
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command
import pytz
from datetime import datetime

logging.basicConfig(level=logging.INFO)
TOKEN = "7698755380:AAGEfcJ_PtraElzNvp5PJvfx0I-ZFfwpi00"
bot = Bot(token=TOKEN)
dp = Dispatcher()

CHAT_ID = None
last_sent_notifications = set()  # Хранит ID уже отправленных уведомлений

keyboard = ReplyKeyboardMarkup(keyboard=[
    [KeyboardButton(text="/start"), KeyboardButton(text="Уведомления")]
], resize_keyboard=True)


@dp.message(Command("start"))
async def start(message: Message):
    global CHAT_ID
    CHAT_ID = message.chat.id
    await message.answer("Бот запущен и готов к работе!", reply_markup=keyboard)
    logging.info(f"CHAT_ID установлен: {CHAT_ID}")


@dp.message(lambda message: message.text == "Уведомления")
@dp.message(Command("notifications"))
async def manual_check(message: Message):
    notifications = await fetch_notifications()
    if notifications:
        for notification in notifications:
            await bot.send_message(CHAT_ID, format_notification(notification))
    else:
        await message.answer("Нет новых уведомлений.")


async def fetch_notifications():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:3000/api/notifications")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    return data
                else:
                    return [data]
    except Exception as e:
        logging.error(f"Ошибка при запросе уведомлений: {e}")
    return []

def format_notification(notification):
    id_ = notification.get("id", "—")
    name = notification.get("name", "—")
    phone = notification.get("phone", "—")
    email = notification.get("email", "—")
    description = notification.get("description", "—")
    is_read = "Да" if notification.get("isRead") else "Нет"

    # Форматируем дату
    created_at_raw = notification.get("createdAt", "—")
    try:
        created_at = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
        created_at = created_at.astimezone(pytz.timezone("Europe/Moscow"))  
        formatted_date = created_at.strftime("%d.%m.%Y %H:%M")  # Пример: 18.02.2025 17:16
    except Exception:
        formatted_date = "Неизвестно"

    return (
        f"📌 Новое уведомление\n\n"
        f"ID: {id_}\n"
        f"Имя: {name}\n"
        f"Телефон: {phone}\n"
        f"Email: {email}\n"
        f"Описание: {description}\n"
        f"Прочитано: {is_read}\n"
        f"Дата создания: {formatted_date}"
    )


async def poll_notifications():
    global CHAT_ID, last_sent_notifications
    while True:
        await asyncio.sleep(5)
        if CHAT_ID is None:
            logging.warning("CHAT_ID не установлен.")
            continue

        notifications = await fetch_notifications()

        new_notifications = []
        for notification in notifications:
            notif_id = notification.get("id", str(notification))
            if notif_id not in last_sent_notifications:
                new_notifications.append(notification)
                last_sent_notifications.add(notif_id)

        if new_notifications:
            for notification in new_notifications:
                await bot.send_message(CHAT_ID, format_notification(notification))


async def main():
    loop = asyncio.get_event_loop()
    loop.create_task(poll_notifications())
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
