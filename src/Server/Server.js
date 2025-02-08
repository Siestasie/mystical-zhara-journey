import express from 'express'
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from "multer";
dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' }); // Сохраняем в папке 'uploads'

// Увеличиваем лимит для JSON
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use('/uploads', express.static(uploadsDir));

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

// Add this SQL query for blog posts
db.query(`
  CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

app.put('/api/products/:id/image', async (req, res) => {
  try {
    const productId = req.params.id;
    const { image, index } = req.body;

    // Проверка валидности индекса
    if (typeof index !== 'number' || index < 0 || index > 2) {
      return res.status(400).json({ error: 'Неверный индекс изображения (допустимо 0-2)' });
    }

    // Поиск продукта
    const [products] = await db.promise().query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Продукт не найден' });
    }

    const currentImages = JSON.parse(products[0].image);
    
    // Проверка существующего индекса
    if (index >= currentImages.length) {
      return res.status(400).json({ error: 'Указанный индекс не существует' });
    }

    // Сохранение нового изображения
    const saveImage = async () => {
      if (image && image.startsWith('data:image')) {
        const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
        if (imageBuffer.length > 5 * 1024 * 1024) {
          throw new Error('Изображение слишком большое (максимум 5MB)');
        }
        const imagePath = path.join(uploadsDir, `${Date.now()}_${index}.jpg`);
        await fs.promises.writeFile(imagePath, imageBuffer);
        return `/uploads/${path.basename(imagePath)}`;
      }
      throw new Error('Неверный формат изображения');
    };

    const newImagePath = await Promise.race([
      saveImage(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Таймаут обработки изображения')), 5000))
    ]);

    // Обновление массива изображений
    const updatedImages = [...currentImages];
    updatedImages[index] = newImagePath;

    // Обновление записи в базе данных
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

app.post('/api/products', async (req, res) => {
  try {
      const { name, description, fullDescription, price, category, specs, image } = req.body;
      console.log(":Name", name, ":Description", description, ":FullDescription", fullDescription, ":Price", price, ":Category", category, ":Specs", specs, ":Images", image);

      if (!Array.isArray(image) || image.length === 0 || image.length > 3) {
          return res.status(400).json({ error: 'Invalid image format or too many image (max 3)' });
      }

      const saveImage = async (img, index) => {
          if (img && img.startsWith('data:image')) {
              const imageBuffer = Buffer.from(img.split(',')[1], 'base64');
              if (imageBuffer.length > 5 * 1024 * 1024) {
                  throw new Error('Image too large (max 5MB)');
              }
              const imagePath = path.join(uploadsDir, `${Date.now()}_${index}.jpg`);
              await fs.promises.writeFile(imagePath, imageBuffer);
              return `/uploads/${path.basename(imagePath)}`;
          }
          throw new Error('Invalid image format');
      };

      const saveImagePromises = image.map((img, index) => 
          Promise.race([
              saveImage(img, index),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Image processing timeout')), 5000))
          ])
      );

      const imagePaths = await Promise.allSettled(saveImagePromises);
      const validImagePaths = imagePaths.filter(res => res.status === 'fulfilled').map(res => res.value);

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
      res.json(results[0]); // Возвращаем первый найденный продукт
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

app.post('/api/blog-posts', (req, res) => {
  const { title, content, image } = req.body;
  
  if (image && image.startsWith('data:image')) {
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
    const imagePath = path.join(uploadsDir, `${Date.now()}.jpg`);
    fs.writeFileSync(imagePath, imageBuffer);

    db.query(
      'INSERT INTO blog_posts (title, content, author, image) VALUES (?, ?, ?, ?)',
      [title, content, 'Admin', `/uploads/${path.basename(imagePath)}`],
      (err, result) => {
        if (err) {
          console.error('Error adding blog post:', err);
          return res.status(500).json({ error: 'Error adding blog post' });
        }
        res.status(201).json({ id: result.insertId, message: 'Blog post added successfully' });
      }
    );
  } else {
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
  fs.readFile('src/Server/Price.json', 'utf8', (err, data) => {
      if (err) {
          console.log(err)
          return res.status(500).send('Error reading file');
      }
      const jsonData = JSON.parse(data);
      res.json(jsonData);
  });
});

app.put('/api/update-discount', (req, res) => {
  const { Discount } = req.body;

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
