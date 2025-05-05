// src/app/api/next-nomor-du/route.ts
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT MAX(CAST(SUBSTRING(nomorDaftarUlang, 4) AS UNSIGNED)) AS lastNumber FROM daftar_ulang'
      );

      const lastNumber = rows[0]?.lastNumber || 0;
      const nextNumber = `DU-${String(lastNumber + 1).padStart(1, '1')}`; // update padding
      return NextResponse.json({ nextNomorDU: nextNumber });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal mengambil nomor DU terbaru:', error);
    return NextResponse.json({ message: 'Gagal mengambil nomor DU terbaru', error: error }, { status: 500 });
  }
}