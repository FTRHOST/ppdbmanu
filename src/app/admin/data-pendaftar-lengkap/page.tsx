'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
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
import { Edit, Trash2, Printer, Download, Search, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

// Data structure - This should represent the data from the database
interface PendaftarLengkap {
  id: number;
  nomorPendaftaran: string;
  nama: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tempatTanggalLahir: string; // Sudah string
  noHp: string;
  alamatLengkap: string;
  sekolahAsal: string;
  programPeminatan: 'MIPA' | 'IPS' | 'BHS' | 'AGM' | 'Tahfidz';
  jalurPendaftaran: 'Reguler Umum' | 'Reguler Prestasi' | 'Reguler Sosial';
  namaAyah: string;
  namaIbu: string;
  statusDaftarUlang: 'Sudah' | 'Belum';
}

export default function DataPendaftarLengkapPage() {
  const [pendaftar, setPendaftar] = useState<PendaftarLengkap[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/pendaftar-lengkap'); // Panggil API route
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PendaftarLengkap[] = await response.json();
        setPendaftar(data);
      } catch (error) {
        console.error('Gagal mengambil data pendaftar:', error);
        toast({
          title: "Gagal!",
          description: "Terjadi kesalahan saat mengambil data dari server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrintDetail = (id: number) => {
    // TODO: Implement print detail logic (similar to formulir but maybe different layout)
    console.log('Cetak detail for ID:', id);
    alert('Fitur cetak detail pendaftar belum diimplementasikan.');
  };

  const handleEditPendaftar = (id: number) => {
    // TODO: Implement edit pendaftar logic (navigate to a full edit form)
    console.log('Edit pendaftar lengkap for ID:', id);
     alert('Fitur edit data lengkap pendaftar belum diimplementasikan.');
     // Example: router.push(`/admin/edit-pendaftar/${id}`);
  };

 const handleDeletePendaftar = async () => {
    if (itemToDelete === null) return;
    console.log('Deleting pendaftar with ID:', itemToDelete);
    // TODO: Replace with actual API call to delete data on the server
    try {
        setLoading(true); // Show loading state during deletion
        await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

        // Update state after successful deletion
        setPendaftar(prev => prev.filter(item => item.id !== itemToDelete));

        toast({
            title: "Sukses!",
            description: `Data pendaftar berhasil dihapus.`,
            variant: "default",
        });
    } catch (error) {
        console.error("Error deleting pendaftar:", error);
        toast({
            title: "Gagal!",
            description: "Terjadi kesalahan saat menghapus data.",
            variant: "destructive",
        });
    } finally {
        setItemToDelete(null); // Close dialog
        setLoading(false); // Hide loading state
    }
 };

 const handleExportExcel = () => {
    // TODO: Implement Excel export logic for the full data
    console.log('Exporting full data to Excel...');
    alert('Fitur export Excel data lengkap belum diimplementasikan.');
  };

   const handlePrintTable = () => {
     // TODO: Implement table print logic for this specific view
     console.log('Printing full data table...');
      window.print(); // Basic browser print
   };

  const filteredData = pendaftar.filter(item =>
    item.nomorPendaftaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sekolahAsal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.programPeminatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jalurPendaftaran.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
         {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
             <AlertDialogDescription>
               Tindakan ini tidak dapat diurungkan. Ini akan menghapus data pendaftar secara permanen dari server.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setItemToDelete(null)}>Batal</AlertDialogCancel>
             <AlertDialogAction onClick={handleDeletePendaftar} className="bg-destructive hover:bg-destructive/90">
                Ya, Hapus Data
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <FileText /> Data Pendaftar Lengkap
          </CardTitle>
          <CardDescription>Menampilkan semua data pendaftar yang telah dikumpulkan melalui formulir.</CardDescription>
           <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
              <div className="relative w-full md:w-1/3">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Cari data lengkap..."
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
                  <TableHead>No. Pend</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>JK</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead>Sekolah Asal</TableHead>
                  <TableHead>Peminatan</TableHead>
                  <TableHead>Status DU</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nomorPendaftaran}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>{item.jenisKelamin.substring(0,1)}</TableCell> {/* L/P */}
                      <TableCell className="text-xs">{item.tempatTanggalLahir}</TableCell>
                      <TableCell>{item.sekolahAsal}</TableCell>
                       <TableCell>{item.programPeminatan}</TableCell>
                       <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.statusDaftarUlang === 'Sudah' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                           {item.statusDaftarUlang}
                         </span>
                       </TableCell>
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
                             <DropdownMenuItem onClick={() => handleEditPendaftar(item.id)}>
                               <Edit className="mr-2 h-4 w-4" />
                               <span>Edit Lengkap</span>
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handlePrintDetail(item.id)}>
                               <Printer className="mr-2 h-4 w-4" />
                               <span>Cetak Detail</span>
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => setItemToDelete(item.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                               <Trash2 className="mr-2 h-4 w-4" />
                               <span>Hapus Data</span>
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Tidak ada data pendaftar lengkap yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
                <TableCaption>Menampilkan data lengkap {filteredData.length} pendaftar.</TableCaption>
            </Table>
           )}
        </CardContent>
      </Card>
    </div>
  );
}