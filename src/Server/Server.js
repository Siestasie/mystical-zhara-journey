
// Import required modules
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import logger from './logger.js';

// Import route modules
import userRoutes from './UserRoutes.js';
import productRoutes from './ProductRoutes.js';
import pricelistRoutes from './pricelistRoutes.js';
import blogpostsRoutes from './blogpostsRoutes.js';
import notificationsRoutes from './NotificationsRoutes.js';
import orderRoutes from './OrderRoutes.js';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check database connection
db.query('SELECT 1+1 AS result', (err, results) => {
  if (err) {
    logger.error('Database connection error:', err);
  } else {
    logger.info('Database connected:', results[0].result);
  }
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use(userRoutes);
app.use(productRoutes);
app.use(pricelistRoutes);
app.use(blogpostsRoutes);
app.use(notificationsRoutes);
app.use(orderRoutes);

// Configure multer endpoints
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path.replace(/\\/g, '/').replace('src/', '/');
    res.json({ 
      fileName: req.file.filename,
      filePath: filePath
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Add type declaration for ES modules
export default app;
