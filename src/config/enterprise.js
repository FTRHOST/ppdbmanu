// config/enterprise.ts
import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host     : '62.72.7.236',
  user     : 'db_coba',
  password : 'cobainaja',
  database : 'db_coba',
  connectionLimit: 10, // Sesuaikan sesuai kebutuhan
});

export default db;