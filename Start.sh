#!/bin/bash

# Запуск StartServer.sh
./StartServer.sh &

# Пауза 1-2 секунды
sleep 1

# Запуск StartUrl.sh
./StartUrl.sh &

# Ожидание завершения обоих процессов
wait
