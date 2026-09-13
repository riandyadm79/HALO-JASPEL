export type RoleType = 
  | 'superadmin' 
  | 'perumus' 
  | 'pic' 
  | 'staf'
  | 'input_perawat'
  | 'input_medis'
  | 'input_nakes_lain'
  | 'input_psikiatri'
  | 'input_cuti'
  | 'input_ketenagaan'
  | 'input_spesialis';

export interface User {
  id: string;
  username: string;
  nama: string;
  nip: string;
  role: RoleType;
  unit: string;
  jabatan: string;
  email: string;
  status: 'aktif' | 'nonaktif';
  avatarUrl?: string;
  rekening?: string;
  bank?: string;
  npwp?: string;
}

export interface Permission {
  id: string;
  name: string;
  category: 'Alokasi Jaspel' | 'Database Manajer' | 'Formula & Kebijakan' | 'User & RBAC' | 'Supabase & Storage' | 'Ekspor & Laporan' | 'Akses & Cetak Tabel Instalasi/Layanan';
  superadmin: boolean;
  perumus: boolean;
  pic: boolean;
  staf: boolean;
  input_perawat?: boolean;
  input_medis?: boolean;
  input_nakes_lain?: boolean;
  input_psikiatri?: boolean;
  input_cuti?: boolean;
  input_ketenagaan?: boolean;
  input_spesialis?: boolean;
  roles?: Partial<Record<RoleType, boolean>>;
  description: string;
}

// Alokasi Jasa Pelayanan
export interface AlokasiJaspel {
  id: string;
  kodePeriode: string; // e.g. "JAPEL-2026-08"
  bulan: string; // e.g. "Agustus"
  tahun: number; // e.g. 2026
  sumberDana: 'BPJS / JKN' | 'Pasien Umum' | 'Klaim Asuransi' | 'Non-Kapitasi' | 'Tindakan VIP' | 'Gabungan Seluruh Layanan';
  pendapatanKotor: number;
  biayaOperasionalRs: number; // Beban Tetap / Cost Center
  proporsiJaspelPersen: number; // e.g. 42%
  paguJaspelKotor: number; // Calculated: pendapatanKotor * (proporsi/100)
  paguJaspelNetto: number; // paguJaspelKotor - beban khusus
  jasaMedisKlinisPersen: number; // e.g. 60%
  jasaNonKlinisPersen: number; // e.g. 30%
  jasaManajemenPersen: number; // e.g. 10%
  status: 'Draft' | 'Verifikasi PIC' | 'Review Perumus' | 'Disetujui Direktur' | 'Terbayar / Final';
  tanggalDibuat: string;
  tanggalUpdate: string;
  keterangan: string;
  createdBy: string;
}

export type InstalasiLayananType =
  | 'Alokasi Dana'
  | 'Indeks Pegawai'
  | 'Post Remunerasi'
  | 'Beban Tetap'
  | 'Pengelola BLUD'
  | 'Dewan Pengawas'
  | 'Tugas Tambahan'
  | 'Struktural'
  | 'Administrasi'
  | 'Psikiatri'
  | 'Spesialis'
  | 'Dokter Umum'
  | 'Perawat'
  | 'Gizi'
  | 'OT/TW'
  | 'Psikolog'
  | 'Fisioterapi'
  | 'Radiologi'
  | 'Laboratorium'
  | 'Farmasi'
  | 'Elektromedik'
  | 'Rekam Medik'
  | 'Kesling';

// Rincian Penerima Alokasi (Staf/Penerima Breakdown)
export interface PenerimaAlokasi {
  id: string;
  alokasiId: string;
  pegawaiId: string;
  nama: string;
  unitKerja: string;
  jabatan: string;
  kategori: string;
  poinDasar: number;
  poinKompetensi: number;
  poinRisiko: number;
  poinKinerja: number;
  totalPoin: number;
  nilaiPerPoin: number;
  brutoJaspel: number;
  pajakPph21Persen: number;
  potonganPph21: number;
  nettoDiterima: number;
  statusKoreksi: 'Sesuai' | 'Usulan Koreksi' | 'Disetujui Koreksi';
  catatanKoreksi?: string;
  sudahDibayar: boolean;

