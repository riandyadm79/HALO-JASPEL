import { SupabaseConfig } from '../types';

declare global {
  interface Window {
    __HALO_JAPEL_ENV__?: {
      APP_NAME?: string;
      APP_VERSION?: string;
      APP_INSTANSI?: string;
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
      SUPABASE_STORAGE_BUCKETS?: string[];
      ENABLE_RLS?: boolean;
      SYNC_MODE?: string;
    };
  }
}

export const getInitialSupabaseConfig = (): SupabaseConfig => {
  const saved = localStorage.getItem('halo_japel_supabase_cfg');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  const env = window.__HALO_JAPEL_ENV__ || {};
  return {
    supabaseUrl: env.SUPABASE_URL || 'https://zpdnjvusmjrqxzgughbi.supabase.co',
    supabaseAnonKey: env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZG5qdnVzbWpycXh6Z3VnaGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjc5NzUsImV4cCI6MjEwNDYwMzk3NX0.M7v4coByObXDSIvk7NeAPAy-3AIOyJnrD7Rki2s8Wes',
    serviceRoleKey: '',
    databaseUrl: 'postgresql://postgres:postgres_password@db.xvyz-halojapel.supabase.co:5432/postgres',
    rlsEnabled: env.ENABLE_RLS !== undefined ? env.ENABLE_RLS : true,
    autoSync: true,
    connected: true,
    lastPushDate: new Date(Date.now() - 3600000).toISOString(),
    lastPullDate: new Date(Date.now() - 1800000).toISOString(),
  };
};

export const INITIAL_SUPABASE_CONFIG: SupabaseConfig = getInitialSupabaseConfig();

export const BUCKET_DEFINITIONS = [
  {
    name: 'dokumen-jaspel',
    label: 'Dokumen Regulasi & Jaspel',
    description: 'SOP, Peraturan Direktur, SK Tarif, dan Panduan Remunerasi',
    icon: 'FileText',
    color: 'maroon'
  },
  {
    name: 'slip-gaji-pdf',
    label: 'Slip Remunerasi PDF',
    description: 'Arsip Slip Jasa Pelayanan per Pegawai per Periode',
    icon: 'Receipt',
    color: 'amber'
  },
  {
    name: 'sk-direktur',
    label: 'SK Penetapan Direktur',
    description: 'Surat Keputusan Pagu & Proporsi Jaspel Resmi Ditandatangani',
    icon: 'Award',
    color: 'navy'
  },
  {
    name: 'bukti-spj',
    label: 'Bukti SPJ & Transfer Bank',
    description: 'Tanda Terima, Rekap Transfer Payroll Bank, & Kwitansi Pajak',
    icon: 'ShieldCheck',
    color: 'emerald'
  }
];

