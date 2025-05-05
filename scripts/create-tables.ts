// scripts/create-tables.ts
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '62.72.7.236',
  user: process.env.DB_USER || 'db_coba',
  password: process.env.DB_PASSWORD || 'cobainaja',
  database: process.env.DB_DATABASE || 'db_coba',
  connectionLimit: 10, // Sesuaikan sesuai kebutuhan
};

async function checkAndCreateTables() {
  let connection;
  try {
    const db = mysql.createPool(dbConfig);
    connection = await db.getConnection();

    // Mulai transaction
    await connection.beginTransaction();

    // Periksa apakah tabel pendaftaran ada
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
          tempatLahir VARCHAR(255) NULL,
          tanggalLahir DATE NULL,
          alamatLengkap TEXT NULL,
          statusDaftarUlang ENUM('Sudah', 'Belum') NOT NULL DEFAULT 'Belum',
          nomorPendaftaran VARCHAR(255) NULL
        )
      `);
      console.log('Tabel `pendaftaran` berhasil dibuat.');
    } else {
      console.log('Tabel `pendaftaran` sudah ada.');
    }

    // Periksa apakah fungsi generateNomorPendaftaran ada
    const [functionExists] = await connection.query<mysql.RowDataPacket[]>('SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME = ?', [dbConfig.database, 'generateNomorPendaftaran']);
    if (functionExists.length === 0) {
      // Buat fungsi generateNomorPendaftaran
      console.log('Membuat fungsi `generateNomorPendaftaran`...');
      await connection.execute(`
          CREATE FUNCTION generateNomorPendaftaran()
          RETURNS VARCHAR(255)
          DETERMINISTIC
          BEGIN
            DECLARE lastId INT;
            DECLARE newId INT;
            DECLARE formattedId VARCHAR(255);

            -- Dapatkan ID terakhir
            SELECT COALESCE(MAX(CAST(SUBSTRING(nomorPendaftaran, 5) AS UNSIGNED)), 0) INTO lastId FROM pendaftaran;

            -- Hasilkan ID baru
            SET newId = lastId + 1;

            -- Format ID
            SET formattedId = CONCAT('MANU', LPAD(newId, 3, '0'));

            RETURN formattedId;
          END 
        `);
      console.log('Fungsi `generateNomorPendaftaran` berhasil dibuat.');
    } else {
      console.log('Fungsi `generateNomorPendaftaran` sudah ada.');
    }

    // Periksa apakah trigger generateNomorPendaftaranBeforeInsert ada
    const [triggerExists] = await connection.query<mysql.RowDataPacket[]>('SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? AND TRIGGER_NAME = ?', [dbConfig.database, 'generateNomorPendaftaranBeforeInsert']);
    if (triggerExists.length === 0) {
      // Buat trigger generateNomorPendaftaranBeforeInsert
      console.log('Membuat trigger `generateNomorPendaftaranBeforeInsert`...');
      await connection.execute(`
          CREATE TRIGGER generateNomorPendaftaranBeforeInsert
          BEFORE INSERT ON pendaftaran
          FOR EACH ROW
          BEGIN
            SET NEW.nomorPendaftaran = generateNomorPendaftaran();
          END 
        `);
      console.log('Trigger `generateNomorPendaftaranBeforeInsert` berhasil dibuat.');
    } else {
      console.log('Trigger `generateNomorPendaftaranBeforeInsert` sudah ada.');
    }
        // Tambahkan logika untuk membuat table daftar_ulang jika belum ada
    const [daftarUlang] = await connection.query<mysql.RowDataPacket[]>('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [dbConfig.database, 'daftar_ulang']);
     if (daftarUlang.length === 0) {
          console.log('Table `daftar_ulang` tidak ditemukan. Membuat table...');
          await connection.execute(`
            CREATE TABLE daftar_ulang (
              id INT AUTO_INCREMENT PRIMARY KEY,
              pendaftarId VARCHAR(255) NOT NULL,
              nomorDaftarUlang VARCHAR(255) NOT NULL,
              tanggalDaftarUlang DATE NOT NULL,
              kelengkapanKK BOOLEAN NOT NULL DEFAULT FALSE,
              kelengkapanSKL BOOLEAN NOT NULL DEFAULT FALSE,
              kelengkapanPiagam BOOLEAN NULL,
              kelengkapanSKTM BOOLEAN NULL,
              bayarDaftarUlang BOOLEAN NOT NULL DEFAULT FALSE,
              biayaDaftarUlang INT NULL,
              ukuranSeragam ENUM('S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Custom') NOT NULL,
              seragamOsis BOOLEAN NOT NULL DEFAULT FALSE,
              seragamPramuka BOOLEAN NOT NULL DEFAULT FALSE,
              seragamBatik BOOLEAN NOT NULL DEFAULT FALSE,
              seragamOlahraga BOOLEAN NOT NULL DEFAULT FALSE
            )`);
          console.log('Table `daftar_ulang` berhasil dibuat.');
       }else{
           console.log('Table `daftar_ulang` sudah ada.'); // Add log for already exist case
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

async function main() {
  try {
    await checkAndCreateTables();
    console.log('Database tables, function, and trigger checked and created (if needed).');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main();