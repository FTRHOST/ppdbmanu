// src/app/form-daftar-ulang/page.tsx
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
import { Combobox } from '@/components/ui/combobox';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Pendaftar } from '@/types/pendaftarTypes';

// Define options for Biaya Daftar Ulang
const biayaOptions = [
  { value: 100000, label: 'Rp 100.000' },
  { value: 200000, label: 'Rp 200.000' },
  { value: 300000, label: 'Rp 300.000' },
  { value: 400000, label: 'Rp 400.000' },
  { value: 500000, label: 'Rp 500.000' },
  // Add other specific amounts if needed
];

// Define interface for Next Nomor DU
interface NextDUResponse {
    nextNomorDU: string;
}

const daftarUlangSchema = z.object({
  pendaftarId: z.string({ required_error: 'Siswa pendaftar harus dipilih.' }).min(1, 'Siswa pendaftar harus dipilih.'),
  nomorDaftarUlang: z.string(), // Readonly, generated automatically
  kelengkapanKK: z.boolean().default(false),
  kelengkapanSKL: z.boolean().default(false),
  kelengkapanPiagam: z.boolean().optional().nullable(), // allow isOptional.
  kelengkapanSKTM: z.boolean().optional().nullable(), // allow isOptional.
  bayarDaftarUlang: z.boolean().default(false),
  biayaDaftarUlang: z.number().optional().nullable(), // use the  Number(numString) or similar convert
  ukuranSeragam: z.enum(['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Custom'], { required_error: 'Ukuran seragam harus dipilih.' }),
  seragamOsis: z.boolean().default(false),
  seragamPramuka: z.boolean().default(false),
  seragamBatik: z.boolean().default(false),
  seragamOlahraga: z.boolean().default(false),
  tanggalDaftarUlang: z.date(), // Readonly, set to today
});
// Use type
type DaftarUlangFormValues = z.infer<typeof daftarUlangSchema>;