// SQL Generator untuk Supabase DDL Schema & RLS (Row Level Security)
export const generateSupabaseRlsScript = (rlsEnabled: boolean = true): string => {
  return `-- ========================================================
-- HALO JASPEL (SISTEM ALOKASI JASA PELAYANAN RS & BLUD)
-- SKRIP LENGKAP: DDL 7 TABEL, INDEX, GRANT & ROW LEVEL SECURITY (RLS)
-- ========================================================
-- Jalankan skrip ini 1x di Supabase SQL Editor untuk mengaktifkan
-- seluruh 7 tabel beserta izin akses PUSH/PULL & RLS.

-- ========================================================
-- BAGIAN 1: STRUKTUR 7 TABEL UTAMA (CREATE & ALTER SCHEMA)
-- ========================================================

-- 1.1 Tabel Alokasi Jaspel (Header Periode Remunerasi)
CREATE TABLE IF NOT EXISTS public.alokasi_jaspel (
  id VARCHAR(100) PRIMARY KEY,
  kode_periode VARCHAR(50) NOT NULL,
  bulan VARCHAR(30) NOT NULL,
  tahun INTEGER NOT NULL,
  sumber_dana VARCHAR(100) NOT NULL,
  pendapatan_kotor NUMERIC(18, 2) NOT NULL DEFAULT 0,
  biaya_operasional_rs NUMERIC(18, 2) NOT NULL DEFAULT 0,
  proporsi_jaspel_persen NUMERIC(5, 2) NOT NULL DEFAULT 42,
  pagu_jaspel_kotor NUMERIC(18, 2) NOT NULL DEFAULT 0,
  pagu_jaspel_netto NUMERIC(18, 2) NOT NULL DEFAULT 0,
  jasa_medis_klinis_persen NUMERIC(5, 2) NOT NULL DEFAULT 60,
  jasa_non_klinis_persen NUMERIC(5, 2) NOT NULL DEFAULT 30,
  jasa_manajemen_persen NUMERIC(5, 2) NOT NULL DEFAULT 10,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  tanggal_dibuat TIMESTAMPTZ DEFAULT NOW(),
  tanggal_update TIMESTAMPTZ DEFAULT NOW(),
  keterangan TEXT,
  created_by VARCHAR(100)
);

-- Pastikan kolom tabel alokasi_jaspel lengkap
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS pendapatan_kotor NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS biaya_operasional_rs NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS proporsi_jaspel_persen NUMERIC(5, 2) DEFAULT 42;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS pagu_jaspel_kotor NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS pagu_jaspel_netto NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS jasa_medis_klinis_persen NUMERIC(5, 2) DEFAULT 60;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS jasa_non_klinis_persen NUMERIC(5, 2) DEFAULT 30;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS jasa_manajemen_persen NUMERIC(5, 2) DEFAULT 10;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft';
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS keterangan TEXT;
ALTER TABLE public.alokasi_jaspel ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);

-- 1.2 Tabel Cost Center (Pusat Beban & Biaya Operasional RS)
CREATE TABLE IF NOT EXISTS public.cost_center (
  id VARCHAR(100) PRIMARY KEY,
  kode_cost_center VARCHAR(50) NOT NULL,
  nama_pusat_biaya VARCHAR(150) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  alokasi_anggaran_bulanan NUMERIC(18, 2) DEFAULT 0,
  realisasi_biaya NUMERIC(18, 2) DEFAULT 0,
  penanggung_jawab VARCHAR(150),
  status VARCHAR(50) DEFAULT 'Aktif',
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom tabel cost_center lengkap
ALTER TABLE public.cost_center ADD COLUMN IF NOT EXISTS alokasi_anggaran_bulanan NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.cost_center ADD COLUMN IF NOT EXISTS realisasi_biaya NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.cost_center ADD COLUMN IF NOT EXISTS penanggung_jawab VARCHAR(150);
ALTER TABLE public.cost_center ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Aktif';
ALTER TABLE public.cost_center ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- 1.3 Tabel General Index Pegawai (Master Skor Bobot Kredensial & Presensi)
CREATE TABLE IF NOT EXISTS public.general_index (
  id VARCHAR(100) PRIMARY KEY,
  kode VARCHAR(50) NOT NULL,
  nama_pegawai VARCHAR(150) NOT NULL,
  nip VARCHAR(50) NOT NULL,
  unit_kerja VARCHAR(100) NOT NULL,
  golongan VARCHAR(20),
  pendidikan VARCHAR(50),
  masa_kerja_tahun INTEGER DEFAULT 0,
  skor_dasar NUMERIC(10, 2) DEFAULT 0,
  skor_kompetensi NUMERIC(10, 2) DEFAULT 0,
  skor_risiko NUMERIC(10, 2) DEFAULT 0,
  skor_kinerja NUMERIC(10, 2) DEFAULT 0,
  bobot_presensi NUMERIC(5, 2) DEFAULT 100,
  status_pegawai VARCHAR(50) DEFAULT 'PNS',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom tabel general_index lengkap
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS golongan VARCHAR(20);
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS pendidikan VARCHAR(50);
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS masa_kerja_tahun INTEGER DEFAULT 0;
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS skor_dasar NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS skor_kompetensi NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS skor_risiko NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS skor_kinerja NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS bobot_presensi NUMERIC(5, 2) DEFAULT 100;
ALTER TABLE public.general_index ADD COLUMN IF NOT EXISTS status_pegawai VARCHAR(50) DEFAULT 'PNS';

-- 1.4 Tabel Profil & Konfigurasi Identitas Instansi BLUD / RSUD
CREATE TABLE IF NOT EXISTS public.hospital_profile (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  hospital_name VARCHAR(200) NOT NULL,
  subtitle VARCHAR(200),
  hospital_type VARCHAR(100),
  badge_text VARCHAR(100),
  badge_color VARCHAR(50) DEFAULT 'amber',
  pemda_name VARCHAR(200),
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(50),
  director_name VARCHAR(150),
  director_nip VARCHAR(50),
  director_title VARCHAR(150),
  committee_lead_name VARCHAR(150),
  committee_lead_nip VARCHAR(50),
  committee_lead_title VARCHAR(150),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom tabel hospital_profile lengkap
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(200);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS subtitle VARCHAR(200);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS hospital_type VARCHAR(100);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS badge_text VARCHAR(100);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS badge_color VARCHAR(50) DEFAULT 'amber';
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS pemda_name VARCHAR(200);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS director_name VARCHAR(150);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS director_nip VARCHAR(50);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS director_title VARCHAR(150);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS committee_lead_name VARCHAR(150);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS committee_lead_nip VARCHAR(50);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS committee_lead_title VARCHAR(150);
ALTER TABLE public.hospital_profile ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 1.5 Tabel Rincian Penerima Alokasi (Breakdown Staf per Periode)
CREATE TABLE IF NOT EXISTS public.penerima_alokasi (
  id VARCHAR(100) PRIMARY KEY,
  alokasi_id VARCHAR(100) NOT NULL,
  pegawai_id VARCHAR(100) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  unit_kerja VARCHAR(100) NOT NULL,
  jabatan VARCHAR(100),
  kategori VARCHAR(100),
  poin_dasar NUMERIC(10, 2) DEFAULT 0,
  poin_kompetensi NUMERIC(10, 2) DEFAULT 0,
  poin_risiko NUMERIC(10, 2) DEFAULT 0,
  poin_kinerja NUMERIC(10, 2) DEFAULT 0,
  total_poin NUMERIC(10, 2) DEFAULT 0,
  nilai_per_poin NUMERIC(18, 2) DEFAULT 0,
  bruto_jaspel NUMERIC(18, 2) DEFAULT 0,
  pajak_pph21_persen NUMERIC(5, 2) DEFAULT 0,
  potongan_pph21 NUMERIC(18, 2) DEFAULT 0,
  netto_diterima NUMERIC(18, 2) DEFAULT 0,
  status_koreksi VARCHAR(50) DEFAULT 'Sesuai',
  catatan_koreksi TEXT,
  sudah_dibayar BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom tabel penerima_alokasi lengkap
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS alokasi_id VARCHAR(100);
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS pegawai_id VARCHAR(100);
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS nama VARCHAR(150);
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS unit_kerja VARCHAR(100);
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS jabatan VARCHAR(100);
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS kategori VARCHAR(100);
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS poin_dasar NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS poin_kompetensi NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS poin_risiko NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS poin_kinerja NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS total_poin NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS nilai_per_poin NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS bruto_jaspel NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS pajak_pph21_persen NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS potongan_pph21 NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS netto_diterima NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS status_koreksi VARCHAR(50) DEFAULT 'Sesuai';
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS catatan_koreksi TEXT;
ALTER TABLE public.penerima_alokasi ADD COLUMN IF NOT EXISTS sudah_dibayar BOOLEAN DEFAULT FALSE;

-- 1.6 Tabel Revenue Center (Pusat Pendapatan Tarif & Klaim Layanan)
CREATE TABLE IF NOT EXISTS public.revenue_center (
  id VARCHAR(100) PRIMARY KEY,
  kode_revenue_center VARCHAR(50) NOT NULL,
  nama_pusat_layanan VARCHAR(150) NOT NULL,
  kategori_layanan VARCHAR(100) NOT NULL,
  target_pendapatan_bulanan NUMERIC(18, 2) DEFAULT 0,
  realisasi_pendapatan NUMERIC(18, 2) DEFAULT 0,
  persentase_pencapaian NUMERIC(5, 2) DEFAULT 0,
  proporsi_retensi_jaspel NUMERIC(5, 2) DEFAULT 0,
  kepala_unit VARCHAR(150),
  jumlah_pasien_bulan_ini INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom tabel revenue_center lengkap
ALTER TABLE public.revenue_center ADD COLUMN IF NOT EXISTS target_pendapatan_bulanan NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.revenue_center ADD COLUMN IF NOT EXISTS realisasi_pendapatan NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.revenue_center ADD COLUMN IF NOT EXISTS persentase_pencapaian NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE public.revenue_center ADD COLUMN IF NOT EXISTS proporsi_retensi_jaspel NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE public.revenue_center ADD COLUMN IF NOT EXISTS kepala_unit VARCHAR(150);
ALTER TABLE public.revenue_center ADD COLUMN IF NOT EXISTS jumlah_pasien_bulan_ini INTEGER DEFAULT 0;

-- 1.7 Tabel Pengguna & Role Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS public.users_rbac (
  id VARCHAR(100) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL,
  nip VARCHAR(50),
  role VARCHAR(30) NOT NULL DEFAULT 'staf',
  unit VARCHAR(100),
  jabatan VARCHAR(100),
  email VARCHAR(150),
  status VARCHAR(20) DEFAULT 'aktif',
  avatar_url TEXT,
  rekening VARCHAR(50),
  bank VARCHAR(50),
  npwp VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom tabel users_rbac lengkap
ALTER TABLE public.users_rbac ADD COLUMN IF NOT EXISTS nip VARCHAR(50);
ALTER TABLE public.users_rbac ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'staf';
ALTER TABLE public.users_rbac ADD COLUMN IF NOT EXISTS unit VARCHAR(100);
ALTER TABLE public.users_rbac ADD COLUMN IF NOT EXISTS jabatan VARCHAR(100);
ALTER TABLE public.users_rbac ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE public.users_rbac ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'aktif';

-- 1.8 Tabel Indeks Jasa Langsung (Sesuai Jumlah Instalasi & Layanan)
CREATE TABLE IF NOT EXISTS public.indeks_jasa_langsung (
  id VARCHAR(100) PRIMARY KEY,
  kode VARCHAR(50),
  instalasi_layanan VARCHAR(150) NOT NULL,
  kategori VARCHAR(100),
  kinerja1 NUMERIC(10, 2) DEFAULT 0,
  kinerja2 NUMERIC(10, 2) DEFAULT 0,
  kinerja3 NUMERIC(10, 2) DEFAULT 0,
  total_poin NUMERIC(12, 2) DEFAULT 0,
  jumlah_alokasi NUMERIC(18, 2) DEFAULT 0,
  rupiah_per_poin1 NUMERIC(18, 2) DEFAULT 0,
  rupiah_per_poin2 NUMERIC(18, 2) DEFAULT 0,
  nilai_jp_langsung NUMERIC(18, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom tabel indeks_jasa_langsung lengkap
ALTER TABLE public.indeks_jasa_langsung ADD COLUMN IF NOT EXISTS kinerja1 NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.indeks_jasa_langsung ADD COLUMN IF NOT EXISTS kinerja2 NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.indeks_jasa_langsung ADD COLUMN IF NOT EXISTS kinerja3 NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.indeks_jasa_langsung ADD COLUMN IF NOT EXISTS total_poin NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.indeks_jasa_langsung ADD COLUMN IF NOT EXISTS jumlah_alokasi NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.indeks_jasa_langsung ADD COLUMN IF NOT EXISTS rupiah_per_poin1 NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.indeks_jasa_langsung ADD COLUMN IF NOT EXISTS rupiah_per_poin2 NUMERIC(18, 2) DEFAULT 0;
ALTER TABLE public.indeks_jasa_langsung ADD COLUMN IF NOT EXISTS nilai_jp_langsung NUMERIC(18, 2) DEFAULT 0;

-- ========================================================
-- BAGIAN 2: INDEKS PENCARIAN & PERFORMA DATABASE
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_penerima_alokasi_id ON public.penerima_alokasi(alokasi_id);
CREATE INDEX IF NOT EXISTS idx_penerima_pegawai_id ON public.penerima_alokasi(pegawai_id);
CREATE INDEX IF NOT EXISTS idx_penerima_unit_kerja ON public.penerima_alokasi(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_alokasi_periode ON public.alokasi_jaspel(tahun, bulan);
CREATE INDEX IF NOT EXISTS idx_general_index_nip ON public.general_index(nip);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users_rbac(username);
CREATE INDEX IF NOT EXISTS idx_indeks_jasa_layanan ON public.indeks_jasa_langsung(instalasi_layanan);

-- ========================================================
-- BAGIAN 3: GRANT PERMISSIONS SCHEMA PUBLIC
-- ========================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ========================================================
-- BAGIAN 4: AKTIFKAN ROW LEVEL SECURITY (RLS) DI TABEL
-- ========================================================
ALTER TABLE public.alokasi_jaspel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_center ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penerima_alokasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_center ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_rbac ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indeks_jasa_langsung ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- BAGIAN 5: ATURAN RLS POLICIES (PUSH, PULL, SELECT, INSERT, UPDATE, DELETE)
-- ========================================================

-- 5.8 Kebijakan indeks_jasa_langsung
DROP POLICY IF EXISTS "allow_all_indeks_jasa_langsung" ON public.indeks_jasa_langsung;
CREATE POLICY "allow_all_indeks_jasa_langsung" ON public.indeks_jasa_langsung
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 5.1 Kebijakan alokasi_jaspel
DROP POLICY IF EXISTS "allow_all_alokasi_jaspel" ON public.alokasi_jaspel;
CREATE POLICY "allow_all_alokasi_jaspel" ON public.alokasi_jaspel
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 5.2 Kebijakan cost_center
DROP POLICY IF EXISTS "allow_all_cost_center" ON public.cost_center;
CREATE POLICY "allow_all_cost_center" ON public.cost_center
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 5.3 Kebijakan general_index
DROP POLICY IF EXISTS "allow_all_general_index" ON public.general_index;
CREATE POLICY "allow_all_general_index" ON public.general_index
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 5.4 Kebijakan hospital_profile
DROP POLICY IF EXISTS "allow_all_hospital_profile" ON public.hospital_profile;
CREATE POLICY "allow_all_hospital_profile" ON public.hospital_profile
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 5.5 Kebijakan penerima_alokasi
DROP POLICY IF EXISTS "allow_all_penerima_alokasi" ON public.penerima_alokasi;
CREATE POLICY "allow_all_penerima_alokasi" ON public.penerima_alokasi
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 5.6 Kebijakan revenue_center
DROP POLICY IF EXISTS "allow_all_revenue_center" ON public.revenue_center;
CREATE POLICY "allow_all_revenue_center" ON public.revenue_center
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 5.7 Kebijakan users_rbac
DROP POLICY IF EXISTS "allow_all_users_rbac" ON public.users_rbac;
CREATE POLICY "allow_all_users_rbac" ON public.users_rbac
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- ========================================================
-- BAGIAN 6: STORAGE BUCKETS & POLICY PENYIMPANAN BERKAS
-- ========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('dokumen-jaspel', 'dokumen-jaspel', true),
  ('slip-gaji-pdf', 'slip-gaji-pdf', true),
  ('sk-direktur', 'sk-direktur', true),
  ('bukti-spj', 'bukti-spj', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "allow_storage_all_access" ON storage.objects;
CREATE POLICY "allow_storage_all_access" ON storage.objects
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- ========================================================
-- SELESAI: Skrip DDL, GRANT, dan RLS 100% Siap untuk PUSH & PULL
-- ========================================================
`;
};
