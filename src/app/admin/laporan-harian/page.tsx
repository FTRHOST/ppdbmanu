'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale
import { Users, UserCheck, TrendingUp, School, BarChart3 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data structure for daily report
interface DailyReportData {
  tanggal: string; // YYYY-MM-DD
  jumlahPendaftar: number;
  jumlahDaftarUlang: number;
  peminatan: {
    MIPA: number;
    IPS: number;
    BHS: number;
    AGM: number;
    Tahfidz: number;
  };
  jenisKelamin: {
    LakiLaki: number;
    Perempuan: number;
  };
}

// Mock data - replace with actual data fetching for the selected date
const getMockReport = (date: Date): DailyReportData => {
   // Simple deterministic mock based on day of month
   const day = date.getDate();
   const basePendaftar = 5 + (day % 10);
   const baseDU = Math.floor(basePendaftar * (0.5 + (day % 5) * 0.1));
   return {
    tanggal: format(date, 'yyyy-MM-dd'),
    jumlahPendaftar: basePendaftar,
    jumlahDaftarUlang: baseDU,
    peminatan: {
      MIPA: Math.floor(basePendaftar * 0.3),
      IPS: Math.floor(basePendaftar * 0.25),
      BHS: Math.floor(basePendaftar * 0.15),
      AGM: Math.floor(basePendaftar * 0.2),
      Tahfidz: basePendaftar - Math.floor(basePendaftar * 0.3) - Math.floor(basePendaftar * 0.25) - Math.floor(basePendaftar * 0.15) - Math.floor(basePendaftar * 0.2), // Remainder
    },
    jenisKelamin: {
      LakiLaki: Math.ceil(basePendaftar * 0.55),
      Perempuan: basePendaftar - Math.ceil(basePendaftar * 0.55),
    },
  };
};

const peminatanChartData = (data: DailyReportData['peminatan']) => [
  { name: 'MIPA', Jumlah: data.MIPA },
  { name: 'IPS', Jumlah: data.IPS },
  { name: 'BHS', Jumlah: data.BHS },
  { name: 'AGM', Jumlah: data.AGM },
  { name: 'Tahfidz', Jumlah: data.Tahfidz },
];

const jkChartData = (data: DailyReportData['jenisKelamin']) => [
  { name: 'Laki-laki', Jumlah: data.LakiLaki },
  { name: 'Perempuan', Jumlah: data.Perempuan },
];


export default function LaporanHarianPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch report data for selectedDate
    const fetchData = async () => {
      setLoading(true);
      console.log(`Fetching report for ${format(selectedDate, 'yyyy-MM-dd')}`);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
      setReportData(getMockReport(selectedDate));
      setLoading(false);
    };
    fetchData();
  }, [selectedDate]);


  const handleDateChange = (date: Date | undefined) => {
      if (date) {
          setSelectedDate(date);
      }
  };


  return (
    <div className="space-y-6">
       <Card className="shadow-md">
         <CardHeader>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 /> Laporan Harian PPDB
                </CardTitle>
                <CardDescription>
                    Laporan Pendaftaran dan Daftar Ulang per tanggal: {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })}
                </CardDescription>
             </div>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                    locale={id}
                    disabled={(date) => date > new Date()} // Disable future dates
                  />
                </PopoverContent>
              </Popover>
           </div>
         </CardHeader>
         <CardContent>
            {loading ? (
                 <p className="text-center text-muted-foreground">Memuat laporan...</p>
            ) : !reportData ? (
                 <p className="text-center text-muted-foreground">Tidak ada data laporan untuk tanggal ini.</p>
            ) : (
                 <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card className="bg-secondary/30">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jumlah Pendaftar</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{reportData.jumlahPendaftar}</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-secondary/30">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jumlah Daftar Ulang</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{reportData.jumlahDaftarUlang}</div>
                          </CardContent>
                        </Card>
                         <Card className="bg-secondary/30">
                           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <CardTitle className="text-sm font-medium">Laki-laki</CardTitle>
                             <TrendingUp className="h-4 w-4 text-muted-foreground" /> {/* Placeholder Icon */}
                           </CardHeader>
                           <CardContent>
                             <div className="text-2xl font-bold">{reportData.jenisKelamin.LakiLaki}</div>
                           </CardContent>
                         </Card>
                         <Card className="bg-secondary/30">
                           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <CardTitle className="text-sm font-medium">Perempuan</CardTitle>
                              <TrendingUp className="h-4 w-4 text-muted-foreground" /> {/* Placeholder Icon */}
                           </CardHeader>
                           <CardContent>
                             <div className="text-2xl font-bold">{reportData.jenisKelamin.Perempuan}</div>
                           </CardContent>
                         </Card>
                    </div>

                    {/* Charts */}
                     <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        {/* Peminatan Chart */}
                         <Card>
                           <CardHeader>
                             <CardTitle className="text-base font-medium">Distribusi Peminatan</CardTitle>
                           </CardHeader>
                           <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                               <BarChart data={peminatanChartData(reportData.peminatan)}>
                                 <CartesianGrid strokeDasharray="3 3" />
                                 <XAxis dataKey="name" />
                                 <YAxis allowDecimals={false} />
                                 <Tooltip />
                                 <Legend />
                                 <Bar dataKey="Jumlah" fill="hsl(var(--primary))" />
                               </BarChart>
                             </ResponsiveContainer>
                           </CardContent>
                         </Card>

                        {/* Jenis Kelamin Chart */}
                         <Card>
                           <CardHeader>
                             <CardTitle className="text-base font-medium">Distribusi Jenis Kelamin</CardTitle>
                           </CardHeader>
                           <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                               <BarChart data={jkChartData(reportData.jenisKelamin)}>
                                 <CartesianGrid strokeDasharray="3 3" />
                                 <XAxis dataKey="name" />
                                 <YAxis allowDecimals={false} />
                                 <Tooltip />
                                 {/* <Legend /> */}
                                  <Bar dataKey="Jumlah" fill="hsl(var(--secondary))" />
                               </BarChart>
                             </ResponsiveContainer>
                           </CardContent>
                         </Card>
                     </div>
                 </>
            )}
         </CardContent>
       </Card>
    </div>
  );
}
