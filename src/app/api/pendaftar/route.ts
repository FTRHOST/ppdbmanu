// src/app/api/pendaftar/route.ts (Optional)
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id, nomorPendaftaran, nama, namaSekolahAsal FROM pendaftaran' // Sesuaikan query
      );
      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal mengambil data pendaftar:', error);
    return NextResponse.json({ message: 'Gagal mengambil data pendaftar', error: error }, { status: 500 });
  }
}