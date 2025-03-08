import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt'
import db from './db.js'
import dotenv from 'dotenv';
import { generateVerificationEmail, generatePasswordResetEmail } from './utils/serverEmailTemplates.js'
dotenv.config();

const router = express.Router();

// ✅ **Вход в аккаунт*
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const queryPromise = new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, results) => {
          if (err) {
            reject({ status: 500, error: 'Ошибка сервера.' });
          }
          if (results.length === 0) {
            reject({ status: 401, error: 'Неверный email или пароль.' });
          }
          const user = results[0];
      
          if (!user.is_verified) { 
            return reject({ status: 403, error: 'Аккаунт не подтвержден. Проверьте вашу почту.' });
          }

          resolve(user); 
        }
      );
    });

    const user = await queryPromise;

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    console.log(isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль.' });
    }

    res.status(200).json({ message: 'Вход выполнен успешно!', user });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(error.status || 500).json({ error: error.error || 'Ошибка сервера.' });
  }
});

// ✅ **Регистрация нового пользователя**
router.post('/register', async (req, res) => {
  const {name, email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query(
      'INSERT INTO users (name, email, password, is_verified, isAdmin) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 0, 0],
      (err, result) => {
        if (err) {
          console.debug(err)
          return res.status(500).json({ error: 'Ошибка сервера при создании пользователя' });
        }

        const userId = result.insertId;
        const token = crypto.randomBytes(32).toString('hex');
        db.query(
          'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [userId, token, new Date(Date.now() + 3600000)], // Токен истекает через 1 час
          (err) => {
            if (err) {
              console.error('Ошибка при сохранении токена:', err);
            }

            sendVerificationEmail(email, token, name);
            res.status(201).json({ message: 'Пользователь зарегистрирован. Проверьте почту для подтверждения.' });
          }
        );
      }
    );
  });
});

// New endpoints for account settings
// ✅ **Изменение пароля пользователя*
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    // Получаем текущий пароль пользователя из базы данных
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT password FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    // Проверяем текущий пароль
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль в базе данных
    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при изменении пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для запроса сброса пароля
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;

  try {
    // Проверяем существование пользователя
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT id, name FROM users WHERE email = ?', [email], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' });
    }

    // Генерируем токен для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // Токен действителен 1 час

    // Сохраняем токен в базе данных
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO email_verification_tokens (token, expires_at, user_id) VALUES (?, ?, ?)',
        [resetToken, tokenExpiry, user.id],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    // Отправляем email со ссылкой для сброса пароля
    const resetLink = `http://localhost:8080/reset-password?token=${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: 'verifkon@gmail.com',
      to: email,
      subject: 'Сброс пароля',
      html: generatePasswordResetEmail(user.name, resetLink)
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Инструкции по сбросу пароля отправлены на email' });

  } catch (error) {
    console.error('Ошибка при запросе сброса пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для сброса пароля
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Проверяем существование токена и его срок действия
    const query = 'SELECT user_id FROM email_verification_tokens WHERE token = ? AND expires_at > NOW()';
    db.query(query, [token], async (err, results) => {
      if (err) {
        console.error('Ошибка при проверке токена:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: 'Токен недействителен или истек' });
      }

      const userId = results[0].user_id;

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Обновляем пароль в базе данных
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
        if (err) {
          console.error('Ошибка при обновлении пароля:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        // Удаляем токен после успешного сброса пароля
        db.query('DELETE FROM email_verification_tokens WHERE token = ?', [token], (err) => {
          if (err) {
            console.error('Ошибка при удалении токена:', err);
          }
        });

        res.status(200).json({ message: 'Пароль успешно изменен' });
      });
    });
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


// ✅ **Обновление пользовательской информации**
router.post('/update-user-info', (req, res) => {
  const { userId, phone, address } = req.body;

  db.query(
    'UPDATE users SET phone = ?, address = ? WHERE id = ?',
    [phone, address, userId],
    (err) => {
      if (err) {
        console.error('Ошибка при обновлении информации:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }
      res.json({ message: 'Информация успешно обновлена' });
    }
  );
});

// ✅ **Отправка песьма верификации**
async function sendVerificationEmail(email, token, name) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('Ошибка проверки соединения:', error);
    } else {
      console.log('Соединение установлено:', success);
    }
  });

  const verificationLink = `http://localhost:8080/verify-account?token=${token}`;

  const mailOptions = {
    from: 'verifkon@gmail.com',
    to: email,
    subject: 'Подтверждение вашей почты',
    html: generateVerificationEmail(name, verificationLink),
  };

  await transporter.sendMail(mailOptions);
  console.log('Письмо отправлено на адрес:', email);
}

// ✅ **Эндпоинт для верификации пользователя**
router.post('/verify-email', (req, res) => {
    const { token } = req.body;
    console.log('Received token:', token);
    db.query(
        'SELECT * FROM email_verification_tokens WHERE token = ?',
        [token],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка сервера.' });
            }

            if (results.length === 0) {
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

// ✅ **Повторная верификация*
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        console.log(err)
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

    await sendVerificationEmail(email, token, user.name);
    
    res.json({ message: 'Письмо с подтверждением отправлено' });
  } catch (error) {
    console.error('Ошибка при повторной отправке:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для проверки токена
router.post('/verify-token', async (req, res) => {
  const { token } = req.body;

  try {
    // Проверяем существование токена в базе данных
    const query = 'SELECT * FROM email_verification_tokens WHERE token = ? AND expires_at > NOW()';
    db.query(query, [token], (err, results) => {
      if (err) {
        console.error('Ошибка при проверке токена:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: 'Токен недействителен или истек' });
      }

      // Если токен действителен
      res.status(200).json({ message: 'Токен действителен' });
    });
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