  // Extended Post Remunerasi & Administrasi Fields
  jaspelPostRemunerasi?: number;
  postPenyesuaianBebanKerja?: number;
  jaspelPostTotal?: number;
  
  // New Hierarchical Fields
  nominalBebanTetap?: number;
  nominalPostRemunerasi?: number;
  nominalAdministrasi?: number;
  nominalJasaLangsung?: number;
  potonganCuti?: number;
  nominalKoreksi?: number;

  persenAdministrasi?: string;
  kelompokJasa?: string;
  kelompokRekap?: string;
  kelompokPelayanan?: string;
  nip?: string;
  golongan?: string;
}

// Database Manajer: General Index
export interface GeneralIndexItem {
  id: string;
  kode: string;
  namaPegawai: string;
  nip: string;
  unitKerja: string;
  golongan: string;
  pendidikan: string;
  masaKerjaTahun: number;
  skorDasar: number;
  skorKompetensi: number;
  skorRisiko: number;
  skorKinerja: number;
  bobotPresensi: number; // 0 - 100%
  statusPegawai: string;

  // Extended RSUD Remunerasi Official Spreadsheet Fields
  no?: number;
  jabatan?: string;
  tmtTanggal?: string;
  ruangan?: string;
  kelompokJasa?: string;
  riskCategory?: string;
  jabatanUnit?: string;
  skorMk?: number;
  skorPd?: number;
  skorJab?: number;
  skorRis?: number;
  skorEmg?: number;
  skorTotal?: number;
  rpMk?: number;
  rpPd?: number;
  rpJab?: number;
  rpRis?: number;
  rpEmg?: number;
  jaspelPostRemunerasi?: number;
  postPenyesuaianBebanKerja?: number;
  jaspelPostTotal?: number;
  kelompokRekap?: string;
  kelompokPelayanan?: string;
  persenAdministrasi?: string;
}

// Database Manajer: Cost Center (Pusat Biaya / Beban)
export interface CostCenterItem {
  id: string;
  kodeCostCenter: string;
  namaPusatBiaya: string;
  kategori: 'Beban Tetap BLUD' | 'Operasional Penunjang' | 'Administrasi & Tata Usaha' | 'IT & SIMRS' | 'Sanitasi & Kesling' | 'Pemeliharaan Sarpras';
  alokasiAnggaranBulanan: number;
  realisasiBiaya: number;
  penanggungJawab: string;
  status: 'Aktif' | 'Monitoring' | 'Kritis';
  keterangan: string;
}

// Database Manajer: Revenue Center (Pusat Pendapatan)
export interface RevenueCenterItem {
  id: string;
  kodeRevenueCenter: string;
  namaPusatLayanan: string;
  kategoriLayanan: 'Instalasi Gawat Darurat (IGD)' | 'Rawat Inap' | 'Rawat Jalan / Poliklinik' | 'Bedah Sentral (IBS)' | 'Laboratorium PK & PA' | 'Radiologi & Imaging' | 'Farmasi Klinis' | 'Rehabilitasi Medik';
  targetPendapatanBulanan: number;
  realisasiPendapatan: number;
  persentasePencapaian: number;
  proporsiRetensiJaspel: number; // % jaspel langsung unit
  kepalaUnit: string;
  jumlahPasienBulanIni: number;
}

// Database Manajer: Indeks Jasa Langsung (Sesuai Jumlah Instalasi dan Layanan)
export interface IndeksJasaLangsungItem {
  id: string;
  kode?: string;
  instalasiLayanan: string;
  namaPegawai?: string;
  kategori?: string;
  kinerja1: number;
  kinerja2: number;
  kinerja3: number;
  totalPoin: number;
  jumlahAlokasi: number;
  rupiahPerPoin1: number;
  rupiahPerPoin2: number;
  nilaiJpLangsung: number;
}

