import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Layers, 
  Server, 
  HardDrive,
  Copy,
  Check,
  Zap,
  ExternalLink,
  Code,
  UploadCloud,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { 
  INITIAL_UNIT_KINERJA_LAYANAN, 
  INITIAL_PEGAWAI_KINERJA_LAYANAN 
} from '../data/rekapKinerjaPelayananData';
import { 
  INITIAL_GENERAL_INDEX, 
  INITIAL_PENERIMA, 
  INITIAL_INDEKS_JASA_LANGSUNG,
  INITIAL_ALOKASI
} from '../data/initialData';
import { 
  mapUnitKinerjaToSupabase, 
  mapPegawaiKinerjaToSupabase, 
  mapIndeksJasaToSupabase 
} from '../utils/supabaseMapper';

interface TableStats {
  table: string;
  name: string;
  count: number | null;
  status: 'ok' | 'empty' | 'error';
  error?: string;
}

interface SupabaseSyncManagerProps {
  onRefreshData: () => Promise<void>;
}

export const SupabaseSyncManager: React.FC<SupabaseSyncManagerProps> = ({
  onRefreshData
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TableStats[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlDdl, setShowSqlDdl] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zpdnjvusmjrqxzgughbi.supabase.co';

  const SQL_DDL_SCRIPT = `-- ============================================================
-- SKEMA POSTGRESQL / SUPABASE: INDEKS JASA LANGSUNG & PELAYANAN RSUD
-- Jalankan script ini di menu "SQL Editor" pada dashboard Supabase
-- ============================================================

-- 1. TABEL UNIT KINERJA LAYANAN (10 INSTALASI & LAYANAN RESMI)
CREATE TABLE IF NOT EXISTS public.unit_kinerja_layanan (
  id text PRIMARY KEY,
  kode_unit text NOT NULL,
  nama_unit text NOT NULL,
  kategori text NOT NULL,
  bulan text NOT NULL,
  tahun integer NOT NULL,
  indikator1 text,
  volume_total1 numeric DEFAULT 0,
  indikator2 text,
  volume_total2 numeric DEFAULT 0,
  indikator3 text,
  volume_total3 numeric DEFAULT 0,
  pagu_jp numeric DEFAULT 0,
  total_poin numeric DEFAULT 0,
  rupiah_per_poin numeric DEFAULT 0,
  realisasi_jp numeric DEFAULT 0,
  jumlah_pegawai integer DEFAULT 0,
  sub_porsi_pagu jsonb,
  status text DEFAULT 'Final',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. TABEL PEGAWAI KINERJA LAYANAN (65 STAF JASA LANGSUNG SESUAI KOLOM CSV)
CREATE TABLE IF NOT EXISTS public.pegawai_kinerja_layanan (
  id text PRIMARY KEY,
  unit_kode text NOT NULL,
  unit_nama text NOT NULL,
  nama text NOT NULL,
  nip text,
  sub_kategori text,
  prestasi1 numeric DEFAULT 0,
  total_bulan1 numeric DEFAULT 0,
  poin1 numeric DEFAULT 0,
  prestasi2 numeric DEFAULT 0,
  total_bulan2 numeric DEFAULT 0,
  poin2 numeric DEFAULT 0,
  prestasi3 numeric DEFAULT 0,
  total_bulan3 numeric DEFAULT 0,
  poin3 numeric DEFAULT 0,
  jumlah_poin numeric DEFAULT 0,
  persen_poin numeric DEFAULT 0,
  jp_langsung numeric DEFAULT 0,
  keterangan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. TABEL INDEKS JASA LANGSUNG (MATRIKS FORMULA)
CREATE TABLE IF NOT EXISTS public.indeks_jasa_langsung (
  id text PRIMARY KEY,
  kode text NOT NULL,
  kategori text NOT NULL,
  instalasi_layanan text NOT NULL,
  nama_pegawai text,
  kinerja1 numeric DEFAULT 0,
  kinerja2 numeric DEFAULT 0,
  kinerja3 numeric DEFAULT 0,
  total_poin numeric DEFAULT 0,
  jumlah_alokasi numeric DEFAULT 0,
  rupiah_per_poin1 numeric DEFAULT 0,
  rupiah_per_poin2 numeric DEFAULT 0,
  nilai_jp_langsung numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. TABEL PENERIMA ALOKASI JASPEL (RINCIAN 2 PILAR TERKINI)
CREATE TABLE IF NOT EXISTS public.penerima_alokasi (
  id text PRIMARY KEY,
  alokasi_id text,
  pegawai_id text,
  nama text NOT NULL,
  unit_kerja text,
  jabatan text,
  kategori text DEFAULT 'Medis',
  poin_dasar numeric DEFAULT 0,
  poin_kompetensi numeric DEFAULT 0,
  poin_risiko numeric DEFAULT 0,
  poin_kinerja numeric DEFAULT 0,
  total_poin numeric DEFAULT 0,
  nilai_per_poin numeric DEFAULT 0,
  nominal_beban_tetap numeric DEFAULT 0,
  nominal_post_remunerasi numeric DEFAULT 0,
  nominal_administrasi numeric DEFAULT 0,
  nominal_jasa_langsung numeric DEFAULT 0,
  potongan_cuti numeric DEFAULT 0,
  nominal_koreksi numeric DEFAULT 0,
  bruto_jaspel numeric DEFAULT 0,
  pajak_pph21_persen numeric DEFAULT 0,
  potongan_pph21 numeric DEFAULT 0,
  netto_diterima numeric DEFAULT 0,
  total_diterima numeric DEFAULT 0,
  status_koreksi text DEFAULT 'Sesuai',
  catatan_koreksi text,
  sudah_dibayar boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- 5. TABEL GENERAL INDEX PEGAWAI
CREATE TABLE IF NOT EXISTS public.general_index (
  id text PRIMARY KEY,
  kode text NOT NULL,
  nama_pegawai text NOT NULL,
  golongan text,
  jabatan text,
  pendidikan text,
  masa_kerja_tahun numeric DEFAULT 0,
  ruangan text,
  kelompok_jasa text,
  skor_dasar numeric DEFAULT 0,
  skor_kompetensi numeric DEFAULT 0,
  skor_risiko numeric DEFAULT 0,
  skor_kinerja numeric DEFAULT 0,
  bobot_presensi numeric DEFAULT 100,
  jaspel_post_total numeric DEFAULT 0,
  status_pegawai text DEFAULT 'PNS',
  created_at timestamptz DEFAULT now()
);

-- KEBIJAKAN AKSES ROW LEVEL SECURITY (RLS)
ALTER TABLE public.unit_kinerja_layanan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik unit_kinerja_layanan" ON public.unit_kinerja_layanan;
CREATE POLICY "Akses Publik unit_kinerja_layanan" ON public.unit_kinerja_layanan FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.pegawai_kinerja_layanan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik pegawai_kinerja_layanan" ON public.pegawai_kinerja_layanan;
CREATE POLICY "Akses Publik pegawai_kinerja_layanan" ON public.pegawai_kinerja_layanan FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.indeks_jasa_langsung ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik indeks_jasa_langsung" ON public.indeks_jasa_langsung;
CREATE POLICY "Akses Publik indeks_jasa_langsung" ON public.indeks_jasa_langsung FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.penerima_alokasi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik penerima_alokasi" ON public.penerima_alokasi;
CREATE POLICY "Akses Publik penerima_alokasi" ON public.penerima_alokasi FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.general_index ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik general_index" ON public.general_index;
CREATE POLICY "Akses Publik general_index" ON public.general_index FOR ALL USING (true) WITH CHECK (true);
`;

  const fetchTableStats = async () => {
    setLoading(true);
    setStatusMessage(null);
    const startTime = performance.now();

    const tablesToInspect = [
      { table: 'unit_kinerja_layanan', name: 'Unit Kinerja Layanan (10 Instalasi)' },
      { table: 'pegawai_kinerja_layanan', name: 'Pegawai Kinerja Layanan (65 Staf CSV)' },
      { table: 'indeks_jasa_langsung', name: 'Indeks Jasa Langsung (Matriks)' },
      { table: 'alokasi_jaspel', name: 'Alokasi Jaspel (Periode)' },
      { table: 'penerima_alokasi', name: 'Rincian Penerima Jaspel' },
      { table: 'general_index', name: 'General Index Pegawai' },
      { table: 'cost_center', name: 'Cost Center (Beban RS)' },
      { table: 'revenue_center', name: 'Revenue Center (Layanan)' },
      { table: 'users_rbac', name: 'Pengguna & RBAC' },
      { table: 'hospital_profile', name: 'Profil Rumah Sakit' }
    ];

    const results: TableStats[] = [];

    for (const item of tablesToInspect) {
      try {
        const { count, error } = await supabase
          .from(item.table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          results.push({
            table: item.table,
            name: item.name,
            count: null,
            status: 'error',
            error: error.message
          });
        } else {
          results.push({
            table: item.table,
            name: item.name,
            count: count ?? 0,
            status: (count ?? 0) > 0 ? 'ok' : 'empty'
          });
        }
      } catch (err: any) {
        results.push({
          table: item.table,
          name: item.name,
          count: null,
          status: 'error',
          error: err.message || 'Koneksi gagal'
        });
      }
    }

    const elapsed = Math.round(performance.now() - startTime);
    setPingLatency(elapsed);
    setStats(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchTableStats();
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(supabaseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_DDL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleFullRefresh = async () => {
    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Memuat ulang seluruh data dari Supabase Cloud...' });
    try {
      await onRefreshData();
      await fetchTableStats();
      setStatusMessage({ type: 'success', text: 'Data berhasil diperbarui langsung dari Supabase Cloud!' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat ulang data: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  // Push all 65 staff and 10 units directly to Supabase
  const handlePushAllDataToSupabase = async () => {
    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Mengunggah 10 unit instalasi dan 65 pegawai CSV ke Supabase Cloud...' });

    try {
      // 1. Upsert Unit Kinerja Layanan
      const mappedUnits = INITIAL_UNIT_KINERJA_LAYANAN.map(mapUnitKinerjaToSupabase);
      const { error: errUnits } = await supabase
        .from('unit_kinerja_layanan')
        .upsert(mappedUnits, { onConflict: 'id' });

      if (errUnits) {
        throw new Error(`Unit Kinerja: ${errUnits.message}. Pastikan tabel 'unit_kinerja_layanan' sudah dibuat via SQL Editor.`);
      }

      // 2. Upsert Pegawai Kinerja Layanan (65 Staf)
      const mappedPegawai = INITIAL_PEGAWAI_KINERJA_LAYANAN.map(mapPegawaiKinerjaToSupabase);
      const { error: errPegawai } = await supabase
        .from('pegawai_kinerja_layanan')
        .upsert(mappedPegawai, { onConflict: 'id' });

      if (errPegawai) {
        throw new Error(`Pegawai Kinerja: ${errPegawai.message}. Pastikan tabel 'pegawai_kinerja_layanan' sudah dibuat via SQL Editor.`);
      }

      // 3. Upsert Indeks Jasa Langsung Matrix
      const mappedIndeks = INITIAL_INDEKS_JASA_LANGSUNG.map(mapIndeksJasaToSupabase);
      await supabase
        .from('indeks_jasa_langsung')
        .upsert(mappedIndeks, { onConflict: 'id' });

      await fetchTableStats();
      await onRefreshData();

      setStatusMessage({ 
        type: 'success', 
        text: 'SUKSES! 10 Unit Instalasi dan 65 Pegawai Kinerja Layanan CSV berhasil disimpan dan dipersistensi di Supabase Cloud!' 
      });
    } catch (err: any) {
      console.error('Supabase Push Error:', err);
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'Terjadi kesalahan saat menyimpan data ke Supabase.' 
      });
      setShowSqlDdl(true); // Automatically expand the SQL script if table does not exist
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c1633] border-blue-900/60 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Koneksi Cloud Aktif
                </span>
                {pingLatency !== null && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>{pingLatency} ms</span>
                  </span>
                )}
              </div>
              <h2 className={`text-xl sm:text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Supabase Cloud Database & Storage RLS
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-blue-200/80'}`}>
                Seluruh data Halo Jaspel dimuat dan disimpan secara permanen di Supabase PostgreSQL, termasuk 10 Instalasi Layanan dan 65 staf kinerja dari file CSV.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePushAllDataToSupabase}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
              title="Simpan seluruh data instalasi dan 65 staf CSV ke Supabase"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Simpan Data CSV ke Supabase</span>
            </button>

            <button
              onClick={handleFullRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang dari Supabase</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* SQL DDL Script Accordion for Database Setup */}
      <div className={`rounded-3xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60 shadow-xl'
      }`}>
        <div 
          onClick={() => setShowSqlDdl(!showSqlDdl)}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/30 rounded-t-3xl transition"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} flex items-center space-x-2`}>
                <span>SQL Skema Supabase (Tabel Instalasi, Layanan & 65 Staf CSV)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  DDL POSTGRESQL
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Jika tabel baru belum dibuat di proyek Supabase Anda, salin script SQL ini dan jalankan di menu Supabase SQL Editor.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopySql();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Tersalin!' : 'Salin Script SQL'}</span>
            </button>
            <div className="text-slate-400">
              {showSqlDdl ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {showSqlDdl && (
          <div className="p-5 pt-0 border-t border-slate-800/60">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mt-3 font-mono text-xs text-amber-300/90 overflow-x-auto max-h-96 leading-relaxed">
              <pre>{SQL_DDL_SCRIPT}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Endpoint & Instance Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60'
        }`}>
          <span className="text-[10px] font-bold uppercase text-slate-400">Endpoint Project</span>
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xs font-mono font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {supabaseUrl}
            </p>
            <button
              onClick={handleCopyUrl}
              className="p-1.5 rounded-lg hover:bg-blue-900/40 text-blue-400 transition shrink-0 ml-2"
              title="Salin URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60'
        }`}>
          <span className="text-[10px] font-bold uppercase text-slate-400">Arsitektur Penyimpanan</span>
          <div className="flex items-center space-x-2 mt-1">
            <Server className="w-4 h-4 text-emerald-400" />
            <p className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              PostgreSQL Managed Cloud (RLS Active)
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60'
        }`}>
          <span className="text-[10px] font-bold uppercase text-slate-400">Sumber Data Aplikasi</span>
          <div className="flex items-center space-x-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <p className={`text-xs font-bold text-amber-400`}>
              100% Live Cloud Supabase & Local Fallback
            </p>
          </div>
        </div>
      </div>

      {/* Tables Status Matrix */}
      <div className={`p-5 rounded-3xl border shadow-xl ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0c152d] border-blue-900/60'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Status Tabel Supabase (Termasuk Instalasi & 65 Staf CSV)
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Verifikasi ketersediaan tabel dan jumlah baris data yang dimuat ke aplikasi.
            </p>
          </div>

          <button
            onClick={fetchTableStats}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Cek Ulang</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.map((item) => (
            <div
              key={item.table}
              className={`p-4 rounded-2xl border transition-all ${
                item.status === 'ok'
                  ? isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'
                  : item.status === 'empty'
                  ? isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
                  : 'bg-rose-950/20 border-rose-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {item.name}
                </span>
                {item.status === 'ok' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {item.count} Baris
                  </span>
                ) : item.status === 'empty' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-700 text-slate-300">
                    0 Baris (Kosong)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Belum Dibuat
                  </span>
                )}
              </div>

              <p className="text-[11px] font-mono text-slate-400 mt-1">
                public.{item.table}
              </p>

              {item.error && (
                <p className="text-[10px] text-rose-400 mt-1 truncate" title={item.error}>
                  {item.error}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

