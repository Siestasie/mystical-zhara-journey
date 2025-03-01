import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import productRoutes from './ProductRoutes.js';
import userRoutes from './UserRoutes.js';
import notificationsRoutes from './NotificationsRoutes.js';
import blogpostsRoutes from './blogpostsRoutes.js';
import pricelistRoutes from './pricelistRoutes.js'

import db from './db.js'

dotenv.config();

const app = express();

// Конфигурация загрузки файлов
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

// Настройки сервера
app.use(cors({ origin: 'http://localhost:8080', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../dist');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', blogpostsRoutes);
app.use('/api', pricelistRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});