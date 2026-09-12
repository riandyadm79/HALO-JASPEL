// Data Resmi Model Distribusi Proporsi / Rupiah Jasa Pelayanan RSUD
// Berdasarkan Regulasi Pembagian Pagu 40% dari Pendapatan

export interface PeriodeRealisasiBulanan {
  bulan: string;
  singkatan: string;
  pendapatan: number;
  porsiJaspel: number; // 40% dari pendapatan
  persentasePorsi: number;
  status: 'Realisasi' | 'Proyeksi';
}

export interface KelompokBebanTetapItem {
  id: string;
  jabatan: string;
  persenDariKategori: number;
  alokasiRp: number;
  rataRataPerOrang: number;
  personel: number;
  keterangan?: string;
}

export interface KelompokDistribusiItem {
  id: string;
  namaKelompok: string;
  kategoriBesar: 'Beban Tetap' | 'Jasa Tidak Langsung' | 'Jasa Langsung';
  subKategori?: string;
  proporsiPersen: number; // Persentase terhadap pagu JP atau sub-pagu
  alokasiRp: number;
  rataRataPerOrang: number;
  personel: number;
  realisasi?: number;
  pagu?: number;
  selisih?: number;
  keterangan?: string;
}

export interface EvaluasiRealisasiPaguItem {
  kelompok: string;
  realisasi: number;
  pagu: number;
  selisih: number;
  keterangan?: string;
}

// 1. DATA MAKRO REGULASI RSUD
export const DATA_MAKRO_RSUD = {
  targetPendapatanTahunan: 22000000000, // Rp 22.000.000.000
  porsiJasaSaranaPersen: 60.0,          // 60,0%
  porsiJasaPelayananPersen: 40.0,       // 40,0%
  paguJasaPelayananTahunan: 8800000000, // Rp 8.800.000.000 (40% x 22M)
  targetPaguPerBulan: 733333333,        // Rp 733.333.333 / bulan
  
  // Realisasi Periode Sampel Berjalan (Bulan Juli pada dokumen resmi RSUD)
  periodeSampelBulan: 'Juli',
  realisasiPendapatanBulan: 2859709359, // Rp 2.859.709.359
  realisasiPaguJaspelBulan: 1143883744, // Rp 1.143.883.744 (40% x 2.859.709.359)
  totalRealisasiPendapatanSdJuli: 18931537926, // Rp 18.931.537.926
  totalRealisasiJaspelSdJuli: 7572615170.40    // Rp 7.572.615.170,40
};

// 2. DATA REALISASI BULANAN JANUARI - DESEMBER
export const REALISASI_BULANAN_RSUD: PeriodeRealisasiBulanan[] = [
  { bulan: 'Januari', singkatan: 'Jan', pendapatan: 2355921785, porsiJaspel: 942368714, persentasePorsi: 40.0, status: 'Realisasi' },
  { bulan: 'Februari', singkatan: 'Feb', pendapatan: 2655488982, porsiJaspel: 1062195593, persentasePorsi: 40.0, status: 'Realisasi' },
  { bulan: 'Maret', singkatan: 'Mar', pendapatan: 2790801464, porsiJaspel: 1116320586, persentasePorsi: 40.0, status: 'Realisasi' },
  { bulan: 'April', singkatan: 'Apr', pendapatan: 2558872026, porsiJaspel: 1023548810, persentasePorsi: 40.0, status: 'Realisasi' },
  { bulan: 'Mei', singkatan: 'May', pendapatan: 2982339196, porsiJaspel: 1192935678, persentasePorsi: 40.0, status: 'Realisasi' },
  { bulan: 'Juni', singkatan: 'Jun', pendapatan: 2728405114, porsiJaspel: 1091362046, persentasePorsi: 40.0, status: 'Realisasi' },
  { bulan: 'Juli', singkatan: 'Jul', pendapatan: 2859709359, porsiJaspel: 1143883744, persentasePorsi: 40.0, status: 'Realisasi' },
  { bulan: 'Agustus', singkatan: 'Aug', pendapatan: 2850000000, porsiJaspel: 1140000000, persentasePorsi: 40.0, status: 'Proyeksi' },
  { bulan: 'September', singkatan: 'Sep', pendapatan: 2800000000, porsiJaspel: 1120000000, persentasePorsi: 40.0, status: 'Proyeksi' },
  { bulan: 'Oktober', singkatan: 'Oct', pendapatan: 2850000000, porsiJaspel: 1140000000, persentasePorsi: 40.0, status: 'Proyeksi' },
  { bulan: 'November', singkatan: 'Nov', pendapatan: 2800000000, porsiJaspel: 1120000000, persentasePorsi: 40.0, status: 'Proyeksi' },
  { bulan: 'Desember', singkatan: 'Dec', pendapatan: 2900000000, porsiJaspel: 1160000000, persentasePorsi: 40.0, status: 'Proyeksi' }
];

