
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
import json

load_dotenv()

logging.basicConfig(level=logging.INFO)
TOKEN = os.getenv("TELEGRAM_TOKEN")
bot = Bot(token=TOKEN)
dp = Dispatcher()

CHAT_ID = None
last_sent_notifications = set()  # Stores IDs of already sent notifications

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
        async with httpx.AsyncClient(timeout=30.0) as client:
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
    
    # Check if this is an order notification
    is_order = "###### НОВЫЙ ЗАКАЗ ######" in description
    
    # Format date
    created_at_raw = notification.get("createdAt", "—")
    try:
        created_at = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
        created_at = created_at.astimezone(pytz.timezone("Europe/Moscow"))  
        formatted_date = created_at.strftime("%d.%m.%Y %H:%M")
    except Exception:
        formatted_date = "Неизвестно"
    
    if is_order:
        items = notification.get("items", [])
        address = notification.get("address", "Не указан")
        comments = notification.get("comments", "Комментариев нет")
        total = notification.get("total", 0)
        
        # Format order items
        items_text = ""
        if items and len(items) > 0:
            for i, item in enumerate(items):
                items_text += f"📦 Товар {i+1}: {item.get('name')}\n"
                items_text += f"   Количество: {item.get('quantity')} шт.\n"
                items_text += f"   Цена: {item.get('price')} ₽\n"
                items_text += f"   Сумма: {item.get('price') * item.get('quantity')} ₽\n\n"
        else:
            # Try to extract items from description if not directly available
            sections = description.split("======")
            order_items_section = next((s for s in sections if "ЗАКАЗАННЫЕ ТОВАРЫ" in s), "")
            if order_items_section:
                items_text = order_items_section.replace("ЗАКАЗАННЫЕ ТОВАРЫ", "").strip()
            else:
                items_text = "Информация о товарах недоступна"
        
        # Format total amount
        total_text = f"{total:,}".replace(",", " ") + " ₽" if total else "Не указана"
        
        return (
            f"🛒 НОВЫЙ ЗАКАЗ\n\n"
            f"👤 Данные клиента:\n"
            f"• Имя: {name}\n"
            f"• Телефон: {phone}\n"
            f"• Email: {email}\n"
            f"• Адрес доставки: {address}\n\n"
            f"📋 Заказанные товары:\n\n{items_text}\n"
            f"💰 Общая сумма: {total_text}\n\n"
            f"📝 Комментарии: {comments}\n\n"
            f"⏰ Время заказа: {formatted_date}"
        )
    else:
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

        try:
            notifications = await fetch_notifications()

            new_notifications = []
            for notification in notifications:
                notif_id = notification.get("id", str(notification))
                if notif_id not in last_sent_notifications:
                    new_notifications.append(notification)
                    last_sent_notifications.add(notif_id)
                    
                    # Keep set size manageable
                    if len(last_sent_notifications) > 1000:
                        last_sent_notifications = set(list(last_sent_notifications)[-500:])

            if new_notifications:
                for notification in new_notifications:
                    await bot.send_message(CHAT_ID, format_notification(notification))
        except Exception as e:
            logging.error(f"Error in poll_notifications: {e}")


async def main():
    loop = asyncio.get_event_loop()
    loop.create_task(poll_notifications())
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
