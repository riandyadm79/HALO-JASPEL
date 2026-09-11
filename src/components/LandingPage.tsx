import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Wallet, 
  Building2, 
  Users, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  Sun, 
  Moon, 
  Activity, 
  Layers, 
  ChevronRight,
  Calculator,
  Receipt,
  Scale
} from 'lucide-react';
import { AlokasiJaspel, CostCenterItem, RevenueCenterItem, PenerimaAlokasi } from '../types';
import { HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from './HospitalProfileModal';
import { useTheme } from '../context/ThemeContext';
import { formatRupiah, formatPercentage, formatNumber } from '../utils/calculations';

interface LandingPageProps {
  onGoToLogin: () => void;
  alokasiList: AlokasiJaspel[];
  costCenterList: CostCenterItem[];
  revenueCenterList: RevenueCenterItem[];
  penerimaList: PenerimaAlokasi[];
  hospitalProfile?: HospitalProfile;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  alokasiList,
  costCenterList,
  revenueCenterList,
  penerimaList,
  hospitalProfile = DEFAULT_HOSPITAL_PROFILE
}) => {
  const { theme, toggleTheme } = useTheme();
  const [activeVisualTab, setActiveVisualTab] = useState<'tren' | 'proporsi' | 'cost'>('tren');

  // KPI Calculations
  const totalPendapatanKotor = useMemo(() => 
    alokasiList.reduce((acc, curr) => acc + (curr.pendapatanKotor || 0), 0),
    [alokasiList]
  );

  const totalPaguJaspel = useMemo(() => 
    alokasiList.reduce((acc, curr) => acc + (curr.paguJaspelNetto || 0), 0),
    [alokasiList]
  );

  const totalBebanOperasional = useMemo(() => 
    costCenterList.reduce((acc, curr) => acc + (curr.realisasiBiaya || 0), 0),
    [costCenterList]
  );

  const totalPegawaiAktif = useMemo(() => 
    penerimaList.length > 0 ? penerimaList.length : 148,
    [penerimaList]
  );

  // Chart Data: Monthly Trends
  const trendData = useMemo(() => {
    return alokasiList.map(item => ({
      periode: `${item.bulan} ${item.tahun}`,
      bulan: item.bulan,
      pendapatan: item.pendapatanKotor,
      paguJaspel: item.paguJaspelNetto,
      biayaOperasional: item.biayaOperasionalRs,
      medis: Math.round((item.paguJaspelNetto * (item.jasaMedisKlinisPersen || 60)) / 100),
      nonMedis: Math.round((item.paguJaspelNetto * (item.jasaNonKlinisPersen || 30)) / 100),
      manajemen: Math.round((item.paguJaspelNetto * (item.jasaManajemenPersen || 10)) / 100)
    }));
  }, [alokasiList]);

  // Chart Data: Pie Distribution
  const pieAlokasiData = useMemo(() => [
    { name: 'Jasa Medis & Klinis (60%)', value: 60, color: '#3b82f6' },
    { name: 'Jasa Keperawatan & Non-Klinis (30%)', value: 30, color: '#10b981' },
    { name: 'Jasa Manajemen & Penunjang (10%)', value: 10, color: '#f59e0b' }
  ], []);

  // Cost center summary
  const costCenterChartData = useMemo(() => {
    return costCenterList.slice(0, 6).map(c => ({
      name: c.namaPusatBiaya.length > 18 ? c.namaPusatBiaya.slice(0, 16) + '...' : c.namaPusatBiaya,
      anggaran: c.alokasiAnggaranBulanan,
      realisasi: c.realisasiBiaya
    }));
  }, [costCenterList]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
      
      {/* 1. Public Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0c1633]/95 border-b border-blue-900/50 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#1e3a8a] to-[#0f172a] border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-950/60">
                <span className="font-black text-amber-300 text-lg sm:text-xl tracking-tighter">
                  {hospitalProfile.hospitalName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                    {hospitalProfile.hospitalName}
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-900/80 text-blue-200 border border-blue-700/60">
                    {hospitalProfile.badgeText || 'BLUD'}
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/70 hidden sm:block font-medium">
                  {hospitalProfile.subtitle || 'Portal Transparansi Remunerasi & Alokasi Jasa Pelayanan RS'}
                </p>
              </div>
            </div>

            {/* Actions: Theme Toggle & Login CTA */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all shadow-sm ${
                  theme === 'light'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-blue-950/80 text-amber-300 border-blue-800 hover:border-amber-400'
                }`}
                title="Ganti Tema Tampilan"
              >
                {theme === 'light' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold hidden sm:inline text-amber-950">Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold hidden sm:inline text-amber-300">Gelap</span>
                  </>
                )}
              </button>

              {/* Login Button */}
              <button
                onClick={onGoToLogin}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Lock className="w-4 h-4" />
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 border-b border-blue-900/30">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-bold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sistem Terintegrasi Sesuai Regulasi BLUD & Permenkes</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Transparansi & Akuntabilitas <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                Alokasi Jasa Pelayanan RSUD
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Platform tata kelola remunerasi digital modern untuk perhitungan, verifikasi berkas, pembagian proporsi jasa medis dan non-klinis, serta pencetakan slip jaspel secara transparan dan akurat.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onGoToLogin}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <span>Buka Dashboard & Login Pegawai</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                href="#visualisasi-transparansi"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Lihat Visualisasi Transparansi</span>
              </a>
            </div>
          </div>

          {/* 3. Executive Summary KPI Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 sm:mt-16">
            
            <div className="p-5 rounded-2xl bg-[#0c1633] border border-blue-900/60 shadow-xl relative overflow-hidden group hover:border-amber-400/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pendapatan RS</span>
                <div className="p-2 rounded-xl bg-blue-900/50 text-blue-300">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-black text-white font-mono">
                  {formatRupiah(totalPendapatanKotor)}
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Klaim Terverifikasi BLUD</span>
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1633] border border-blue-900/60 shadow-xl relative overflow-hidden group hover:border-amber-400/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pagu Jaspel Netto</span>
                <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {formatRupiah(totalPaguJaspel)}
                </p>
                <p className="text-[11px] text-slate-300 font-medium mt-1">
                  Proporsi 42% dari Pendapatan Netto
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1633] border border-blue-900/60 shadow-xl relative overflow-hidden group hover:border-amber-400/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Realisasi Beban RS</span>
                <div className="p-2 rounded-xl bg-rose-950/50 text-rose-300">
                  <Calculator className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-black text-slate-200 font-mono">
                  {formatRupiah(totalBebanOperasional)}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Cost Center & Operasional BLUD
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1633] border border-blue-900/60 shadow-xl relative overflow-hidden group hover:border-amber-400/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Penerima Remunerasi</span>
                <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-300">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-black text-white font-mono">
                  {formatNumber(totalPegawaiAktif)} <span className="text-sm font-sans font-bold text-slate-400">Pegawai</span>
                </p>
                <p className="text-[11px] text-blue-300 font-medium mt-1">
                  Medis, Nakes & Non-Klinis
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. VISUALISASI & DASHBOARD TRANSPARANSI (Moved to Landing) */}
      <section id="visualisasi-transparansi" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Transparansi Visual Rumah Sakit</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Visualisasi Pendapatan, Pagu & Beban Layanan
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Grafik dinamis real-time pembagian jasa pelayanan dan kinerja pos keuangan rumah sakit.
            </p>
          </div>

          {/* Visualization Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveVisualTab('tren')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeVisualTab === 'tren' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tren Bulanan</span>
            </button>
            <button
              onClick={() => setActiveVisualTab('proporsi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeVisualTab === 'proporsi' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Proporsi Alokasi</span>
            </button>
            <button
              onClick={() => setActiveVisualTab('cost')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeVisualTab === 'cost' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Cost Center</span>
            </button>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="bg-[#0c1633] rounded-3xl p-6 sm:p-8 border border-blue-900/60 shadow-2xl">
          
          {activeVisualTab === 'tren' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Tren Pendapatan Kotor vs Pagu Jaspel Netto</h4>
                  <p className="text-xs text-slate-400">Komparasi alokasi bulanan periode berjalan</p>
                </div>
                <div className="flex items-center space-x-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> Pendapatan Kotor
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span> Pagu Jaspel Netto
                  </span>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPagu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="bulan" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis 
                      stroke="#64748b" 
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}M`} 
                    />
                    <Tooltip 
                      formatter={(val: any) => [formatRupiah(Number(val)), '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="pendapatan" name="Pendapatan Kotor RS" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPendapatan)" />
                    <Area type="monotone" dataKey="paguJaspel" name="Pagu Jaspel Netto" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPagu)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeVisualTab === 'proporsi' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieAlokasiData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieAlokasiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`${val}%`, 'Proporsi']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Standar Pembagian Pagu Jaspel BLUD</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Berdasarkan formula bobot skor indeks remunerasi rumah sakit, pagu netto didistribusikan secara proporsional ke seluruh unit layanan:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-bold text-white">Jasa Medis & Tindakan Klinis</span>
                    </div>
                    <span className="font-mono font-bold text-blue-300">60%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-white">Keperawatan, Kebidanan & Nakes Lain</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300">30%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="font-bold text-white">Manajemen, Administrasi & Penunjang</span>
                    </div>
                    <span className="font-mono font-bold text-amber-300">10%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeVisualTab === 'cost' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Distribusi Anggaran vs Realisasi Pusat Biaya (Cost Center)</h4>
                  <p className="text-xs text-slate-400">Monitoring efisiensi beban operasional rumah sakit</p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costCenterChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis 
                      stroke="#64748b" 
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}M`} 
                    />
                    <Tooltip 
                      formatter={(val: any) => [formatRupiah(Number(val)), '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="anggaran" name="Alokasi Anggaran" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="realisasi" name="Realisasi Biaya" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

      </section>

      {/* 5. Features Grid Section */}
      <section className="py-12 bg-slate-950/60 border-y border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-white">
              Fitur Lengkap Tata Kelola Jasa Pelayanan
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Dirancang khusus untuk memenuhi standar administrasi keuangan BLUD modern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/50 text-blue-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Slip Jaspel Online Pribadi</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Staf dapat mengakses dan mencetak rincian poin kinerja, potongan PPh 21, dan nominal netto jasa pelayanan langsung dari perangkat masing-masing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/50 text-amber-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Rekap & Cetak Laporan Resmi</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fasilitas cetak laporan terintegrasi per periode, per alokasi, per tabel, dan per kelompok jasa lengkap dengan kop surat dan lembar pengesahan direktur.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/50 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Database Terpusat & RLS</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penyimpanan aman di Supabase dengan enkripsi Role-Based Access Control (RBAC) dan pemisahan hak akses Direktur, Tim Perumus, PIC Unit, dan Staf.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-8 border-t border-slate-800 bg-[#07090e] text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 HALO JASPEL — Sistem Alokasi Jasa Pelayanan & Database Manajer RSUD (BLUD). Seluruh Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500">
            <span>Standar Permendagri No. 79/2018</span>
            <span>•</span>
            <span>Peraturan Direktur Remunerasi BLUD</span>
            <span>•</span>
            <span>Keamanan Supabase Cloud</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
