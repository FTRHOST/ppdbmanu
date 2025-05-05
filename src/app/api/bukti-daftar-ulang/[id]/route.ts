// src/app/api/bukti-daftar-ulang/[id]/route.ts
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
      return NextResponse.json({ message: 'ID Daftar Ulang diperlukan' }, { status: 400 });
    }

    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT 
          p.nomorPendaftaran, 
          p.nama, 
          p.alamatLengkap, 
          p.namaSekolahAsal, 
          p.jenisKelamin, 
          du.nomorDaftarUlang, 
          du.kelengkapanKK, 
          du.kelengkapanSKL, 
          du.kelengkapanPiagam, 
          du.kelengkapanSKTM, 
          du.bayarDaftarUlang, 
          du.biayaDaftarUlang, 
          du.tanggalDaftarUlang,
          du.ukuranSeragam,
          du.seragamOsis,
          du.seragamPramuka,
          du.seragamBatik,
          du.seragamOlahraga,
          kabupaten
        FROM daftar_ulang du
        INNER JOIN pendaftaran p ON du.id = p.id
        WHERE du.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return NextResponse.json({ message: 'Data daftar ulang tidak ditemukan' }, { status: 404 });
      }

      return NextResponse.json(rows[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal mengambil data bukti daftar ulang:', error);
    return NextResponse.json({ message: 'Gagal mengambil data bukti daftar ulang', error: error }, { status: 500 });
  }
}