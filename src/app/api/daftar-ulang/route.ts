// src/app/api/daftar-ulang/route.ts
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise'; // Path yang benar
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      pendaftarId,
      nomorDaftarUlang,
      kelengkapanKK,
      kelengkapanSKL,
      kelengkapanPiagam,
      kelengkapanSKTM,
      bayarDaftarUlang,
      biayaDaftarUlang,
      ukuranSeragam,
      seragamOsis,
      seragamPramuka,
      seragamBatik,
      seragamOlahraga,
      tanggalDaftarUlang,
    } = body;

    const connection = await db.getConnection();
    try {
      // Lakukan query INSERT untuk menyimpan data daftar ulang
      const [result] = await connection.execute(
        'INSERT INTO daftar_ulang (pendaftarId, nomorDaftarUlang, kelengkapanKK, kelengkapanSKL, kelengkapanPiagam, kelengkapanSKTM, bayarDaftarUlang, biayaDaftarUlang, ukuranSeragam, seragamOsis, seragamPramuka, seragamBatik, seragamOlahraga, tanggalDaftarUlang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          pendaftarId,
          nomorDaftarUlang,
          kelengkapanKK,
          kelengkapanSKL,
          kelengkapanPiagam,
          kelengkapanSKTM,
          bayarDaftarUlang,
          biayaDaftarUlang,
          ukuranSeragam,
          seragamOsis,
          seragamPramuka,
          seragamBatik,
          seragamOlahraga,
          tanggalDaftarUlang,
        ]
      );

      console.log('Data daftar ulang berhasil disimpan:', result);

      // Lakukan query UPDATE untuk mengubah statusDaftarUlang di tabel pendaftaran
      await connection.execute(
        'UPDATE pendaftaran SET statusDaftarUlang = "Sudah" WHERE id = ?',
        [pendaftarId]
      );

      console.log('Status daftar ulang di pendaftaran berhasil diubah menjadi "Sudah"');

      return NextResponse.json({ message: 'Data daftar ulang berhasil disimpan dan status pendaftar diubah' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal menyimpan data daftar ulang:', error);
    return NextResponse.json({ message: 'Gagal menyimpan data daftar ulang', error: error }, { status: 500 });
  }
}