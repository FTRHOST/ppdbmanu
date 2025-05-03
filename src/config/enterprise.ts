// config/enterprise.ts
import mysql from 'mysql2/promise';

const dbConfig = {
  host: '62.72.7.236',
  user: 'db_coba',
  password: 'cobainaja',
  database: 'db_coba',
  connectionLimit: 10, // Sesuaikan sesuai kebutuhan
};

const db = mysql.createPool(dbConfig);

async function checkAndCreateTable() {
  let connection;
  try {
    // Dapatkan koneksi dari pool
    connection = await db.getConnection();

    // Mulai transaction
    await connection.beginTransaction();

    // Periksa apakah tabel pendaftaran ada dengan query yang lebih spesifik
    const [tables] = await connection.query<mysql.RowDataPacket[]>('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [dbConfig.database, 'pendaftaran']);

    if (tables.length === 0) {
      // Tabel tidak ada, buat tabel
      console.log('Tabel `pendaftaran` tidak ditemukan. Membuat tabel...');
      await connection.execute(`
        CREATE TABLE pendaftaran (
          id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
          rekomendasiPendaftaran VARCHAR(255) NULL,
          jalurPendaftaran ENUM('Reguler Umum', 'Reguler Prestasi', 'Reguler Sosial') NULL,
          programPeminatan ENUM('MIPA', 'IPS', 'BHS', 'AGM', 'Tahfidz') NULL,
          nama VARCHAR(255) NULL,
          jenisKelamin ENUM('Laki-laki', 'Perempuan') NULL,
          tempatLahir VARCHAR(255) NULL,
          tanggalLahir DATE NULL,
          noHp VARCHAR(20) NULL,
          tinggal ENUM('Bersama Orang tua', 'Bersama Wali', 'Bersama Kakak', 'Tinggal Sendiri', 'Lainnya') NULL,
          dukuhJalan VARCHAR(255) NULL,
          desa VARCHAR(255) NULL,
          rt VARCHAR(10) NULL,
          rw VARCHAR(10) NULL,
          kecamatan VARCHAR(255) NULL,
          kabupaten VARCHAR(255) NULL,
          provinsi VARCHAR(255) NULL,
          namaAyah VARCHAR(255) NULL,
          pendidikanAyah ENUM('SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3') NULL,
          pekerjaanAyah VARCHAR(255) NULL,
          namaIbu VARCHAR(255) NULL,
          pendidikanIbu ENUM('SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3') NULL,
          pekerjaanIbu VARCHAR(255) NULL,
          alamatOrangtua TEXT NULL,
          noHpAyah VARCHAR(20) NULL,
          noHpIbu VARCHAR(20) NULL,
          punyaSaudaraDiMansaba ENUM('Punya', 'Tidak Punya') NULL,
          namaWali VARCHAR(255) NULL,
          hubunganWali VARCHAR(255) NULL,
          pendidikanWali ENUM('SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3') NULL,
          pekerjaanWali VARCHAR(255) NULL,
          alamatWali TEXT NULL,
          noHpWali VARCHAR(20) NULL,
          namaSekolahAsal VARCHAR(255) NULL,
          alamatSekolahAsal TEXT NULL,
          nisn VARCHAR(20) NULL,
          punyaPiagam ENUM('Punya', 'Tidak Punya') NULL,
          motivasi TEXT NULL,
          tanggalDaftar DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
          tempatTanggalLahir VARCHAR(255) NULL,  -- Tambahkan kolom ini
          alamatLengkap TEXT NULL               -- Tambahkan kolom ini
        )
      `);
      console.log('Tabel `pendaftaran` berhasil dibuat.');
    } else {
      console.log('Tabel `pendaftaran` sudah ada.');
    }

    // Commit transaction
    await connection.commit();
  } catch (error) {
    // Rollback transaction jika terjadi error
    if (connection) {
      await connection.rollback();
    }
    console.error('Error memeriksa atau membuat tabel:', error);
    throw error; // Re-throw error agar aplikasi tahu ada masalah
  } finally {
    if (connection) connection.release();
  }
}

async function initializeDatabase() {
  try {
    // Pastikan koneksi database siap
    await db.getConnection();
    console.log('Koneksi database siap.');

    // Periksa dan buat tabel
    await checkAndCreateTable();
    console.log('Database diinisialisasi.');
  } catch (error) {
    console.error('Gagal menginisialisasi database:', error);
    // Mungkin perlu keluar dari aplikasi atau mencoba lagi
    process.exit(1); 
  }
}

// Jalankan inisialisasi database saat modul ini diimpor
initializeDatabase();

export default db;