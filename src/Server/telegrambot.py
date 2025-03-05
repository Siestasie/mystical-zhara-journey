
import asyncio
import logging
import httpx
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command
import pytz
from datetime import datetime
import os
from dotenv import load_dotenv
import re

load_dotenv()

logging.basicConfig(level=logging.INFO)
TOKEN = os.getenv("TELEGRAM_TOKEN")
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

    # Проверяем, если это уведомление о заказе
    if description and "НОВЫЙ ЗАКАЗ" in description:
        total_match = re.search(r'• Общая сумма заказа: ([\d\s]+) ₽', description)
        total_amount = total_match.group(1) if total_match else "Не указана"
        
        address_match = re.search(r'• Адрес доставки: ([^\n]+)', description)
        address = address_match.group(1) if address_match else "Не указан"
        
        customer_name_match = re.search(r'• Имя заказчика: ([^\n]+)', description)
        customer_name = customer_name_match.group(1) if customer_name_match else name
        
        # Извлекаем информацию о товарах
        items_section = description.split("====== ЗАКАЗАННЫЕ ТОВАРЫ ======")[1].split("======")[0] if "====== ЗАКАЗАННЫЕ ТОВАРЫ ======" in description else ""
        
        # Форматируем сообщение о заказе
        return (
            f"🛒 НОВЫЙ ЗАКАЗ\n\n"
            f"Заказчик: {customer_name}\n"
            f"Телефон: {phone}\n"
            f"Email: {email}\n"
            f"Адрес: {address}\n\n"
            f"Сумма заказа: {total_amount} ₽\n\n"
            f"Дата: {formatted_date}\n\n"
            f"Для просмотра полной информации о заказе откройте панель администратора.\n"
            f"ID уведомления: {id_}"
        )
    else:
        # Обычное уведомление о консультации
        return (
            f"📌 Новое уведомление о консультации\n\n"
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
