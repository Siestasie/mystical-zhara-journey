import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Определяем пути
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

// Включаем CORS
app.use(cors());

// Разбираем JSON в запросах
app.use(express.json());

// Отдаем статические файлы из папки "uploads"
app.use('/uploads', express.static(uploadsDir));

// API-маршруты
import UserRoutes from './UserRoutes.js';
import ProductRoutes from './ProductRoutes.js';
import NotificationsRoutes from './NotificationsRoutes.js';
import PricelistRoutes from './pricelistRoutes.js';
import BlogpostsRoutes from './blogpostsRoutes.js';
import orderRoutes from './OrderRoutes.js';

app.use('/api', UserRoutes);
app.use('/api', ProductRoutes);
app.use('/api', NotificationsRoutes);
app.use('/api', PricelistRoutes);
app.use('/api', BlogpostsRoutes);
app.use('/api', orderRoutes);

// === Разделяем режимы работы: Разработка vs Продакшен ===
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(buildPath));

  // Отдаём index.html для любых маршрутов (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // В режиме разработки просто показываем сообщение
  app.get('*', (req, res) => {
    res.send('⚡ Сервер API работает! Запусти React отдельно: "npm start" или "npm run dev"');
  });
}

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер API запущен на порту ${port}`);
  console.log(`🗂  Директория сервера: ${__dirname}`);
});