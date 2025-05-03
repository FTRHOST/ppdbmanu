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
import { UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react'; // Import useState and useEffect

// Mock Petugas data structure for storage
interface PetugasAccount {
    nama: string;
    username: string;
    password: string; // IMPORTANT: Storing plain text password is insecure. Only for mock purposes.
    isAdmin: boolean;
}

// Validation Schema
const petugasSchema = z.object({
  nama: z.string().min(3, { message: 'Nama petugas minimal 3 karakter.' }),
  username: z.string().min(4, { message: 'Username minimal 4 karakter.' }).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username hanya boleh berisi huruf, angka, dan underscore.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password dan Konfirmasi Password tidak cocok.",
  path: ["confirmPassword"], // Attach error to confirmPassword field
});


export default function InputPetugasPage() {
    const [petugasList, setPetugasList] = useState<PetugasAccount[]>([]);

    // Load existing petugas from local storage on mount
    useEffect(() => {
        const storedPetugas = localStorage.getItem('petugasAccounts');
        if (storedPetugas) {
            try {
                setPetugasList(JSON.parse(storedPetugas));
            } catch (e) {
                console.error("Error parsing stored petugas data:", e);
            }
        }
    }, []);


    // TODO: Add authorization check - only admin should access this page

  const form = useForm<z.infer<typeof petugasSchema>>({
    resolver: zodResolver(petugasSchema),
    defaultValues: {
      nama: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });


  async function onSubmit(values: z.infer<typeof petugasSchema>) {
    // Exclude confirmPassword before saving
    const { confirmPassword, ...dataToSubmit } = values;

    // Check if username already exists (case-insensitive for robustness)
     const usernameExists = petugasList.some(p => p.username.toLowerCase() === dataToSubmit.username.toLowerCase());
     if (usernameExists) {
         form.setError("username", { type: "manual", message: "Username sudah digunakan." });
         toast({
             title: "Gagal!",
             description: "Username sudah digunakan. Silakan pilih username lain.",
             variant: "destructive",
         });
         return;
     }

     // Add the new petugas account
     const newPetugas: PetugasAccount = {
         ...dataToSubmit,
         isAdmin: false, // Petugas are not admins
         // IMPORTANT: Storing plain text password - highly insecure!
     };

    console.log('Data Petugas Submitted:', newPetugas);
    // --- Mock saving to Local Storage ---
    try {
        const updatedList = [...petugasList, newPetugas];
        localStorage.setItem('petugasAccounts', JSON.stringify(updatedList));
        setPetugasList(updatedList); // Update component state

        toast({
            title: "Sukses!",
            description: `Petugas dengan nama ${dataToSubmit.nama} berhasil ditambahkan.`,
            variant: "default",
        });
        form.reset(); // Reset form after successful submission

    } catch (error: any) {
        console.error("Error creating petugas:", error);
        toast({
            title: "Gagal!",
            description: "Terjadi kesalahan saat menambahkan petugas.",
            variant: "destructive",
        });
    }
    // --- End of Mock ---
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <UserPlus /> Input Petugas Pendaftaran Baru
          </CardTitle>
          <CardDescription>Tambahkan akun petugas baru untuk mengelola pendaftaran.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap Petugas</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan username (untuk login)" {...field} />
                    </FormControl>
                     <FormDescription>
                       Hanya boleh berisi huruf, angka, dan underscore (_). Case sensitive.
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan password" {...field} />
                    </FormControl>
                     <FormDescription>
                       Minimal 6 karakter. Case sensitive.
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ulangi password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Petugas Baru'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
       {/* Optional: Display existing petugas (for debugging/management) */}
       {/* <Card className="mt-8 max-w-2xl mx-auto">
           <CardHeader><CardTitle>Daftar Petugas (Mock)</CardTitle></CardHeader>
           <CardContent>
            {petugasList.length > 0 ? (
                <ul>
                    {petugasList.map(p => <li key={p.username}>{p.nama} ({p.username})</li>)}
                </ul>
            ) : (
                <p className="text-muted-foreground">Belum ada petugas ditambahkan.</p>
            )}
           </CardContent>
       </Card> */}
    </div>
  );
}
