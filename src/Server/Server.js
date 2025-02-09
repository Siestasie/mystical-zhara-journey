
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

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_URL 
    : 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// API routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/products', productsRouter);
app.use('/api/blog-posts', blogRouter);
app.use('/api', authRouter);

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
  // The directory where your React build files are located
  const buildPath = path.join(__dirname, '../../dist');
  
  // Serve static files
  app.use(express.static(buildPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

