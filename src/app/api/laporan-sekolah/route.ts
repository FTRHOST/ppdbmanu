// src/app/api/laporan-sekolah/route.ts
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT 
          p.namaSekolahAsal AS namaSekolah,
          COUNT(p.id) AS jumlahPendaftar,
          COUNT(du.pendaftarId) AS jumlahDaftarUlang
        FROM pendaftaran p
        LEFT JOIN daftar_ulang du ON p.id = du.id
        GROUP BY p.namaSekolahAsal
        ORDER BY COUNT(p.id) DESC`
      );

      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal mengambil data laporan sekolah:', error);
    return NextResponse.json({ message: 'Gagal mengambil data laporan sekolah', error: error }, { status: 500 });
  }
}