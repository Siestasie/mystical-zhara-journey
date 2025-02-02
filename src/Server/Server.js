import express from 'express'
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'klimatholoddatabase',
});

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        process.exit(1);
    }
    console.log('Подключение к базе данных успешно!');
});

// Add this SQL query after database connection
db.query(`
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fullDescription TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    specs JSON,
    image VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add these new endpoints after existing endpoints
app.post('/api/products', (req, res) => {
    const { name, description, fullDescription, price, category, specs, image } = req.body;

    db.query(
        'INSERT INTO products (name, description, fullDescription, price, category, specs, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, fullDescription, price, category, JSON.stringify(specs), image],
        (err, result) => {
            if (err) {
                console.error('Error adding product:', err);
                return res.status(500).json({ error: 'Error adding product' });
            }
            res.status(201).json({ id: result.insertId, message: 'Product added successfully' });
        }
    );
});

app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Error fetching products' });
        }
        res.json(results);
    });
});

app.delete('/api/products/:id', (req, res) => {
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

// Add this new endpoint after the existing endpoints
app.post('/api/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    // Проверяем существование пользователя
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

    // Создаем новый токен
    const token = crypto.randomBytes(32).toString('hex');
    
    // Обновляем или создаем новый токен верификации
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

    // Отправляем новое письмо
    await sendVerificationEmail(email, token);
    
    res.json({ message: 'Письмо с подтверждением отправлено' });
  } catch (error) {
    console.error('Ошибка при повторной отправке:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API-эндпоинт для входа
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Проверка пользователя в базе данных
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
                const user = results[0]; // Берем первого пользователя
          
                if (!user.is_verified) { 
                  return reject({ status: 403, error: 'Аккаунт не подтвержден. Проверьте вашу почту.' });
                }

                resolve(user); 
          }
        );
    });

    // Ожидаем завершения запроса и дальнейшей обработки
    const user = await queryPromise;

    console.log('Введенный пароль:', password); 
    console.log('Пароль из базы данных:', user);

    // Сравнение пароля с использованием bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    console.log(isPasswordValid);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Неверный email или пароль.' });
    }

    // Возвращаем успешный ответ
    res.status(200).json({ message: 'Вход выполнен успешно!', user });

  } catch (error) {
      console.error('Ошибка входа:', error);
      res.status(error.status || 500).json({ error: error.error || 'Ошибка сервера.' });
  }
});

app.post('/api/register', async (req, res) => {
    const {name, email, password } = req.body;
    console.debug(email)
    // Проверить, существует ли пользователь с таким email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }
  
      // Хешировать пароль
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Вставить нового пользователя в базу данных
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

                sendVerificationEmail(email, token);
                res.status(201).json({ message: 'Пользователь зарегистрирован. Проверьте почту для подтверждения.' });
              }
          );
        }
      );
    });
  });

  app.get('/verify-email', (req, res) => {
    const { token } = req.query;

    // Проверяем токен в базе данных
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

            // Обновляем статус пользователя
            db.query(
                'UPDATE users SET is_verified = 1 WHERE id = ?',
                [userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка сервера.' });
                    }

                    // Удаляем токен после успешной активации
                    db.query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);

                    res.status(200).json({ message: 'Ваша почта успешно подтверждена!' });
                }
            );
        }
    );
});

async function sendVerificationEmail(email, token) {

  const transporter = nodemailer.createTransport({
      service: 'gmail', // Используйте свой email-сервис (например, Gmail)
      auth: {
          user: process.env.EMAIL_USER, //Удалить
          pass: process.env.EMAIL_PASS //Удалить
      }
  });

  transporter.verify((error, success) => {
    if (error) {
        console.error('Ошибка проверки соединения:', error);
    } else {
        console.log('Соединение установлено:', success);
    }
  });

  const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

  const mailOptions = {
      from: 'verifkon@gmail.com',
      to: email,
      subject: 'Подтверждение вашей почты',
      text: `Перейдите по ссылке для подтверждения: ${verificationLink}`,
      html: `<p>Перейдите по <a href="${verificationLink}">ссылке</a> для подтверждения вашей почты.</p>`
    };

  await transporter.sendMail(mailOptions);
  console.log('Письмо отправлено на адрес:', email);
}


// Endpoint для получения всех уведомлений
app.get('/api/notifications', (req, res) => {
    db.query(
        'SELECT * FROM notifications ORDER BY createdAt DESC',
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка сервера при получении уведомлений.' });
            }
            res.json(results);
        }
    );
});

// Endpoint для создания нового уведомления
app.post('/api/notifications', (req, res) => {
    let { name, phone, email, description } = req.body;

    name = name || "Нет данных";
    phone = phone || "Нет данных";
    email = email || "Нет данных";
    description = description || "Нет данных";

    db.query(
        'INSERT INTO notifications (name, phone, email, description, isRead, createdAt) VALUES (?, ?, ?, ?, false, NOW())',
        [name, phone, email, description],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка сервера при создании уведомления.' });
            }
            res.status(201).json({ message: 'Уведомление создано успешно!', id: result.insertId });
        }
    );
});

// Endpoint для отметки уведомления как прочитанного
app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    
    db.query(
        'UPDATE notifications SET isRead = true WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка сервера при обновлении уведомления.' });
            }
            res.json({ message: 'Уведомление отмечено как прочитанное.' });
        }
    );
});

app.delete('/api/notifications/:id/delete', (req, res) => {
  const { id } = req.params;
    
  db.query(
      'DELETE FROM notifications WHERE id = ?',
      [id],
      (err, result) => {
          if (err) {
              return res.status(500).json({ error: 'Ошибка сервера при удалении уведомления.', details: err });
          }
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Уведомление с таким ID не найдено.' });
          }
          res.json({ message: 'Уведомление успешно удалено.' });
      }
  );
});

app.get('/api/price', (req, res) => {
  fs.readFile('src/Server/Price.json', 'utf8', (err, data) => {
      if (err) {
          console.log(err)
          return res.status(500).send('Error reading file');
      }
      const jsonData = JSON.parse(data);  // Преобразуем строку в объект
      res.json(jsonData);  // Отправляем объект как JSON ответ
  });
});

app.put('/api/update-discount', (req, res) => {
  const { Discount } = req.body;

  if (typeof Discount !== 'number') {
    return res.status(400).json({ error: 'Discount должен быть числом' });
  }

  // Чтение текущего файла JSON
  fs.readFile("src/Server/Price.json", 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при чтении файла' });
    }

    let jsonData = JSON.parse(data);

    // Обновление значения Discount
    jsonData[0].Discount = Discount;

    // Запись изменений обратно в файл
    fs.writeFile("src/Server/Price.json", JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при записи в файл' });
      }

      return res.status(200).json({ message: 'Discount успешно обновлен' });
    });
  });
});

// const __dirname = path.resolve();

// app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
