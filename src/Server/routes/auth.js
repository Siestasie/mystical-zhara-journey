
import express from 'express';
import db from '../config/database.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'Email уже подтвержден' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)',
        [user.id, token, new Date(Date.now() + 3600000)],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    await sendVerificationEmail(email, token);
    
    res.json({ message: 'Письмо с подтверждением отправлено' });
  } catch (error) {
    console.error('Ошибка при повторной отправке:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
          reject({ status: 401, error: 'Неверный email или пароль.' });
        } else if (!results[0].is_verified) {
          reject({ status: 403, error: 'Аккаунт не подтвержден. Проверьте вашу почту.' });
        } else {
          resolve(results[0]);
        }
      });
    });

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль.' });
    }

    res.status(200).json({ message: 'Вход выполнен успешно!', user });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.error || 'Ошибка сервера.' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password, is_verified, isAdmin) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 0, 0]
    );

    const token = crypto.randomBytes(32).toString('hex');
    await db.promise().query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [result.insertId, token, new Date(Date.now() + 3600000)]
    );

    await sendVerificationEmail(email, token);
    res.status(201).json({ message: 'Пользователь зарегистрирован. Проверьте почту для подтверждения.' });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании пользователя' });
  }
});

router.get('/verify-email', (req, res) => {
  const { token } = req.query;

  db.query(
    'SELECT * FROM email_verification_tokens WHERE token = ?',
    [token],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ error: 'Неверный или истекший токен.' });
      }

      const userId = results[0].user_id;
      db.query(
        'UPDATE users SET is_verified = 1 WHERE id = ?',
        [userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка сервера.' });
          }

          db.query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);
          res.status(200).json({ message: 'Ваша почта успешно подтверждена!' });
        }
      );
    }
  );
});

export default router;