// Rekapitulasi Poin Kinerja Pelayanan: Instalasi / Layanan (Macro Level)
export interface UnitKinerjaLayanan {
  id: string;
  kodeUnit: string; // e.g. "GIZI", "FARMASI", "LABORATORIUM"
  namaUnit: string; // e.g. "Gizi", "Farmasi", "Laboratorium"
  kategori: string; // "Nakes Ber-Tarif" | "Nakes Non-Tarif"
  bulan: string; // e.g. "Agustus"
  tahun: number; // e.g. 2026
  indikator1: string; // e.g. "Jumlah Diet Pasien", "Pengelolaan Perbekalan Farmasi"
  volumeTotal1: number;
  indikator2: string; // e.g. "Asuhan Gizi", "Telaah / Verifikasi"
  volumeTotal2: number;
  indikator3: string; // e.g. "Pengawasan Mutu Makanan", "KIE"
  volumeTotal3: number;
  paguJp: number;
  totalPoin: number;
  rupiahPerPoin: number;
  realisasiJp: number;
  jumlahPegawai: number;
  subPorsiPagu?: {
    apotekerPorsiPersen?: number;
    apotekerPagu?: number;
    asistenApotekerPorsiPersen?: number;
    asistenApotekerPagu?: number;
  };
  status: 'Draft' | 'Verifikasi' | 'Final';
}

// Rekapitulasi Poin Kinerja Pelayanan: Pegawai per Instalasi / Layanan (Micro Level)
export interface PegawaiKinerjaLayanan {
  id: string;
  unitKode: string; // matches UnitKinerjaLayanan.kodeUnit
  unitNama: string;
  nama: string;
  nip?: string;
  subKategori?: string; // e.g. "Apoteker", "Asisten Apoteker", "Okupasi Terapi", "Terapi Wicara"
  prestasi1: number;
  totalBulan1: number;
  poin1: number;
  prestasi2: number;
  totalBulan2: number;
  poin2: number;
  prestasi3: number;
  totalBulan3: number;
  poin3: number;
  jumlahPoin: number; // e.g. 1.03
  persenPoin: number; // e.g. 34%
  jpLangsung: number; // e.g. 1595921.34
  keterangan?: string;
}

export interface IndeksJasaHeaderConfig {
  headerKinerja1: string;
  headerKinerja2: string;
  headerKinerja3: string;
  headerTotalPoin: string;
  headerJumlahAlokasi: string;
  headerRupiahPerPoin1: string;
  headerRupiahPerPoin2: string;
  headerNilaiJpLangsung: string;
  formulaJpLangsung: string;
}

// Supabase Storage Bucket Item
export interface BucketStorageFile {
  id: string;
  bucketName: 'dokumen-jaspel' | 'slip-gaji-pdf' | 'sk-direktur' | 'bukti-spj';
  fileName: string;
  fileSize: number; // bytes
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  description: string;
  url?: string;
  public: boolean;
}

// Supabase Configuration
export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey?: string;
  databaseUrl?: string;
  rlsEnabled: boolean;
  autoSync: boolean;
  lastPushDate?: string;
  lastPullDate?: string;
  connected: boolean;
}

export interface HospitalProfile {
  hospitalName: string;
  subtitle: string;
  hospitalType: string;
  badgeText: string;
  badgeColor: string;
  pemdaName: string;
  address: string;
  city: string;
  phone: string;
  directorName: string;
  directorNip: string;
  directorTitle: string;
  committeeLeadName: string;
  committeeLeadNip: string;
  committeeLeadTitle: string;
}

export const DEFAULT_HOSPITAL_PROFILE: HospitalProfile = {
  hospitalName: "RSJD ATMA HUSADA MAHAKAM",
  subtitle: "Sistem Jaspel & Remunerasi 2026",
  hospitalType: "RUMAH SAKIT JIWA DAERAH",
  badgeText: "PROVINSI KALIMANTAN TIMUR",
  badgeColor: "amber",
  pemdaName: "PEMERINTAH PROVINSI KALIMANTAN TIMUR",
  address: "Jl. Kakap No. 23",
  city: "Samarinda",
  phone: "(0541) 743364",
  directorName: "dr. H. Jaya Mualimin, Sp.KJ, M.Kes, MARS",
  directorNip: "19720515 200212 1 004",
  directorTitle: "Direktur",
  committeeLeadName: "Ketua Tim Remunerasi",
  committeeLeadNip: "-",
  committeeLeadTitle: "Ketua Komite",
};

export type ThemeMode = 'light' | 'dark';

