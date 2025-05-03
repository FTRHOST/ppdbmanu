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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Define options for Biaya Daftar Ulang
const biayaOptions = [
  { value: 100000, label: 'Rp 100.000' },
  { value: 200000, label: 'Rp 200.000' },
  { value: 300000, label: 'Rp 300.000' },
  { value: 400000, label: 'Rp 400.000' },
  { value: 500000, label: 'Rp 500.000' },
];

// Mock data structure - Combine Pendaftar and DaftarUlang data for edit
// Add all fields that can be edited from the daftar ulang record
interface DaftarUlangEditData {
  // From Pendaftar (read-only display)
  pendaftarId: number;
  nomorPendaftaran: string;
  nama: string;
  sekolahAsal: string;

  // From DaftarUlang (editable fields)
  id: number; // Daftar Ulang ID
  nomorDaftarUlang: string;
  kelengkapanKK: boolean;
  kelengkapanSKL: boolean;
  kelengkapanPiagam: boolean;
  kelengkapanSKTM: boolean;
  bayarDaftarUlang: boolean;
  biayaDaftarUlang?: number | null;
  ukuranSeragam: string;
  seragamOsis: boolean;
  seragamPramuka: boolean;
  seragamBatik: boolean;
  seragamOlahraga: boolean;
  tanggalDaftarUlang: string; // YYYY-MM-DD (read-only or editable?) - Keep read-only for now
}

// Mock Combined Data - Replace with actual data fetching logic based on Daftar Ulang ID
const mockCombinedDataForEdit: DaftarUlangEditData[] = [
   {
     pendaftarId: 1,
     nomorPendaftaran: 'A-2526/0001',
     nama: 'Ahmad Fauzi',
     sekolahAsal: 'MTs N 1 Batang',
     id: 101, // DU ID
     nomorDaftarUlang: 'DU-1',
     kelengkapanKK: true,
     kelengkapanSKL: true,
     kelengkapanPiagam: false,
     kelengkapanSKTM: false,
     bayarDaftarUlang: true,
     biayaDaftarUlang: 400000,
     ukuranSeragam: 'L',
     seragamOsis: true,
     seragamPramuka: true,
     seragamBatik: true,
     seragamOlahraga: false,
     tanggalDaftarUlang: '2024-07-15'
   },
   {
     pendaftarId: 3,
     nomorPendaftaran: 'A-2526/0003',
     nama: 'Citra Lestari',
     sekolahAsal: 'MTs Al Hidayah',
     id: 102, // DU ID
     nomorDaftarUlang: 'DU-2',
     kelengkapanKK: true,
     kelengkapanSKL: false,
     kelengkapanPiagam: true,
     kelengkapanSKTM: true,
     bayarDaftarUlang: true,
     biayaDaftarUlang: 300000,
     ukuranSeragam: 'M',
     seragamOsis: true,
     seragamPramuka: true,
     seragamBatik: true,
     seragamOlahraga: true,
     tanggalDaftarUlang: '2024-07-15'
   },
   {
     pendaftarId: 6,
     nomorPendaftaran: 'A-2526/0006',
     nama: 'Fitri Handayani',
     sekolahAsal: 'SMP N 1 Subah',
     id: 103, // DU ID
     nomorDaftarUlang: 'DU-3',
     kelengkapanKK: false,
     kelengkapanSKL: true,
     kelengkapanPiagam: false,
     kelengkapanSKTM: false,
     bayarDaftarUlang: false,
     biayaDaftarUlang: null,
     ukuranSeragam: 'XL',
     seragamOsis: true,
     seragamPramuka: false,
     seragamBatik: true,
     seragamOlahraga: true,
     tanggalDaftarUlang: '2024-07-16'
   },
 ];

