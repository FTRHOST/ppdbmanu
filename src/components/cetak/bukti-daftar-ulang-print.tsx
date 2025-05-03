'use client';

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import Image from 'next/image';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the structure of the data needed for the proof
export interface BuktiDaftarUlangData {
  nomorPendaftaran: string;
  namaPendaftar: string;
  asalSekolah: string;
  alamat: string;
  nomorDaftarUlang: string;
  kelengkapanKK: boolean;
  kelengkapanSKL: boolean;
  kelengkapanPiagam: boolean;
  kelengkapanSKTM: boolean;
  bayarDaftarUlang: boolean;
  biayaDaftarUlang?: number | null;
  tanggalDaftarUlang: string;
  kabupatenTempat?: string | null;
  namaPetugas?: string | null;
}

// Helper component for rendering label-value pairs consistently
const DataRow: React.FC<{ label: string; value?: string | null; boldValue?: boolean }> = ({ label, value, boldValue }) => (
   value || label === 'Alamat' ? (
   <div className="flex mb-0_5 text-xs print:text-[9pt] print:leading-tight print:mb-0">
     <span className="w-[100px] flex-shrink-0 print:w-[100px]">{label}</span>
     <span className="mr-2 print:mr-2">:</span>
     <span className={cn("break-words", boldValue ? 'font-semibold print:font-semibold' : '')}>{value || '-'}</span>
   </div>
 ) : null
);

// Helper component for checklist items
const ChecklistItem: React.FC<{ checked: boolean; label: string }> = ({ checked, label }) => (
    <div className="flex items-center mb-0 text-xs print:text-[9pt] print:leading-tight print:mb-0">
        {checked ? <CheckSquare className="w-3 h-3 mr-1 text-black print:w-[9pt] print:h-[9pt] print:mr-1" /> : <Square className="w-3 h-3 mr-1 text-gray-500 print:w-[9pt] print:h-[9pt] print:mr-1" />}
        <span>{label}</span>
    </div>
);

// Helper function to format currency
const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value <= 0) {
        return '-';
    }
    return `Rp ${new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value).replace(/\./g, '.')}`;
};

