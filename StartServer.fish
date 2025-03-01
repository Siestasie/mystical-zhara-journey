#!/usr/bin/env fish

# Функция для корректного завершения процесса
function cleanup
    echo "Ожидание завершения сервера..."
    pkill -f "nodemon"
end

# Устанавливаем обработчик выхода
trap cleanup EXIT

# Запуск сервера
konsole -e fish -c "nodemon src/Server/Server.js; exec fish"


