'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Users, UserPlus, ListChecks, FileText, Settings, Edit, FileInput, BarChart3, BookUser, BriefcaseBusiness, School, UserCog, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth(); // Use the auth hook
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true after component mounts
    // requireAuth logic is now primarily handled within useAuth's useEffect
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
      console.log('Logout clicked');
      await logout();
  };

  // Show loading state while useAuth is initializing or if not on client yet
  const showLoading = !isClient || loading;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader >
          <div className="flex items-center gap-2 p-2" >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                <path fillRule="evenodd" d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.522c0 .318.218.594.5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.42a.75.75 0 0 0-.657-.744A8.202 8.202 0 0 1 6 18a8.235 8.235 0 0 1-2.25-.37v-1.42a.75.75 0 0 1 .657-.744A8.21 8.21 0 0 0 6 15c2.086 0 3.981-.782 5.378-2.067a.75.75 0 0 0 1.122-.56v-1.42a.75.75 0 0 0-.5-.707 8.21 8.21 0 0 0-1.721-.486.75.75 0 0 0-.657.744v1.42h-.001c-1.431.925-3.312 1.483-5.323 1.483a8.235 8.235 0 0 1-2.25-.37V7.5a8.21 8.21 0 0 0 1.721-.486.75.75 0 0 1 .657.744v1.42c0 .274.11.523.294.706A8.21 8.21 0 0 0 6 10.5c2.086 0 3.981-.782 5.378-2.067a.75.75 0 0 1 1.122-.56v-1.42a.75.75 0 0 1 .5-.707c.157-.054.316-.1.477-.143a.75.75 0 0 0 .6-.89Z" />
                <path d="M12.75 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.522c0 .318-.218.594-.5.707A9.735 9.735 0 0 1 12.75 21a9.707 9.707 0 0 1-5.25-1.533v-1.42a.75.75 0 0 1 .657-.744 8.202 8.202 0 0 0 4.593-.345 8.235 8.235 0 0 0 2.25-.37v-1.42a.75.75 0 0 0-.657-.744 8.21 8.21 0 0 1-4.593-.345c-2.086 0-3.981.782-5.378 2.067a.75.75 0 0 1-1.122.56v1.42a.75.75 0 0 1 .5.707 8.21 8.21 0 0 1 1.721.486.75.75 0 0 1 .657.744v-1.42h.001c1.431-.925 3.312-1.483 5.323-1.483a8.235 8.235 0 0 0 2.25.37V13.5a8.21 8.21 0 0 1-1.721.486.75.75 0 0 0-.657.744v-1.42a.75.75 0 0 1-.294-.706 8.21 8.21 0 0 1-1.622-4.533c2.086 0 3.981.782 5.378 2.067a.75.75 0 0 0 1.122.56v1.42a.75.75 0 0 0 .5-.707c.157.054.316.1.477-.143a.75.75 0 0 1 .6.89Z" />
             </svg>
            <span className="font-semibold text-lg text-primary group-data-[collapsible=icon]:hidden">
              MANSABA PPDB
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/admin')}
                tooltip="Dashboard"
              >
                <Link href="/admin">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarSeparator />

             <SidebarGroup>
              <SidebarGroupLabel>Pendaftaran</SidebarGroupLabel>
               <SidebarMenuItem>
                 <SidebarMenuButton
                   asChild
                   isActive={isActive('/admin/input-daftar-ulang')}
                   tooltip="Input Daftar Ulang"
                 >
                   <Link href="/admin/input-daftar-ulang">
                     <FileInput />
                     <span>Input Daftar Ulang</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/data-pendaftar')}
                  tooltip="Data Pendaftar"
                >
                  <Link href="/admin/data-pendaftar">
                    <Users />
                    <span>Data Pendaftar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
             </SidebarGroup>

             <SidebarGroup>
               <SidebarGroupLabel>Status Daftar Ulang</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/peserta-daftar-ulang')}
                    tooltip="Peserta Daftar Ulang"
                  >
                    <Link href="/admin/peserta-daftar-ulang">
                      <ListChecks />
                      <span>Sudah Daftar Ulang</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/belum-daftar-ulang')}
                    tooltip="Belum Daftar Ulang"
                  >
                    <Link href="/admin/belum-daftar-ulang">
                      <Edit /> {/* Using Edit as a placeholder for 'pending' */}
                      <span>Belum Daftar Ulang</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarGroup>

             <SidebarGroup>
               <SidebarGroupLabel>Laporan</SidebarGroupLabel>
                 <SidebarMenuItem>
                   <SidebarMenuButton
                     asChild
                     isActive={isActive('/admin/data-pendaftar-lengkap')}
                     tooltip="Data Lengkap"
                   >
                     <Link href="/admin/data-pendaftar-lengkap">
                       <FileText />
                       <span>Data Pendaftar Lengkap</span>
                     </Link>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/admin/laporan-harian')}
                      tooltip="Laporan Harian"
                    >
                      <Link href="/admin/laporan-harian">
                        <BarChart3 />
                        <span>Laporan Harian</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/admin/laporan-sekolah')}
                      tooltip="Laporan Asal Sekolah"
                    >
                      <Link href="/admin/laporan-sekolah">
                        <School />
                        <span>Laporan Asal Sekolah</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/admin/laporan-seragam')}
                      tooltip="Laporan Seragam"
                    >
                      <Link href="/admin/laporan-seragam">
                        <BriefcaseBusiness /> {/* Using Briefcase as placeholder */}
                        <span>Laporan Seragam</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
             </SidebarGroup>

             {/* Conditionally render Admin section based on user role */}
             {showLoading ? (
                 // Optional: Show a skeleton or placeholder while loading user role
                 <SidebarGroup>
                    <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
                    {/* Add Skeleton loaders here if desired */}
                 </SidebarGroup>
             ) : user?.isAdmin && (
               <SidebarGroup>
                 <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/admin/profil')}
                      tooltip="Profil Saya"
                    >
                      <Link href="/admin/profil">
                        <UserCog /> {/* Changed icon */}
                        <span>Profil Saya</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/admin/input-petugas')}
                      tooltip="Input Petugas"
                    >
                      <Link href="/admin/input-petugas">
                        <UserPlus />
                        <span>Input Petugas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/admin/pengaturan')}
                      tooltip="Pengaturan"
                    >
                      <Link href="/admin/pengaturan">
                        <Settings />
                        <span>Pengaturan</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
               </SidebarGroup>
             )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 md:justify-end">
             <SidebarTrigger className="md:hidden" />
             <div className="text-sm text-muted-foreground font-medium">
                {showLoading ? 'Memuat...' : user?.name || 'Pengguna'}
             </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
             {/* Show loading indicator centrally until auth check is complete */}
             {showLoading ? (
                 <div className="flex h-full items-center justify-center">
                   <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                   <p>Memuat...</p>
                 </div>
             ) : (
                // Render children only when loading is false. Redirects are handled by useAuth.
                children
             )}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;