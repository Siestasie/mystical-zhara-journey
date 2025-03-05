
const express = require('express');
const router = express.Router();
const connection = require('./db');
const logger = require('./logger');

// Create a new notification
router.post('/notifications', async (req, res) => {
  const { name, phone, email, description } = req.body;
  
  try {
    const [result] = await connection.execute(
      'INSERT INTO notifications (name, phone, email, description, isRead) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email || null, description || null, 0]
    );
    
    logger.info(`Notification created with ID: ${result.insertId}`);
    res.status(201).json({ 
      id: result.insertId,
      name,
      phone,
      email,
      description,
      isRead: false,
      createdAt: new Date()
    });
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({ error: 'Error creating notification' });
  }
});

// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM notifications ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get a specific notification
router.get('/notifications/:id', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    logger.error(`Error fetching notification with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const [result] = await connection.execute(
      'UPDATE notifications SET isRead = 1 WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    logger.info(`Notification ${req.params.id} marked as read`);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    logger.error(`Error marking notification ${req.params.id} as read:`, error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete a notification
router.delete('/notifications/:id/delete', async (req, res) => {
  try {
    const [result] = await connection.execute('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    logger.info(`Notification ${req.params.id} deleted`);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting notification ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
