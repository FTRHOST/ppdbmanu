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
      const [result] = await connection.execute<mysql.ResultSetHeader>(
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

      // Get the ID of the newly inserted record
      const newDaftarUlangId = result.insertId; // Now this should work correctly

      // Lakukan query UPDATE untuk mengubah statusDaftarUlang di tabel pendaftaran
      await connection.execute(
        'UPDATE pendaftaran SET statusDaftarUlang = "Sudah" WHERE id = ?',
        [pendaftarId] // Use the pendaftarId to update the status
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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log('Incoming request body:', body); // Log the entire body
    const {
      id, // Ensure you are receiving the ID
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

    // Log the ID to verify
    console.log('ID received for update:', id);

    const connection = await db.getConnection();
    try {
      // Update the record in the database
      const [result] = await connection.execute<mysql.ResultSetHeader>(
        'UPDATE daftar_ulang SET pendaftarId = ?, nomorDaftarUlang = ?, kelengkapanKK = ?, kelengkapanSKL = ?, kelengkapanPiagam = ?, kelengkapanSKTM = ?, bayarDaftarUlang = ?, biayaDaftarUlang = ?, ukuranSeragam = ?, seragamOsis = ?, seragamPramuka = ?, seragamBatik = ?, seragamOlahraga = ?, tanggalDaftarUlang = ? WHERE id = ?',
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
          id, // Use the ID to identify which record to update
        ]
      );

      console.log('Rows affected:', result.affectedRows); // Now this should work correctly

      return NextResponse.json({ message: 'Data daftar ulang berhasil diperbarui' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal memperbarui data daftar ulang:', error);
    return NextResponse.json({ message: 'Gagal memperbarui data daftar ulang', error: error }, { status: 500 });
  }
}