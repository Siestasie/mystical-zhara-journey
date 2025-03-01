#!/usr/bin/env fish

# Запуск StartServer
./StartServer.fish &

# Пауза 1-2 секунды
sleep 1

# Запуск StartUrl
./StartUrl.fish &

# Ожидание завершения обоих процессов
wait
