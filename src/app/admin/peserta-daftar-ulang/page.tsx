// src/app/admin/peserta-daftar-ulang/page.tsx (Diperbarui)
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Printer, Download, Search, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Import cn utility

// Mock data - replace with actual data fetching (filter pendaftar based on statusDaftarUlang='Sudah') - Export data
export const mockPesertaDaftarUlangData: PesertaDaftarUlang[] = [
  { id: 101, pendaftarId: 1, nomorPendaftaran: 'A-2526/0001', nomorDaftarUlang: 'DU-1', nama: 'Ahmad Fauzi', sekolahAsal: 'MTs N 1 Batang', tanggalDaftarUlang: '2024-07-15', ukuranSeragam: 'L' },
  { id: 102, pendaftarId: 3, nomorPendaftaran: 'A-2526/0003', nomorDaftarUlang: 'DU-2', nama: 'Citra Lestari', sekolahAsal: 'MTs Al Hidayah', tanggalDaftarUlang: '2024-07-15', ukuranSeragam: 'M' },
  { id: 103, pendaftarId: 6, nomorPendaftaran: 'A-2526/0006', nomorDaftarUlang: 'DU-3', nama: 'Fitri Handayani', sekolahAsal: 'SMP N 1 Subah', tanggalDaftarUlang: format(new Date(), 'yyyy-MM-dd'), ukuranSeragam: 'XL' }, // Today
  // Add more mock data if needed for dashboard testing
];

// Mock data structure - adjust based on actual daftar ulang data
export interface PesertaDaftarUlang { // Export interface
  id: number; // Unique DB ID for daftar ulang record
  pendaftarId: number; // Link to Pendaftar table
  nomorPendaftaran: string;
  nomorDaftarUlang: string;
  nama: string;
  sekolahAsal: string;
  tanggalDaftarUlang: string; // Format: YYYY-MM-DD or display format
  ukuranSeragam: string;
}

// Mock data - replace with actual data fetching (filter pendaftar based on statusDaftarUlang='Sudah') - Remove mock data
// export const mockPesertaDaftarUlangData: PesertaDaftarUlang[] = [ ... ];

