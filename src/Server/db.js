import mysql from 'mysql2'

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'klimatholoddatabase',
  });
  
  db.connect(err => {
    if (err) {
      console.error('Ошибка подключения к базе данных:', err);
      return;
    }
    console.log('✅ Подключено к базе данных');
  });

export default db;