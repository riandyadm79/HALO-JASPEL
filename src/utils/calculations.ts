export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
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
