// src/app/admin/cetak-bukti-du/[id]/page.tsx (Diperbarui)
'use client';

import React, { useEffect, useState, useRef, type ComponentProps } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { BuktiDaftarUlangPrint, type BuktiDaftarUlangData } from '@/components/cetak/bukti-daftar-ulang-print';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// Mock data structure - Update types for API
interface ApiCombinedData {
  nomorPendaftaran: string;
  nama: string;
  alamatLengkap: string;
  sekolahAsal: string;
  kabupaten: string;
  nomorDaftarUlang: string;
  kelengkapanKK: boolean;
  kelengkapanSKL: boolean;
  kelengkapanPiagam: boolean;
  kelengkapanSKTM: boolean;
  bayarDaftarUlang: boolean;
  biayaDaftarUlang: number | null;
  tanggalDaftarUlang: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  ukuranSeragam: string;
  seragamOsis: boolean;
  seragamPramuka: boolean;
  seragamBatik: boolean;
  seragamOlahraga: boolean;
}

// Update BuktiDaftarUlangData to match API response - new interface
interface BuktiDaftarUlangDataApi {
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
    biayaDaftarUlang: number | null;
    tanggalDaftarUlang: string;
    kabupatenTempat: string;
    namaPetugas: string;
}

// Component to render the actual page content once auth is confirmed
const CetakBuktiDUPageContent = () => {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const daftarUlangId = params?.id ? parseInt(params.id as string, 10) : null;
    const [data, setData] = useState<BuktiDaftarUlangDataApi | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const [letterheadUri, setLetterheadUri] = useState<string | null>(null); // State for letterhead

    useEffect(() => {
        setIsClient(true);
        // Load letterhead from localStorage on client-side mount
        const storedUri = localStorage.getItem('customLetterheadUri');
        if (storedUri) {
            setLetterheadUri(storedUri);
        }
    }, []);


    useEffect(() => {
      if (!isClient || authLoading) return;

      const fetchData = async () => {
        if (!daftarUlangId) {
          setError('ID Daftar Ulang tidak valid.');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          console.log(`Fetching data for Daftar Ulang ID: ${daftarUlangId}`);
          const response = await fetch(`/api/bukti-daftar-ulang/${daftarUlangId}`); //Call new API

          if (!response.ok) {
               console.error(`HTTP error! status: ${response.status}`);
               toast({
                  title: "Gagal Memuat Data",
                  description: `Terjadi kesalahan saat memuat data. Status: ${response.status}`,
                  variant: "destructive",
               });
               return; // Exit early for error handle
          }

          const apiData: ApiCombinedData = await response.json();

          const mappedData: BuktiDaftarUlangDataApi = { // Map data
               nomorPendaftaran: apiData.nomorPendaftaran,
              namaPendaftar: apiData.nama,
                asalSekolah: apiData.sekolahAsal,
               alamat: apiData.alamatLengkap,
               nomorDaftarUlang: apiData.nomorDaftarUlang,
               kelengkapanKK: apiData.kelengkapanKK,
               kelengkapanSKL: apiData.kelengkapanSKL,
               kelengkapanPiagam: apiData.kelengkapanPiagam,
               kelengkapanSKTM: apiData.kelengkapanSKTM,
                bayarDaftarUlang: apiData.bayarDaftarUlang,
                biayaDaftarUlang: apiData.biayaDaftarUlang || null,
               tanggalDaftarUlang: apiData.tanggalDaftarUlang,
               kabupatenTempat: apiData.kabupaten,
                namaPetugas: user?.name || 'Panitia PPDB',

           };
            setData(mappedData); // Assing type data

        } catch (err) {
          console.error('Error fetching daftar ulang data:', err);
          setError('Gagal memuat data daftar ulang.');
          toast({
             title: "Gagal Memuat Data",
             description: "Terjadi kesalahan saat mengambil data daftar ulang.",
             variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

       if (daftarUlangId && !authLoading && isClient) {
           fetchData();
       } else if (!daftarUlangId) {
           setError('ID Daftar Ulang tidak valid.');
           setLoading(false);
       }

    }, [daftarUlangId, user, authLoading, isClient, router]);

   const handlePrint = () => {
     console.log('Handle Print button clicked.');
     const printContent = printRef.current;

     if (!printContent) {
       console.error('Print content ref is null or not available.');
       toast({ title: "Gagal Mencetak", description: "Konten untuk dicetak tidak ditemukan.", variant: "destructive" });
       return;
     }

      setTimeout(() => {
         const printWindow = window.open('', '_blank', 'height=800,width=1200,scrollbars=yes');

         if (!printWindow) {
           console.error('Failed to open print window. Pop-up might be blocked.');
           toast({ title: "Gagal Membuka Jendela Cetak", description: "Browser Anda mungkin memblokir pop-up. Mohon izinkan pop-up untuk situs ini.", variant: "destructive" });
           return;
         }

          console.log('Print window opened successfully.');

         let styles = '';
         try {
             styles = Array.from(document.styleSheets)
               .map(styleSheet => {
                 try {
                   if (!styleSheet.href || styleSheet.href.startsWith(window.location.origin) || styleSheet.href.startsWith('/')) {
                     return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
                   } return '';
                 } catch (e) { console.warn('Could not read CSS rules from stylesheet:', styleSheet.href, e); return ''; }
               }).join('\n');
             console.log('Collected styles for print window.');
         } catch (e) { console.error("Error collecting styles:", e); }

          const printSpecificStyles = `
           @media print {
             @page {
               size: 330mm 210mm; /* F4 Landscape */
               margin: 1cm; /* 1cm margin on all sides */
             }
             html, body {
               margin: 0;
               padding: 0;
               font-family: Arial, sans-serif;
               font-size: 9pt;
               line-height: 1.4;
               -webkit-print-color-adjust: exact !important;
               print-color-adjust: exact !important;
               width: 100%;
               height: 100%;
               display: flex;
               justify-content: center;
               align-items: center;
               background-color: white !important;
             }
             .no-print { display: none !important; }
             .print-container {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                gap: 10mm !important;
                width: calc(330mm - 2cm);
                height: calc(210mm - 2cm);
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                box-sizing: border-box !important;
             }
             .receipt-outer-wrapper {
                 width: calc(( (330mm - 2cm) - 10mm) / 2);
                 height: 100% !important;
                 border: 1px solid black !important;
                 box-sizing: border-box !important;
                 display: flex !important;
                 flex-direction: column !important;
                 page-break-inside: avoid !important;
                 overflow: hidden;
                 background-color: white !important;
             }
             .receipt-container {
                 padding: 5mm !important;
                 box-sizing: border-box !important;
                 width: 100% !important;
                 height: 100% !important;
                 display: flex !important;
                 flex-direction: column !important;
                 font-size: 9pt !important;
                 line-height: 1.4 !important;
                 border: none !important;
                 page-break-inside: avoid !important;
                 background-color: white !important;
             }
             .receipt-content { flex-grow: 1 !important; }
             .receipt-footer { margin-top: auto !important; padding-top: 3mm !important; flex-shrink: 0 !important; }
             .receipt-container h1, .receipt-container h2, .receipt-container h3 { margin-bottom: 1.5mm; line-height: 1.3; font-weight: bold; }
             .receipt-container .text-xs { font-size: 9pt !important; line-height: 1.4 !important; }
             .receipt-container .text-sm { font-size: 10pt !important; line-height: 1.4 !important; }
             .receipt-container .text-base { font-size: 11pt !important; line-height: 1.4 !important; }
             .receipt-container .font-bold { font-weight: bold !important; }
             .receipt-container .font-semibold { font-weight: 600 !important; }
             .receipt-container .font-medium { font-weight: 500 !important; }
             .receipt-container .underline { text-decoration: underline !important; }
             .receipt-container .flex.mb-0_5 { margin-bottom: 1mm !important; }
             .receipt-container span.w-\\[100px\\] { width: 100px !important; }
             .receipt-container span.mr-2 { margin-right: 8px !important; }
             .receipt-container .flex.items-center.mb-0 { margin-bottom: 0.5mm !important; }
             .receipt-container .w-3.h-3.mr-1 { width: 9pt !important; height: 9pt !important; margin-right: 5px !important; vertical-align: middle; }
             .receipt-container .text-black { color: black !important; }
             .receipt-container .text-gray-500 { color: #6b7280 !important; }
             .receipt-container .border-b-2.border-black { border-bottom-width: 2px !important; border-color: black !important; }
             .receipt-container .h-\\[2px\\].bg-red-600 { height: 1.5pt !important; background-color: #dc2626 !important; print-color-adjust: exact !important; }
             .receipt-container .w-1\\/3 { width: 33.33% !important; }
             .receipt-container .mx-auto { margin-left: auto !important; margin-right: auto !important; }
             .receipt-container .text-green-700 { color: #047857 !important; }
             .receipt-container .bg-transparent { background-color: transparent !important; }
             .receipt-container .border.border-black.p-1\\.5.mt-2.mb-2 { /* Adjusted selector for specificity */
                border-width: 1px !important;
                border-color: black !important;
                padding: 1.5mm !important;
                background-color: #f3f4f6 !important;
                print-color-adjust: exact !important;
                margin-top: 2mm !important;
                margin-bottom: 2mm !important;
                line-height: 1.3 !important;
             }
             .receipt-container .text-\\[8pt\\] { font-size: 8pt !important; }
             .receipt-container .small-print { font-size: 8pt !important; line-height: 1.3 !important; }
             .receipt-container .signature-space { height: 15mm !important; }
             .receipt-container .receipt-signature { margin-top: 2mm !important; }
           }
           @media screen {
               body { background-color: #f3f4f6; }
               .print-preview-container {
                   display: flex;
                   justify-content: center;
                   align-items: flex-start;
                   padding: 1rem;
                   width: 100%;
                   overflow-x: auto;
                   min-height: 100vh;
               }
               .print-container {
                   display: flex !important;
                   flex-direction: row !important;
                   justify-content: center !important;
                   align-items: flex-start !important;
                   gap: 20px !important;
                   width: auto;
                   max-width: 1200px;
                   background-color: transparent;
               }
               .receipt-outer-wrapper {
                   flex: 1;
                   max-width: 500px;
                   min-width: 400px;
                   margin-bottom: 1rem;
                   background-color: white;
                   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                   height: auto;
                   border: 1px solid #ccc !important;
               }
               .receipt-container {
                    height: auto;
                    overflow: visible;
                    padding: 10px !important;
                    line-height: 1.5 !important;
               }
                .receipt-container .text-xs { font-size: 10pt !important; line-height: 1.5 !important; }
                .receipt-container .text-sm { font-size: 11pt !important; line-height: 1.5 !important; }
                .receipt-container .text-base { font-size: 12pt !important; line-height: 1.5 !important; }
                .receipt-container .text-\\[8pt\\] { font-size: 9pt !important; line-height: 1.4 !important; }
                .receipt-container .small-print { font-size: 9pt !important; line-height: 1.4 !important; }
           }
         `;


         try {
           const originalTitle = document.title;
           const printDoc = printWindow.document;

           printDoc.open();
           printDoc.write(`<!DOCTYPE html><html lang="id"><head><title>Bukti Daftar Ulang - ${data?.namaPendaftar || daftarUlangId}</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${styles}${printSpecificStyles}</style></head><body><div class="print-container">${printContent.innerHTML}</div></body></html>`);
           printDoc.close();

           setTimeout(() => {
             try {
               console.log('Executing print command.');
               printWindow.focus();
               printWindow.print();
               console.log('Print command executed.');
             } catch (printError) {
               console.error("Error during print execution:", printError);
                toast({ title: "Gagal Mencetak", description: "Terjadi kesalahan saat mencoba mencetak.", variant: "destructive" });
                if (printWindow && !printWindow.closed) printWindow.close();
             } finally {
                 console.log('Restoring original document title.');
                 document.title = originalTitle;
             }
           }, 1000);

         } catch (writeError) {
           console.error("Error writing to print window:", writeError);
           toast({ title: "Gagal Mempersiapkan Cetak", description: "Terjadi kesalahan saat menyiapkan halaman cetak.", variant: "destructive" });
           if (printWindow && !printWindow.closed) printWindow.close();
         }
      }, 50);
   };

     if (authLoading || loading) {
          return (
              <div className="flex justify-center items-center h-screen">
                   <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                   <span>Memuat bukti daftar ulang...</span>
              </div>
          );
     }

    if (error) {
      return <div className="flex justify-center items-center h-screen text-red-600"><p>{error}</p></div>;
    }

    if (!data) {
      return <div className="flex justify-center items-center h-screen"><p>Data tidak tersedia.</p></div>;
    }

    // Render the content only if data is available
    return (
      <div className="p-4 print:p-0 min-h-screen flex flex-col bg-gray-100 print:bg-white">
         <div className="mb-4 flex justify-between items-center no-print max-w-6xl mx-auto w-full">
             <Button variant="outline" size="sm" onClick={() => router.push('/admin/peserta-daftar-ulang')}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
             </Button>
             <Button onClick={handlePrint} size="sm" >
                 <Printer className="mr-2 h-4 w-4" /> Cetak Bukti (F4 Landscape)
             </Button>
         </div>
        <div className="print-preview-container flex-grow">
          <div ref={printRef} className="print-container">
            <BuktiDaftarUlangPrint data={data} />
          </div>
        </div>
      </div>
    );
};

// Component to handle authentication check before rendering content
const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

     useEffect(() => {
         setIsClient(true);
     }, []);

     useEffect(() => {
        if (!isClient || authLoading) return;

        const isPrintPage = pathname?.startsWith('/admin/cetak-bukti-du/');
        const isAdminPath = pathname?.startsWith('/admin');
        const isLoginPage = pathname === '/login';

        if (!user && isAdminPath && !isLoginPage && !isPrintPage) {
            console.log("AuthCheck: User not authenticated on protected admin page, redirecting from", pathname);
            const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
            router.push(redirectUrl);
        } else if (user && isLoginPage) {
            console.log("AuthCheck: User authenticated on login page, redirecting to /admin");
            router.push('/admin');
        }
     }, [isClient, authLoading, user, router, pathname]);


     if (!isClient || authLoading) {
         return (
             <div className="flex justify-center items-center h-screen">
                 <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                 <span>Memeriksa autentikasi...</span>
             </div>
         );
     }

    if (user || pathname?.startsWith('/login') || pathname?.startsWith('/admin/cetak-bukti-du/')) {
        return <>{children}</>;
    }

    // Fallback for non-user on protected admin pages (should ideally be handled by redirect)
    return null;
};

// Main component that uses the AuthCheck wrapper
const CetakBuktiDUPage = () => {
   return (
       <AuthCheck>
           <CetakBuktiDUPageContent />
       </AuthCheck>
   );
};

export default CetakBuktiDUPage;