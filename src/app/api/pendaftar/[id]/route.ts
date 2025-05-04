// src/app/api/pendaftar/[id]/route.ts
import { NextResponse } from 'next/server';
import db from '../../../../config/enterprise'; // Path yang benar
import mysql from 'mysql2/promise';

interface Params {
  id: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: 'ID pendaftar diperlukan' }, { status: 400 });
    }

    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT 
          id, 
          nomorPendaftaran,
          nisn,
          nama,
          CONCAT(tempatLahir, ', ', DATE_FORMAT(tanggalLahir, '%d %M %Y')) AS tempatTanggalLahir,
          jenisKelamin,
          alamatLengkap,
          dukuhJalan,
          desa,
          rt,
          rw,
          noHp,
          tinggal,
          jalurPendaftaran,
          programPeminatan,
          namaAyah,
          pendidikanAyah,
          pekerjaanAyah,
          noHpAyah,
          namaIbu,
          pendidikanIbu,
          pekerjaanIbu,
          noHpIbu,
          alamatOrangtua,
          punyaSaudaraDiMansaba,
          namaWali,
          hubunganWali,
          pendidikanWali,
          pekerjaanWali,
          alamatWali,
          noHpWali,
          namaSekolahAsal,
          alamatSekolahAsal,
          rekomendasiPendaftaran,
          punyaPiagam,
          motivasi,
          tanggalDaftar
        FROM pendaftaran WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return NextResponse.json({ message: 'Data pendaftar tidak ditemukan' }, { status: 404 });
      }

      return NextResponse.json(rows[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal mengambil data pendaftar:', error);
    return NextResponse.json({ message: 'Gagal mengambil data pendaftar', error: error }, { status: 500 });
  }
}