// 3. BEBAN TETAP (Pusat Biaya / Cost Center)
export const RINCIAN_BEBAN_TETAP: KelompokBebanTetapItem[] = [
  { id: 'bt-1', jabatan: 'Tim Perumus Jaspel', persenDariKategori: 1.5, alokasiRp: 17158256, rataRataPerOrang: 1225590, personel: 14, keterangan: 'Beban Tetap Tim Perumus (1,5% Pagu JP)' },
  { id: 'bt-2', jabatan: 'Pengelola BLUD (Ketua)', persenDariKategori: 18.2, alokasiRp: 9476790, rataRataPerOrang: 9476790, personel: 1, keterangan: 'Penyesuaian Risiko & Beban Kerja (Porsi 18,2%)' },
  { id: 'bt-3', jabatan: 'Pengelola Keuangan BLUD', persenDariKategori: 15.7, alokasiRp: 8160000, rataRataPerOrang: 8160000, personel: 1, keterangan: 'Penyesuaian Risiko & Beban Kerja (Porsi 15,7%)' },
  { id: 'bt-4', jabatan: 'Pengelola Teknis BLUD I', persenDariKategori: 15.7, alokasiRp: 8160000, rataRataPerOrang: 8160000, personel: 1, keterangan: 'Penyesuaian Risiko & Beban Kerja (Porsi 15,7%)' },
  { id: 'bt-5', jabatan: 'Pengelola Teknis BLUD II', persenDariKategori: 15.7, alokasiRp: 8160000, rataRataPerOrang: 8160000, personel: 1, keterangan: 'Penyesuaian Risiko & Beban Kerja (Porsi 15,7%)' },
  { id: 'bt-6', jabatan: 'Dewan Pengawas (Ketua)', persenDariKategori: 6.4, alokasiRp: 3316877, rataRataPerOrang: 3316877, personel: 1, keterangan: 'Dewan Pengawas BLUD (Porsi 6,4%)' },
  { id: 'bt-7', jabatan: 'Dewan Pengawas (Anggota)', persenDariKategori: 7.3, alokasiRp: 3790716, rataRataPerOrang: 1895358, personel: 2, keterangan: 'Dewan Pengawas BLUD (Porsi 7,3%)' },
  { id: 'bt-8', jabatan: 'Dewan Pengawas (Sekretaris)', persenDariKategori: 1.8, alokasiRp: 947679, rataRataPerOrang: 947679, personel: 1, keterangan: 'Dewan Pengawas BLUD (Porsi 1,8%)' },
  { id: 'bt-9', jabatan: 'Penerima Delegasi KPA', persenDariKategori: 0.0, alokasiRp: 0, rataRataPerOrang: 0, personel: 2, keterangan: 'Delegasi KPA' },
  { id: 'bt-10', jabatan: 'Proporsi Keahlian dan Profesi MOU', persenDariKategori: 0.0, alokasiRp: 10000000, rataRataPerOrang: 10000000, personel: 1, keterangan: 'MOU Dokter Spesialis/Ahli Khusus' }
];

