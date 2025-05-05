// src/app/api/laporan-harian/route.ts
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise';
import mysql from 'mysql2/promise';
import { format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get('tanggal');

    if (!tanggal) {
      return NextResponse.json({ message: 'Tanggal diperlukan' }, { status: 400 });
    }

    const connection = await db.getConnection();
    try {
      // Query untuk mengambil data pendaftaran
      const [pendaftaranRows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) AS jumlahPendaftar FROM pendaftaran WHERE DATE(tanggalDaftar) = ?`,
        [tanggal]
      );

      // Query untuk mengambil data daftar ulang
      const [daftarUlangRows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) AS jumlahDaftarUlang FROM daftar_ulang WHERE DATE(tanggalDaftarUlang) = ?`,
        [tanggal]
      );

      // Query untuk mengambil data peminatan
      const [peminatanRows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT programPeminatan, COUNT(*) AS jumlah FROM pendaftaran WHERE DATE(tanggalDaftar) = ? GROUP BY programPeminatan`,
        [tanggal]
      );

      // Query untuk mengambil data jenis kelamin
      const [jenisKelaminRows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT jenisKelamin, COUNT(*) AS jumlah FROM pendaftaran WHERE DATE(tanggalDaftar) = ? GROUP BY jenisKelamin`,
        [tanggal]
      );

      // Memproses data
      const jumlahPendaftar = pendaftaranRows[0]?.jumlahPendaftar || 0;
      const jumlahDaftarUlang = daftarUlangRows[0]?.jumlahDaftarUlang || 0;

      const peminatan = {
        MIPA: 0,
        IPS: 0,
        BHS: 0,
        AGM: 0,
        Tahfidz: 0,
      };
      peminatanRows.forEach(row => {
        peminatan[row.programPeminatan as keyof typeof peminatan] = row.jumlah;
      });

      const jenisKelamin = {
        LakiLaki: 0,
        Perempuan: 0,
      };
      jenisKelaminRows.forEach(row => {
        jenisKelamin[row.jenisKelamin === 'Laki-laki' ? 'LakiLaki' : 'Perempuan'] = row.jumlah;
      });

      const reportData = {
        tanggal,
        jumlahPendaftar,
        jumlahDaftarUlang,
        peminatan,
        jenisKelamin,
      };

      return NextResponse.json(reportData);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal mengambil data laporan harian:', error);
    return NextResponse.json({ message: 'Gagal mengambil data laporan harian', error: error }, { status: 500 });
  }
}