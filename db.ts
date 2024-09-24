import mysql from 'mysql2/promise'; //MySQL veritabanıyla asenkron olarak çalışmak için kullanılan bir Node.js kütüphanesidir.

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'asd123',  // Şifreni buraya yaz
  database: 'Taskmaster'
});

export default pool;