// 4. JASA TIDAK LANGSUNG (Cost Center / Beban Fluktuasi)
export const RINCIAN_JASA_TIDAK_LANGSUNG = [
  { id: 'jtl-dir', jabatan: 'Direktur', persen: 10.33, alokasiRp: 11875000, personel: 1, rataRata: 11875000, kelompok: 'Struktural' },
  { id: 'jtl-wadir', jabatan: 'Wakil Direktur (Wadir)', persen: 25.45, alokasiRp: 29250000, personel: 3, rataRata: 9750000, kelompok: 'Struktural' },
  { id: 'jtl-kabid', jabatan: 'Kabag / Kabid', persen: 46.29, alokasiRp: 53200000, personel: 8, rataRata: 6650000, kelompok: 'Struktural' },
  { id: 'jtl-jafung', jabatan: 'JAFUNG Disetarakan / Keahlian', persen: 1.74, alokasiRp: 2000000, personel: 1, rataRata: 2000000, kelompok: 'Struktural' },
  { id: 'jtl-ketua', jabatan: 'Ketua / Komite', persen: 3.62, alokasiRp: 4156250, personel: 1, rataRata: 4156250, kelompok: 'Struktural' },
  { id: 'jtl-anggota', jabatan: 'Anggota Komite', persen: 4.13, alokasiRp: 4750000, personel: 2, rataRata: 2375000, kelompok: 'Struktural' },
  { id: 'jtl-sekretaris', jabatan: 'Sekretaris Komite', persen: 1.03, alokasiRp: 1187500, personel: 1, rataRata: 1187500, kelompok: 'Struktural' },
  
  // Pos Non-Struktural Jasa Tidak Langsung
  { id: 'jtl-admin', jabatan: 'Administrasi & Staf Pendukung', persen: 16.30, alokasiRp: 70000000, personel: 514, rataRata: 136187, kelompok: 'Administrasi' },
  { id: 'jtl-postremun', jabatan: 'Post Remunerasi', persen: 59.30, alokasiRp: 254703346, personel: 424, rataRata: 600715, kelompok: 'Post Remunerasi' },
  { id: 'jtl-tugas', jabatan: 'Tugas Tambahan Kegiatan / Pokja', persen: 0.00, alokasiRp: 0, personel: 0, rataRata: 0, kelompok: 'Tugas Tambahan' }
];

