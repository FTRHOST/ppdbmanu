

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
import { Printer, Download, Search, Shirt, Users, UserCheck, PersonStanding, Home } from 'lucide-react'; // Added more icons
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// Mock data structure for uniform report item
interface SeragamReportItem {
  ukuran: string; // S, M, L, XL, etc.
  jenisKelamin: 'Laki-laki' | 'Perempuan' | 'Total'; // Added Total for overall summary
  osis: number;
  pramuka: number;
  batik: number;
  olahraga: number;
}

// Mock summary stats - replace with actual data fetching
interface SummaryStats {
    totalPendaftar: number;
    totalDaftarUlang: number;
    totalLakiLakiDU: number;
    totalPerempuanDU: number;
}

const mockSummaryStats: SummaryStats = {
    totalPendaftar: 125, // Example total registrants
    totalDaftarUlang: 7, // Total re-registrants (sum of L+P)
    totalLakiLakiDU: 4, // Example male re-registrants
    totalPerempuanDU: 3, // Example female re-registrants
};


// Mock raw data - replace with actual data aggregation from daftar ulang records
// Add more diverse data for testing
const mockRawData = [
  // Sample daftar ulang records (subset of fields needed)
  { id: 101, jenisKelamin: 'Laki-laki', ukuranSeragam: 'L', seragamOsis: true, seragamPramuka: true, seragamBatik: true, seragamOlahraga: false },
  { id: 102, jenisKelamin: 'Perempuan', ukuranSeragam: 'M', seragamOsis: true, seragamPramuka: true, seragamBatik: true, seragamOlahraga: true },
  { id: 103, jenisKelamin: 'Laki-laki', ukuranSeragam: 'XL', seragamOsis: true, seragamPramuka: false, seragamBatik: true, seragamOlahraga: true },
  { id: 104, jenisKelamin: 'Laki-laki', ukuranSeragam: 'L', seragamOsis: true, seragamPramuka: true, seragamBatik: true, seragamOlahraga: true },
  { id: 105, jenisKelamin: 'Perempuan', ukuranSeragam: 'M', seragamOsis: true, seragamPramuka: true, seragamBatik: false, seragamOlahraga: true },
  { id: 106, jenisKelamin: 'Perempuan', ukuranSeragam: 'S', seragamOsis: false, seragamPramuka: true, seragamBatik: true, seragamOlahraga: true },
  { id: 107, jenisKelamin: 'Laki-laki', ukuranSeragam: 'XXL', seragamOsis: true, seragamPramuka: true, seragamBatik: true, seragamOlahraga: true },
  { id: 108, jenisKelamin: 'Perempuan', ukuranSeragam: 'L', seragamOsis: true, seragamPramuka: true, seragamBatik: true, seragamOlahraga: true },
  { id: 109, jenisKelamin: 'Laki-laki', ukuranSeragam: 'M', seragamOsis: true, seragamPramuka: true, seragamBatik: true, seragamOlahraga: true },
];

