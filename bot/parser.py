from bs4 import BeautifulSoup
from db import get_db_connection  # Предположим, что у вас есть модуль для работы с БД

def parse_notification(notification_html):
    """
    Парсит HTML уведомления и извлекает новые данные.
    """
    soup = BeautifulSoup(notification_html, 'html.parser')
    
    # Новые данные в уведомлениях
    title = soup.find('div', class_='notification-title').text.strip()
    content = soup.find('div', class_='notification-content').text.strip()
    timestamp = soup.find('span', class_='notification-time').text.strip()
    # Добавляем новые поля, если они есть
    additional_info = soup.find('div', class_='notification-extra').text.strip() if soup.find('div', class_='notification-extra') else None
    
    return {
        'title': title,
        'content': content,
        'timestamp': timestamp,
        'additional_info': additional_info
    }

def get_new_notifications():
    """
    Получает новые уведомления из базы данных.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Запрос для получения новых уведомлений
    query = """
    SELECT title, content, timestamp, additional_info
    FROM notifications
    WHERE is_sent = FALSE
    ORDER BY timestamp DESC
    """
    cursor.execute(query)
    notifications = cursor.fetchall()
    
    # Обновляем статус уведомлений на "отправлено"
    update_query = """
    UPDATE notifications
    SET is_sent = TRUE
    WHERE is_sent = FALSE
    """
    cursor.execute(update_query)
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return [{
        'title': n[0],
        'content': n[1],
        'timestamp': n[2],
        'additional_info': n[3]
    } for n in notifications] 