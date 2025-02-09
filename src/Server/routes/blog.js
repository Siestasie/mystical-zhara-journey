
import express from 'express';
import db from '../config/database.js';
import { saveImage } from '../utils/imageHandler.js';

const router = express.Router();

router.get('/', (req, res) => {
  db.query('SELECT * FROM blog_posts ORDER BY createdAt DESC', (err, results) => {
    if (err) {
      console.error('Error fetching blog posts:', err);
      return res.status(500).json({ error: 'Error fetching blog posts' });
    }
    res.json(results);
  });
});

router.delete('/:id', (req, res) => {
  const postId = req.params.id;
  db.query('DELETE FROM blog_posts WHERE id = ?', [postId], (err, result) => {
    if (err) {
      console.error('Error deleting post:', err);
      return res.status(500).json({ error: 'Error deleting post' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
});

router.post('/', async (req, res) => {
  const { title, content, image } = req.body;
  
  try {
    let imagePath = null;
    if (image && image.startsWith('data:image')) {
      imagePath = await saveImage(image);
    }

    db.query(
      'INSERT INTO blog_posts (title, content, author, image) VALUES (?, ?, ?, ?)',
      [title, content, 'Admin', imagePath],
      (err, result) => {
        if (err) {
          console.error('Error adding blog post:', err);
          return res.status(500).json({ error: 'Error adding blog post' });
        }
        res.status(201).json({ id: result.insertId, message: 'Blog post added successfully' });
      }
    );
  } catch (error) {
    console.error('Error processing blog post:', error);
    res.status(500).json({ error: 'Error processing blog post' });
  }
});

export default router;