// Function to process raw data into the report structure
const processSeragamData = (rawData: any[]): SeragamReportItem[] => {
  const reportMap: { [key: string]: SeragamReportItem } = {};
  const ukuranOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Custom']; // Define order

  // Initialize map entries for all sizes and genders to ensure they exist even if count is 0
  ukuranOrder.forEach(ukuran => {
     ['Laki-laki', 'Perempuan'].forEach(jk => {
         const key = `${ukuran}-${jk}`;
         reportMap[key] = {
             ukuran: ukuran,
             jenisKelamin: jk as 'Laki-laki' | 'Perempuan',
             osis: 0,
             pramuka: 0,
             batik: 0,
             olahraga: 0,
         };
     });
  });


  rawData.forEach(item => {
    const key = `${item.ukuranSeragam}-${item.jenisKelamin}`;
    // Only process if the key exists (valid size/gender)
    if (reportMap[key]) {
        if (item.seragamOsis) reportMap[key].osis++;
        if (item.seragamPramuka) reportMap[key].pramuka++;
        if (item.seragamBatik) reportMap[key].batik++;
        if (item.seragamOlahraga) reportMap[key].olahraga++;
    }
  });

  // Calculate Totals
  ukuranOrder.forEach(ukuran => {
       const totalKey = `${ukuran}-Total`;
       const lakiKey = `${ukuran}-Laki-laki`;
       const perempuanKey = `${ukuran}-Perempuan`;

       reportMap[totalKey] = {
           ukuran: ukuran,
           jenisKelamin: 'Total',
           osis: (reportMap[lakiKey]?.osis || 0) + (reportMap[perempuanKey]?.osis || 0),
           pramuka: (reportMap[lakiKey]?.pramuka || 0) + (reportMap[perempuanKey]?.pramuka || 0),
           batik: (reportMap[lakiKey]?.batik || 0) + (reportMap[perempuanKey]?.batik || 0),
           olahraga: (reportMap[lakiKey]?.olahraga || 0) + (reportMap[perempuanKey]?.olahraga || 0),
       };
   });


   // Sort the results based on ukuranOrder and then jenisKelamin
    return Object.values(reportMap).sort((a, b) => {
       const indexA = ukuranOrder.indexOf(a.ukuran);
       const indexB = ukuranOrder.indexOf(b.ukuran);
       if (indexA !== indexB) return indexA - indexB;

        // Define order for jenisKelamin within each ukuran
       const jkOrder = ['Laki-laki', 'Perempuan', 'Total'];
       return jkOrder.indexOf(a.jenisKelamin) - jkOrder.indexOf(b.jenisKelamin);
   });
};


export default function LaporanSeragamPage() {
  const [reportData, setReportData] = useState<SeragamReportItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'total' | 'laki' | 'perempuan'>('total');

  // Simulate data fetching and processing
  useEffect(() => {
    // TODO: Replace mockRawData and mockSummaryStats with actual API calls
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      const processedData = processSeragamData(mockRawData);
      setReportData(processedData);
      setSummaryStats(mockSummaryStats); // Set mock summary data
      setLoading(false);
    };
    fetchData();
  }, []);

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
     let dataToFilter = reportData;
     // Filter out sizes with zero total counts for the 'Total' tab for cleaner display
     if (tab === 'total') {
         dataToFilter = reportData.filter(item => {
             if (item.jenisKelamin === 'Total') {
                 return item.osis > 0 || item.pramuka > 0 || item.batik > 0 || item.olahraga > 0;
             }
             return false; // Only include 'Total' rows in the total tab display data
         });
     } else if (tab === 'laki') {
          dataToFilter = reportData.filter(item => item.jenisKelamin === 'Laki-laki');
     } else if (tab === 'perempuan') {
          dataToFilter = reportData.filter(item => item.jenisKelamin === 'Perempuan');
     }
      // Filter out rows where all counts are zero for L/P tabs as well
      return dataToFilter.filter(item => item.osis > 0 || item.pramuka > 0 || item.batik > 0 || item.olahraga > 0);
 };


 // Chart data preparation based on active tab
 const chartData = getFilteredData(activeTab).map(item => ({
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
       ) : summaryStats && (
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
                      <PersonStanding className="h-4 w-4 text-muted-foreground" /> {/* Icon for Male */}
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{summaryStats.totalLakiLakiDU}</div>
                  </CardContent>
              </Card>
              <Card className="bg-secondary/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">DU Perempuan</CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" /> {/* Placeholder Icon for Female */}
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{summaryStats.totalPerempuanDU}</div>
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
     const totals = data.reduce((acc, item) => {
         acc.osis += item.osis;
         acc.pramuka += item.pramuka;
         acc.batik += item.batik;
         acc.olahraga += item.olahraga;
         acc.totalPcs += item.osis + item.pramuka + item.batik + item.olahraga;
         return acc;
     }, { osis: 0, pramuka: 0, batik: 0, olahraga: 0, totalPcs: 0 });


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

