// src/app/admin/laporan-seragam/page.tsx (Diperbarui)
'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';  //Add callback
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Printer, Download, Search, Shirt, Users, UserCheck, PersonStanding, Home } from 'lucide-react'; // Added more icons
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// 3.Import Interfaces Types
interface SeragamReportItem {
  ukuran: string; // S, M, L, XL, etc.
  jenisKelamin: 'Laki-laki' | 'Perempuan' | 'Total'; // Added Total for overall summary
  osis: number;
  pramuka: number;
  batik: number;
  olahraga: number;
}
//4 Now is a const and not a const for is a literal map, not can have literal in other code part
interface SummaryStats {
    totalPendaftar: number;
    totalDaftarUlang: number;
    totalLakiLakiDU: number;
    totalPerempuanDU: number;
}

export default function LaporanSeragamPage() {
  const [reportData, setReportData] = useState<SeragamReportItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'total' | 'laki' | 'perempuan'>('total');

    // 6 Call Function with useCallback
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/laporan-seragam'); // Change here
            if (!response.ok) {
              console.error('HTTP error details:', response.status, response.statusText, await response.text());
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();  // response with two items summaryStats and reportData

            setReportData(result.reportData);
             setSummaryStats(result.summaryStats);  // Response with new result
        } catch (error) {
           console.error('Gagal mengambil data laporan seragam:', error);
            toast({
                title: "Gagal Memuat Laporan",
                description: "Terjadi kesalahan saat mengambil data laporan seragam.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
       fetchData();   // Call fetchdata function to fetch results
    }, [fetchData]); // Use function here for dependency

  const handleExportExcel = () => {
    // TODO: Implement Excel export logic for the current view (tab)
    console.log(`Exporting Seragam Report (${activeTab}) to Excel...`);
    alert('Fitur export Excel belum diimplementasikan.');
  };

  const handlePrintTable = () => {
    // TODO: Implement table print logic for the current view (tab)
    console.log(`Printing Seragam Report (${activeTab}) table...`);
     window.print(); // Basic browser print
  };

  const getFilteredData = (tab: 'total' | 'laki' | 'perempuan'): SeragamReportItem[] => {
      let dataToFilter = reportData;  //ReportData, load here and use
       if (tab === 'total') {
            dataToFilter = reportData.filter(item => item.jenisKelamin === 'Total' && (item.osis > 0 || item.pramuka > 0 || item.batik > 0 || item.olahraga > 0)); // No zeros data
        } else if (tab === 'laki') {
            dataToFilter = reportData.filter(item => item.jenisKelamin === 'Laki-laki');
      } else if (tab === 'perempuan') {
            dataToFilter = reportData.filter(item => item.jenisKelamin === 'Perempuan');
      }
        return dataToFilter.filter(item => item.osis > 0 || item.pramuka > 0 || item.batik > 0 || item.olahraga > 0);

  };


 const chartData = getFilteredData(activeTab).map(item => ({   // Now can work with data to types
        name: item.ukuran,
        Osis: item.osis,
        Pramuka: item.pramuka,
        Batik: item.batik,
        Olahraga: item.olahraga,
    }));


  return (
    <div className="space-y-6">
       {/* Summary Cards Section */}
       {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader><CardTitle>Memuat...</CardTitle></CardHeader><CardContent><div className="h-8 bg-muted rounded animate-pulse"></div></CardContent></Card>
              <Card><CardHeader><CardTitle>Memuat...</CardTitle></CardHeader><CardContent><div className="h-8 bg-muted rounded animate-pulse"></div></CardContent></Card>
              <Card><CardHeader><CardTitle>Memuat...</CardTitle></CardHeader><CardContent><div className="h-8 bg-muted rounded animate-pulse"></div></CardContent></Card>
              <Card><CardHeader><CardTitle>Memuat...</CardTitle></CardHeader><CardContent><div className="h-8 bg-muted rounded animate-pulse"></div></CardContent></Card>
          </div>
       ) : summaryStats && ( // Check again is not empty data

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.totalPendaftar}</div>
                </CardContent>
            </Card>
            <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Daftar Ulang</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.totalDaftarUlang}</div>
                </CardContent>
            </Card>
            <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">DU Laki-laki</CardTitle>
                    <PersonStanding className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {/* Check before the value  load data*/}
                  <div className="text-2xl font-bold">{summaryStats?.totalLakiLakiDU }</div>
                </CardContent>
            </Card>
            <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">DU Perempuan</CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {/* Check value exist with optional operation */}
                    <div className="text-2xl font-bold">{summaryStats?.totalPerempuanDU}</div>
                </CardContent>
            </Card>
        </div>
        )}


      {/* Uniform Report Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Shirt /> Laporan Kebutuhan Seragam
          </CardTitle>
          <CardDescription>Rekapitulasi jumlah kebutuhan seragam berdasarkan ukuran dan jenis kelamin.</CardDescription>
          <div className="flex justify-end gap-2 pt-4">
                 {/* Note: Search might be less useful here unless searching by size */}
                 <Button variant="outline" size="sm" onClick={handlePrintTable}>
                   <Printer className="mr-2 h-4 w-4" />
                   Cetak Tabel ({activeTab})
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleExportExcel}>
                   <Download className="mr-2 h-4 w-4" />
                   Export Excel ({activeTab})
                 </Button>
               </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Memuat laporan seragam...</p>
          ) : (
             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
               <TabsList className="grid w-full grid-cols-3 mb-4">
                 <TabsTrigger value="total">Total Kebutuhan</TabsTrigger>
                 <TabsTrigger value="laki">Laki-laki</TabsTrigger>
                 <TabsTrigger value="perempuan">Perempuan</TabsTrigger>
               </TabsList>

               {/* Chart Section - Display chart based on active tab */}
               <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-center text-primary">
                      Grafik Kebutuhan Seragam ({activeTab === 'total' ? 'Total' : activeTab === 'laki' ? 'Laki-laki' : 'Perempuan'})
                  </h3>
                   {getFilteredData(activeTab).length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                         <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false}/>
                            <Tooltip />
                            <Legend />
                             {/* Define Bar colors - adjust as needed */}
                             <Bar dataKey="Osis" stackId="a" fill="hsl(var(--chart-1))" name="Osis" />
                             <Bar dataKey="Pramuka" stackId="a" fill="hsl(var(--chart-2))" name="Pramuka" />
                             <Bar dataKey="Batik" stackId="a" fill="hsl(var(--chart-3))" name="Batik" />
                             <Bar dataKey="Olahraga" stackId="a" fill="hsl(var(--chart-4))" name="Olahraga" />
                          </BarChart>
                      </ResponsiveContainer>
                   ) : (
                      <p className="text-center text-muted-foreground mt-4">Tidak ada data untuk ditampilkan pada grafik.</p>
                   )}
               </div>

                {/* Table Section - Render tables within TabsContent */}
                <TabsContent value="total">
                   {/* Render Table for Total */}
                   <SeragamTable data={getFilteredData('total')} tabName="total" />
                </TabsContent>
                <TabsContent value="laki">
                  {/* Render Table for Laki-laki */}
                  <SeragamTable data={getFilteredData('laki')} tabName="laki" />
                </TabsContent>
                <TabsContent value="perempuan">
                  {/* Render Table for Perempuan */}
                  <SeragamTable data={getFilteredData('perempuan')} tabName="perempuan" />
                </TabsContent>

             </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Extracted Table Component for reusability within tabs