export default function InputDaftarUlangPage() {
  const [pendaftarOptions, setPendaftarOptions] = useState<{ value: string; label: string }[]>([]);
  const [nextNomorDU, setNextNomorDU] = useState('DU-1');

  const form = useForm<DaftarUlangFormValues>({
    resolver: zodResolver(daftarUlangSchema),
    defaultValues: {
      pendaftarId: '', // Initialize as empty string for Combobox
      nomorDaftarUlang: nextNomorDU,
      kelengkapanKK: false,
      kelengkapanSKL: false,
      kelengkapanPiagam: false,
      kelengkapanSKTM: false,
      bayarDaftarUlang: false,
      biayaDaftarUlang: undefined, // Initialize as undefined for Select
      ukuranSeragam: undefined,
      seragamOsis: false,
      seragamPramuka: false,
      seragamBatik: false,
      seragamOlahraga: false,
      tanggalDaftarUlang: new Date(),
    },
  });

   // 1.New Function with useCallback
  const fetchNextNomorDU = useCallback(async () => {
      try {
         const response = await fetch('/api/next-nomor-du'); // Call new Route

      if (!response.ok) {
         console.error('Response status for fetchNextNumber:', response.status); // New Errors
      console.error('Response body:', await response.text()); // Trace message text
                throw new Error(`HTTP error! status: ${response.status}`); // Correct code
            }
         const data:NextDUResponse = await response.json()   // New Assertion type
            setNextNomorDU(data.nextNomorDU); // Check properties valid with try

        } catch (error) {
            console.error('Error fetching next DU number:', error);
              toast({
                    title: "Gagal Memuat Data",
                    description: "Terjadi kesalahan saat memuat nomor daftar ulang otomatis.",
                    variant: "destructive",
                });
        }
    }, []);

  // Call Fetch as page mount and reuse a local call with callback when any call needed
  useEffect(() => {
    fetchNextNomorDU();  // Call with Callback Func in first run
  }, [fetchNextNomorDU]);


  useEffect(() => {
    const fetchPendaftar = async () => {
      try {
        const response = await fetch('/api/pendaftar'); // Fetch from your API
        if (!response.ok) {
          console.error('Failed to fetch pendaftar data'); // add info for logs
          throw new Error(`HTTP error! status: ${response.status}`);// better err
          
        }
        const data: Pendaftar[] = await response.json();   // Apply types in variable for safe use

        const options = data.map((item) => ({
          value: item.id,
          label: `${item.nomorPendaftaran} - ${item.nama} (${item.namaSekolahAsal})`, // Use same and exist Type value
        }));
        setPendaftarOptions(options);
      } catch (error) {
        console.error('Error fetching pendaftar:', error);
        toast({
                    title: "Gagal Memuat Data",
                    description: "Terjadi kesalahan saat cargar la lista de postulantes.",
                    variant: "destructive",
                });
      }
    };
    fetchPendaftar();
  }, []);  // No Dependecy


   // Call in init after fetch Next NUm

   // Update value form  with new DU number
   useEffect(() => {
    form.setValue('nomorDaftarUlang', nextNomorDU); //Call set force change value
  }, [nextNomorDU, form]); // Add dependencies


  // Watch bayarDaftarUlang to toggle biaya field visibility/requirement
  const watchBayarDaftarUlang = form.watch('bayarDaftarUlang');

  async function onSubmit(values: z.infer<typeof daftarUlangSchema>) {
     const dataToSubmit = {
      ...values,
      // Biaya is already a number or undefined due to Select onValueChange handling
      biayaDaftarUlang: values.bayarDaftarUlang ? values.biayaDaftarUlang : null, // Set null if not paid
      tanggalDaftarUlang: format(values.tanggalDaftarUlang, 'yyyy-MM-dd'), // Format date for DB
    };
     console.log('Form Daftar Ulang Submitted:', dataToSubmit); // Trace Values Sended

    // Call Api POST

     try {
        const response = await fetch('/api/daftar-ulang', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSubmit),
        });

             if (!response.ok) {
                  console.error('Response status:', response.status);
                 console.error('Response body:', await response.json());
                 throw new Error(`HTTP error! status: ${response.status}`);
               }

        toast({
            title: "Sukses!",
            description: `Data daftar ulang untuk ${values.pendaftarId} berhasil disimpan.`,
            variant: "default",
        });
 // New Try and call Fetch in correct time, and force by API not call direct value SetNum
  fetchNextNomorDU();

         form.reset({
                    ...form.getValues(), // Keep other potential defaults if needed
                    pendaftarId: '', // Clear selection
                    nomorDaftarUlang:nextNomorDU, //Force value num load from the variable API num in the correct time
  kelengkapanKK: false,
                    kelengkapanSKL: false,
                    kelengkapanPiagam: false,
                    kelengkapanSKTM: false,
                    bayarDaftarUlang: false,
                    biayaDaftarUlang: undefined, // Reset biaya
                    ukuranSeragam: undefined,
                    seragamOsis: false,
                    seragamPramuka: false,
                    seragamBatik: false,
                    seragamOlahraga: false,
                    tanggalDaftarUlang: new Date(),
                });

    } catch (error) {

   console.error("Submission error:", error);  // Show Submission Error With Call
        toast({
            title: "Gagal!",
            description: "Terjadi kesalahan saat menyimpan data daftar ulang.",
            variant: "destructive",
        });
    }
    // ---- of Call
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Input Daftar Ulang Peserta Didik</CardTitle>
          <CardDescription>Masukkan data kelengkapan dan pembayaran daftar ulang.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Pendaftar Searchable Combobox */}
              <FormField
                control={form.control}
                name="pendaftarId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Pendaftar</FormLabel>
                     <FormControl>
                        <Combobox
                            options={pendaftarOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Cari No. Pend / Nama / Sekolah..."
                            searchPlaceholder="Ketik untuk mencari..."
                            emptyPlaceholder="Pendaftar tidak ditemukan."
                            />
                     </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="nomorDaftarUlang"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nomor Daftar Ulang (Otomatis)</FormLabel>
                        <FormControl>
                            <Input {...field} readOnly disabled className="bg-muted/50" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="tanggalDaftarUlang"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tanggal Daftar Ulang (Otomatis)</FormLabel>
                        <FormControl>
                             <Input value={format(field.value, 'dd MMMM yyyy')} readOnly disabled className="bg-muted/50" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
              </div>

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
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">Piagam (Jika Ada)</FormLabel>
                        </div>
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
                         <div className="space-y-1 leading-none">
                           <FormLabel className="font-normal">SKTM / Rekom PRNU (Jika Ada)</FormLabel>
                         </div>
                      </FormItem>
                    )}
                  />
                </div>
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
                             // Convert the number value to string for Select comparison
                             value={field.value !== undefined ? String(field.value) : undefined}
                             // Convert the selected string back to number for the form state
                             onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                             disabled={!watchBayarDaftarUlang} // Disable if checkbox is not checked
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
                               {/* Optionally add an "Other" or custom input if needed */}
                               {/* <SelectItem value="custom">Lainnya...</SelectItem> */}
                             </SelectContent>
                           </Select>
                           {/* If 'custom' is selected, you might show an Input field */}
                           {/* {field.value === 'custom' && (
                             <Input type="number" placeholder="Masukkan jumlah custom" ... />
                           )} */}
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
                             {/* Using RadioGroup for single selection */}
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
                 </FormItem>
               </div>

              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Data Daftar Ulang'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}