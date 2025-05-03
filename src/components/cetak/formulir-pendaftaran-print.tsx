
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils'; // Import cn

// Define the structure of the data needed for the form
export interface FormulirData {
  nomorPendaftaran?: string | null;
  nisn?: string | null;
  nama?: string | null;
  tempatTanggalLahir?: string | null;
  jenisKelamin?: 'Laki-laki' | 'Perempuan' | null;
  alamatLengkap?: string | null;
  desa?: string | null;
  kecamatan?: string | null;
  kabupaten?: string | null;
  provinsi?: string | null;
  dukuhJalan?: string | null;
  rt?: string | null;
  rw?: string | null;
  noHp?: string | null;
  tinggal?: string | null;
  jalurPendaftaran?: 'Reguler Umum' | 'Reguler Prestasi' | 'Reguler Sosial' | null;
  programPeminatan?: 'MIPA' | 'IPS' | 'BHS' | 'AGM' | 'Tahfidz' | null;
  namaAyah?: string | null;
  pendidikanAyah?: string | null;
  pekerjaanAyah?: string | null;
  noHpAyah?: string | null;
  namaIbu?: string | null;
  pendidikanIbu?: string | null;
  pekerjaanIbu?: string | null;
  noHpIbu?: string | null;
  alamatOrangtua?: string | null;
  punyaSaudaraDiMansaba?: 'Punya' | 'Tidak Punya' | null;
  namaWali?: string | null;
  hubunganWali?: string | null;
  pendidikanWali?: 'SD' | 'SMP' | 'SMA/SMK' | 'D1' | 'D2' | 'D3' | 'S1' | 'S2' | 'S3' | null | undefined;
  pekerjaanWali?: string | null;
  alamatWali?: string | null;
  noHpWali?: string | null;
  namaSekolahAsal?: string | null;
  alamatSekolahAsal?: string | null;
  rekomendasiPendaftaran?: string | null;
  punyaPiagam?: 'Punya' | 'Tidak Punya' | null;
  motivasi?: string | null;
  tanggalDaftar?: Date | null;
  tanggalCetak?: string | null;
}


// Helper component for rendering label-value pairs consistently
const DataRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    value ? (
     // Added print:mb-0.5 for tighter spacing in print
     <div className="flex data-row print:mb-0.5">
       {/* Adjusted width for print */}
       <span className="w-36 md:w-40 flex-shrink-0 print:w-[110px]">{label}</span>
       <span className="mr-1 print:mr-1">:</span>
       <span className="font-semibold break-words">{value || '-'}</span>
     </div>
   ) : null
 );

// Helper for multi-column rows
 const DataRowMultiCol: React.FC<{ items: { label: string; value?: string | null }[] }> = ({ items }) => (
   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 print:grid-cols-2 print:gap-x-2">
     {items.map((item, index) => (
        <DataRow key={index} label={item.label} value={item.value} />
     ))}
   </div>
 );

// Helper for section titles
 const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    // Added print:text-[11pt] print:py-0.5 print:my-1 for print styling
    <h3 className="bg-green-700 text-white text-center font-bold py-1 my-2 text-sm print:text-[11pt] print:py-0.5 print:my-1 section-title">{title}</h3>
 );


