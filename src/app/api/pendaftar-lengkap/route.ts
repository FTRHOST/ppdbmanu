// src/app/api/pendaftar-lengkap/route.ts
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise'; // Path yang benar
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT 
          id, 
          nomorPendaftaran, 
          nama, 
          jenisKelamin, 
          CONCAT(tempatLahir, ', ', DATE_FORMAT(tanggalLahir, '%d %M %Y')) AS tempatTanggalLahir, 
          noHp, 
          alamatLengkap, 
          namaSekolahAsal AS sekolahAsal, 
          programPeminatan, 
          jalurPendaftaran, 
          namaAyah, 
          namaIbu, 
          statusDaftarUlang 
        FROM pendaftaran`
      ); // Sesuaikan query dengan struktur tabel Anda
      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal mengambil data pendaftar:', error);
    return NextResponse.json({ message: 'Gagal mengambil data pendaftar', error: error }, { status: 500 });
  }
}