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
import { Printer, Download, Search, School } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data structure for report by school
interface SekolahReport {
  namaSekolah: string;
  jumlahPendaftar: number;
  jumlahDaftarUlang: number;
}

// Mock data - replace with actual data aggregation from DB
const mockData: SekolahReport[] = [
  { namaSekolah: 'MTs N 1 Batang', jumlahPendaftar: 35, jumlahDaftarUlang: 25 },
  { namaSekolah: 'SMP N 2 Banyuputih', jumlahPendaftar: 28, jumlahDaftarUlang: 15 },
  { namaSekolah: 'MTs Al Hidayah', jumlahPendaftar: 22, jumlahDaftarUlang: 18 },
  { namaSekolah: 'SMP Islam Terpadu', jumlahPendaftar: 15, jumlahDaftarUlang: 10 },
  { namaSekolah: 'SMP N 1 Subah', jumlahPendaftar: 12, jumlahDaftarUlang: 9 },
  { namaSekolah: 'MTs YPI Banyuputih', jumlahPendaftar: 8, jumlahDaftarUlang: 5 },
  { namaSekolah: 'Lainnya', jumlahPendaftar: 5, jumlahDaftarUlang: 3 }, // Aggregate smaller schools
];

export default function LaporanSekolahPage() {
  const [reportData, setReportData] = useState<SekolahReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulate data fetching and aggregation
  useEffect(() => {
    // TODO: Replace with actual API call to fetch and aggregate data by sekolahAsal
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      // Sort data by jumlahPendaftar descending for better chart readability
      const sortedData = mockData.sort((a, b) => b.jumlahPendaftar - a.jumlahPendaftar);
      setReportData(sortedData);
      setLoading(false);
    };
    fetchData();
  }, []);

 const handleExportExcel = () => {
    // TODO: Implement Excel export logic for this report
    console.log('Exporting Sekolah Report to Excel...');
     alert('Fitur export Excel belum diimplementasikan.');
  };

   const handlePrintTable = () => {
     // TODO: Implement table print logic for this report
     console.log('Printing Sekolah Report table...');
      window.print(); // Basic browser print
   };

  const filteredData = reportData.filter(item =>
    item.namaSekolah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for the chart (top N schools + Lainnya)
  const chartData = filteredData.slice(0, 10).map(item => ({
      name: item.namaSekolah.length > 15 ? item.namaSekolah.substring(0, 12) + '...' : item.namaSekolah, // Shorten long names
      Pendaftar: item.jumlahPendaftar,
      'Daftar Ulang': item.jumlahDaftarUlang,
  }));

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <School /> Laporan Berdasarkan Sekolah Asal
          </CardTitle>
          <CardDescription>Jumlah pendaftar dan peserta daftar ulang dikelompokkan berdasarkan SMP/MTs asal.</CardDescription>
           <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
              <div className="relative w-full md:w-1/3">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Cari nama sekolah..."
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
            <p className="text-center text-muted-foreground">Memuat laporan...</p>
          ) : (
            <>
             {/* Chart */}
              <div className="mb-8">
                 <h3 className="text-lg font-semibold mb-4 text-center text-primary">Grafik Pendaftar & Daftar Ulang per Sekolah Asal (Top 10)</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 75 }}> {/* Increased bottom margin */}
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} /> {/* Rotate labels */}
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="Pendaftar" fill="hsl(var(--primary))" />
                        <Bar dataKey="Daftar Ulang" fill="hsl(var(--secondary))" />
                    </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-[50px]">No.</TableHead>
                     <TableHead>Nama Sekolah Asal</TableHead>
                     <TableHead className="text-right">Jumlah Pendaftar</TableHead>
                     <TableHead className="text-right">Jumlah Daftar Ulang</TableHead>
                     <TableHead className="text-right">Persentase DU (%)</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredData.length > 0 ? (
                     filteredData.map((item, index) => (
                       <TableRow key={item.namaSekolah}>
                         <TableCell>{index + 1}</TableCell>
                         <TableCell className="font-medium">{item.namaSekolah}</TableCell>
                         <TableCell className="text-right">{item.jumlahPendaftar}</TableCell>
                         <TableCell className="text-right">{item.jumlahDaftarUlang}</TableCell>
                          <TableCell className="text-right">
                            {item.jumlahPendaftar > 0
                              ? ((item.jumlahDaftarUlang / item.jumlahPendaftar) * 100).toFixed(1) + '%'
                              : 'N/A'}
                          </TableCell>
                       </TableRow>
                     ))
                   ) : (
                     <TableRow>
                       <TableCell colSpan={5} className="h-24 text-center">
                         Tidak ada data sekolah yang cocok.
                       </TableCell>
                     </TableRow>
                   )}
                 </TableBody>
                  <TableCaption>Laporan berdasarkan sekolah asal.</TableCaption>
               </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