export default function PesertaDaftarUlangPage() {
  const [peserta, setPeserta] = useState<PesertaDaftarUlang[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  // Use effect to fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/peserta-daftar-ulang'); // Call API route
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PesertaDaftarUlang[] = await response.json();

        // Filter out entries with null values
        const filteredData = data.filter(item => 
          item.pendaftarId !== null &&
          item.nomorPendaftaran !== null &&
          item.nomorDaftarUlang !== null &&
          item.nama !== null &&
          item.sekolahAsal !== null &&
          item.tanggalDaftarUlang !== null &&
          item.ukuranSeragam !== null
        );

        setPeserta(filteredData);
      } catch (error) {
        console.error('Gagal mengambil data peserta daftar ulang:', error);
        toast({
          title: "Gagal Memuat Data",
          description: "Terjadi kesalahan saat mengambil data peserta daftar ulang.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrintBukti = (daftarUlangId: number) => {
    console.log('Attempting to print Bukti for Daftar Ulang ID:', daftarUlangId); // Debug log
     if (!daftarUlangId) {
         console.error('Invalid ID passed to handlePrintBukti');
         toast({
            title: "Error",
            description: "ID pendaftar tidak valid untuk mencetak bukti.",
            variant: "destructive",
         });
         return;
     }
    console.log('Opening print bukti for Daftar Ulang ID:', daftarUlangId);
    const printUrl = `/admin/cetak-bukti-du/${daftarUlangId}`;
    const newWindow = window.open(printUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      console.error('Failed to open new window. Check pop-up blocker.');
      toast({
        title: "Gagal Membuka Halaman Cetak",
        description: "Browser Anda mungkin memblokir pop-up. Mohon izinkan pop-up untuk situs ini.",
        variant: "destructive",
      });
    } else {
         console.log('Print window opened successfully.');
         // Trigger print after a short delay to allow content loading
          setTimeout(() => {
              try {
                  newWindow.print();
                  console.log("Print command issued.");
                  // Optionally close the window after printing, might interfere with user viewing/saving
                  // setTimeout(() => newWindow.close(), 1000);
              } catch (e) {
                  console.error("Error calling print() on new window:", e);
                  toast({
                     title: "Gagal Mencetak",
                     description: "Terjadi kesalahan saat mencoba memanggil fungsi cetak.",
                     variant: "destructive",
                  });
              }
          }, 1000); // Adjust delay as needed
    }
  };

  const handleEditDaftarUlang = (id: number) => {
    console.log('Attempting to edit Daftar Ulang ID:', id); // Debug log
    if (!id) {
        console.error('Invalid ID passed to handleEditDaftarUlang');
         toast({
            title: "Error",
            description: "ID pendaftar tidak valid untuk diedit.",
            variant: "destructive",
         });
        return;
    }
    console.log('Navigating to edit daftar ulang page for ID:', id);
    // Navigate to the edit page, passing the Daftar Ulang ID
    router.push(`/admin/edit-daftar-ulang/${id}`);
  };

 const handleExportExcel = () => {
    // TODO: Implement Excel export logic
    console.log('Exporting to Excel...');
     toast({
         title: "Fitur Belum Tersedia",
         description: "Fitur export data peserta daftar ulang ke Excel belum diimplementasikan.",
         variant: "default",
     });
  };

   const handlePrintTable = () => {
     // TODO: Implement better table print logic if needed
     console.log('Printing table...');
     window.print(); // Basic browser print
   };

  const filteredData = peserta.filter(item =>
    item.nomorPendaftaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nomorDaftarUlang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sekolahAsal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to safely parse date and format, handling invalid dates
   const formatDateSafe = (dateString: string): string => {
      try {
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return 'Tanggal Invalid';
        }
        return format(date, 'dd MMMM yyyy', { locale: id });
      } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Error Tanggal';
      }
    };


  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <CheckCircle className="text-green-600"/> Peserta Sudah Daftar Ulang
          </CardTitle>
          <CardDescription>Daftar peserta didik yang telah menyelesaikan proses daftar ulang.</CardDescription>
           <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
              <div className="relative w-full md:w-1/3">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Cari peserta..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-8 w-full"
                 />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={handlePrintTable}>
                   <Printer className="mr-2 h-4 w-4" />
                   Cetak Tabel
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleExportExcel}>
                   <Download className="mr-2 h-4 w-4" />
                   Export Excel
                 </Button>
               </div>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Memuat data...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>No. Daftar Ulang</TableHead>
                  <TableHead>No. Pendaftaran</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Sekolah Asal</TableHead>
                  <TableHead>Tgl Daftar Ulang</TableHead>
                  <TableHead>Ukuran Seragam</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nomorDaftarUlang}</TableCell>
                      <TableCell>{item.nomorPendaftaran}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>{item.sekolahAsal}</TableCell>
                      <TableCell>{formatDateSafe(item.tanggalDaftarUlang)}</TableCell>
                      <TableCell>{item.ukuranSeragam}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" className="h-8 w-8 p-0">
                               <span className="sr-only">Buka menu</span>
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                             <DropdownMenuItem
                               onClick={(e) => {
                                 // e.stopPropagation(); // Optional: Stop event propagation if needed
                                 handleEditDaftarUlang(item.id);
                               }}
                               className="cursor-pointer" // Ensure cursor indicates interactivity
                             >
                               <Edit className="mr-2 h-4 w-4" />
                               <span>Edit Daftar Ulang</span>
                             </DropdownMenuItem>
                             <DropdownMenuItem
                               onClick={(e) => {
                                 // e.stopPropagation(); // Optional: Stop event propagation if needed
                                 handlePrintBukti(item.id);
                               }}
                               className="cursor-pointer" // Ensure cursor indicates interactivity
                             >
                               <Printer className="mr-2 h-4 w-4" />
                               <span>Cetak Bukti</span>
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Tidak ada data peserta yang sudah daftar ulang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
               <TableCaption>Total {filteredData.length} peserta sudah daftar ulang.</TableCaption>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}