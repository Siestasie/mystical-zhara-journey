
import express from 'express';
import cors from 'cors';
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import productsRouter from './routes/products.js';
import blogRouter from './routes/blog.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/products', productsRouter);
app.use('/api/blog-posts', blogRouter);
app.use('/api', authRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
