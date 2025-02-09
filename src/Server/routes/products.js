
import express from 'express';
import db from '../config/database.js';
import { saveImage } from '../utils/imageHandler.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.put('/:id/image', async (req, res) => {
  try {
    const productId = req.params.id;
    const { image, index } = req.body;

    if (typeof index !== 'number' || index < 0 || index > 2) {
      return res.status(400).json({ error: 'Неверный индекс изображения (допустимо 0-2)' });
    }

    const [products] = await db.promise().query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Продукт не найден' });
    }

    const currentImages = JSON.parse(products[0].image);
    
    if (index >= currentImages.length) {
      return res.status(400).json({ error: 'Указанный индекс не существует' });
    }

    const newImagePath = await saveImage(image, index);
    const updatedImages = [...currentImages];
    updatedImages[index] = newImagePath;

    await db.promise().query(
      'UPDATE products SET image = ? WHERE id = ?',
      [JSON.stringify(updatedImages), productId]
    );

    res.json({ message: 'Изображение успешно обновлено', newImage: newImagePath });
  } catch (error) {
    console.error('Ошибка при обновлении изображения:', error);
    res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, fullDescription, price, category, specs, image } = req.body;

    if (!Array.isArray(image) || image.length === 0 || image.length > 3) {
      return res.status(400).json({ error: 'Invalid image format or too many images (max 3)' });
    }

    const saveImagePromises = image.map((img, index) => saveImage(img, index));
    const imagePaths = await Promise.allSettled(saveImagePromises);
    const validImagePaths = imagePaths
      .filter(res => res.status === 'fulfilled')
      .map(res => res.value);

    if (validImagePaths.length === 0) {
      return res.status(400).json({ error: 'All images failed to process' });
    }

    const [result] = await db.promise().query(
      'INSERT INTO products (name, description, fullDescription, price, category, specs, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, fullDescription, price, category, JSON.stringify(specs), JSON.stringify(validImagePaths)]
    );

    res.status(201).json({ id: result.insertId, message: 'Product added successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Error fetching products' });
    }
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Error fetching product' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(results[0]);
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Error deleting product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

export default router;