// Reusable Receipt Component
const Receipt: React.FC<{ data: BuktiDaftarUlangData; isArsip?: boolean; namaPetugas?: string | null, letterheadUri: string | null }> = ({ data, isArsip = false, namaPetugas, letterheadUri }) => {
    const formattedTanggal = data.tanggalDaftarUlang
      ? format(new Date(data.tanggalDaftarUlang), 'd/M/yyyy', { locale: localeId })
      : '...................';
    const tempatDaftar = data.kabupatenTempat || 'Banyuputih';
    const petugasNamaDisplay = namaPetugas || 'Panitia PPDB';

    return (
      <div className={cn(
          "receipt-container bg-white p-2 max-w-full print:max-w-none print:p-[4mm] mx-auto text-xs font-sans break-inside-avoid print:text-[9pt] print:leading-tight flex flex-col h-full", // Updated line-height
          isArsip ? "border-t-4 border-t-red-600" : ""
      )}>
        {/* Header with Conditional Letterhead */}
        <div className="mb-1 border-b-2 border-black pb-1 print:mb-1 print:pb-1">
           <div className="w-full">
             {letterheadUri ? (
                  <Image
                    src={letterheadUri}
                    alt="Kop Surat MA NU 01 Banyuputih"
                    width={700} // Adjust as needed
                    height={100} // Adjust as needed
                    className="w-full h-auto object-contain"
                    priority
                  />
             ) : (
                  // Fallback if no custom letterhead is set (e.g., default text or placeholder)
                   <div className="text-center py-4">
                      <h2 className="text-sm font-bold">MA NU 01 BANYUPUTIH</h2>
                      <p className="text-[8pt]">Jl. Lapangan 9a Banyuputih Kec. Banyuputih Kab. Batang</p>
                   </div>
             )}
           </div>
        </div>
        <h3 className="font-bold text-center mb-0.5 mt-0.5 underline text-sm print:text-[10pt] print:mb-0.5 print:mt-0.5">
           BUKTI DAFTAR ULANG {isArsip ? '(ARSIP)' : ''}
        </h3>
        <div className="h-[2px] bg-red-600 w-1/3 mx-auto mb-2 print:h-[1.5pt] print:mb-2"></div>

         {/* Content Area */}
         <div className="receipt-content flex-grow">
            <div className="mb-1 print:mb-1">
                 <DataRow label="Nomor" value={data.nomorPendaftaran} boldValue/>
                 <DataRow label="Pendaftaran" value={""} />
                 <DataRow label="Nama Pendaftar" value={data.namaPendaftar?.toUpperCase()} boldValue/>
                 <DataRow label="Asal Sekolah" value={data.asalSekolah?.toUpperCase()} />
                 <DataRow label="Alamat" value={data.alamat || '-'} />
                 <DataRow label="No. Daftar Ulang" value={data.nomorDaftarUlang} boldValue/>
            </div>
            <div className="mb-1 print:mb-1">
                 <p className="mb-0.5 text-xs font-medium print:text-[9pt] print:mb-0.5">Kelengkapan:</p>
                <div className="ml-2 grid grid-cols-1 gap-y-0 print:ml-2 print:gap-y-0">
                     <ChecklistItem checked={data.kelengkapanKK} label="KK/Akte (asli)" />
                     <ChecklistItem checked={data.kelengkapanSKL} label="Surat Kelulusan (asli)" />
                     <ChecklistItem checked={true} label="Fotocopi KK/Akte" />
                     <ChecklistItem checked={data.kelengkapanPiagam} label="Fotocopi Piagam / Sertifikat Juara" />
                     <ChecklistItem checked={data.kelengkapanSKTM} label="SKTM / Surat Rekom PRNU" />
                </div>
                <div className="mt-1 flex items-center print:mt-1 ml-2">
                     <ChecklistItem checked={data.bayarDaftarUlang} label="Daftar Ulang" />
                      {data.bayarDaftarUlang && (
                         <span className="ml-2 bg-black text-white font-semibold px-1 py-0.5 rounded text-[9pt] print:text-[8pt] print:ml-2 print:px-1 print:py-0.5">
                              {formatCurrency(data.biayaDaftarUlang)}
                         </span>
                      )}
                </div>
             </div>
              {/* Info Box moved under checklist */}
              <div className={cn(
                  "border border-black p-1.5 text-center text-[8pt] leading-tight print:text-[7pt] print:p-1 small-print bg-gray-100 print:bg-gray-100 mt-2 mb-2", // Added mt-2 mb-2
                  isArsip ? 'hidden' : '' // Hide info box in arsip copy
               )}>
                   Selamat bergabung di Madrasah Hebat, MA NU 01 Banyuputih.<br/>
                   Info keberangkatan pertama akan di informasikan di grup Whatsapp Siswa Baru 2025
               </div>
          </div>

        {/* Footer */}
        <div className="receipt-footer mt-auto pt-2">
            <div className="receipt-signature flex justify-end">
                <div className="text-center text-xs print:text-[9pt]">
                    <p>{tempatDaftar}, {formattedTanggal}</p>
                    <p>Panitia PPDB</p>
                    <div className="h-10 print:h-[15mm] signature-space"></div> {/* Adjusted height */}
                    <p className="font-bold underline print:font-bold">( {petugasNamaDisplay} )</p>
                </div>
            </div>
        </div>

      </div>
    );
}


// Main Print Component combining two Receipts
export const BuktiDaftarUlangPrint: React.FC<{ data: BuktiDaftarUlangData }> = ({ data }) => {
    const [letterheadUri, setLetterheadUri] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Load letterhead from localStorage on client-side mount
    useEffect(() => {
        setIsClient(true); // Mark as client-side
        const storedUri = localStorage.getItem('customLetterheadUri');
        if (storedUri) {
            setLetterheadUri(storedUri);
        }
    }, []);

    // Avoid rendering on the server or before client mount
    if (!isClient) {
        return null; // Or a loading placeholder if preferred
    }

    return (
       <div className="print-container flex flex-col md:flex-row gap-4 print:flex print:flex-row print:gap-[10mm] h-full">
          {/* Copy 1: For Student */}
          <div className="receipt-outer-wrapper h-full">
             <Receipt data={data} namaPetugas={data.namaPetugas} letterheadUri={letterheadUri} />
          </div>

          {/* Copy 2: For Arsip */}
           <div className="receipt-outer-wrapper h-full">
              <Receipt data={data} isArsip={true} namaPetugas={data.namaPetugas} letterheadUri={letterheadUri} />
           </div>
       </div>
    );
  };
