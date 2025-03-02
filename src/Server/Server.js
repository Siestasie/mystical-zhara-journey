
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Serve static files from the public directory
// Go up two levels: from /src/Server to the project root, then into /public
const publicPath = path.join(__dirname, '../../public');
app.use(express.static(publicPath));

// If in production, serve the built files
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../dist');
  app.use(express.static(buildPath));
}

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

// For any other route, serve index.html (SPA approach)
app.get('*', (req, res) => {
  // In production, serve from dist, otherwise from public
  const indexPath = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '../../dist/index.html')
    : path.join(__dirname, '../../public/index.html');
    
  res.sendFile(indexPath);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