// 5. JASA LANGSUNG (Revenue Center / Beban Fluktuasi)
export const RINCIAN_JASA_LANGSUNG = [
  // 5.1 Perawat
  { id: 'jl-prw', jabatan: 'Perawat & Bidan', kategori: 'Perawat', persenDariJL: 40.90, alokasiRp: 263880698, personel: 198, rataRata: 1332731 },
  
  // 5.2 Dokter / Medis
  { id: 'jl-dok-um', jabatan: 'Dokter Umum', kategori: 'Medis', subKategori: 'Umum', persenDariMedis: 27.60, alokasiRp: 76520425, personel: 17, rataRata: 4501201 },
  { id: 'jl-dok-psi', jabatan: 'Dokter Spesialis Psikiater', kategori: 'Medis', subKategori: 'Psikiater', persenDariMedis: 48.00, alokasiRp: 133166201, personel: 4, rataRata: 33291550 },
  { id: 'jl-dok-nonpsi', jabatan: 'Dokter Spesialis Non-Psikiatri Tetap', kategori: 'Medis', subKategori: 'Spesialis Non Psikiatri', persenDariMedis: 14.40, alokasiRp: 40000000, personel: 4, rataRata: 10000000 },
  
  // 5.3 Nakes Lainnya - Pelayanan dengan Tarif (86,0% dari Nakes Lain = Rp 89.332.326)
  { id: 'jl-far', jabatan: 'Farmasi', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan dengan Tarif', persenDariTarif: 39.00, alokasiRp: 34839607, personel: 20, rataRata: 1741980 },
  { id: 'jl-lab', jabatan: 'Analis Laboratorium', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan dengan Tarif', persenDariTarif: 18.00, alokasiRp: 16079819, personel: 11, rataRata: 1461802 },
  { id: 'jl-psi', jabatan: 'Psikolog Klinis', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan dengan Tarif', persenDariTarif: 7.50, alokasiRp: 6699924, personel: 2, rataRata: 3349962 },
  { id: 'jl-ot', jabatan: 'Okupasi Terapis & Terapi Wicara (OT/TW)', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan dengan Tarif', persenDariTarif: 15.00, alokasiRp: 13399849, personel: 6, rataRata: 2233308 },
  { id: 'jl-fis', jabatan: 'Fisioterapis', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan dengan Tarif', persenDariTarif: 7.50, alokasiRp: 6699924, personel: 4, rataRata: 1674981 },
  { id: 'jl-rad', jabatan: 'Radiografer / Radiolog', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan dengan Tarif', persenDariTarif: 7.50, alokasiRp: 6699924, personel: 3, rataRata: 2233308 },
  { id: 'jl-giz', jabatan: 'Nutrisionist / Gizi', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan dengan Tarif', persenDariTarif: 5.50, alokasiRp: 4913278, personel: 3, rataRata: 1637759 },

  // 5.4 Nakes Lainnya - Pelayanan Non Tarif (14,0% dari Nakes Lain = Rp 14.542.472)
  { id: 'jl-el', jabatan: 'Elektromedis', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan Non Tarif', persenDariNonTarif: 12.00, alokasiRp: 1745097, personel: 2, rataRata: 872548 },
  { id: 'jl-kes', jabatan: 'Kesehatan Lingkungan (Kesling)', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan Non Tarif', persenDariNonTarif: 30.00, alokasiRp: 4362742, personel: 5, rataRata: 872548 },
  { id: 'jl-rm', jabatan: 'Rekam Medik', kategori: 'Nakes Lainnya', subKategori: 'Pelayanan Non Tarif', persenDariNonTarif: 58.00, alokasiRp: 8434634, personel: 8, rataRata: 1054329 }
];

// 6. TABEL EVALUASI RESMI: REALISASI VS PAGU VS SELISIH (21 KELOMPOK)
export const EVALUASI_REALISASI_VS_PAGU_RSUD: EvaluasiRealisasiPaguItem[] = [
  { kelompok: 'Tim Perumus Jaspel', realisasi: 17158256.16, pagu: 17158256, selisih: 0, keterangan: 'Tepat sesuai Pagu 1,5%' },
  { kelompok: 'Proporsi Risiko, Kepatutan & Beban Kerja (BLUD/Dewas)', realisasi: 52012061.73, pagu: 52012062, selisih: 0, keterangan: 'Tepat sesuai Pagu 4,5%' },
  { kelompok: 'Tugas Tambahan dalam Kegiatan / Pokja', realisasi: 0.00, pagu: 0, selisih: 0, keterangan: 'Belum ada kegiatan' },
  { kelompok: 'Struktural', realisasi: 109843083.13, pagu: 114918750, selisih: 5075667, keterangan: 'Efisiensi anggaran (+)' },
  { kelompok: 'Administrasi', realisasi: 70568862.88, pagu: 70000000, selisih: -568863, keterangan: 'Penyesuaian kebutuhan (-)' },
  { kelompok: 'Post Remunerasi', realisasi: 255171208.69, pagu: 254703346, selisih: -467863, keterangan: 'Penyesuaian indeks kinerja (-)' },
  { kelompok: 'Perawat', realisasi: 250787800.07, pagu: 263880698, selisih: 13092898, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Dokter Umum (Medis)', realisasi: 70739062.82, pagu: 76520425, selisih: 5781363, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Dokter Spesialis Non Psikiatri', realisasi: 53001810.78, pagu: 40000000, selisih: -13001811, keterangan: 'Kebutuhan tindakan khusus (-)' },
  { kelompok: 'Psikiater', realisasi: 101247143.15, pagu: 133166201, selisih: 31919057, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Psikologi', realisasi: 4234165.37, pagu: 6699924, selisih: 2465759, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Fisioterapi', realisasi: 5360622.08, pagu: 6699924, selisih: 1339302, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Okupasi Terapis (OT)', realisasi: 5392894.43, pagu: 13399849, selisih: 5206779, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Terapi Wicara (TW)', realisasi: 2800175.71, pagu: 2800176, selisih: 0, keterangan: 'Sesuai alokasi' },
  { kelompok: 'Rekam Medik', realisasi: 8016134.64, pagu: 8434634, selisih: 418499, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Radiologi', realisasi: 972000.00, pagu: 6699924, selisih: 5727924, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Elektromedik', realisasi: 1658510.62, pagu: 1745097, selisih: 86586, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Laboratorium', realisasi: 15281990.67, pagu: 16079819, selisih: 797828, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Farmasi', realisasi: 33110979.78, pagu: 34839607, selisih: 1728627, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Gizi (Nutrisionist)', realisasi: 4669497.15, pagu: 4913278, selisih: 243781, keterangan: 'Efisiensi / Sisa Pagu (+)' },
  { kelompok: 'Kesehatan Lingkungan (Kesling)', realisasi: 4146276.54, pagu: 4362742, selisih: 216465, keterangan: 'Efisiensi / Sisa Pagu (+)' }
];
