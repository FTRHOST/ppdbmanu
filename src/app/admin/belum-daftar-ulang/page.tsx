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
import { Printer, Download, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link'; // Import Link for navigation

// Mock data structure - reuse Pendaftar interface from data-pendaftar
interface Pendaftar {
  id: number; // Unique DB ID
  nomorPendaftaran: string;
  nama: string;
  sekolahAsal: string;
  noHp?: string; // Add phone number if available and needed for follow-up
}

// Mock data - replace with actual data fetching (filter pendaftar based on statusDaftarUlang='Belum')
const mockData: Pendaftar[] = [
 { id: 2, nomorPendaftaran: 'A-2526/0002', nama: 'Budi Santoso', sekolahAsal: 'SMP N 2 Banyuputih', noHp: '081234567891' },
 { id: 4, nomorPendaftaran: 'A-2526/0004', nama: 'Dewi Anggraini', sekolahAsal: 'SMP Islam Terpadu', noHp: '081234567893' },
 { id: 5, nomorPendaftaran: 'A-2526/0005', nama: 'Eko Prasetyo', sekolahAsal: 'MTs N 1 Batang', noHp: '081234567894' },
];


export default function BelumDaftarUlangPage() {
  const [peserta, setPeserta] = useState<Pendaftar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    // TODO: Replace with actual API call to fetch pendaftar with status 'Belum Daftar Ulang'
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      setPeserta(mockData);
      setLoading(false);
    };
    fetchData();
  }, []);


 const handleExportExcel = () => {
    // TODO: Implement Excel export logic for this specific list
    console.log('Exporting Belum Daftar Ulang to Excel...');
     alert('Fitur export Excel belum diimplementasikan.');
  };

   const handlePrintTable = () => {
     // TODO: Implement table print logic for this specific list
     console.log('Printing Belum Daftar Ulang table...');
     window.print(); // Basic browser print
   };

  const filteredData = peserta.filter(item =>
    item.nomorPendaftaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sekolahAsal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-yellow-600" /> Peserta Belum Daftar Ulang
          </CardTitle>
          <CardDescription>Daftar peserta didik yang telah mendaftar namun belum menyelesaikan proses daftar ulang.</CardDescription>
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
                  <TableHead>Nomor Pendaftaran</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Sekolah Asal</TableHead>
                   <TableHead>No. HP (Jika Ada)</TableHead>
                   <TableHead className="text-right">Aksi Cepat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nomorPendaftaran}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>{item.sekolahAsal}</TableCell>
                      <TableCell>{item.noHp || '-'}</TableCell>
                      <TableCell className="text-right">
                         {/* Add a button/link to directly go to input daftar ulang for this student */}
                         <Button asChild variant="link" size="sm" className="text-primary hover:underline">
                            <Link href={`/admin/input-daftar-ulang?pendaftarId=${item.nomorPendaftaran}`}>
                                Input Daftar Ulang
                            </Link>
                         </Button>
                         {/* Maybe add follow-up actions like 'Send Reminder' later */}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Tidak ada data peserta yang belum daftar ulang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>Total {filteredData.length} peserta belum daftar ulang.</TableCaption>
            </Table>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
