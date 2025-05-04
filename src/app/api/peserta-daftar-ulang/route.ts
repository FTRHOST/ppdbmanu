// src/app/api/peserta-daftar-ulang/route.ts
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise';
import mysql from 'mysql2/promise';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = `
      SELECT 
        p.id, 
        p.nomorPendaftaran, 
        p.nama, 
        p.jenisKelamin, 
        CONCAT(p.tempatLahir, ', ', DATE_FORMAT(p.tanggalLahir, '%d %M %Y')) AS tempatTanggalLahir,
        p.noHp, 
        p.alamatLengkap, 
        p.namaSekolahAsal AS sekolahAsal, 
        p.programPeminatan, 
        p.jalurPendaftaran, 
        p.namaAyah, 
        p.namaIbu, 
        p.statusDaftarUlang,
        d.nomorDaftarUlang,  -- Select nomorDaftarUlang from daftar_ulang
        d.ukuranSeragam,
        d.tanggalDaftarUlang
      FROM pendaftaran p
      LEFT JOIN daftar_ulang d ON p.id = d.Id  -- Join with daftar_ulang table
    `;

    const queryParams: any[] = [];

    if (status && (status === 'Sudah' || status === 'Belum')) {
      query += ' WHERE p.statusDaftarUlang = ?';
      queryParams.push(status);
    }

    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(query, queryParams);
      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal mengambil data pendaftar:', error);
    return NextResponse.json({ message: 'Gagal mengambil data pendaftar', error: error }, { status: 500 });
  }
}