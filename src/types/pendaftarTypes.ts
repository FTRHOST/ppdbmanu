// src/types/pendaftarTypes.ts

// --- ENUMS ---
export type JalurPendaftaran = 'Reguler Umum' | 'Reguler Prestasi' | 'Reguler Sosial';
export type ProgramPeminatan = 'MIPA' | 'IPS' | 'BHS' | 'AGM' | 'Tahfidz';
export type JenisKelamin = 'Laki-laki' | 'Perempuan';
export type TinggalDengan = 'Bersama Orang tua' | 'Bersama Wali' | 'Bersama Kakak' | 'Tinggal Sendiri' | 'Lainnya';
export type Pendidikan = 'SD' | 'SMP' | 'SMA/SMK' | 'D1' | 'D2' | 'D3' | 'S1' | 'S2' | 'S3';
export type PunyaTidakPunya = 'Punya' | 'Tidak Punya';

// --- INTERFACES ---

// Use for filter status to url
export interface UsePendaftarQuery {
    status?: 'Sudah' | 'Belum' | null;
}

// Main data structure for Pendaftaran Table
export interface Pendaftar {
    id: string; // Or number, depending on your database
    nomorPendaftaran: string;
    nisn: string | null;
    rekomendasiPendaftaran: string;
    jalurPendaftaran: JalurPendaftaran;
    programPeminatan: ProgramPeminatan;
    nama: string;
    jenisKelamin: JenisKelamin;
    tempatLahir: string;
    tanggalLahir: string; // ISO date string (YYYY-MM-DD)
    noHp: string;
    tinggal: TinggalDengan;
    dukuhJalan: string;
    desa: string;
    rt: string;
    rw: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    namaAyah: string;
    pendidikanAyah: Pendidikan;
    pekerjaanAyah: string;
    noHpAyah: string | null;
    namaIbu: string;
    pendidikanIbu: Pendidikan;
    pekerjaanIbu: string;
    noHpIbu: string;
    alamatOrangtua: string;
    punyaSaudaraDiMansaba: PunyaTidakPunya;
    namaWali: string | null;
    hubunganWali: string | null;
    pendidikanWali: Pendidikan | null;
    pekerjaanWali: string | null;
    alamatWali: string | null;
    noHpWali: string | null;
    namaSekolahAsal: string;
    alamatSekolahAsal: string;
    punyaPiagam: PunyaTidakPunya | null;
    motivasi: string;
    statusDaftarUlang: 'Sudah' | 'Belum';
    tanggalDaftar: string; // ISO datetime string
    tempatTanggalLahir: string; // derived, not in database
    alamatLengkap: string; // derived, not in database
}

// Data structure for Laporan Seragam
export interface SeragamReportItem {
    ukuran: string; // S, M, L, XL, etc.
    jenisKelamin: JenisKelamin | 'Total'; // added enum
    osis: number;
    pramuka: number;
    batik: number;
    olahraga: number;
}

// Data structure for summary statistics
export interface SummaryStats {
    totalPendaftar: number;
    totalDaftarUlang: number;
    totalLakiLakiDU: number;
    totalPerempuanDU: number;
}