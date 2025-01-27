import express from 'express'
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import cors from 'cors';
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

// API-эндпоинт для входа
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Проверка пользователя в базе данных
    db.query(
      'SELECT * FROM `users` WHERE email = ?',
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка сервера.' });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: 'Неверный email или пароль.' });
        }

        const user = results[0];

        // Сравнение пароля с использованием bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(isPasswordValid);

        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Неверный email или пароль.' });
        }

        // Возвращаем успешный ответ
        res.status(200).json({ message: 'Вход выполнен успешно!', user });
      }
    );
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

app.post('/api/register', async (req, res) => {
    const {name, email, password } = req.body;
  
    // Проверить, существует ли пользователь с таким email
    db.query('SELECT * FROM `users` WHERE email = ?' [email], async (err, results) => {
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
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка сервера при создании пользователя' });
          }
  
          res.status(201).json({ message: 'Регистрация успешна!' });
        }
      );
    });
  });

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
    const { name, phone, email, description } = req.body;
    
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
