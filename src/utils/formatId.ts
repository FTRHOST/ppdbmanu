// src/utils/idFormatter.ts
export function formatPendaftaranId(id: number): string {
    const idString = String(id).padStart(4, '0'); // Pad dengan angka 0 hingga 4 digit
    return `MANU${idString}`;
  }