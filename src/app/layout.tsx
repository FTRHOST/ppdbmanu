import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean default, Geist is also good
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'MANSABA PPDB', // Updated title
  description: 'Pendaftaran Peserta Didik Baru MA NU 01 Banyuputih Tahun 2025/2026', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set language to Indonesian
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
