// src/app/admin/cetak-formulir/[id]/page.tsx (Diperbarui)
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { FormulirPendaftaranPrint, type FormulirData } from '@/components/cetak/formulir-pendaftaran-print';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth'; // Ensure correct path
import { toast } from '@/hooks/use-toast'; // Ensure correct path

// Mock data structure
interface PendaftarLengkap extends FormulirData {
  id: number;
}

// Mock data remains the same
// const mockFullData: PendaftarLengkap[] = [ ... ]; // Hapus mock data

// Component to render the actual page content once auth is confirmed
const CetakFormulirPageContent = () => {
    const params = useParams();
    const router = useRouter();
    const pendaftarId = params?.id ? parseInt(params.id as string, 10) : null;
    const [data, setData] = useState<FormulirData | null>(null); // Use FormulirData here
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null); // Ensure correct type
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const fetchData = async () => {
            if (!pendaftarId) {
                setError('ID Pendaftar tidak valid.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                console.log(`Fetching data for ID: ${pendaftarId}`);
                const response = await fetch(`/api/pendaftar/${pendaftarId}`); // Panggil API route
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const apiData: FormulirData = await response.json(); // Ambil data dari respons API
                // await new Promise(resolve => setTimeout(resolve, 500));
                // const foundData = mockFullData.find(item => item.id === pendaftarId);

                if (apiData) {
                    const dataWithPrintDate: FormulirData = {
                        ...apiData,
                        tanggalCetak: format(new Date(), 'dd MMMM yyyy', { locale: localeId })
                    };
                    setData(dataWithPrintDate);
                } else {
                    setError(`Data pendaftar dengan ID ${pendaftarId} tidak ditemukan.`);
                }
            } catch (err) {
                console.error('Error fetching pendaftar data:', err);
                setError('Gagal memuat data pendaftar.');
                toast({
                    title: "Gagal Memuat Data",
                    description: "Terjadi kesalahan saat mengambil data pendaftar.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [pendaftarId, isClient]);

   const handlePrint = () => {
     const printContent = printRef.current;
     if (!printContent || !isClient) {
          toast({
             title: "Gagal Mencetak",
             description: "Konten formulir tidak ditemukan atau komponen belum siap.",
             variant: "destructive",
          });
         return;
     }

     setTimeout(() => {
         const originalTitle = document.title;
         document.title = `Formulir Pendaftaran - ${data?.nama || pendaftarId}`;

         let styles = '';
         try {
             styles = Array.from(document.styleSheets)
                .map(styleSheet => {
                  try {
                   if (!styleSheet.href || styleSheet.href.startsWith(window.location.origin) || styleSheet.href.startsWith('/')) {
                       return Array.from(styleSheet.cssRules)
                           .map(rule => rule.cssText)
                           .join('');
                   }
                   return '';
                  } catch (e) {
                    console.warn('Could not read CSS rules from stylesheet:', styleSheet.href, e);
                    return '';
                  }
                })
                .join('\n');
         } catch (e) {
             console.error("Error collecting styles:", e);
         }

          const printSpecificStyles = `
            @media print {
              @page { size: A4; margin: 15mm; }
              html, body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Times New Roman', Times, serif;
                  font-size: 10pt;
                  line-height: 1.3; /* Adjusted line-height */
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  background-color: white !important;
              }
              .no-print { display: none !important; }
              .print-container {
                   width: 100%;
                   max-width: 100%;
                   margin: 0;
                   padding: 0;
                   border: none;
                   box-shadow: none;
                   break-inside: avoid;
                   background-color: white !important;
              }
              /* Ensure no forced page breaks inside grid items */
              .grid > div { break-inside: avoid-page !important; }
              /* Prevent widow/orphan lines in paragraphs/textareas */
              p, span, div, h1, h2, h3, h4, ul, li { orphans: 3; widows: 3; }
              img { max-width: 100%; height: auto; object-fit: contain; }
              .data-row { margin-bottom: 2px !important; } /* Tighter spacing */
              .data-row > span:first-child { width: 120px !important; } /* Adjust label width if needed */
              .section-title { margin-top: 4px !important; margin-bottom: 2px !important; font-size: 11pt !important; }
              .print-signature { margin-top: 40px !important; } /* More space for signatures */
              .print-signature p { line-height: 1.4 !important; margin-bottom: 1px !important; }
              .print-signature .underline { display: inline-block; min-width: 150px; }
              .print-footer-section { margin-top: 10px !important; padding-top: 5px !important; border-top: 1px solid #ccc !important; }
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
                    background-color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    padding: 1rem;
                    width: 210mm; /* A4 width */
                    min-height: 297mm; /* A4 height */
                    border: 1px solid #ccc;
                    margin: 1rem auto;
                     line-height: 1.5 !important;
                }
                 .data-row { margin-bottom: 4px; }
                 .section-title { margin-top: 0.75rem; margin-bottom: 0.5rem; }
                 .print-signature { margin-top: 2rem; }
                 .print-footer-section { margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed #ccc; }
            }
          `;

         const printWindow = window.open('', '', 'height=800,width=900,scrollbars=yes'); // Increased width
         if (printWindow) {
            printWindow.document.write('<!DOCTYPE html><html lang="id"><head><title>');
            printWindow.document.write(document.title);
            printWindow.document.write('</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">');
            printWindow.document.write('<style>');
            printWindow.document.write(styles); // Existing app styles
            printWindow.document.write(printSpecificStyles); // Print-specific overrides
            printWindow.document.write('</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="print-container">');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();

             // Delay printing slightly to allow content rendering in the new window
             setTimeout(() => {
                try {
                   printWindow.focus();
                   printWindow.print();
                   // Consider removing or adjusting the auto-close behavior
                   // setTimeout(() => { if (!printWindow.closed) printWindow.close(); }, 2000);
                } catch(e) {
                   console.error("Error during print execution:", e);
                    toast({ title: "Gagal Mencetak", description: "Terjadi kesalahan saat memulai proses cetak.", variant: "destructive" });
                   if (!printWindow.closed) printWindow.close();
                } finally {
                   document.title = originalTitle; // Restore original title
                }
             }, 750); // Increased delay

         } else {
            toast({ title: "Gagal Membuka Jendela", description: "Browser mungkin memblokir pop-up. Mohon izinkan pop-up.", variant: "destructive" });
         }
       }, 50); // Short delay before opening window
   };


    if (!isClient || loading) {
      return <div className="flex justify-center items-center h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin" /><span>Memuat data formulir...</span></div>;
    }

    if (error) {
      return <div className="flex justify-center items-center h-screen text-red-600"><p>{error}</p></div>;
    }

    if (!data) {
      return <div className="flex justify-center items-center h-screen"><p>Data tidak tersedia.</p></div>;
    }

    return (
      <div className="bg-gray-100 p-4 print:bg-white print:p-0">
         <div className="mb-4 flex justify-between items-center no-print max-w-4xl mx-auto">
             <Button variant="outline" size="sm" onClick={() => router.back()}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
             </Button>
           <Button onClick={handlePrint} size="sm">
             <Printer className="mr-2 h-4 w-4" /> Cetak Ulang Formulir (A4)
           </Button>
         </div>
        {/* Add print-preview-container for screen view styling */}
        <div className="print-preview-container">
            <div ref={printRef} className="print-container">
                {/* The actual print content component */}
                <FormulirPendaftaranPrint data={data} />
            </div>
        </div>
      </div>
    );
};

// Component to handle authentication check before rendering content
const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

     useEffect(() => {
         setIsClient(true);
     }, []);

     useEffect(() => {
        if (!isClient || authLoading) return;

        const isAdminPath = pathname?.startsWith('/admin');
        const isLoginPage = pathname === '/login';

        if (!user && isAdminPath && !isLoginPage) {
             console.log("AuthCheck (Cetak Formulir): User not authenticated, redirecting from", pathname);
             const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
             router.push(redirectUrl);
         }
         // No need to redirect logged-in user from print page
     }, [isClient, authLoading, user, router, pathname]);


    if (!isClient || authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Memeriksa autentikasi...</span>
            </div>
        );
    }

    // Allow rendering if user exists OR if loading is done (even if user is null, page itself might handle it)
    if (user || !authLoading) {
        return <>{children}</>;
    }

    // Fallback if still loading somehow or condition not met
    return null;
};


// Main component that uses the AuthCheck wrapper
const CetakFormulirPage = () => {
   return (
       <AuthCheck>
           <CetakFormulirPageContent />
       </AuthCheck>
   );
};


export default CetakFormulirPage;