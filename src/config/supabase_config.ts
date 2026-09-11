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
export const generateSupabaseRlsScript = (rlsEnabled: boolean): string => {
  return `-- ========================================================
-- HALO JASPEL (SISTEM ALOKASI JASA PELAYANAN RS & BLUD)
-- SKRIP LENGKAP: DDL STRUKTUR TABEL, INDEX & ROW LEVEL SECURITY
-- ========================================================

-- BAGIAN 1: STRUKTUR TABEL MASTER & TRANSAKSI (CREATE TABLE IF NOT EXISTS)
-- --------------------------------------------------------

-- 1.1 Tabel Alokasi Jaspel (Header Periode Remunerasi)
CREATE TABLE IF NOT EXISTS public.alokasi_jaspel (
  id VARCHAR(100) PRIMARY KEY,
  kode_periode VARCHAR(50) NOT NULL,
  bulan VARCHAR(30) NOT NULL,
  tahun INTEGER NOT NULL,
  sumber_dana VARCHAR(100) NOT NULL,
  pendapatan_kotor NUMERIC(18, 2) NOT NULL DEFAULT 0,
  biaya_operasional_rs NUMERIC(18, 2) NOT NULL DEFAULT 0,
  proporsi_jaspel_persen NUMERIC(5, 2) NOT NULL DEFAULT 0,
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

-- 1.2 Tabel Rincian Penerima Alokasi (Breakdown Staf per Periode)
CREATE TABLE IF NOT EXISTS public.penerima_alokasi (
  id VARCHAR(100) PRIMARY KEY,
  alokasi_id VARCHAR(100) NOT NULL REFERENCES public.alokasi_jaspel(id) ON DELETE CASCADE,
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

-- 1.4 Tabel Cost Center (Pusat Beban & Biaya Operasional RS)
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

-- 1.5 Tabel Revenue Center (Pusat Pendapatan Tarif & Klaim Layanan)
CREATE TABLE IF NOT EXISTS public.revenue_center (
  id VARCHAR(100) PRIMARY KEY,
  kode_revenue_center VARCHAR(50) NOT NULL,
  nama_pusat_layanan VARCHAR(150) NOT NULL,
  kategori_layanan VARCHAR(100) NOT NULL,
  target_pendapatan_bulanan NUMERIC(18, 2) DEFAULT 0,
  realisasi_pendapatan NUMERIC(18, 2) DEFAULT 0,
  persentase_pencapaian NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Tabel Pengguna & Role Based Access Control (RBAC)
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

-- BAGIAN 2: INDEKS PENCARIAN & INTEGRITAS PERFORMA
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_penerima_alokasi_id ON public.penerima_alokasi(alokasi_id);
CREATE INDEX IF NOT EXISTS idx_penerima_pegawai_id ON public.penerima_alokasi(pegawai_id);
CREATE INDEX IF NOT EXISTS idx_penerima_unit_kerja ON public.penerima_alokasi(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_alokasi_periode ON public.alokasi_jaspel(tahun, bulan);
CREATE INDEX IF NOT EXISTS idx_general_index_nip ON public.general_index(nip);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users_rbac(username);

-- BAGIAN 3: PENGATURAN ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------
ALTER TABLE public.alokasi_jaspel ${rlsEnabled ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY;
ALTER TABLE public.penerima_alokasi ${rlsEnabled ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY;
ALTER TABLE public.general_index ${rlsEnabled ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY;
ALTER TABLE public.cost_center ${rlsEnabled ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY;
ALTER TABLE public.revenue_center ${rlsEnabled ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY;
ALTER TABLE public.users_rbac ${rlsEnabled ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY;

-- BAGIAN 4: ATURAN KEBIJAKAN KEAMANAN (RLS POLICIES - IDEMPOTENT)
-- --------------------------------------------------------

-- 4.1 Kebijakan Superadmin (Akses Penuh Tanpa Batas)
DROP POLICY IF EXISTS "superadmin_full_access_alokasi" ON public.alokasi_jaspel;
CREATE POLICY "superadmin_full_access_alokasi" ON public.alokasi_jaspel
  FOR ALL TO authenticated
  USING ( COALESCE(auth.jwt()->>'role', '') = 'superadmin' OR auth.role() = 'service_role' )
  WITH CHECK ( COALESCE(auth.jwt()->>'role', '') = 'superadmin' OR auth.role() = 'service_role' );

DROP POLICY IF EXISTS "superadmin_full_access_penerima" ON public.penerima_alokasi;
CREATE POLICY "superadmin_full_access_penerima" ON public.penerima_alokasi
  FOR ALL TO authenticated
  USING ( COALESCE(auth.jwt()->>'role', '') = 'superadmin' OR auth.role() = 'service_role' )
  WITH CHECK ( COALESCE(auth.jwt()->>'role', '') = 'superadmin' OR auth.role() = 'service_role' );

-- 4.2 Kebijakan Tim Perumus (Formula, Input Alokasi & Database)
DROP POLICY IF EXISTS "perumus_manage_alokasi" ON public.alokasi_jaspel;
CREATE POLICY "perumus_manage_alokasi" ON public.alokasi_jaspel
  FOR ALL TO authenticated
  USING ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' )
  WITH CHECK ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' );

DROP POLICY IF EXISTS "perumus_read_general_index" ON public.general_index;
CREATE POLICY "perumus_read_general_index" ON public.general_index
  FOR SELECT TO authenticated
  USING ( true );

DROP POLICY IF EXISTS "perumus_manage_general_index" ON public.general_index;
CREATE POLICY "perumus_manage_general_index" ON public.general_index
  FOR ALL TO authenticated
  USING ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' )
  WITH CHECK ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' );

DROP POLICY IF EXISTS "perumus_manage_cost_center" ON public.cost_center;
CREATE POLICY "perumus_manage_cost_center" ON public.cost_center
  FOR ALL TO authenticated
  USING ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' )
  WITH CHECK ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' );

DROP POLICY IF EXISTS "perumus_manage_revenue_center" ON public.revenue_center;
CREATE POLICY "perumus_manage_revenue_center" ON public.revenue_center
  FOR ALL TO authenticated
  USING ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' )
  WITH CHECK ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' );

-- 4.3 Kebijakan PIC (Penanggung Jawab / Kepala Ruangan)
DROP POLICY IF EXISTS "pic_view_own_unit_penerima" ON public.penerima_alokasi;
CREATE POLICY "pic_view_own_unit_penerima" ON public.penerima_alokasi
  FOR SELECT TO authenticated
  USING (
    (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR
    ( (auth.jwt()->>'role') = 'pic' AND unit_kerja = (auth.jwt()->>'unit') ) OR
    auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "pic_update_koreksi_unit" ON public.penerima_alokasi;
CREATE POLICY "pic_update_koreksi_unit" ON public.penerima_alokasi
  FOR UPDATE TO authenticated
  USING ( (auth.jwt()->>'role') = 'pic' AND unit_kerja = (auth.jwt()->>'unit') )
  WITH CHECK ( (auth.jwt()->>'role') = 'pic' AND unit_kerja = (auth.jwt()->>'unit') );

-- 4.4 Kebijakan Staf / Penerima (Privasi Rekening & Slip Pribadi)
DROP POLICY IF EXISTS "staf_read_own_slip" ON public.penerima_alokasi;
CREATE POLICY "staf_read_own_slip" ON public.penerima_alokasi
  FOR SELECT TO authenticated
  USING (
    (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR
    ( (auth.jwt()->>'role') = 'pic' AND unit_kerja = (auth.jwt()->>'unit') ) OR
    ( (auth.jwt()->>'role') = 'staf' AND pegawai_id = (auth.jwt()->>'pegawai_id') ) OR
    auth.role() = 'service_role'
  );

-- 4.5 Akses Read Users RBAC
DROP POLICY IF EXISTS "authenticated_read_users" ON public.users_rbac;
CREATE POLICY "authenticated_read_users" ON public.users_rbac
  FOR SELECT TO authenticated
  USING ( true );

-- BAGIAN 5: SUPABASE STORAGE BUCKET & FILE SECURITY
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('dokumen-jaspel', 'dokumen-jaspel', false),
  ('slip-gaji-pdf', 'slip-gaji-pdf', false),
  ('sk-direktur', 'sk-direktur', false),
  ('bukti-spj', 'bukti-spj', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow Staff to Read Own PDF" ON storage.objects;
CREATE POLICY "Allow Staff to Read Own PDF" ON storage.objects
  FOR SELECT TO authenticated
  USING ( bucket_id = 'slip-gaji-pdf' AND name LIKE (COALESCE(auth.jwt()->>'nip', '') || '%') );

DROP POLICY IF EXISTS "Allow Admins Manage Storage Objects" ON storage.objects;
CREATE POLICY "Allow Admins Manage Storage Objects" ON storage.objects
  FOR ALL TO authenticated
  USING ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' )
  WITH CHECK ( (auth.jwt()->>'role') IN ('superadmin', 'perumus') OR auth.role() = 'service_role' );

-- ========================================================
-- SELESAI: Skrip berhasil dipersiapkan untuk HALO JASPEL
-- ========================================================
`;
};
