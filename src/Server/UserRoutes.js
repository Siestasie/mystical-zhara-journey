
// Using modern ES6 imports instead of require
import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { generateVerificationEmail } from '../utils/serverEmailTemplates.js';

const router = express.Router();

// Import the database connection
import db from './db.js';

// Настройка транспорта для отправки писем
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // заменить на ваш SMTP-сервер
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com', // заменить на ваш email
    pass: 'your-password', // заменить на ваш пароль
  },
});

// Маршрут для регистрации пользователя
router.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Проверяем, существует ли пользователь
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаем токен для верификации
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Токен действителен 24 часа
    
    // Сохраняем пользователя в базу данных
    await db.query(
      'INSERT INTO users (name, email, password, verification_token, token_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, verificationToken, tokenExpiry, false]
    );
    
    // Создаем ссылку для верификации
    const verificationLink = `http://localhost:5173/verify-account?token=${verificationToken}`;
    
    // Отправляем письмо с подтверждением
    const mailOptions = {
      from: '"Your App" <your-email@gmail.com>',
      to: email,
      subject: 'Подтверждение аккаунта',
      html: generateVerificationEmail(name, verificationLink),
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ message: 'Пользователь зарегистрирован. Проверьте почту для подтверждения.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Маршрут для повторной отправки письма с подтверждением
router.post('/api/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Проверяем существование пользователя
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const user = users[0];
    
    // Если аккаунт уже подтвержден
    if (user.is_verified) {
      return res.status(400).json({ error: 'Аккаунт уже подтвержден' });
    }
    
    // Создаем новый токен
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);
    
    // Обновляем токен в базе данных
    await db.query(
      'UPDATE users SET verification_token = ?, token_expiry = ? WHERE id = ?',
      [verificationToken, tokenExpiry, user.id]
    );
    
    // Создаем ссылку для верификации
    const verificationLink = `http://localhost:5173/verify-account?token=${verificationToken}`;
    
    // Отправляем письмо
    const mailOptions = {
      from: '"Your App" <your-email@gmail.com>',
      to: email,
      subject: 'Подтверждение аккаунта (повторная отправка)',
      html: generateVerificationEmail(user.name, verificationLink),
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Письмо с подтверждением отправлено повторно' });
  } catch (error) {
    console.error('Error during resend verification:', error);
    res.status(500).json({ error: 'Ошибка сервера при отправке письма' });
  }
});

// Маршрут для проверки токена и подтверждения аккаунта
router.post('/api/verify-account', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Токен не предоставлен' });
    }
    
    // Ищем пользователя с этим токеном
    const [users] = await db.query(
      'SELECT * FROM users WHERE verification_token = ?', 
      [token]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Недействительный токен' });
    }
    
    const user = users[0];
    
    // Проверяем, не истек ли срок действия токена
    const tokenExpiry = new Date(user.token_expiry);
    const now = new Date();
    
    if (now > tokenExpiry) {
      return res.status(400).json({ error: 'Срок действия токена истек' });
    }
    
    // Если все проверки пройдены, подтверждаем аккаунт
    await db.query(
      'UPDATE users SET is_verified = true, verification_token = NULL, token_expiry = NULL WHERE id = ?',
      [user.id]
    );
    
    res.json({ message: 'Аккаунт успешно подтвержден' });
  } catch (error) {
    console.error('Error during account verification:', error);
    res.status(500).json({ error: 'Ошибка сервера при подтверждении аккаунта' });
  }
});

router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = users[0];

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Аккаунт не подтвержден. Пожалуйста, проверьте свою почту.' });
    }

    // Respond with user data (excluding password)
    const { id, name, email: userEmail, isAdmin, phone, alternativePhone, address, notificationsEnabled, deliveryNotes } = user;
    res.json({ user: { id, name, email: userEmail, isAdmin, phone, alternativePhone, address, notificationsEnabled, deliveryNotes } });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

export default router;
