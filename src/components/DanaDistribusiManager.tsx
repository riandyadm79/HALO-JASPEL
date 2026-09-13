import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Users, 
  CheckCircle2, 
  FileSpreadsheet, 
  Download, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Percent,
  Check,
  Stethoscope,
  Briefcase,
  Sliders,
  Scale
} from 'lucide-react';
import { formatRupiah, formatNumber } from '../utils/calculations';
import { 
  DATA_MAKRO_RSUD, 
  REALISASI_BULANAN_RSUD, 
  RINCIAN_BEBAN_TETAP, 
  RINCIAN_JASA_TIDAK_LANGSUNG, 
  RINCIAN_JASA_LANGSUNG,
  EVALUASI_REALISASI_VS_PAGU_RSUD 
} from '../data/danaCsvData';
import { hitungAlurDistribusiDana, KalkulasiDanaResult } from '../utils/danaCalculations';
import { AlokasiJaspel, User } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { supabase } from '../lib/supabase';

interface DanaDistribusiManagerProps {
  alokasiList: AlokasiJaspel[];
  setAlokasiList: React.Dispatch<React.SetStateAction<AlokasiJaspel[]>>;
  currentUser?: User | null;
  onNavigateToPayroll?: () => void;
}

export const DanaDistribusiManager: React.FC<DanaDistribusiManagerProps> = ({
  alokasiList,
  setAlokasiList,
  currentUser,
  onNavigateToPayroll
}) => {
  // Input State: Default dari CSV Juli RSUD
  const [pendapatanInput, setPendapatanInput] = useState<number>(DATA_MAKRO_RSUD.realisasiPendapatanBulan);
  const [porsiJaspelPersen, setPorsiJaspelPersen] = useState<number>(DATA_MAKRO_RSUD.porsiJasaPelayananPersen);
  const [activeSubView, setActiveSubView] = useState<'distribusi' | 'bulanan' | 'evaluasi'>('distribusi');
  const [filterKategori, setFilterKategori] = useState<'all' | 'tetap' | 'jtl' | 'jl'>('all');
  
  // Collapse toggle states for details
  const [expandedSection, setExpandedSection] = useState<{ [key: string]: boolean }>({
    tetap: true,
    jtl: true,
    jl: true
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Kalkulasi reaktif
  const kalkulasi: KalkulasiDanaResult = useMemo(() => {
    return hitungAlurDistribusiDana(pendapatanInput, porsiJaspelPersen);
  }, [pendapatanInput, porsiJaspelPersen]);

  // Handler preset data
  const handleLoadCsvBaseline = () => {
    setPendapatanInput(DATA_MAKRO_RSUD.realisasiPendapatanBulan);
    setPorsiJaspelPersen(40.0);
    setNotification('Memuat dataset resmi CSV Periode Juli (Pendapatan Rp 2.859.709.359)');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoadTargetTahunan = () => {
    setPendapatanInput(DATA_MAKRO_RSUD.targetPendapatanTahunan);
    setPorsiJaspelPersen(40.0);
    setNotification('Memuat Target Pagu Tahunan RSUD (Pendapatan Rp 22.000.000.000)');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoadTargetBulanan = () => {
    // 22 M / 12 = 1.833.333.333 Pendapatan bulanan
    setPendapatanInput(Math.round(DATA_MAKRO_RSUD.targetPendapatanTahunan / 12));
    setPorsiJaspelPersen(40.0);
    setNotification('Memuat Target Rata-rata Bulanan (Pagu JP: Rp 733.333.333)');
    setTimeout(() => setNotification(null), 4000);
  };

  // Handler sinkronisasi ke tabel Alokasi Jaspel
  const handleApplyToAlokasi = async () => {
    const kodePeriode = `JAPEL-${new Date().getFullYear()}-07`;
    const targetAlokasiId = alokasiList.find(a => a.bulan.toLowerCase().includes('juli'))?.id || `alo-csv-jul-${Date.now()}`;

    const newOrUpdatedAlokasi: AlokasiJaspel = {
      id: targetAlokasiId,
      kodePeriode: kodePeriode,
      bulan: 'Juli',
      tahun: 2026,
      sumberDana: 'Gabungan Seluruh Layanan',
      pendapatanKotor: kalkulasi.pendapatanInput,
      biayaOperasionalRs: kalkulasi.bebanTetap.totalBebanTetap,
      proporsiJaspelPersen: kalkulasi.porsiJaspelPersen,
      paguJaspelKotor: kalkulasi.paguJaspel,
      paguJaspelNetto: kalkulasi.paguJaspel - kalkulasi.bebanTetap.totalBebanTetap,
      jasaMedisKlinisPersen: 56.40,
      jasaNonKlinisPersen: 37.55,
      jasaManajemenPersen: 6.05,
      status: 'Disetujui Direktur',
      tanggalDibuat: new Date().toISOString(),
      tanggalUpdate: new Date().toISOString(),
      keterangan: `Ditetapkan sesuai alur distribusi resmi CSV (Pagu JP 40%: ${formatRupiah(kalkulasi.paguJaspel)})`,
      createdBy: currentUser?.nama || 'Superadmin'
    };

    // Update state
    setAlokasiList(prev => {
      const exists = prev.some(a => a.id === targetAlokasiId);
      if (exists) {
        return prev.map(a => a.id === targetAlokasiId ? newOrUpdatedAlokasi : a);
      }
      return [newOrUpdatedAlokasi, ...prev];
    });

    // Sync to Supabase
    try {
      await supabase.from('alokasi_jaspel').upsert({
        id: newOrUpdatedAlokasi.id,
        kode_periode: newOrUpdatedAlokasi.kodePeriode,
        bulan: newOrUpdatedAlokasi.bulan,
        tahun: newOrUpdatedAlokasi.tahun,
        sumber_dana: newOrUpdatedAlokasi.sumberDana,
        pendapatan_kotor: newOrUpdatedAlokasi.pendapatanKotor,
        biaya_operasional_rs: newOrUpdatedAlokasi.biayaOperasionalRs,
        proporsi_jaspel_persen: newOrUpdatedAlokasi.proporsiJaspelPersen,
        pagu_jaspel_kotor: newOrUpdatedAlokasi.paguJaspelKotor,
        pagu_jaspel_netto: newOrUpdatedAlokasi.paguJaspelNetto,
        status: newOrUpdatedAlokasi.status,
        keterangan: newOrUpdatedAlokasi.keterangan
      });
      setNotification('Alur & Pagu Jaspel 40% berhasil diterapkan ke Periode Alokasi!');
    } catch (err) {
      console.warn('Supabase sync notice:', err);
      setNotification('Pagu berhasil diterapkan ke state aplikasi lokal!');
    }

    setTimeout(() => setNotification(null), 5000);
  };

  const toggleSection = (sec: string) => {
    setExpandedSection(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1c3a] via-[#0f2756] to-[#17387a] rounded-3xl p-5 sm:p-7 border border-blue-600/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 shadow-md">
                Model Resmi RSUD
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/90 text-blue-200 border border-blue-700">
                Regulasi Jaspel 40%
              </span>
              <span className="text-xs text-blue-200 font-medium">
                Pagu Tahunan Target: <strong>Rp 8.800.000.000</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              Alur & Manajemen Distribusi Dana Jaspel
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl mt-1.5 leading-relaxed">
              Mekanisme alokasi proporsi belanja jasa RSUD: <strong>40,0% Pagu Jasa Pelayanan</strong> & <strong>60,0% Jasa Sarana</strong> dari nilai pendapatan, terbagi ke Beban Tetap, Jasa Tidak Langsung, dan Jasa Langsung.
            </p>
          </div>

          {/* Action Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadCsvBaseline}
              className="px-3 py-2 rounded-xl bg-blue-950/90 hover:bg-blue-900 text-blue-200 border border-blue-700 text-xs font-bold transition flex items-center space-x-1.5 active:scale-95"
              title="Gunakan Data Riil CSV Bulan Juli"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Data CSV (Juli)</span>
            </button>
            <button
              onClick={handleLoadTargetTahunan}
              className="px-3 py-2 rounded-xl bg-blue-950/90 hover:bg-blue-900 text-blue-200 border border-blue-700 text-xs font-bold transition flex items-center space-x-1.5 active:scale-95"
            >
              <span>Target 22M (Tahunan)</span>
            </button>
            <button
              onClick={handleApplyToAlokasi}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/40 transition flex items-center space-x-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Terapkan ke Alokasi</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards (Macro Allocation Overview) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-blue-800/60">
          
          <div className="bg-[#081329]/80 p-4 rounded-2xl border border-blue-900/60">
            <span className="text-[10px] font-bold uppercase text-blue-300 flex items-center justify-between">
              <span>Nilai Pendapatan RSUD</span>
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <p className="text-base sm:text-xl font-black text-white mt-1 truncate font-mono">
              {formatRupiah(kalkulasi.pendapatanInput)}
            </p>
            <span className="text-[10px] text-blue-300/80">Basis Perhitungan Jaspel</span>
          </div>

          <div className="bg-[#081329]/80 p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-[#0c1836] to-[#122854]">
            <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center justify-between">
              <span>Pagu Jasa Pelayanan (JP)</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px]">
                {kalkulasi.porsiJaspelPersen.toFixed(1)}%
              </span>
            </span>
            <p className="text-base sm:text-xl font-black text-amber-400 mt-1 truncate font-mono">
              {formatRupiah(kalkulasi.paguJaspel)}
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">Hak Remunerasi Pegawai</span>
          </div>

          <div className="bg-[#081329]/80 p-4 rounded-2xl border border-blue-900/60">
            <span className="text-[10px] font-bold uppercase text-blue-300 flex items-center justify-between">
              <span>Jasa Sarana (JS)</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-[10px]">
                {kalkulasi.porsiSaranaPersen.toFixed(1)}%
              </span>
            </span>
            <p className="text-base sm:text-xl font-black text-slate-200 mt-1 truncate font-mono">
              {formatRupiah(kalkulasi.paguSarana)}
            </p>
            <span className="text-[10px] text-blue-300/80">Operasional & Sarana RS</span>
          </div>

          <div className="bg-[#081329]/80 p-4 rounded-2xl border border-blue-900/60">
            <span className="text-[10px] font-bold uppercase text-blue-300 flex items-center justify-between">
              <span>Target Rata-rata Bulanan</span>
              <Percent className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <p className="text-base sm:text-xl font-black text-white mt-1 truncate font-mono">
              {formatRupiah(DATA_MAKRO_RSUD.targetPaguPerBulan)}
            </p>
            <span className="text-[10px] text-blue-300/80">Target APBD / BLUD Per Bulan</span>
          </div>

        </div>
      </div>

      {/* Interactive Controls & Settings Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Sub-view Navigation Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubView('distribusi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
              activeSubView === 'distribusi'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Alur Distribusi 3 Pilar</span>
          </button>
          <button
            onClick={() => setActiveSubView('evaluasi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
              activeSubView === 'evaluasi'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Evaluasi Realisasi vs Pagu ({kalkulasi.evaluasiList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubView('bulanan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
              activeSubView === 'bulanan'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Riwayat Pendapatan Bulanan (Jan-Des)</span>
          </button>
        </div>

        {/* Input Manajemen Nilai Pendapatan Realtime */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56 sm:w-64">
            <CurrencyInput
              label="Input Pendapatan Periode"
              value={pendapatanInput}
              onChange={val => setPendapatanInput(val)}
              placeholder="Masukkan Nilai Pendapatan"
            />
          </div>

          <div className="w-36">
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Porsi Jaspel (%)
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={20}
                max={60}
                step={0.5}
                value={porsiJaspelPersen}
                onChange={e => setPorsiJaspelPersen(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-bold font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>
        </div>

      </div>

      {/* VIEW 1: ALUR DISTRIBUSI 3 PILAR HIERARKI LENGKAP */}
      {activeSubView === 'distribusi' && (
        <div className="space-y-6">
          
          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs text-slate-400 font-bold uppercase shrink-0">Filter Pos:</span>
            {[
              { id: 'all', label: 'Seluruh Pos Dana' },
              { id: 'tetap', label: 'Beban Tetap (6,05%)' },
              { id: 'jtl', label: 'Jasa Tidak Langsung (37,55%)' },
              { id: 'jl', label: 'Jasa Langsung (56,40%)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterKategori(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  filterKategori === tab.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* PILAR 1: COST CENTER (Beban Tetap & Beban Fluktuasi) */}
          {(filterKategori === 'all' || filterKategori === 'tetap' || filterKategori === 'jtl') && (
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
              
              {/* Header Accordion */}
              <div 
                onClick={() => toggleSection('tetap')}
                className="p-4 sm:p-5 bg-gradient-to-r from-[#172554]/50 to-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-blue-950/40 transition border-b border-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-blue-950 text-amber-400 border border-blue-800">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-white">1. Cost Center</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {(kalkulasi.bebanTetap.persenDariJaspel + kalkulasi.jasaTidakLangsung.persenDariJaspel).toFixed(2)}% dari Pagu JP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Beban Tetap (Non Jasa) dan Jasa Tidak Langsung (Beban Fluktuasi)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Total Alokasi Cost Center</span>
                    <p className="text-sm sm:text-base font-black text-amber-400 font-mono">
                      {formatRupiah(kalkulasi.bebanTetap.totalBebanTetap + kalkulasi.jasaTidakLangsung.totalJTL)}
                    </p>
                  </div>
                  {expandedSection.tetap ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Body */}
              {expandedSection.tetap && (
                <div className="p-4 sm:p-6 space-y-8">
                  
                  {/* A. Non Jasa (Beban Tetap) */}
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">A. Non Jasa (Beban Tetap)</h4>
                      <p className="text-xs text-slate-400">Alokasi: {kalkulasi.bebanTetap.persenDariJaspel}% ({formatRupiah(kalkulasi.bebanTetap.totalBebanTetap)})</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-blue-300">1) Tim Perumus</span>
                        <p className="text-base font-black text-white font-mono mt-1">
                          {formatRupiah(kalkulasi.bebanTetap.timPerumus.nominal)}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{kalkulasi.bebanTetap.timPerumus.personel} Staf</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-blue-300">2) Pengelola BLUD</span>
                        <p className="text-base font-black text-amber-400 font-mono mt-1">
                          {formatRupiah(kalkulasi.bebanTetap.penyesuaianRisiko.nominal - 7107593)} {/* Approximate Dewas deduction */}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>4 Pejabat</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-blue-300">3) Dewan Pengawas</span>
                        <p className="text-base font-black text-emerald-400 font-mono mt-1">
                          {formatRupiah(7107593)}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>3 Personel</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-blue-300">4) Tugas Tambahan</span>
                        <p className="text-base font-black text-white font-mono mt-1">
                          Rp 0
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>Belum ada kegiatan</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* B. Jasa Tidak Langsung (Beban Fluktuasi) */}
                  <div className="space-y-4 pt-4 border-t border-slate-800/60">
                    <div className="flex flex-col">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">B. Jasa Tidak Langsung (Beban Fluktuasi)</h4>
                      <p className="text-xs text-slate-400">Alokasi: {kalkulasi.jasaTidakLangsung.persenDariJaspel}% ({formatRupiah(kalkulasi.jasaTidakLangsung.totalJTL)})</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-blue-300">1) Post Remunerasi (General Index)</span>
                        <p className="text-base font-black text-white font-mono mt-1">
                          {formatRupiah(kalkulasi.jasaTidakLangsung.postRemunerasi.nominal + kalkulasi.jasaTidakLangsung.struktural.total)}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Rupiah bagi seluruh Pegawai
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-blue-300">2) Administrasi</span>
                        <p className="text-base font-black text-amber-400 font-mono mt-1">
                          {formatRupiah(kalkulasi.jasaTidakLangsung.administrasi.nominal)}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Rupiah Hanya untuk kelompok administrasi
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Table Pengelola & Dewas */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Jabatan / Komponen Beban Tetap</th>
                          <th className="py-2.5 px-3 text-right">Porsi (%)</th>
                          <th className="py-2.5 px-3 text-right">Alokasi Rupiah</th>
                          <th className="py-2.5 px-3 text-center">Personel</th>
                          <th className="py-2.5 px-3 text-right">Rata-rata / Orang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {kalkulasi.bebanTetap.penyesuaianRisiko.items.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-semibold text-white">{row.jabatan}</td>
                            <td className="py-2 px-3 text-right font-mono text-amber-400">{row.persen}%</td>
                            <td className="py-2 px-3 text-right font-mono text-white font-bold">{formatRupiah(row.nominal)}</td>
                            <td className="py-2 px-3 text-center font-mono text-slate-300">{row.personel}</td>
                            <td className="py-2 px-3 text-right font-mono text-blue-300">{formatRupiah(row.rataRata)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Rincian Personel Dewan Pengawas (Dewas) */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Distribusi Personel Dewan Pengawas (Dewas RSUD)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Total Dewas: Rp 7.107.593 (15,3% Porsi Penyesuaian Risiko)
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">Nama Pegawai / Anggota Dewas</th>
                            <th className="py-2 px-3">Jabatan Dewan Pengawas</th>
                            <th className="py-2 px-3 text-right">Porsi (%)</th>
                            <th className="py-2 px-3 text-right">Penyesuaian Beban Kerja (Rp)</th>
                            <th className="py-2 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                          <tr className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-bold text-white font-sans">drg. Rochmat Koesbiantoro, M.Kes</td>
                            <td className="py-2 px-3 text-amber-300 font-sans">Ketua Dewan Pengawas</td>
                            <td className="py-2 px-3 text-right text-amber-400">6,40%</td>
                            <td className="py-2 px-3 text-right font-black text-amber-300">Rp 3.316.877</td>
                            <td className="py-2 px-3 text-center font-sans"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Aktif</span></td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-bold text-white font-sans">M. Yenny Dewi Sitinjak, SE</td>
                            <td className="py-2 px-3 text-amber-300 font-sans">Anggota Dewan Pengawas (Anggota 1)</td>
                            <td className="py-2 px-3 text-right text-amber-400">3,65%</td>
                            <td className="py-2 px-3 text-right font-black text-amber-300">Rp 1.895.358</td>
                            <td className="py-2 px-3 text-center font-sans"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Aktif</span></td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-bold text-white font-sans">Syarifah Zahra, SKM, MARS</td>
                            <td className="py-2 px-3 text-amber-300 font-sans">Anggota Dewan Pengawas (Anggota 2)</td>
                            <td className="py-2 px-3 text-right text-amber-400">3,65%</td>
                            <td className="py-2 px-3 text-right font-black text-amber-300">Rp 1.895.358</td>
                            <td className="py-2 px-3 text-center font-sans"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Aktif</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* PILAR 2: JASA LANGSUNG (Revenue Center) */}
          {(filterKategori === 'all' || filterKategori === 'jl') && (
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
              
              <div 
                onClick={() => toggleSection('jl')}
                className="p-4 sm:p-5 bg-gradient-to-r from-[#172554]/50 to-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-blue-950/40 transition border-b border-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-blue-950 text-emerald-400 border border-blue-800">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-white">2. Revenue Center (Jasa Langsung)</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {kalkulasi.jasaLangsung.persenDariJaspel}% dari Pagu JP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Perawat, Medis (Dokter Umum, Spesialis, Psikiater), dan Nakes Lain (Tarif & Non-Tarif)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Total Jasa Langsung</span>
                    <p className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                      {formatRupiah(kalkulasi.jasaLangsung.totalJL)}
                    </p>
                  </div>
                  {expandedSection.jl ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {expandedSection.jl && (
                <div className="p-4 sm:p-6 space-y-6">
                  
                  {/* Top 3 Kelompok Klinis */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Perawat */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-blue-300">Keperawatan & Kebidanan</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 font-mono text-amber-300">
                          {kalkulasi.jasaLangsung.perawat.persen}% dari JL
                        </span>
                      </div>
                      <p className="text-lg font-black text-white font-mono mt-1.5">
                        {formatRupiah(kalkulasi.jasaLangsung.perawat.nominal)}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                        <span>{kalkulasi.jasaLangsung.perawat.personel} Perawat</span>
                        <span>@ {formatRupiah(kalkulasi.jasaLangsung.perawat.rataRata)}</span>
                      </div>
                    </div>

                    {/* Dokter / Medis */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-blue-300">Dokter & Medis Spesialis</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 font-mono text-amber-300">
                          {kalkulasi.jasaLangsung.medis.persen}% dari JL
                        </span>
                      </div>
                      <p className="text-lg font-black text-emerald-400 font-mono mt-1.5">
                        {formatRupiah(kalkulasi.jasaLangsung.medis.total)}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                        <span>{kalkulasi.jasaLangsung.medis.personel} Dokter</span>
                        <span>Umum, Psikiater & Non-Psikiatri</span>
                      </div>
                    </div>

                    {/* Nakes Lain */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-blue-300">Nakes Lainnya & Penunjang</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 font-mono text-amber-300">
                          {kalkulasi.jasaLangsung.nakesLain.persen}% dari JL
                        </span>
                      </div>
                      <p className="text-lg font-black text-white font-mono mt-1.5">
                        {formatRupiah(kalkulasi.jasaLangsung.nakesLain.total)}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                        <span>{kalkulasi.jasaLangsung.nakesLain.personel} Staf Klinis</span>
                        <span>10 Profesi Pelayanan</span>
                      </div>
                    </div>

                  </div>

                  {/* Sub-Rincian Dokter Medis */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                      Rincian Alokasi Tenaga Medis (Dokter)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Dokter Umum (27,6%):</span>
                        <p className="font-bold text-white font-mono text-sm mt-0.5">
                          {formatRupiah(kalkulasi.jasaLangsung.medis.dokterUmum.nominal)}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {kalkulasi.jasaLangsung.medis.dokterUmum.personel} Dokter (@ {formatRupiah(kalkulasi.jasaLangsung.medis.dokterUmum.rataRata)})
                        </span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Dokter Spesialis Psikiater (48,0%):</span>
                        <p className="font-bold text-emerald-400 font-mono text-sm mt-0.5">
                          {formatRupiah(kalkulasi.jasaLangsung.medis.psikiater.nominal)}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {kalkulasi.jasaLangsung.medis.psikiater.personel} Dokter (@ {formatRupiah(kalkulasi.jasaLangsung.medis.psikiater.rataRata)})
                        </span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Spesialis Non-Psikiatri (14,4%):</span>
                        <p className="font-bold text-white font-mono text-sm mt-0.5">
                          {formatRupiah(kalkulasi.jasaLangsung.medis.spesialisNonPsikiatri.nominal)}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {kalkulasi.jasaLangsung.medis.spesialisNonPsikiatri.personel} Dokter (@ {formatRupiah(kalkulasi.jasaLangsung.medis.spesialisNonPsikiatri.rataRata)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Rincian Nakes Lain: Pelayanan Tarif (86%) vs Non-Tarif (14%) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Tarif */}
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                          Pelayanan dengan Tarif (86,0%)
                        </h4>
                        <span className="text-xs font-bold font-mono text-white">
                          {formatRupiah(kalkulasi.jasaLangsung.nakesLain.tarif.total)}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800 text-xs">
                        {kalkulasi.jasaLangsung.nakesLain.tarif.items.map((it, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-white">{it.nama}</span>
                              <span className="text-[10px] text-slate-400 ml-2">({it.personel} Staf)</span>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-white font-bold">{formatRupiah(it.nominal)}</span>
                              <span className="text-[10px] text-slate-400 block">{it.persen}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Non-Tarif */}
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Pelayanan Non-Tarif (14,0%)
                        </h4>
                        <span className="text-xs font-bold font-mono text-white">
                          {formatRupiah(kalkulasi.jasaLangsung.nakesLain.nonTarif.total)}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800 text-xs">
                        {kalkulasi.jasaLangsung.nakesLain.nonTarif.items.map((it, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-white">{it.nama}</span>
                              <span className="text-[10px] text-slate-400 ml-2">({it.personel} Staf)</span>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-white font-bold">{formatRupiah(it.nominal)}</span>
                              <span className="text-[10px] text-slate-400 block">{it.persen}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* VIEW 2: EVALUASI REALISASI VS PAGU (21 KELOMPOK) */}
      {activeSubView === 'evaluasi' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                <span>Tabel Evaluasi & Monitoring Selisih Jaspel</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-900/80 text-blue-200">
                  {kalkulasi.evaluasiList.length} Kelompok
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Perbandingan Realisasi Pengeluaran Jaspel terhadap Pagu resmi RSUD dan sisa efisiensi anggaran.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Selisih Efisiensi:</span>
                <p className={`font-black font-mono text-sm ${kalkulasi.totalSelisih >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatRupiah(kalkulasi.totalSelisih)}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Kelompok Layanan / Profesi</th>
                  <th className="py-3 px-3.5 text-right">Realisasi (Rp)</th>
                  <th className="py-3 px-3.5 text-right">Pagu Alokasi (Rp)</th>
                  <th className="py-3 px-3.5 text-right">Selisih Anggaran (Rp)</th>
                  <th className="py-3 px-3.5">Keterangan Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {kalkulasi.evaluasiList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3.5 font-semibold text-white">{row.kelompok}</td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-slate-200">{formatRupiah(row.realisasi)}</td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-white font-bold">{formatRupiah(row.pagu)}</td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-bold">
                      <span className={row.selisih >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatRupiah(row.selisih)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.selisih >= 0 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      }`}>
                        {row.keterangan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950/90 font-bold text-xs border-t-2 border-slate-700">
                <tr>
                  <td className="py-3 px-3.5 text-amber-400 uppercase">Total Akumulasi</td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-200">{formatRupiah(kalkulasi.totalRealisasi)}</td>
                  <td className="py-3 px-3.5 text-right font-mono text-white">{formatRupiah(kalkulasi.totalPaguEvaluasi)}</td>
                  <td className="py-3 px-3.5 text-right font-mono text-emerald-400">{formatRupiah(kalkulasi.totalSelisih)}</td>
                  <td className="py-3 px-3.5 text-slate-400 text-[11px]">Sisa Anggaran Efisien</td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      )}

      {/* VIEW 3: RIWAYAT REALISASI PENDAPATAN BULANAN (JANUARI - DESEMBER) */}
      {activeSubView === 'bulanan' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-5">
          
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
              <span>Tabel Realisasi Pendapatan & Pagu Jaspel 40% (Jan - Des)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Riwayat realisasi pendapatan BLUD dan pembentukan pagu Jasa Pelayanan 40% per bulan sesuai dokumen resmi RSUD.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Periode Bulan</th>
                  <th className="py-3 px-3.5 text-right">Nilai Pendapatan (Rp)</th>
                  <th className="py-3 px-3.5 text-center">Porsi (%)</th>
                  <th className="py-3 px-3.5 text-right">Pagu Jasa Pelayanan (Rp)</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {REALISASI_BULANAN_RSUD.map((b, idx) => (
                  <tr key={idx} className={`hover:bg-slate-800/40 ${b.bulan === 'Juli' ? 'bg-blue-950/30' : ''}`}>
                    <td className="py-2.5 px-3.5 font-bold text-white flex items-center space-x-2">
                      <span>{b.bulan}</span>
                      {b.bulan === 'Juli' && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                          Sampel CSV
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-white font-bold">
                      {formatRupiah(b.pendapatan)}
                    </td>
                    <td className="py-2.5 px-3.5 text-center font-mono text-amber-400 font-bold">
                      {b.persentasePorsi}%
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-amber-300 font-bold">
                      {formatRupiah(b.porsiJaspel)}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'Realisasi' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        onClick={() => {
                          setPendapatanInput(b.pendapatan);
                          setPorsiJaspelPersen(b.persentasePorsi);
                          setActiveSubView('distribusi');
                          setNotification(`Memuat data bulan ${b.bulan} (Pendapatan: ${formatRupiah(b.pendapatan)})`);
                          setTimeout(() => setNotification(null), 3000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800 text-[11px] font-semibold transition"
                      >
                        Gunakan Periode Ini
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-300">
              Total Realisasi Pendapatan s/d Juli:{' '}
              <strong className="text-white font-mono">{formatRupiah(DATA_MAKRO_RSUD.totalRealisasiPendapatanSdJuli)}</strong>
            </div>
            <div className="text-slate-300">
              Total Realisasi Pagu Jaspel (40%):{' '}
              <strong className="text-amber-400 font-mono">{formatRupiah(DATA_MAKRO_RSUD.totalRealisasiJaspelSdJuli)}</strong>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
