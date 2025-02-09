
import mysql from 'mysql2';

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

// Создание таблиц
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

export default db;
