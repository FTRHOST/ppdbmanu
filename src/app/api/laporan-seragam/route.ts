// src/app/api/laporan-seragam/route.ts
import { NextResponse } from 'next/server';
import db from '../../../config/enterprise';
import mysql from 'mysql2/promise';

// Updated interfaces to reflect more accurate data structures
interface RawSeragamReportItem {
    ukuranSeragam: string;
    jenisKelamin: 'Laki-laki' | 'Perempuan';
    seragamOsis: boolean;
    seragamPramuka: boolean;
    seragamBatik: boolean;
    seragamOlahraga: boolean;
}

interface DatabaseSummaryStats {
    totalPendaftar: number;
    totalDaftarUlang: number;
}

export async function GET(req: Request) {
    let connection;
    try {
        connection = await db.getConnection();
        try {
            // Fetch raw data for uniform report items
            const [rawData] = await connection.query<mysql.RowDataPacket[]>(
                `SELECT 
                    du.ukuranSeragam,
                    p.jenisKelamin,
                    du.seragamOsis,
                    du.seragamPramuka,
                    du.seragamBatik,
                    du.seragamOlahraga
                FROM daftar_ulang du
                INNER JOIN pendaftaran p ON du.id = p.id`
            );

            // Fetch summary stats - total pendaftar and total daftar ulang
            const [summaryRows] = await connection.query<mysql.RowDataPacket[]>(
                `SELECT 
                    COUNT(DISTINCT p.id) AS totalPendaftar,
                    COUNT(DISTINCT du.pendaftarId) AS totalDaftarUlang
                 FROM pendaftaran p
                 LEFT JOIN daftar_ulang du ON p.id = du.id`
            );
            const rawDataItems = rawData as RawSeragamReportItem[];  // TS Assert Raw
            // Process Seragam Data from MySQL Results
            const reportMap: { [key: string]: any } = {};
            const ukuranOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Custom'];

            // Initialize the map with sizes and genders, ensure all combinations exist.
            ukuranOrder.forEach(ukuran => {
                ['Laki-laki', 'Perempuan'].forEach(jk => {
                    const key = `${ukuran}-${jk}`;
                    reportMap[key] = {
                        ukuran: ukuran,
                        jenisKelamin: jk,
                        osis: 0,
                        pramuka: 0,
                        batik: 0,
                        olahraga: 0,
                    };
                });
            });

            // Assign Values by Data
            rawDataItems.forEach(item => { // RawDataItems Type by Assertion
                const key = `${item.ukuranSeragam}-${item.jenisKelamin}`;
                if (reportMap[key]) {
                    if (item.seragamOsis) reportMap[key].osis++;
                    if (item.seragamPramuka) reportMap[key].pramuka++;
                    if (item.seragamBatik) reportMap[key].batik++;
                    if (item.seragamOlahraga) reportMap[key].olahraga++;
                }
            });
            //Total Count by data
            ukuranOrder.forEach(ukuran => {
                const totalKey = `${ukuran}-Total`;
                const lakiKey = `${ukuran}-Laki-laki`;
                const perempuanKey = `${ukuran}-Perempuan`;

                reportMap[totalKey] = {
                    ukuran: ukuran,
                    jenisKelamin: 'Total',
                    osis: (reportMap[lakiKey]?.osis || 0) + (reportMap[perempuanKey]?.osis || 0),
                    pramuka: (reportMap[lakiKey]?.pramuka || 0) + (reportMap[perempuanKey]?.pramuka || 0),
                    batik: (reportMap[lakiKey]?.batik || 0) + (reportMap[perempuanKey]?.batik || 0),
                    olahraga: (reportMap[lakiKey]?.olahraga || 0) + (reportMap[perempuanKey]?.olahraga || 0),
                };
            });

            // 6. Sort data with the same filter criteria
            const processedData = Object.values(reportMap).sort((a: any, b: any) => {
                const indexA = ukuranOrder.indexOf(a.ukuran);
                const indexB = ukuranOrder.indexOf(b.ukuran);

                if (indexA !== indexB) {
                    return indexA - indexB; // Sort by size order
                }
                const jkOrder = ['Laki-laki', 'Perempuan', 'Total'];  //Check Enum
                return jkOrder.indexOf(a.jenisKelamin) - jkOrder.indexOf(b.jenisKelamin);

            });

            // Structure the summary response and assert type and call data
            const summaryStats = summaryRows[0] as DatabaseSummaryStats;
            const summary = {
                totalPendaftar: summaryStats?.totalPendaftar || 0,
                totalDaftarUlang: summaryRows[0]?.totalDaftarUlang || 0,
                totalLakiLakiDU: 0, // TODO Calculate correct values
                totalPerempuanDU: 0, // TODO Calculate correct values
            };

           // Calculate total daftar ulang by gender with loop
            rawDataItems.forEach(item => {
               if (item.jenisKelamin === 'Laki-laki') {
                 summary.totalLakiLakiDU++;
                } else if (item.jenisKelamin === 'Perempuan') {
                  summary.totalPerempuanDU++;
               }
           });

            const responseData = {
                reportData: processedData,
                summaryStats: summary, // Use new structure values here
            };
            return NextResponse.json(responseData);

        } finally {
            if (connection) connection.release();
        }
    } catch (error) {
        console.error('Gagal mengambil data laporan seragam:', error);
        return NextResponse.json({ message: 'Gagal mengambil data laporan seragam', error: error }, { status: 500 });
    }
}