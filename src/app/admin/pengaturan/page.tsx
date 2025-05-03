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
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Import next/image
import { cn } from '@/lib/utils'; // Import cn

// LocalStorage Key
const LETTERHEAD_STORAGE_KEY = 'customLetterheadUri';

// Validation Schema - Keep existing fields, add optional file field (validation happens in handler)
const pengaturanSchema = z.object({
  tahunPelajaran: z.string()
    .min(4, { message: 'Tahun Pelajaran minimal 4 karakter (contoh: 2526).' })
    .regex(/^\d{4}$/, { message: 'Format Tahun Pelajaran tidak valid (contoh: 2526).' }),
  gelombang: z.enum(['Gelombang 1', 'Gelombang 2'], { required_error: 'Gelombang pendaftaran harus dipilih.' }),
  // File input is handled outside Zod schema for simplicity in this mock
});

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true);
  const [letterheadPreview, setLetterheadPreview] = useState<string | null>(null); // For immediate preview
  const [currentLetterhead, setCurrentLetterhead] = useState<string | null>(null); // Stored letterhead
  const [newFileSelected, setNewFileSelected] = useState<File | null>(null); // Track selected file

  const form = useForm<z.infer<typeof pengaturanSchema>>({
    resolver: zodResolver(pengaturanSchema),
    defaultValues: {
      tahunPelajaran: '',
      gelombang: undefined,
    },
  });

  // Fetch current settings and letterhead on component mount (client-side)
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Mock fetched settings data
        const currentSettings = {
          tahunPelajaran: localStorage.getItem('pengaturanTahunPelajaran') || '2526',
          gelombang: (localStorage.getItem('pengaturanGelombang') as 'Gelombang 1' | 'Gelombang 2') || 'Gelombang 1',
        };
        form.reset(currentSettings);

        // Load letterhead from localStorage
        const storedLetterhead = localStorage.getItem(LETTERHEAD_STORAGE_KEY);
        if (storedLetterhead) {
          setCurrentLetterhead(storedLetterhead);
          setLetterheadPreview(storedLetterhead); // Show stored image initially
        } else {
          setCurrentLetterhead(null);
          setLetterheadPreview(null);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Gagal Memuat Pengaturan",
          description: "Tidak dapat mengambil data pengaturan saat ini.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (type and size)
      if (!file.type.startsWith('image/')) {
        toast({ title: "File Tidak Valid", description: "Harap pilih file gambar.", variant: "destructive" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit example
        toast({ title: "Ukuran File Terlalu Besar", description: "Ukuran gambar maksimal 2MB.", variant: "destructive" });
        return;
      }

      setNewFileSelected(file); // Store the file object
      const reader = new FileReader();
      reader.onloadend = () => {
        setLetterheadPreview(reader.result as string); // Update preview immediately
      };
      reader.onerror = () => {
        console.error("Error reading file");
        toast({ title: "Gagal Membaca File", description: "Tidak dapat memproses file yang dipilih.", variant: "destructive" });
        setLetterheadPreview(currentLetterhead); // Revert preview on error
        setNewFileSelected(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLetterhead = () => {
    setLetterheadPreview(null);
    setCurrentLetterhead(null);
    setNewFileSelected(null); // Clear selected file if any
    localStorage.removeItem(LETTERHEAD_STORAGE_KEY);
    toast({ title: "Sukses", description: "Kop sekolah kustom dihapus." });
     // Optionally trigger form save here if needed, or let user save manually
    // onSubmit(form.getValues()); // Example: Trigger save immediately
  };


  // Modified onSubmit to handle both settings and letterhead upload
  const onSubmit = useCallback(async (values: z.infer<typeof pengaturanSchema>) => {
    console.log('Pengaturan Submitted:', values);
    setLoading(true); // Show loading indicator

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));

      // Save basic settings (Mock: using localStorage)
      localStorage.setItem('pengaturanTahunPelajaran', values.tahunPelajaran);
      localStorage.setItem('pengaturanGelombang', values.gelombang);

      // Save new letterhead if a file was selected
      if (newFileSelected && letterheadPreview) {
         // In a real app, upload newFileSelected to server/storage first
         // Then store the URL or identifier returned from the server
         localStorage.setItem(LETTERHEAD_STORAGE_KEY, letterheadPreview);
         setCurrentLetterhead(letterheadPreview); // Update the 'current' state
         setNewFileSelected(null); // Reset file selection state
         console.log('New letterhead saved to localStorage.');
      } else if (!letterheadPreview && currentLetterhead) {
         // This case handles if remove was clicked but save wasn't immediate
         localStorage.removeItem(LETTERHEAD_STORAGE_KEY);
         setCurrentLetterhead(null);
         console.log('Existing letterhead removed from localStorage.');
      }

      toast({
        title: "Sukses!",
        description: "Pengaturan PPDB berhasil diperbarui.",
        variant: "default",
      });
      form.reset(values); // Keep saved values in form

    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Gagal!",
        description: "Terjadi kesalahan saat menyimpan pengaturan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Hide loading indicator
    }
  }, [form, letterheadPreview, currentLetterhead, newFileSelected]);

  return (
    <div className="space-y-6">
      <Card className="shadow-md max-w-3xl mx-auto"> {/* Increased max-width */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings /> Pengaturan PPDB
          </CardTitle>
          <CardDescription>Atur parameter penting dan tampilan kop surat untuk periode pendaftaran saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !form.formState.isDirty ? ( // Show loading only on initial load
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Memuat pengaturan...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> {/* Increased spacing */}
                {/* Existing Settings Fields */}
                <FormField
                  control={form.control}
                  name="tahunPelajaran"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Pelajaran Aktif</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 2526" {...field} />
                      </FormControl>
                      <FormDescription>
                        Masukkan 4 digit tahun pelajaran (misal: 2526 untuk 2025/2026).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gelombang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gelombang Pendaftaran Aktif</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Gelombang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gelombang 1">Gelombang 1</SelectItem>
                          <SelectItem value="Gelombang 2">Gelombang 2</SelectItem>
                        </SelectContent>
                      </Select>
                       <FormDescription>
                         Gelombang yang aktif saat ini.
                       </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Kop Sekolah Upload Section */}
                <FormItem>
                    <FormLabel htmlFor='kopSekolah'>Kop Surat Sekolah (Opsional)</FormLabel>
                    <FormDescription>
                        Upload gambar kop surat (JPG/PNG, maks 2MB) untuk digunakan pada cetak formulir dan bukti daftar ulang.
                    </FormDescription>
                    <div className="mt-2 flex flex-col md:flex-row items-center gap-4">
                         <FormControl className="flex-grow">
                            <label htmlFor="kopSekolah" className={cn(
                                "cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full md:w-auto" // Mimic outline button style
                            )}>
                                <Upload className="mr-2 h-4 w-4" />
                                <span>{newFileSelected ? `Ganti Gambar (${newFileSelected.name.substring(0,15)}...)` : 'Pilih Gambar Kop Surat'}</span>
                                <Input id="kopSekolah" type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="sr-only" />
                            </label>
                        </FormControl>
                         {letterheadPreview && (
                             <Button type="button" variant="destructive" size="sm" onClick={handleRemoveLetterhead} className="w-full md:w-auto">
                                 <Trash2 className="mr-2 h-4 w-4" /> Hapus Kop Kustom
                             </Button>
                         )}
                    </div>
                     <FormMessage /> {/* For potential file-related errors if added */}
                </FormItem>

                {/* Image Preview */}
                 <FormItem>
                     <FormLabel>Preview Kop Surat Saat Ini</FormLabel>
                     <div className="mt-2 p-4 border rounded-md bg-muted/30 min-h-[100px] flex items-center justify-center">
                         {letterheadPreview ? (
                             <Image
                                 src={letterheadPreview}
                                 alt="Preview Kop Surat"
                                 width={600} // Adjust width for better preview
                                 height={150} // Adjust height accordingly
                                 className="max-w-full h-auto object-contain rounded-md"
                             />
                         ) : (
                             <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                                 <ImageIcon className="w-10 h-10" />
                                 <span>Tidak ada kop surat kustom. Akan menggunakan default.</span>
                             </div>
                         )}
                     </div>
                 </FormItem>

                {/* Save Button */}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}