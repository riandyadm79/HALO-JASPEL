export const formatRupiah = (amount: number): string => {
  const formattedNumber = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
  return `Rp. ${formattedNumber}`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num || 0);
};

export const formatPercentage = (rate: number): string => {
  return `${(rate || 0).toFixed(1)}%`;
};

export const formatDateIndo = (isoString?: string): string => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return isoString;
  }
};

export const formatDateTimeIndo = (isoString?: string): string => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return isoString;
  }
};

export interface JaspelPaguBreakdown {
  pendapatanKotor: number;
  proporsiPersen: number;
  paguKotor: number;
  biayaOperasional: number;
  paguNetto: number;
  jasaMedisKlinis: number;
  jasaNonKlinis: number;
  jasaManajemen: number;
}

export const calculatePaguJaspel = (
  pendapatanKotor: number,
  proporsiPersen: number,
  biayaOperasional: number,
  medisPersen: number = 60,
  nonKlinisPersen: number = 30,
  manajemenPersen: number = 10
): JaspelPaguBreakdown => {
  const paguKotor = Math.round(pendapatanKotor * (proporsiPersen / 100));
  // Pagu netto disesuaikan dengan biaya operasional/beban tetap proporsional jika ada
  const cadanganBeban = Math.min(biayaOperasional * 0.2, paguKotor * 0.1); 
  const paguNetto = Math.max(0, paguKotor - cadanganBeban);

  const jasaMedisKlinis = Math.round(paguNetto * (medisPersen / 100));
  const jasaNonKlinis = Math.round(paguNetto * (nonKlinisPersen / 100));
  const jasaManajemen = Math.round(paguNetto * (manajemenPersen / 100));

  return {
    pendapatanKotor,
    proporsiPersen,
    paguKotor,
    biayaOperasional,
    paguNetto,
    jasaMedisKlinis,
    jasaNonKlinis,
    jasaManajemen
  };
};

export const calculatePenerimaNetto = (
  totalPoin: number,
  nilaiPerPoin: number,
  pajakPph21Persen: number = 5
) => {
  const brutoJaspel = Math.round(totalPoin * nilaiPerPoin);
  const potonganPph21 = Math.round(brutoJaspel * (pajakPph21Persen / 100));
  const nettoDiterima = Math.max(0, brutoJaspel - potonganPph21);

  return {
    brutoJaspel,
    potonganPph21,
    nettoDiterima
  };
};

export const evaluateJpFormula = (
  item: {
    kinerja1: number;
    kinerja2: number;
    kinerja3: number;
    totalPoin: number;
    jumlahAlokasi: number;
    rupiahPerPoin1: number;
    rupiahPerPoin2: number;
  },
  formulaStr: string
): number => {
  if (!formulaStr || !formulaStr.trim()) return 0;
  
  try {
    // Replace column names with numeric values
    let expr = formulaStr
      .replace(/\bkinerja1\b/gi, String(item.kinerja1 || 0))
      .replace(/\bkinerja2\b/gi, String(item.kinerja2 || 0))
      .replace(/\bkinerja3\b/gi, String(item.kinerja3 || 0))
      .replace(/\btotalPoin\b/gi, String(item.totalPoin || 0))
      .replace(/\bjumlahAlokasi\b/gi, String(item.jumlahAlokasi || 0))
      .replace(/\brupiahPerPoin1\b/gi, String(item.rupiahPerPoin1 || 0))
      .replace(/\brupiahPerPoin2\b/gi, String(item.rupiahPerPoin2 || 0))
      .replace(/\bK1\b/gi, String(item.kinerja1 || 0))
      .replace(/\bK2\b/gi, String(item.kinerja2 || 0))
      .replace(/\bK3\b/gi, String(item.kinerja3 || 0))
      .replace(/\bTP\b/gi, String(item.totalPoin || 0))
      .replace(/\bJA\b/gi, String(item.jumlahAlokasi || 0))
      .replace(/\bRP1\b/gi, String(item.rupiahPerPoin1 || 0))
      .replace(/\bRP2\b/gi, String(item.rupiahPerPoin2 || 0));

    // Sanitize: allow numbers, spaces, +, -, *, /, %, (, ), .
    if (/[^0-9\s\+\-\*\/\%\(\)\.]/.test(expr)) {
      return 0;
    }

    // Safely evaluate math expression
    const result = new Function(`"use strict"; return (${expr})`)();
    return typeof result === 'number' && !isNaN(result) && isFinite(result) ? Math.round(result) : 0;
  } catch (err) {
    return 0;
  }
};