// Zod schema for the editable fields
const editDaftarUlangSchema = z.object({
  // Readonly fields are not part of the schema for validation
  kelengkapanKK: z.boolean().default(false),
  kelengkapanSKL: z.boolean().default(false),
  kelengkapanPiagam: z.boolean().optional(),
  kelengkapanSKTM: z.boolean().optional(),
  bayarDaftarUlang: z.boolean().default(false),
  biayaDaftarUlang: z.number().optional(), // Keep as number, handle conversion in Select
  ukuranSeragam: z.enum(['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Custom'], { required_error: 'Ukuran seragam harus dipilih.' }),
  seragamOsis: z.boolean().default(false),
  seragamPramuka: z.boolean().default(false),
  seragamBatik: z.boolean().default(false),
  seragamOlahraga: z.boolean().default(false),
}).refine(data => {
  // If payment is checked, a valid amount must be selected
  if (data.bayarDaftarUlang && (data.biayaDaftarUlang === undefined || data.biayaDaftarUlang === null || data.biayaDaftarUlang <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Jumlah biaya daftar ulang harus dipilih jika pembayaran dicentang.',
  path: ['biayaDaftarUlang'],
});


export default function EditDaftarUlangPage() {
  const params = useParams();
  const router = useRouter();
  const daftarUlangId = params?.id ? parseInt(params.id as string, 10) : null;

  const [initialData, setInitialData] = useState<DaftarUlangEditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof editDaftarUlangSchema>>({
    resolver: zodResolver(editDaftarUlangSchema),
    defaultValues: { // Default values will be overridden by fetched data
      kelengkapanKK: false,
      kelengkapanSKL: false,
      kelengkapanPiagam: false,
      kelengkapanSKTM: false,
      bayarDaftarUlang: false,
      biayaDaftarUlang: undefined,
      ukuranSeragam: undefined,
      seragamOsis: false,
      seragamPramuka: false,
      seragamBatik: false,
      seragamOlahraga: false,
    },
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!daftarUlangId) {
        setError('ID Daftar Ulang tidak valid.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to fetch data by DAFTAR ULANG ID
        console.log(`Fetching data for edit, Daftar Ulang ID: ${daftarUlangId}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const foundData = mockCombinedDataForEdit.find(item => item.id === daftarUlangId);

        if (foundData) {
          setInitialData(foundData);
          // Reset the form with the fetched data
          form.reset({
            kelengkapanKK: foundData.kelengkapanKK,
            kelengkapanSKL: foundData.kelengkapanSKL,
            kelengkapanPiagam: foundData.kelengkapanPiagam,
            kelengkapanSKTM: foundData.kelengkapanSKTM,
            bayarDaftarUlang: foundData.bayarDaftarUlang,
            // Ensure biayaDaftarUlang is number or undefined for Select
            biayaDaftarUlang: foundData.biayaDaftarUlang ?? undefined,
            ukuranSeragam: foundData.ukuranSeragam as any, // Cast if needed for enum
            seragamOsis: foundData.seragamOsis,
            seragamPramuka: foundData.seragamPramuka,
            seragamBatik: foundData.seragamBatik,
            seragamOlahraga: foundData.seragamOlahraga,
          });
        } else {
          setError(`Data daftar ulang dengan ID ${daftarUlangId} tidak ditemukan.`);
        }
      } catch (err) {
        console.error('Error fetching daftar ulang data for edit:', err);
        setError('Gagal memuat data daftar ulang.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [daftarUlangId, form]); // Include form in dependency array

  // Watch bayarDaftarUlang to toggle biaya field visibility/requirement
  const watchBayarDaftarUlang = form.watch('bayarDaftarUlang');

  async function onSubmit(values: z.infer<typeof editDaftarUlangSchema>) {
    if (!initialData) return;

    const dataToSubmit = {
      id: initialData.id, // Include the ID for update
      ...values,
      biayaDaftarUlang: values.bayarDaftarUlang ? values.biayaDaftarUlang : null,
      // tanggalDaftarUlang: initialData.tanggalDaftarUlang, // Assuming date is not editable
    };
    console.log('Form Edit Daftar Ulang Submitted:', dataToSubmit);
    // --- TODO: Replace with actual API call to UPDATE data ---
    try {
        setLoading(true); // Show loading during update
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Sukses!",
            description: `Data daftar ulang untuk ${initialData.nama} berhasil diperbarui.`,
            variant: "default",
        });
        router.push('/admin/peserta-daftar-ulang'); // Redirect back to the list page
    } catch (error) {
        console.error("Error updating data:", error);
        toast({
            title: "Gagal!",
            description: "Terjadi kesalahan saat memperbarui data daftar ulang.",
            variant: "destructive",
        });
        setLoading(false);
    }
    // --- End of TODO ---
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Memuat data untuk diedit...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600"><p>{error}</p></div>;
  }

  if (!initialData) {
    return <div className="flex justify-center items-center h-screen"><p>Data tidak ditemukan.</p></div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Edit Data Daftar Ulang</CardTitle>
          <CardDescription>
             Perbarui informasi daftar ulang untuk <strong>{initialData.nama}</strong> ({initialData.nomorPendaftaran}).
          </CardDescription>
        </CardHeader>
        <CardContent>
           {/* Display Read-only Info */}
           <div className="mb-6 space-y-2 text-sm p-4 bg-secondary/30 rounded-md border">
             <p><strong>No. Daftar Ulang:</strong> {initialData.nomorDaftarUlang}</p>
             <p><strong>Sekolah Asal:</strong> {initialData.sekolahAsal}</p>
             <p><strong>Tanggal Daftar Ulang:</strong> {format(new Date(initialData.tanggalDaftarUlang), 'dd MMMM yyyy', { locale: localeId })}</p>
           </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Kelengkapan Berkas */}
              <FormItem>
                <FormLabel>Kelengkapan Berkas</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-md border p-4">
                  <FormField
                    control={form.control}
                    name="kelengkapanKK"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">KK Asli</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kelengkapanSKL"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">SKL Asli</FormLabel>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="kelengkapanPiagam"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Piagam (Jika Ada)</FormLabel>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="kelengkapanSKTM"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                         <FormLabel className="font-normal">SKTM / Rekom PRNU (Jika Ada)</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                 <FormMessage /> {/* Display potential form-level errors here if needed */}
              </FormItem>


               {/* Pembayaran */}
               <div className="space-y-4 rounded-md border p-4">
                  <FormField
                    control={form.control}
                    name="bayarDaftarUlang"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} id="bayarDaftarUlang" />
                        </FormControl>
                        <FormLabel htmlFor="bayarDaftarUlang" className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                         Bayar Daftar Ulang
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  {watchBayarDaftarUlang && (
                     <FormField
                       control={form.control}
                       name="biayaDaftarUlang"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Jumlah Biaya Daftar Ulang</FormLabel>
                           <Select
                             value={field.value !== undefined && field.value !== null ? String(field.value) : undefined}
                             onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                             disabled={!watchBayarDaftarUlang}
                           >
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Pilih jumlah biaya" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {biayaOptions.map((option) => (
                                 <SelectItem key={option.value} value={String(option.value)}>
                                   {option.label}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                  )}
               </div>


              {/* Seragam */}
               <div className="space-y-6 rounded-md border p-4">
                 <FormField
                   control={form.control}
                   name="ukuranSeragam"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Ukuran Seragam</FormLabel>
                         <FormControl>
                             <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                              >
                                {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Custom'].map(size => (
                                   <FormItem key={size} className="flex items-center space-x-3 space-y-0">
                                     <FormControl>
                                       <RadioGroupItem value={size} />
                                     </FormControl>
                                     <FormLabel className="font-normal">
                                         {size === 'Custom' ? 'Custom (Ukuran Sendiri)' : size}
                                     </FormLabel>
                                   </FormItem>
                                ))}
                              </RadioGroup>
                         </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormItem>
                   <FormLabel>Seragam yang Diterima</FormLabel>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-md border p-4">
                      <FormField
                       control={form.control}
                       name="seragamOsis"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                           <FormControl>
                             <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                           </FormControl>
                           <FormLabel className="font-normal">Osis</FormLabel>
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="seragamPramuka"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                           <FormControl>
                             <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                           </FormControl>
                           <FormLabel className="font-normal">Pramuka</FormLabel>
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="seragamBatik"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                           <FormControl>
                             <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                           </FormControl>
                           <FormLabel className="font-normal">Batik</FormLabel>
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="seragamOlahraga"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                           <FormControl>
                             <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                           </FormControl>
                           <FormLabel className="font-normal">Olahraga</FormLabel>
                         </FormItem>
                       )}
                     />
                   </div>
                    <FormMessage /> {/* Display potential form-level errors here if needed */}
                 </FormItem>
               </div>


              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting || loading}>
                 {form.formState.isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
