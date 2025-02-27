#!/bin/bash

# Функция для корректного завершения процесса
cleanup() {
    echo "Ожидание завершения сервера..."
    pkill -f "nodemon"
}

# Устанавливаем обработчик выхода
trap cleanup EXIT

# Запуск сервера
konsole -e bash -c "nodemon src/Server/Server.js; exec bash"

