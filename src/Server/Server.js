import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

import UserRoutes from './UserRoutes.js';
import ProductRoutes from './ProductRoutes.js';
import NotificationsRoutes from './NotificationsRoutes.js';
import PricelistRoutes from './pricelistRoutes.js';
import BlogpostsRoutes from './blogpostsRoutes.js';
import OrderRoutes from './OrderRoutes.js';

// Routes
app.use('/api', UserRoutes);
app.use('/api', ProductRoutes);
app.use('/api', NotificationsRoutes);
app.use('/api', PricelistRoutes);
app.use('/api', BlogpostsRoutes);
app.use('/api', OrderRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
