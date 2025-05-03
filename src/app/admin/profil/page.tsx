
'use client';

import type React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; // Use relative path
import { useState, useEffect } from 'react';

// Validation Schema for profile update (excluding password initially)
const profileSchema = z.object({
  nama: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  username: z.string().min(4, { message: 'Username minimal 4 karakter.' }).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username hanya boleh berisi huruf, angka, dan underscore.' }),
});

// Validation Schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Password saat ini harus diisi.' }),
  newPassword: z.string().min(6, { message: 'Password baru minimal 6 karakter.' }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Password Baru dan Konfirmasi Password Baru tidak cocok.",
  path: ["confirmNewPassword"],
});

export default function ProfilPage() {
  const { user, loading: authLoading, updateUserProfile, changeUserPassword } = useAuth(); // Assuming useAuth provides update functions
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nama: '',
      username: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // Populate profile form with current user data
  useEffect(() => {
    if (user) {
      profileForm.reset({
        nama: user.name,
        username: user.username, // Assuming username is available in user object
      });
    }
  }, [user, profileForm]);

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    setProfileLoading(true);
    console.log('Profile Update Submitted:', values);
    // --- TODO: Replace with actual API call using updateUserProfile ---
    try {
      const success = await updateUserProfile(values.nama, values.username); // Pass updated values
      if (success) {
        toast({
          title: "Sukses!",
          description: "Profil Anda berhasil diperbarui.",
          variant: "default",
        });
        // Refresh user data in useAuth state implicitly by updateUserProfile or manually if needed
      } else {
        // Error handled within updateUserProfile (e.g., username taken)
         profileForm.setError("username", { type: "manual", message: "Username mungkin sudah digunakan." }); // Example error
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Gagal!",
        description: "Terjadi kesalahan saat memperbarui profil.",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
    // --- End of TODO ---
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setPasswordLoading(true);
    console.log('Password Change Submitted');
    // --- TODO: Replace with actual API call using changeUserPassword ---
    try {
      const success = await changeUserPassword(values.currentPassword, values.newPassword);
      if (success) {
        toast({
          title: "Sukses!",
          description: "Password Anda berhasil diubah.",
          variant: "default",
        });
        passwordForm.reset(); // Reset password form
      } else {
        // Error handled within changeUserPassword (e.g., wrong current password)
        passwordForm.setError("currentPassword", { type: "manual", message: "Password saat ini salah." });
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Gagal!",
        description: "Terjadi kesalahan saat mengubah password.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
    // --- End of TODO ---
  }

  if (authLoading) {
    return <div className="flex justify-center items-center h-40"><p className="text-muted-foreground">Memuat profil...</p></div>;
  }

  if (!user) {
      // Should be handled by layout's requireAuth, but as a safeguard
      return <div className="text-destructive">Gagal memuat data pengguna. Silakan login kembali.</div>;
  }


  return (
    <div className="space-y-8">
      {/* Profile Information Card */}
      <Card className="shadow-md max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <UserCog /> Profil Saya
          </CardTitle>
          <CardDescription>Kelola informasi profil Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan username Anda" {...field} />
                    </FormControl>
                     <FormDescription>
                       Digunakan untuk login. Hanya boleh berisi huruf, angka, dan underscore (_).
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={profileLoading}>
                {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="shadow-md max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <KeyRound /> Ubah Password
          </CardTitle>
          <CardDescription>Ubah password login Anda secara berkala untuk keamanan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Saat Ini</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan password Anda saat ini" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Baru</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan password baru (min. 6 karakter)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ulangi password baru Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="secondary" className="w-full" disabled={passwordLoading}>
                {passwordLoading ? 'Mengubah...' : 'Ubah Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
