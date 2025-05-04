import { NextRequest, NextResponse } from 'next/server';
import db from '../../../config/enterprise';
// import { formatPendaftaranId } from '../../../utils/idFormatter'; // Hapus import ini

// Definisikan interface untuk data pendaftaran (contoh)
interface PendaftaranData {
    rekomendasiPendaftaran: string;
    jalurPendaftaran: 'Reguler Umum' | 'Reguler Prestasi' | 'Reguler Sosial';
    programPeminatan: 'MIPA' | 'IPS' | 'BHS' | 'AGM' | 'Tahfidz';
    nama: string;
    jenisKelamin: 'Laki-laki' | 'Perempuan';
    tempatLahir: string;
    tanggalLahir: string; // Format YYYY-MM-DD
    noHp: string;
    tinggal: 'Bersama Orang tua' | 'Bersama Wali' | 'Bersama Kakak' | 'Tinggal Sendiri' | 'Lainnya';
    dukuhJalan: string;
    desa: string;
    rt: string;
    rw: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    namaAyah: string;
    pendidikanAyah: 'SD' | 'SMP' | 'SMA/SMK' | 'D1' | 'D2' | 'D3' | 'S1' | 'S2' | 'S3';
    pekerjaanAyah: string;
    namaIbu: string;
    pendidikanIbu: 'SD' | 'SMP' | 'SMA/SMK' | 'D1' | 'D2' | 'D3' | 'S1' | 'S2' | 'S3';
    pekerjaanIbu: string;
    alamatOrangtua: string;
    noHpAyah: string | null;
    noHpIbu: string;
    punyaSaudaraDiMansaba: 'Punya' | 'Tidak Punya';
    namaWali: string;
    hubunganWali: string;
    pendidikanWali: 'SD' | 'SMP' | 'SMA/SMK' | 'D1' | 'D2' | 'D3' | 'S1' | 'S2' | 'S3';
    pekerjaanWali: string;
    alamatWali: string;
    noHpWali: string;
    namaSekolahAsal: string;
    alamatSekolahAsal: string;
    nisn: string | null;
    punyaPiagam: 'Punya' | 'Tidak Punya';
    motivasi: string;
    tempatTanggalLahir: string;
    alamatLengkap: string;
}

// Definisikan interface untuk response API
interface PendaftaranResponse {
    message: string;
    nomorPendaftaran?: string; // Optional karena mungkin ada error
}

export async function POST(req: NextRequest) {
    try {
        const body: PendaftaranData = await req.json();

        // Log data yang diterima
        console.log('Data yang diterima:', body);

        // Validasi data (contoh sederhana)
        if (!body.nama || body.nama.length < 3) {
            return NextResponse.json({ message: 'Nama harus diisi dan minimal 3 karakter' }, { status: 400 });
        }

        // Tambahkan validasi lainnya sesuai kebutuhan

        const {
            rekomendasiPendaftaran,
            jalurPendaftaran,
            programPeminatan,
            nama,
            jenisKelamin,
            tempatLahir,
            tanggalLahir,
            noHp,
            tinggal,
            dukuhJalan,
            desa,
            rt,
            rw,
            kecamatan,
            kabupaten,
            provinsi,
            namaAyah,
            pendidikanAyah,
            pekerjaanAyah,
            namaIbu,
            pendidikanIbu,
            pekerjaanIbu,
            alamatOrangtua,
            noHpAyah,
            noHpIbu,
            punyaSaudaraDiMansaba,
            namaWali,
            hubunganWali,
            pendidikanWali,
            pekerjaanWali,
            alamatWali,
            noHpWali,
            namaSekolahAsal,
            alamatSekolahAsal,
            nisn,
            punyaPiagam,
            motivasi,
            tempatTanggalLahir,
            alamatLengkap,
        } = body;

        // Dapatkan koneksi dari pool
        const connection = await db.getConnection();

        try {
            // Jalankan query untuk menyimpan data
            const [result] = await connection.execute('INSERT INTO pendaftaran (rekomendasiPendaftaran, jalurPendaftaran, programPeminatan, nama, jenisKelamin, tempatLahir, tanggalLahir, noHp, tinggal, dukuhJalan, desa, rt, rw, kecamatan, kabupaten, provinsi, namaAyah, pendidikanAyah, pekerjaanAyah, namaIbu, pendidikanIbu, pekerjaanIbu, alamatOrangtua, noHpAyah, noHpIbu, punyaSaudaraDiMansaba, namaWali, hubunganWali, pendidikanWali, pekerjaanWali, alamatWali, noHpWali, namaSekolahAsal, alamatSekolahAsal, nisn, punyaPiagam, motivasi, tempatTanggalLahir, alamatLengkap) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [rekomendasiPendaftaran, jalurPendaftaran, programPeminatan, nama, jenisKelamin, tempatLahir, tanggalLahir, noHp, tinggal, dukuhJalan, desa, rt, rw, kecamatan, kabupaten, provinsi, namaAyah, pendidikanAyah, pekerjaanAyah, namaIbu, pendidikanIbu, pekerjaanIbu, alamatOrangtua, noHpAyah, noHpIbu, punyaSaudaraDiMansaba, namaWali, hubunganWali, pendidikanWali, pekerjaanWali, alamatWali, noHpWali, namaSekolahAsal, alamatSekolahAsal, nisn, punyaPiagam, motivasi, tempatTanggalLahir, alamatLengkap]);

            // Dapatkan ID pendaftaran yang baru diinsert
            const insertId = (result as any).insertId;

            // Dapatkan nomor pendaftaran dari database
            const [pendaftar] = await connection.execute<any>('SELECT nomorPendaftaran FROM pendaftaran WHERE id = ?', [insertId]);

            const nomorPendaftaran = pendaftar[0].nomorPendaftaran;

            // Kembalikan respons sukses dengan nomor pendaftaran
            return NextResponse.json<PendaftaranResponse>({ message: 'Pendaftaran berhasil', nomorPendaftaran: nomorPendaftaran }, { status: 201 });
        } finally {
            // Pastikan untuk melepaskan koneksi setelah digunakan
            connection.release();
        }
    } catch (error) {
        console.error('Error menyimpan data:', error);
        return NextResponse.json({ message: 'Gagal menyimpan data', error: error }, { status: 500 });
    }
}