const SeragamTable: React.FC<{ data: SeragamReportItem[]; tabName: string }> = ({ data, tabName }) => {
    const captionText = `Rekap kebutuhan seragam ${tabName === 'total' ? 'total' : tabName === 'laki' ? 'laki-laki' : 'perempuan'}.`;

    // Calculate column totals
     const totals = React.useMemo(() => data.reduce((acc, item) => { //Use Recalculate on change for data performance
         acc.osis += item.osis;
         acc.pramuka += item.pramuka;
         acc.batik += item.batik;
         acc.olahraga += item.olahraga;
         acc.totalPcs += item.osis + item.pramuka + item.batik + item.olahraga;
         return acc;
     }, { osis: 0, pramuka: 0, batik: 0, olahraga: 0, totalPcs: 0 }), [data]); // and Add memo

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Ukuran</TableHead>
                    <TableHead className="text-right">Osis</TableHead>
                    <TableHead className="text-right">Pramuka</TableHead>
                    <TableHead className="text-right">Batik</TableHead>
                    <TableHead className="text-right">Olahraga</TableHead>
                    <TableHead className="text-right font-semibold">Total Pcs</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length > 0 ? (
                    data.map((item) => {
                        const totalPcs = item.osis + item.pramuka + item.batik + item.olahraga;
                        return (
                            <TableRow key={`${item.ukuran}-${item.jenisKelamin}`}>
                                <TableCell className="font-medium">{item.ukuran}</TableCell>
                                <TableCell className="text-right">{item.osis}</TableCell>
                                <TableCell className="text-right">{item.pramuka}</TableCell>
                                <TableCell className="text-right">{item.batik}</TableCell>
                                <TableCell className="text-right">{item.olahraga}</TableCell>
                                <TableCell className="text-right font-semibold">{totalPcs}</TableCell>
                            </TableRow>
                        );
                    })
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            Tidak ada data seragam untuk kategori ini.
                        </TableCell>
                    </TableRow>
                )}
                 {/* Footer Row for Totals */}
                {data.length > 0 && (
                    <TableRow className="font-bold bg-muted/50">
                        <TableCell>TOTAL</TableCell>
                        <TableCell className="text-right">{totals.osis}</TableCell>
                        <TableCell className="text-right">{totals.pramuka}</TableCell>
                        <TableCell className="text-right">{totals.batik}</TableCell>
                        <TableCell className="text-right">{totals.olahraga}</TableCell>
                        <TableCell className="text-right">{totals.totalPcs}</TableCell>
                    </TableRow>
                )}
            </TableBody>
            <TableCaption>
                {captionText}
            </TableCaption>
        </Table>
    );
};