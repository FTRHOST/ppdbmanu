// src/types/pendaftarTypes.ts
export interface Pendaftar {
    id: string;
    nomorPendaftaran: string;
    nama: string;
    jenisKelamin: 'Laki-laki' | 'Perempuan';
    tempatTanggalLahir: string;
    noHp: string;
    alamatLengkap: string;
    sekolahAsal: string;
    programPeminatan: 'MIPA' | 'IPS' | 'BHS' | 'AGM' | 'Tahfidz';
    jalurPendaftaran: 'Reguler Umum' | 'Reguler Prestasi' | 'Reguler Sosial';
    namaAyah: string;
    namaIbu: string;
    statusDaftarUlang: 'Sudah' | 'Belum';
}

export interface usePendaftarQuery {
    status?: 'Sudah' | 'Belum' | null;  // For query strings, must be or null
}