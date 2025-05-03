// app/api/pendaftaran/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '../../../config/enterprise'; // Pastikan path ini benar

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validasi data di sisi server (opsional, tapi disarankan)
        // Anda bisa menggunakan Zod schema yang sama di sini


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
            tempatTanggalLahir, // Menambahkan field tempatTanggalLahir
            alamatLengkap, // Menambahkan field alamatLengkap
        } = body;
        

        // Dapatkan koneksi dari pool
        const connection = await db.getConnection();

        try {
            // Jalankan query untuk menyimpan data
            const [result] = await connection.execute('INSERT INTO pendaftaran (rekomendasiPendaftaran, jalurPendaftaran, programPeminatan, nama, jenisKelamin, tempatLahir, tanggalLahir, noHp, tinggal, dukuhJalan, desa, rt, rw, kecamatan, kabupaten, provinsi, namaAyah, pendidikanAyah, pekerjaanAyah, namaIbu, pendidikanIbu, pekerjaanIbu, alamatOrangtua, noHpAyah, noHpIbu, punyaSaudaraDiMansaba, namaWali, hubunganWali, pendidikanWali, pekerjaanWali, alamatWali, noHpWali, namaSekolahAsal, alamatSekolahAsal, nisn, punyaPiagam, motivasi, tempatTanggalLahir, alamatLengkap) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [rekomendasiPendaftaran, jalurPendaftaran, programPeminatan, nama, jenisKelamin, tempatLahir, tanggalLahir, noHp, tinggal, dukuhJalan, desa, rt, rw, kecamatan, kabupaten, provinsi, namaAyah, pendidikanAyah, pekerjaanAyah, namaIbu, pendidikanIbu, pekerjaanIbu, alamatOrangtua, noHpAyah, noHpIbu, punyaSaudaraDiMansaba, namaWali, hubunganWali, pendidikanWali, pekerjaanWali, alamatWali, noHpWali, namaSekolahAsal, alamatSekolahAsal, nisn, punyaPiagam, motivasi, tempatTanggalLahir, alamatLengkap]);
            // Dapatkan ID pendaftaran yang baru diinsert
            const insertId = (result as any).insertId;

            // Kembalikan respons sukses dengan ID
            return NextResponse.json({ message: 'Pendaftaran berhasil', id: insertId }, { status: 201 });
        } finally {
            // Pastikan untuk melepaskan koneksi setelah digunakan
            connection.release();
        }
    } catch (error) {
        console.error('Error menyimpan data:', error);
        return NextResponse.json({ message: 'Gagal menyimpan data', error: error }, { status: 500 });
    }
}