var mysql = require('mysql');

// Informasi koneksi database, sebaiknya simpan di environment variable
const dbConfig = {
  host: '62.72.7.236',
  user: 'db_coba',
  password: 'cobainaja',
  database: 'db_coba',
};

var connection = mysql.createConnection(dbConfig);

connection.connect(function (err) {
  if (err) {
    console.error('Koneksi database gagal: ' + err.stack);
    return;
  }
  console.log('Terhubung ke database dengan id ' + connection.threadId);

  // Data yang akan dimasukkan
  const dataPendaftaran = {
    rekomendasiPendaftaran: 'ff',
    jalurPendaftaran: 'Reguler Umum',
    programPeminatan: 'MIPA',
    nama: 'aaa',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Batang',
    tanggalLahir: '2015-12-17',
    noHp: '08222222212',
    tinggal: 'Bersama Wali',
    dukuhJalan: 'qsqas',
    desa: 'asasas',
    rt: '1',
    rw: '2',
    kecamatan: 'bbb',
    kabupaten: 'bbb',
    provinsi: 'agvga',
    namaAyah: 'haha',
    pendidikanAyah: 'SD',
    pekerjaanAyah: 'kkk',
    namaIbu: 'ajaj',
    pendidikanIbu: 'SD',
    pekerjaanIbu: 'ajja',
    alamatOrangtua: 'hahay',
    noHpAyah: null, // Sebaiknya gunakan null jika tidak ada data
    noHpIbu: '0909',
    punyaSaudaraDiMansaba: 'Punya',
    namaWali: 'ebeww',
    hubunganWali: 'ajaj',
    pendidikanWali: 'SD',
    pekerjaanWali: 'hahy',
    alamatWali: 'ajja',
    noHpWali: '09098008089',
    namaSekolahAsal: 'hhahahy',
    alamatSekolahAsal: 'hahah',
    nisn: null, // Sebaiknya gunakan null jika tidak ada data
    punyaPiagam: 'Punya',
    motivasi: 'hahy',
    tempatTanggalLahir: 'Batang, 17 Desember 2015',
    alamatLengkap: 'qsqas, asasas, RT 001 / RW 002, Kec. bbb, Kab. bbb, Prov. agvga',
  };

  // Query menggunakan parameterized query untuk mencegah SQL Injection
  const query = 'INSERT INTO pendaftaran SET ?';

  connection.query(query, dataPendaftaran, function (error, results, fields) {
    if (error) {
      console.error('Error menjalankan query: ' + error.stack);
      return;
    }
    console.log('Data berhasil ditambahkan, ID: ' + results.insertId);
  });

  connection.end(function (err) {
    if (err) {
      console.error('Error menutup koneksi: ' + err.stack);
      return;
    }
    console.log('Koneksi database ditutup.');
  });
});