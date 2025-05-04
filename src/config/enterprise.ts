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
          tempatLahir VARCHAR(255) NULL,
          tanggalLahir DATE NULL,
          alamatLengkap TEXT NULL,
          statusDaftarUlang ENUM('Sudah', 'Belum') NOT NULL DEFAULT 'Belum',
          nomorPendaftaran VARCHAR(255) NULL
        )
      `);
      console.log('Tabel `pendaftaran` berhasil dibuat.');

      

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

      // Buat trigger generateNomorPendaftaranBeforeInsert
      console.log('Membuat trigger `generateNomorPendaftaranBeforeInset`...');
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
      console.log('Tabel `pendaftaran` sudah ada.');
      // Tambahkan logika untuk ALTER TABLE jika kolom statusDaftarUlang belum ada
      const [columns] = await connection.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM pendaftaran LIKE "statusDaftarUlang"');
      if (columns.length === 0) {
        console.log('Kolom `statusDaftarUlang` tidak ditemukan. Menambahkan kolom...');
        await connection.execute(`ALTER TABLE pendaftaran ADD COLUMN statusDaftarUlang ENUM('Sudah', 'Belum') NOT NULL DEFAULT 'Belum'`);
        console.log('Kolom `statusDaftarUlang` berhasil ditambahkan.');
      }

      // Tambahkan logika untuk membuat fungsi generateNomorPendaftaran jika belum ada
      const [functionExists] = await connection.query<mysql.RowDataPacket[]>('SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME = ?', [dbConfig.database, 'generateNomorPendaftaran']);
      if (functionExists.length === 0) {
        console.log('Fungsi `generateNomorPendaftaran` tidak ditemukan. Membuat fungsi...');
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
      }

            // Tambahkan logika untuk membuat fungsi generateNomorPendaftaran jika belum ada
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
            }

      // Tambahkan logika untuk membuat trigger generateNomorPendaftaranBeforeInsert jika belum ada
      const [triggerExists] = await connection.query<mysql.RowDataPacket[]>('SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? AND TRIGGER_NAME = ?', [dbConfig.database, 'generateNomorPendaftaranBeforeInsert']);
      if (triggerExists.length === 0) {
        console.log('Trigger `generateNomorPendaftaranBeforeInsert` tidak ditemukan. Membuat trigger...');
        await connection.execute(`
            CREATE TRIGGER generateNomorPendaftaranBeforeInsert
            BEFORE INSERT ON pendaftaran
            FOR EACH ROW
            BEGIN
              SET NEW.nomorPendaftaran = generateNomorPendaftaran();
            END 
          `);
        console.log('Trigger `generateNomorPendaftaranBeforeInsert` berhasil dibuat.');
      }
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