// src/app/api/daftar-ulang/route.ts
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise'; // Path yang benar
import mysql from 'mysql2/promise';

const dbPool = mysql.createPool({
  host: '62.72.7.236',
  user: 'db_coba',
  password: 'cobainaja',
  database: 'db_coba',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

async function getConnectionWithRetry() {
  let attempts = 0;
  while (attempts < 5) {
    try {
      return await dbPool.getConnection();
    } catch (error) {
      attempts++;
      console.error(`Connection attempt ${attempts} failed:`, error);
      if (attempts >= 5) throw error; // Rethrow after max attempts
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
    }
  }
}

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

    const connection = await getConnectionWithRetry();
    if (!connection) {
      throw new Error('Connection is undefined');
    }
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

      // Lakukan query UPDATE untuk mengubah statusDaftarUlang di tabel pendaftaran
      try {
        const [updateResult] = await connection.execute<mysql.ResultSetHeader>(
          'UPDATE pendaftaran SET statusDaftarUlang = "Sudah" WHERE id = ?',
          [pendaftarId]
        );
        console.log('Rows affected:', updateResult.affectedRows);
      } catch (error) {
        console.error('Error updating status:', error);
      }

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

    const connection = await getConnectionWithRetry();
    if (!connection) {
      throw new Error('Connection is undefined');
    }
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

      console.log('Updating status for pendaftarId:', pendaftarId);

      return NextResponse.json({ message: 'Data daftar ulang berhasil diperbarui' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal memperbarui data daftar ulang:', error);
    return NextResponse.json({ message: 'Gagal memperbarui data daftar ulang', error: error }, { status: 500 });
  }
}