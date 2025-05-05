'use client';

import type React from 'react';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, FileInput, BarChart3, Clock } from 'lucide-react'; // Added Clock icon
import { mockPendaftarData, type Pendaftar } from '@/app/admin/data-pendaftar/page'; // Import mock pendaftar data and type
import { mockPesertaDaftarUlangData, type PesertaDaftarUlang } from '@/app/admin/peserta-daftar-ulang/page'; // Import mock daftar ulang data and type
import { isToday } from 'date-fns'; // Import date-fns helper



interface DashboardStats {
  totalPendaftar: number;
  sudahDaftarUlang: number;
  belumDaftarUlang: number;
  pendaftarHariIni: number;
  daftarUlangHariIni: number;
}

const AdminDashboardPage = () => {
   const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     // TODO: Replace with actual API calls to fetch and calculate stats
     const calculateStats = async () => {
       setLoading(true);
       await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

       const totalPendaftar = mockPendaftarData.length;
       const sudahDaftarUlang = mockPesertaDaftarUlangData.length;
       const belumDaftarUlang = totalPendaftar - sudahDaftarUlang;

       const pendaftarHariIni = mockPendaftarData.filter(p => isToday(p.tanggalDaftar)).length;
       const daftarUlangHariIni = mockPesertaDaftarUlangData.filter(du => isToday(new Date(du.tanggalDaftarUlang))).length;

       setDashboardStats({
         totalPendaftar,
         sudahDaftarUlang,
         belumDaftarUlang,
         pendaftarHariIni,
         daftarUlangHariIni,
       });
       setLoading(false);
     };

     calculateStats();
   }, []);

  if (loading) {
      return (
          <div className="space-y-6">
              <h1 className="text-2xl font-semibold text-primary">Memuat Dashboard...</h1>
              {/* Optional: Add skeleton loaders for cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="animate-pulse"><CardHeader><CardTitle className="h-4 bg-muted rounded w-3/4"></CardTitle></CardHeader><CardContent><div className="h-10 bg-muted rounded"></div></CardContent></Card>
                  <Card className="animate-pulse"><CardHeader><CardTitle className="h-4 bg-muted rounded w-3/4"></CardTitle></CardHeader><CardContent><div className="h-10 bg-muted rounded"></div></CardContent></Card>
                  <Card className="animate-pulse"><CardHeader><CardTitle className="h-4 bg-muted rounded w-3/4"></CardTitle></CardHeader><CardContent><div className="h-10 bg-muted rounded"></div></CardContent></Card>
                  <Card className="animate-pulse"><CardHeader><CardTitle className="h-4 bg-muted rounded w-3/4"></CardTitle></CardHeader><CardContent><div className="h-10 bg-muted rounded"></div></CardContent></Card>
                  <Card className="animate-pulse"><CardHeader><CardTitle className="h-4 bg-muted rounded w-3/4"></CardTitle></CardHeader><CardContent><div className="h-10 bg-muted rounded"></div></CardContent></Card>
              </div>
          </div>
      );
  }


  if (!dashboardStats) {
    // Handle case where data couldn't be loaded (though loading state should cover this)
    return <div>Gagal memuat data dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Dashboard PPDB</h1>
      <p className="text-muted-foreground">Ringkasan status pendaftaran peserta didik baru.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalPendaftar}</div>
            <p className="text-xs text-muted-foreground">Jumlah keseluruhan pendaftar</p>
          </CardContent>
        </Card>
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Daftar Ulang</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" /> {/* Changed color to primary-foreground style */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.sudahDaftarUlang}</div>
            <p className="text-xs text-muted-foreground">Telah menyelesaikan proses daftar ulang</p>
          </CardContent>
        </Card>
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Daftar Ulang</CardTitle>
            <UserX className="h-4 w-4 text-red-600" /> {/* Changed color to destructive style */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.belumDaftarUlang}</div>
            <p className="text-xs text-muted-foreground">Menunggu proses daftar ulang</p>
          </CardContent>
        </Card>
         <Card className="shadow hover:shadow-md transition-shadow md:col-span-1 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendaftar Hari Ini</CardTitle>
             <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendaftarHariIni}</div>
             <p className="text-xs text-muted-foreground">Pendaftar baru pada hari ini</p>
          </CardContent>
        </Card>
         <Card className="shadow hover:shadow-md transition-shadow md:col-span-1 lg:col-span-1">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Daftar Ulang Hari Ini</CardTitle>
             <FileInput className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{dashboardStats.daftarUlangHariIni}</div>
             <p className="text-xs text-muted-foreground">Peserta yang daftar ulang hari ini</p>
           </CardContent>
         </Card>
      </div>

      {/* Placeholder for recent activity or quick actions */}
      <Card className="shadow">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Clock className="h-5 w-5 text-muted-foreground"/> Aktivitas Terbaru
            </CardTitle>
            <CardDescription>Menampilkan log aktivitas terakhir pendaftaran dan daftar ulang.</CardDescription>
         </CardHeader>
         <CardContent>
            <p className="text-muted-foreground italic">Belum ada aktivitas terbaru.</p>
            {/* TODO: Implement recent activity log (e.g., list last 5 registrations/re-registrations) */}
         </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
