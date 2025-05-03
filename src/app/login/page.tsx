
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
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth'; // Import the auth hook using relative path

// Validation Schema
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username harus diisi.' }),
  password: z.string().min(1, { message: 'Password harus diisi.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth(); // Use the login function from the auth hook

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log('Login attempt:', values.username);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        toast({
          title: "Login Berhasil!",
          description: `Selamat datang kembali, ${values.username}.`,
          variant: "default",
        });
        router.push('/admin'); // Redirect to admin dashboard on successful login
      } else {
        // Login function in useAuth already shows the toast for failure
        form.setError("username", { type: "manual", message: "Username atau password salah." });
        form.setError("password", { type: "manual", message: "Username atau password salah." });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Gagal!",
        description: error.message || "Terjadi kesalahan saat mencoba login.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <LogIn className="h-8 w-8" />
           </div>
          <CardTitle className="text-2xl font-bold text-primary">Login Admin PPDB</CardTitle>
          <CardDescription>Masukkan username dan password Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan username" {...field} />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting || loading}>
                {form.formState.isSubmitting || loading ? 'Memproses...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
    
