
import express from 'express';
import db from './db.js';

const router = express.Router();

// Create a new order
router.post('/orders', async (req, res) => {
  try {
    const { 
      user_id, 
      total_price, 
      status, 
      items, 
      shipping_address, 
      contact_phone, 
      comments 
    } = req.body;

    // Insert the order into the orders table
    const [orderResult] = await db.promise().query(
      'INSERT INTO orders (user_id, total_price, status, shipping_address, contact_phone, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [user_id, total_price, status, shipping_address, contact_phone, comments]
    );

    const orderId = orderResult.insertId;

    // Insert each order item
    for (const item of items) {
      await db.promise().query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, name) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price, item.name]
      );
    }

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Get orders for a specific user
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get all orders for this user
    const [orders] = await db.promise().query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // For each order, get its items
    for (let i = 0; i < orders.length; i++) {
      const [items] = await db.promise().query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orders[i].id]
      );
      orders[i].items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

export default router;
