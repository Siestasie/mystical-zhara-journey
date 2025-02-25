import express from 'express'
import bcrypt from 'bcrypt'
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from "multer";

import db from './db.js'

dotenv.config();

const app = express();

// Конфигурация загрузки файлов
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Настройки сервера
app.use(cors({ origin: 'http://localhost:8080', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Создание таблицы, если её нет
db.query(`
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fullDescription TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    specs JSON,
    image JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Ошибка при создании таблицы:', err);
  }
});

// ✅ **Добавление продукта с изображениями**
app.post('/api/products', upload.array("image", 3), (req, res) => {
  const { name, description, fullDescription, price, category, specs } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "Не загружены изображения" });
  }

  const imagePaths = files.map(file => `/uploads/${file.filename}`);

  db.query(
    "INSERT INTO products (name, description, fullDescription, price, category, specs, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, description, fullDescription, price, category, specs ? JSON.stringify(specs) : null, JSON.stringify(imagePaths)],
    (err, result) => {
      if (err) {
        console.error("Ошибка при добавлении продукта:", err);
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
      }
      res.status(201).json({ id: result.insertId, message: "Продукт успешно добавлен" });
    }
  );
});

// ✅ **Обновление изображения продукта**
app.put('/api/products/:id/image', upload.single("image"), (req, res) => {
  const productId = req.params.id;
  const index = parseInt(req.body.index);
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Файл изображения отсутствует" });
  }

  if (isNaN(index) || index < 0 || index > 2) {
    return res.status(400).json({ error: "Неверный индекс изображения (допустимо 0-2)" });
  }

  // Проверяем, существует ли продукт
  db.query("SELECT * FROM products WHERE id = ?", [productId], (err, products) => {
    if (err) {
      console.error("Ошибка при проверке продукта:", err);
      return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }

    if (products.length === 0) {
      return res.status(404).json({ error: "Продукт не найден" });
    }

    let currentImages = JSON.parse(products[0].image) || [];
    if (index >= currentImages.length) {
      return res.status(400).json({ error: "Указанный индекс не существует" });
    }

    // Обновляем изображение по индексу
    currentImages[index] = `/uploads/${file.filename}`;

    db.query("UPDATE products SET image = ? WHERE id = ?", [
      JSON.stringify(currentImages),
      productId,
    ], (err) => {
      if (err) {
        console.error("Ошибка при обновлении изображения:", err);
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
      }

      res.json({ message: "Изображение обновлено", newImage: currentImages[index] });
    });
  });
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

app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Error fetching product' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Получаем первый найденный продукт
    const product = results[0];

    // Парсим JSON-строки в массивы
    try {
      product.specs = product.specs ? JSON.parse(product.specs) : [];
      product.image = product.image ? JSON.parse(product.image) : [];
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      product.specs = [];
      product.image = [];
    }

    console.log(product); // Проверим, что данные корректны
    res.json(product);
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

app.put("/api/update-discounts", (req, res) => {
  const products = req.body.products;

  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "Неверный формат данных" });
  }

  // Начинаем транзакцию
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка начала транзакции: " + err.message });
    }

    // Создаем массив промисов для обновления скидок
    const queries = products.map((product) => {
      return new Promise((resolve, reject) => {
        db.execute(
          "UPDATE products SET discount = ? WHERE id = ?",
          [parseFloat(product.discount.toFixed(2)), product.id], // Округляем скидку до 2 знаков
          (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          }
        );
      });
    });

    // Выполняем все запросы параллельно
    Promise.all(queries)
      .then(() => {
        // Фиксируем транзакцию, если все запросы прошли успешно
        db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => {
              res.status(500).json({ error: "Ошибка при фиксации транзакции: " + commitErr.message });
            });
          }
          res.json({ message: "Скидки успешно обновлены" });
        });
      })
      .catch((error) => {
        // Откатываем транзакцию при ошибке
        db.rollback(() => {
          res.status(500).json({ error: "Ошибка обновления скидок: " + error.message });
        });
      });
  });
});

// блог пост обработка

app.get('/api/blog-posts', (req, res) => {
  db.query('SELECT * FROM blog_posts ORDER BY createdAt DESC', (err, results) => {
    if (err) {
      console.error('Error fetching blog posts:', err);
      return res.status(500).json({ error: 'Error fetching blog posts' });
    }
    res.json(results);
  });
});

app.delete('/api/blog-posts/:id', (req, res) => {
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

app.post('/api/blog-posts', upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const image = req.file; // Получаем изображение, загруженное через FormData

  if (image) {
    const imagePath = `/uploads/${image.filename}`; // Путь к изображению

    // Добавляем пост в базу данных с изображением
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
  } else {
    // Если изображения нет, добавляем пост без изображения
    db.query(
      'INSERT INTO blog_posts (title, content, author) VALUES (?, ?, ?)',
      [title, content, 'Admin'],
      (err, result) => {
        if (err) {
          console.error('Error adding blog post:', err);
          return res.status(500).json({ error: 'Error adding blog post' });
        }
        res.status(201).json({ id: result.insertId, message: 'Blog post added successfully' });
      }
    );
  }
});

app.post('/api/resend-verification', async (req, res) => {
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

    await sendVerificationEmail(email, token);
    
    res.json({ message: 'Письмо с подтверждением отправлено' });
  } catch (error) {
    console.error('Ошибка при повторной отправке:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/login', async (req, res) => {
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

app.post('/api/register', async (req, res) => {
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

async function sendVerificationEmail(email, token) {

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
  // Создание абсолютного пути к файлу с помощью __dirname
  const filePath = path.join(__dirname, 'Price.json');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error reading file');
    }
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});


app.put('/api/update-discount-Pricelist', (req, res) => {
  const { Discount } = req.body;
  console.log(process.cwd());
  if (typeof Discount !== 'number') {
    return res.status(400).json({ error: 'Discount должен быть числом' });
  }

  fs.readFile("src/Server/Price.json", 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при чтении файла' });
    }

    let jsonData = JSON.parse(data);

    jsonData[0].Discount = Discount;

    fs.writeFile("src/Server/Price.json", JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при записи в файл' });
      }

      return res.status(200).json({ message: 'Discount успешно обновлен' });
    });
  });
});

// New endpoints for account settings
app.post('/api/change-password', async (req, res) => {
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

app.post('/api/update-user-info', (req, res) => {
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

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, fullDescription, price, category, specs, image } = req.body;

  if (image && image.startsWith('data:image')) {
    // Декодирование Base64 изображения в файл
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
    const imagePath = path.join(uploadsDir, `${Date.now()}.jpg`);
    fs.writeFileSync(imagePath, imageBuffer);

    db.query(
      'UPDATE products SET name = ?, description = ?, fullDescription = ?, price = ?, category = ?, specs = ?, image = ? WHERE id = ?',
      [name, description, fullDescription, price, category, JSON.stringify(specs), `/uploads/${path.basename(imagePath)}`, id],
      (err) => {
        if (err) {
          console.error('Error updating product:', err);
          return res.status(500).json({ error: 'Error updating product' });
        }
        res.json({ message: 'Product updated successfully' });
      }
    );
  } else {
    db.query(
      'UPDATE products SET name = ?, description = ?, fullDescription = ?, price = ?, category = ?, specs = ? WHERE id = ?',
      [name, description, fullDescription, price, category, JSON.stringify(specs), id],
      (err) => {
        if (err) {
          console.error('Error updating product:', err);
          return res.status(500).json({ error: 'Error updating product' });
        }
        res.json({ message: 'Product updated successfully' });
      }
    );
  }
});

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
  // The directory where your React build files are located
  const buildPath = path.join(__dirname, '../../dist');

  console.log(buildPath);

  // Serve static files
  app.use(express.static(buildPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});