export const FormulirPendaftaranPrint: React.FC<{ data: FormulirData }> = ({ data }) => {
   const [letterheadUri, setLetterheadUri] = useState<string | null>(null);
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
       setIsClient(true);
       const storedUri = localStorage.getItem('customLetterheadUri');
       if (storedUri) {
           setLetterheadUri(storedUri);
       }
   }, []);

   // Avoid rendering header on the server or before client mount if custom uri is used
   const renderHeader = () => {
       // Always render something server-side or before client hydration to prevent mismatch
       if (!isClient && !letterheadUri) {
           return ( // Default text header for SSR/initial render
              <div className="text-center py-2 mb-1 border-b-2 border-black pb-1">
                 <h1 className="text-sm font-bold">PANITIA PENDAFTARAN PESERTA DIDIK BARU</h1>
                 <h2 className="text-lg font-bold text-green-700">MA NU 01 BANYUPUTIH</h2>
                 <h3 className="text-sm font-bold">TAHUN PELAJARAN 2025/2026</h3>
                 <p className="text-xs">Jl. Lapangan 9a Banyuputih Kec. Banyuputih Kab. Batang</p>
              </div>
           );
       }
       // On client-side, render image if URI exists, otherwise default text
       if (letterheadUri) {
           return (
              <div className="mb-1 border-b-2 border-black pb-1 print:mb-1 print:pb-1">
                 <Image
                    src={letterheadUri}
                    alt="Kop Surat MA NU 01 Banyuputih"
                    width={794} // Approx A4 width in pixels for reference
                    height={150} // Adjust height as needed
                    className="w-full h-auto object-contain"
                    priority
                 />
               </div>
           );
       }
       // Default Fallback if no custom URI on client
       return (
           <div className="text-center mb-1 border-b-2 border-black pb-1">
                <h1 className="text-sm font-bold">PANITIA PENDAFTARAN PESERTA DIDIK BARU</h1>
                <h2 className="text-lg font-bold text-green-700">MA NU 01 BANYUPUTIH</h2>
                <h3 className="text-sm font-bold">TAHUN PELAJARAN 2025/2026</h3>
                <p className="text-xs">Jl. Lapangan 9a Banyuputih Kec. Banyuputih Kab. Batang</p>
           </div>
       );
   };

   const formattedTanggalDaftar = data.tanggalDaftar
     ? format(data.tanggalDaftar, 'dd MMMM yyyy', { locale: localeId })
     : '...................';
   const tempatDaftar = data.kabupaten || 'Banyuputih';

   return (
     // Removed max-w-4xl, using A4 size in print CSS instead
     <div className="bg-white p-4 mx-auto border border-gray-300 text-xs font-['Times_New_Roman'] print:font-['Times_New_Roman'] print:text-[10pt] print:leading-tight print:border-none print:shadow-none print:p-0">
       {renderHeader()}
        <h3 className="font-bold text-center mb-1 underline text-sm print:text-[12pt] print:mb-1">FORMULIR PENDAFTARAN PESERTA DIDIK BARU</h3>

       {/* Sections */}
       <SectionTitle title="IDENTITAS PESERTA DIDIK" />
       {/* Adjusted grid for better print layout */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mb-1 print:mb-0.5 print:grid-cols-2 print:gap-x-2">
         <DataRow label="No Pendaftaran" value={data.nomorPendaftaran} />
         <DataRow label="Jalur Daftar" value={data.jalurPendaftaran} />
         <DataRow label="NISN" value={data.nisn} />
         <DataRow label="Peminatan" value={data.programPeminatan} />
       </div>
       <div className="mb-1 print:mb-0.5">
          <DataRow label="Nama Peserta Didik" value={data.nama?.toUpperCase()} />
       </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mb-1 print:mb-0.5 print:grid-cols-2 print:gap-x-2">
            <DataRow label="Tempat & Tgl Lahir" value={data.tempatTanggalLahir} />
            <DataRow label="Jenis Kelamin" value={data.jenisKelamin} />
            <DataRow label="No. HP" value={data.noHp} />
            <DataRow label="Keterangan Tinggal" value={data.tinggal} />
        </div>
         <div className="mb-1 print:mb-0.5">
              <DataRow label="Alamat Tinggal" value={data.alamatLengkap}/>
         </div>

       <SectionTitle title="IDENTITAS ORANGTUA / WALI" />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mb-1 print:mb-0.5 print:grid-cols-2 print:gap-x-2">
            {/* Ayah */}
            <div className="border-r-0 md:border-r md:border-gray-300 md:pr-4 print:border-r print:border-gray-400 print:pr-2">
                <h4 className="font-bold mb-0.5 underline print:mb-0.5">Ayah</h4>
                <DataRow label="Nama" value={data.namaAyah?.toUpperCase()} />
                <DataRow label="Pendidikan" value={data.pendidikanAyah} />
                <DataRow label="Pekerjaan" value={data.pekerjaanAyah} />
                <DataRow label="No. HP" value={data.noHpAyah || data.noHp} />
                <DataRow label="Alamat" value={data.alamatOrangtua?.toUpperCase()} />
                 <DataRow label="Saudara di MANSA" value={data.punyaSaudaraDiMansaba} />
            </div>
            {/* Ibu */}
            <div className="mt-1 md:mt-0 print:mt-0">
                 <h4 className="font-bold mb-0.5 underline print:mb-0.5">Ibu</h4>
                 <DataRow label="Nama" value={data.namaIbu?.toUpperCase()} />
                 <DataRow label="Pendidikan" value={data.pendidikanIbu} />
                 <DataRow label="Pekerjaan" value={data.pekerjaanIbu} />
                 <DataRow label="No. HP" value={data.noHpIbu || data.noHp} />
            </div>
        </div>
         {data.tinggal === 'Bersama Wali' && data.namaWali && ( // Conditionally render Wali section
             <div className="mt-1 pt-1 border-t border-gray-300 print:mt-0.5 print:pt-0.5">
                 <h4 className="font-bold mb-0.5 underline print:mb-0.5">Wali</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 print:grid-cols-2 print:gap-x-2">
                     <DataRow label="Nama" value={data.namaWali?.toUpperCase()} />
                     <DataRow label="Hubungan" value={data.hubunganWali} />
                     <DataRow label="Alamat" value={data.alamatWali?.toUpperCase()} />
                     <DataRow label="No. HP" value={data.noHpWali} />
                 </div>
             </div>
         )}

       <SectionTitle title="IDENTITAS SEKOLAH ASAL" />
        <div className="mb-1 print:mb-0.5">
            <DataRow label="Nama Sekolah" value={data.namaSekolahAsal?.toUpperCase()} />
            <DataRow label="Alamat Sekolah" value={data.alamatSekolahAsal?.toUpperCase()} />
            <DataRow label="Rekomendasi" value={data.rekomendasiPendaftaran} />
        </div>

       <SectionTitle title="PIAGAM / SERTIFIKAT" />
        <div className="mb-1 print:mb-0.5">
           <DataRow label="Kepemilikan" value={data.punyaPiagam} />
           {data.punyaPiagam === 'Punya' && <DataRow label="Kejuaraan" value={'....................................'} />}
        </div>

       <SectionTitle title="MOTIVASI" />
        <div className="mb-2 min-h-[20px] pl-2 print:mb-1 print:pl-2 font-semibold">
            {data.motivasi || '-'}
        </div>

       {/* Signatures Section */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs print:mt-8 print:text-[9pt] print:gap-4 print-signature">
          <div>
            <p>Mengetahui,</p>
            <p>Panitia PPDB</p>
            <div className="h-10 print:h-[60px]"></div> {/* Adjusted height */}
            <p className="font-bold underline">( Saniyah, S.H. )</p>
          </div>
          <div>
            <p>Orang Tua / Wali</p>
            <div className="h-10 print:h-[60px]"></div> {/* Adjusted height */}
            <p className="font-bold underline">( {data.tinggal === 'Bersama Wali' ? data.namaWali?.toUpperCase() : data.namaAyah?.toUpperCase() || data.namaIbu?.toUpperCase() || '...........................'} )</p>
          </div>
          <div>
            <p>{tempatDaftar}, {formattedTanggalDaftar}</p>
            <p>Pendaftar</p>
            <div className="h-10 print:h-[60px]"></div> {/* Adjusted height */}
            <p className="font-bold underline">( {data.nama?.toUpperCase() || '...........................'} )</p>
          </div>
        </div>

       {/* Bukti Daftar Section (Footer) */}
        <div className="print-footer-section mt-2 pt-1 border-t-2 border-black print:mt-3 print:pt-1">
             <h3 className="font-bold text-center mb-1 text-sm print:text-[11pt]">BUKTI DAFTAR</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mb-1 print:grid-cols-2 print:gap-x-2 print:mb-0.5">
                 <DataRow label="No. Pendaftaran" value={data.nomorPendaftaran} />
                 <DataRow label="Jalur" value={data.jalurPendaftaran} />
                 <DataRow label="Nama" value={data.nama?.toUpperCase()} />
                 <DataRow label="Peminatan" value={data.programPeminatan} />
                 <DataRow label="Alamat" value={data.alamatLengkap} />
                 <div></div> {/* Spacer */}
                 <DataRow label="Asal Sekolah" value={data.namaSekolahAsal?.toUpperCase()} />
             </div>
             <div className="mt-1 text-xs print:mt-0.5 print:text-[9pt]">
                <p className="font-medium">Dimohon untuk segera melakukan daftar ulang dengan mengumpulkan :</p>
                <ul className="list-disc list-inside ml-4">
                   <li>KK (Asli)</li>
                   <li>Surat Kelulusan (jika sudah ada)</li>
                   <li>Fotocopi KK dan Akte Lahir</li>
                   <li>Membayar biaya Daftar Ulang</li>
                   <li>SKTM dan Rekomendasi PR NU Desa (Jika ada)</li>
                </ul>
             </div>
             <div className="grid grid-cols-2 gap-2 mt-2 text-center text-xs print:mt-4 print:text-[9pt]">
                 <div></div> {/* Spacer */}
                  <div>
                      <p>{tempatDaftar}, {formattedTanggalDaftar}</p>
                      <p>Panitia,</p>
                      <div className="h-8 print:h-[50px]"></div> {/* Adjusted height */}
                      <p className="font-bold underline">( Saniyah, S.H. )</p>
                  </div>
             </div>
        </div>
     </div>
   );
 };
