export type RoleType = 'superadmin' | 'perumus' | 'pic' | 'staf';

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
  category: 'Alokasi Jaspel' | 'Database Manajer' | 'Formula & Kebijakan' | 'User & RBAC' | 'Supabase & Storage' | 'Ekspor & Laporan';
  superadmin: boolean;
  perumus: boolean;
  pic: boolean;
  staf: boolean;
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
}

// Database Manajer: General Index
export interface GeneralIndexItem {
  id: string;
  kode: string;
  namaPegawai: string;
  nip: string;
  unitKerja: string;
  golongan: string;
  pendidikan: 'D3' | 'D4 / S1' | 'Profesi / Sp-1' | 'Sp-2 / S3' | 'SMA / Sederajat';
  masaKerjaTahun: number;
  skorDasar: number;
  skorKompetensi: number;
  skorRisiko: number;
  skorKinerja: number;
  bobotPresensi: number; // 0 - 100%
  statusPegawai: 'PNS' | 'PPPK' | 'Non-ASN Kontrak' | 'Dokter Mitra';
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

export type ThemeMode = 'light' | 'dark';

