async def handle_notification(notification):
    """
    Обрабатывает уведомление и отправляет его в Telegram.
    """
    # Формируем сообщение с данными
    message = f"📢 *{notification['title']}*\n\n"
    message += f"{notification['content']}\n\n"
    message += f"🕒 {notification['timestamp']}\n"
    if notification['additional_info']:
        message += f"ℹ️ {notification['additional_info']}\n"
    
    # Отправляем сообщение в Telegram
    await bot.send_message(
        chat_id=CHAT_ID,
        text=message,
        parse_mode='Markdown'
    ) 