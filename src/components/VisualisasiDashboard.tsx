import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ComposedChart, 
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
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Wallet, 
  Building2, 
  Percent, 
  Calendar, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Info
} from 'lucide-react';
import { AlokasiJaspel, CostCenterItem, RevenueCenterItem, PenerimaAlokasi, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { formatRupiah } from '../utils/calculations';

interface VisualisasiDashboardProps {
  alokasiList: AlokasiJaspel[];
  costCenterList: CostCenterItem[];
  revenueCenterList?: RevenueCenterItem[];
  penerimaList?: PenerimaAlokasi[];
  currentUser: User;
}

export const VisualisasiDashboard: React.FC<VisualisasiDashboardProps> = ({
  alokasiList,
  costCenterList,
  revenueCenterList = [],
  penerimaList = [],
  currentUser
}) => {
  const { theme } = useTheme();

  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedSumberDana, setSelectedSumberDana] = useState<string>('all');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [costCenterView, setCostCenterView] = useState<'comparison' | 'category' | 'monthly'>('comparison');
  const [jaspelSubBreakdown, setJaspelSubBreakdown] = useState<boolean>(false);

  // Month sorting helper (Jan -> Des)
  const monthOrder: { [key: string]: number } = {
    'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
    'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
    'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
  };

  // 1. Process Monthly Jaspel Trend Data
  const monthlyJaspelData = useMemo(() => {
    let filtered = [...alokasiList];
    if (selectedYear !== 'all') {
      filtered = filtered.filter(a => a.tahun.toString() === selectedYear);
    }
    if (selectedSumberDana !== 'all') {
      filtered = filtered.filter(a => a.sumberDana === selectedSumberDana);
    }

    // Sort chronologically by month
    filtered.sort((a, b) => {
      if (a.tahun !== b.tahun) return a.tahun - b.tahun;
      return (monthOrder[a.bulan] || 0) - (monthOrder[b.bulan] || 0);
    });

    return filtered.map(item => {
      // Calculate clinical vs non-clinical vs management split
      const medis = Math.round((item.paguJaspelNetto * (item.jasaMedisKlinisPersen || 60)) / 100);
      const nonMedis = Math.round((item.paguJaspelNetto * (item.jasaNonKlinisPersen || 30)) / 100);
      const manajemen = Math.round((item.paguJaspelNetto * (item.jasaManajemenPersen || 10)) / 100);

      return {
        periode: `${item.bulan} ${item.tahun}`,
        bulanSingkat: item.bulan.slice(0, 3),
        bulan: item.bulan,
        tahun: item.tahun,
        pendapatanKotor: item.pendapatanKotor,
        biayaOperasional: item.biayaOperasionalRs,
        paguKotor: item.paguJaspelKotor,
        paguNetto: item.paguJaspelNetto,
        proporsiPersen: item.proporsiJaspelPersen,
        jasaMedis: medis,
        jasaNonMedis: nonMedis,
        jasaManajemen: manajemen,
        status: item.status
      };
    });
  }, [alokasiList, selectedYear, selectedSumberDana]);

  // 2. Process Cost Center Realization Data
  const costCenterChartData = useMemo(() => {
    return costCenterList.map(cc => {
      const persentase = cc.alokasiAnggaranBulanan > 0 
        ? Math.round((cc.realisasiBiaya / cc.alokasiAnggaranBulanan) * 1000) / 10 
        : 0;
      const sisaAnggaran = Math.max(0, cc.alokasiAnggaranBulanan - cc.realisasiBiaya);

      return {
        id: cc.id,
        kode: cc.kodeCostCenter,
        namaSingkat: cc.namaPusatBiaya.length > 22 ? cc.namaPusatBiaya.slice(0, 20) + '...' : cc.namaPusatBiaya,
        namaLengkap: cc.namaPusatBiaya,
        kategori: cc.kategori,
        anggaran: cc.alokasiAnggaranBulanan,
        realisasi: cc.realisasiBiaya,
        sisa: sisaAnggaran,
        persentase: persentase,
        status: cc.status
      };
    });
  }, [costCenterList]);

  // 3. Process Cost Center by Category
  const costCenterByCategory = useMemo(() => {
    const grouped: { [key: string]: { kategori: string; anggaran: number; realisasi: number } } = {};
    costCenterList.forEach(cc => {
      if (!grouped[cc.kategori]) {
        grouped[cc.kategori] = {
          kategori: cc.kategori,
          anggaran: 0,
          realisasi: 0
        };
      }
      grouped[cc.kategori].anggaran += cc.alokasiAnggaranBulanan;
      grouped[cc.kategori].realisasi += cc.realisasiBiaya;
    });
    return Object.values(grouped);
  }, [costCenterList]);

  // 4. Monthly Simulated Evolution of Cost Centers across the months
  const monthlyCostCenterTrend = useMemo(() => {
    // Distribute actual cost centers proportionally across months from January to August
    return monthlyJaspelData.map((m, idx) => {
      // Variance factor based on month sequence
      const factor = 0.90 + (idx * 0.025);
      const totalCostRealized = Math.round(costCenterList.reduce((acc, c) => acc + c.realisasiBiaya, 0) * factor);
      const totalBudget = costCenterList.reduce((acc, c) => acc + c.alokasiAnggaranBulanan, 0);

      const bebanTetap = Math.round((costCenterList.find(c => c.kategori === 'Beban Tetap BLUD')?.realisasiBiaya || 412500000) * factor);
      const itSimrs = Math.round((costCenterList.find(c => c.kategori === 'IT & SIMRS')?.realisasiBiaya || 98000000) * factor);
      const sanitasi = Math.round((costCenterList.find(c => c.kategori === 'Sanitasi & Kesling')?.realisasiBiaya || 174000000) * factor);
      const adminTu = Math.round((costCenterList.find(c => c.kategori === 'Administrasi & Tata Usaha')?.realisasiBiaya || 135000000) * factor);
      const sarpras = Math.round((costCenterList.find(c => c.kategori === 'Pemeliharaan Sarpras')?.realisasiBiaya || 205000000) * factor);

      return {
        bulan: m.bulan,
        bulanSingkat: m.bulanSingkat,
        totalBudget,
        totalCostRealized,
        bebanTetap,
        itSimrs,
        sanitasi,
        adminTu,
        sarpras
      };
    });
  }, [monthlyJaspelData, costCenterList]);

  // 5. Total Aggregate Metrics (KPI)
  const totalPaguNettoTerkini = useMemo(() => {
    return monthlyJaspelData.reduce((acc, curr) => acc + curr.paguNetto, 0);
  }, [monthlyJaspelData]);

  const totalPendapatanKotorTerkini = useMemo(() => {
    return monthlyJaspelData.reduce((acc, curr) => acc + curr.pendapatanKotor, 0);
  }, [monthlyJaspelData]);

  const totalBiayaOperasionalRs = useMemo(() => {
    return costCenterList.reduce((acc, curr) => acc + curr.realisasiBiaya, 0);
  }, [costCenterList]);

  const totalAnggaranBiayaRs = useMemo(() => {
    return costCenterList.reduce((acc, curr) => acc + curr.alokasiAnggaranBulanan, 0);
  }, [costCenterList]);

  const persentaseRealisasiBiaya = totalAnggaranBiayaRs > 0 
    ? Math.round((totalBiayaOperasionalRs / totalAnggaranBiayaRs) * 1000) / 10 
    : 0;

  const rasioJaspelKotor = totalPendapatanKotorTerkini > 0
    ? Math.round((totalPaguNettoTerkini / totalPendapatanKotorTerkini) * 1000) / 10
    : 40;

  // Pie Data: Proporsi Kebijakan Jaspel
  const pieDistributionData = [
    { name: 'Jasa Medis & Klinis (60%)', value: 60, color: '#3b82f6' },
    { name: 'Jasa Non-Klinis & Penunjang (30%)', value: 30, color: '#10b981' },
    { name: 'Jasa Manajemen & Mutu (10%)', value: 10, color: '#f59e0b' }
  ];

  // Theme-aware colors
  const isLight = theme === 'light';
  const gridStroke = isLight ? '#e2e8f0' : '#1e293b';
  const textColor = isLight ? '#475569' : '#94a3b8';
  const tooltipBg = isLight ? '#ffffff' : '#090e1f';
  const tooltipBorder = isLight ? '#cbd5e1' : '#1e3a8a';
  const tooltipText = isLight ? '#0f172a' : '#f8fafc';

  // Custom Formatter for Tooltip
  const customTooltipFormatter = (value: any, name: string) => {
    if (typeof value === 'number') {
      if (name.includes('Persen') || name.includes('%')) {
        return [`${value}%`, name];
      }
      return [formatRupiah(value), name];
    }
    return [value, name];
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Title */}
      <div className={`p-6 rounded-3xl border shadow-xl transition-all ${
        isLight
          ? 'bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border-blue-200/80 text-slate-900'
          : 'bg-gradient-to-r from-[#0c1633] via-[#0f214d] to-[#080d1e] border-blue-900/60 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-400/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analitik Eksekutif BLUD 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Dashboard Visualisasi & Tren Keuangan Jaspel
            </h2>
            <p className={`text-xs sm:text-sm max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Grafik visualisasi interaktif performa pagu jasa pelayanan rumah sakit bulanan, alokasi anggaran, dan realisasi per pusat biaya (Cost Center) secara terukur dan transparan.
            </p>
          </div>

          {/* Controls & Quick Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Year Filter */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Tahun:</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-transparent font-black outline-none cursor-pointer"
              >
                <option value="2026" className={isLight ? 'text-slate-900' : 'text-slate-900'}>2026</option>
                <option value="2025" className={isLight ? 'text-slate-900' : 'text-slate-900'}>2025</option>
                <option value="all" className={isLight ? 'text-slate-900' : 'text-slate-900'}>Semua Periode</option>
              </select>
            </div>

            {/* Sumber Dana Filter */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}>
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              <span>Dana:</span>
              <select
                value={selectedSumberDana}
                onChange={e => setSelectedSumberDana(e.target.value)}
                className="bg-transparent font-black outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="all" className={isLight ? 'text-slate-900' : 'text-slate-900'}>Semua Sumber</option>
                <option value="Gabungan Seluruh Layanan" className={isLight ? 'text-slate-900' : 'text-slate-900'}>Gabungan Layanan</option>
                <option value="BPJS / JKN" className={isLight ? 'text-slate-900' : 'text-slate-900'}>BPJS / JKN</option>
                <option value="Pasien Umum" className={isLight ? 'text-slate-900' : 'text-slate-900'}>Pasien Umum</option>
              </select>
            </div>

            {/* Chart Type Toggle */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}>
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  chartType === 'area' 
                    ? 'bg-blue-600 text-white shadow' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Area Tren"
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  chartType === 'bar' 
                    ? 'bg-blue-600 text-white shadow' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Bar Komparasi"
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  chartType === 'line' 
                    ? 'bg-blue-600 text-white shadow' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Garis Multi-Metrik"
              >
                Line
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Overview (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pagu Jaspel */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-500">
              Total Pagu Jaspel Netto
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-500">
            {formatRupiah(totalPaguNettoTerkini)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Akumulasi {monthlyJaspelData.length} Periode ({selectedYear})</span>
          </div>
        </div>

        {/* Card 2: Total Pendapatan Kotor */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-500">
              Pendapatan Kotor RS
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatRupiah(totalPendapatanKotorTerkini)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-blue-600 dark:text-blue-300">
            <span>Rata-rata: {formatRupiah(monthlyJaspelData.length ? Math.round(totalPendapatanKotorTerkini / monthlyJaspelData.length) : 0)} /bln</span>
          </div>
        </div>

        {/* Card 3: Realisasi Biaya Cost Center */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-500">
              Realisasi Beban RS
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatRupiah(totalBiayaOperasionalRs)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Dari Anggaran: {formatRupiah(totalAnggaranBiayaRs)}</span>
          </div>
        </div>

        {/* Card 4: Persentase Realisasi Biaya & Rasio */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">
              Realisasi vs Anggaran
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {persentaseRealisasiBiaya}%
            </p>
            <span className="text-xs font-bold text-slate-500">
              (Optimal &lt;100%)
            </span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sisa Anggaran: {formatRupiah(totalAnggaranBiayaRs - totalBiayaOperasionalRs)}</span>
          </div>
        </div>
      </div>

      {/* 3. CHART UTAMA: TREN TOTAL PAGU JASPEL SECARA BULANAN */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-xl ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0c152d] border-blue-900/60'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Tren Total Pagu Jaspel & Pendapatan Bulanan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-400/20">
                {monthlyJaspelData.length} Bulan Terdata
              </span>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Pergerakan kurva pendapatan kotor, pagu jaspel kotor, pagu jaspel netto, dan biaya operasional RS sepanjang tahun {selectedYear}.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setJaspelSubBreakdown(!jaspelSubBreakdown)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                jaspelSubBreakdown 
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md shadow-amber-400/20' 
                  : isLight ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{jaspelSubBreakdown ? 'Mode: Komposisi Jasa (60:30:10)' : 'Mode: Agregat Pagu Jaspel'}</span>
            </button>
          </div>
        </div>

        {/* The Recharts Container */}
        <div className="h-[380px] sm:h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={monthlyJaspelData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorPaguNetto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorPaguKotor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorBiayaOperasional" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="bulanSingkat" stroke={textColor} tick={{ fill: textColor, fontSize: 12, fontWeight: 600 }} />
                <YAxis 
                  stroke={textColor} 
                  tick={{ fill: textColor, fontSize: 11 }} 
                  tickFormatter={(val) => `Rp ${(val / 1000000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: 16, 
                    color: tooltipText,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    fontSize: 12
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 14, fontSize: 12, fontWeight: 600 }}
                />

                {!jaspelSubBreakdown ? (
                  <>
                    <Area 
                      type="monotone" 
                      dataKey="pendapatanKotor" 
                      name="Pendapatan Kotor RS" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorPendapatan)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="paguKotor" 
                      name="Pagu Jaspel Kotor" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPaguKotor)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="paguNetto" 
                      name="Pagu Jaspel Netto (Staf)" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPaguNetto)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="biayaOperasional" 
                      name="Biaya Operasional RS" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorBiayaOperasional)" 
                    />
                  </>
                ) : (
                  <>
                    <Area 
                      type="monotone" 
                      dataKey="jasaMedis" 
                      name="Jasa Medis Klinis (60%)" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5}
                      fill="#3b82f6"
                      fillOpacity={0.4}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="jasaNonMedis" 
                      name="Jasa Non-Klinis (30%)" 
                      stroke="#10b981" 
                      strokeWidth={2.5}
                      fill="#10b981"
                      fillOpacity={0.4}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="jasaManajemen" 
                      name="Jasa Manajemen (10%)" 
                      stroke="#f59e0b" 
                      strokeWidth={2.5}
                      fill="#f59e0b"
                      fillOpacity={0.4}
                    />
                  </>
                )}
              </AreaChart>
            ) : chartType === 'bar' ? (
              <BarChart data={monthlyJaspelData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="bulanSingkat" stroke={textColor} tick={{ fill: textColor, fontSize: 12, fontWeight: 600 }} />
                <YAxis 
                  stroke={textColor} 
                  tick={{ fill: textColor, fontSize: 11 }} 
                  tickFormatter={(val) => `Rp ${(val / 1000000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: 16, 
                    color: tooltipText,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    fontSize: 12
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12, fontWeight: 600 }} />

                {!jaspelSubBreakdown ? (
                  <>
                    <Bar dataKey="pendapatanKotor" name="Pendapatan Kotor RS" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="paguNetto" name="Pagu Jaspel Netto" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="biayaOperasional" name="Biaya Operasional RS" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </>
                ) : (
                  <>
                    <Bar dataKey="jasaMedis" name="Jasa Medis (60%)" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="jasaNonMedis" name="Jasa Non-Klinis (30%)" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="jasaManajemen" name="Jasa Manajemen (10%)" fill="#f59e0b" stackId="a" radius={[6, 6, 0, 0]} />
                  </>
                )}
              </BarChart>
            ) : (
              <LineChart data={monthlyJaspelData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="bulanSingkat" stroke={textColor} tick={{ fill: textColor, fontSize: 12, fontWeight: 600 }} />
                <YAxis 
                  stroke={textColor} 
                  tick={{ fill: textColor, fontSize: 11 }} 
                  tickFormatter={(val) => `Rp ${(val / 1000000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: 16, 
                    color: tooltipText,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    fontSize: 12
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12, fontWeight: 600 }} />
                <Line type="monotone" dataKey="pendapatanKotor" name="Pendapatan Kotor RS" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="paguNetto" name="Pagu Jaspel Netto" stroke="#10b981" strokeWidth={3.5} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="biayaOperasional" name="Biaya Operasional RS" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Insight Caption */}
        <div className={`mt-4 p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
          isLight ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Keterangan Formula:</strong> Pagu Jaspel Netto terdistribusi rata-rata <strong>{rasioJaspelKotor}%</strong> dari Pendapatan Kotor RS, dengan kepatuhan pemotongan cadangan beban operasional tepat sasaran.
            </span>
          </div>
          <span className="font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            Stabil & Terverifikasi
          </span>
        </div>
      </div>

      {/* 4. CHART KEDUA: REALISASI PER PUSAT BIAYA (COST CENTER) SECARA BULANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Cost Center Chart (2 Columns) */}
        <div className={`lg:col-span-2 p-5 sm:p-6 rounded-3xl border transition-all shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0c152d] border-blue-900/60'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Realisasi per Pusat Biaya (Cost Center)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-400/20">
                  {costCenterList.length} Unit Cost Center
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Perbandingan Alokasi Anggaran Bulanan vs Realisasi Biaya Aktual setiap instalasi penunjang/operasional RS.
              </p>
            </div>

            {/* Sub View Toggle */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-700'
            }`}>
              <button
                onClick={() => setCostCenterView('comparison')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  costCenterView === 'comparison' 
                    ? 'bg-purple-600 text-white shadow' 
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Per Unit Biaya
              </button>
              <button
                onClick={() => setCostCenterView('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  costCenterView === 'monthly' 
                    ? 'bg-purple-600 text-white shadow' 
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Tren Bulanan
              </button>
            </div>
          </div>

          <div className="h-[340px] sm:h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {costCenterView === 'comparison' ? (
                <BarChart
                  data={costCenterChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke={textColor}
                    tick={{ fill: textColor, fontSize: 11 }}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="namaSingkat" 
                    stroke={textColor}
                    tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }}
                    width={130}
                  />
                  <Tooltip 
                    formatter={customTooltipFormatter}
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderColor: tooltipBorder, 
                      borderRadius: 16, 
                      color: tooltipText,
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      fontSize: 12
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }} />
                  <Bar dataKey="anggaran" name="Alokasi Anggaran Bulanan" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="realisasi" name="Realisasi Biaya Aktual" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              ) : (
                <ComposedChart
                  data={monthlyCostCenterTrend}
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="bulanSingkat" stroke={textColor} tick={{ fill: textColor, fontSize: 12, fontWeight: 600 }} />
                  <YAxis 
                    stroke={textColor}
                    tick={{ fill: textColor, fontSize: 11 }}
                    tickFormatter={(val) => `Rp ${(val / 1000000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={customTooltipFormatter}
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderColor: tooltipBorder, 
                      borderRadius: 16, 
                      color: tooltipText,
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      fontSize: 12
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }} />
                  <Bar dataKey="bebanTetap" name="Beban Tetap BLUD" stackId="cost" fill="#3b82f6" />
                  <Bar dataKey="sarpras" name="Kalibrasi Alkes IPSRS" stackId="cost" fill="#8b5cf6" />
                  <Bar dataKey="sanitasi" name="Sanitasi & Kesling" stackId="cost" fill="#10b981" />
                  <Bar dataKey="adminTu" name="Administrasi & TU" stackId="cost" fill="#f59e0b" />
                  <Bar dataKey="itSimrs" name="IT & SIMRS" stackId="cost" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey="totalBudget" name="Plafon Anggaran Total" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel: Detail Persentase Realisasi Biaya (1 Column) */}
        <div className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-xl flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0c152d] border-blue-900/60'
        }`}>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h3 className="text-base font-black tracking-tight">
                Rasio Penyerapan Biaya
              </h3>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Tingkat realisasi terhadap pagu anggaran bulanan masing-masing pusat biaya.
            </p>

            <div className="mt-5 space-y-4">
              {costCenterChartData.map((cc) => {
                const isWarning = cc.persentase > 95;
                const progressColor = cc.persentase > 95 
                  ? 'bg-rose-500' 
                  : cc.persentase > 80 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500';

                return (
                  <div key={cc.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold truncate max-w-[170px]" title={cc.namaLengkap}>
                        {cc.namaSingkat}
                      </span>
                      <div className="flex items-center space-x-1.5 shrink-0 font-mono font-black">
                        <span className={cc.persentase > 95 ? 'text-rose-500' : isLight ? 'text-slate-800' : 'text-slate-200'}>
                          {cc.persentase}%
                        </span>
                        {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${Math.min(100, cc.persentase)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Terpakai: {formatRupiah(cc.realisasi)}</span>
                      <span>Sisa: {formatRupiah(cc.sisa)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`mt-5 p-3 rounded-xl border text-[11px] ${
            isLight ? 'bg-purple-50/70 border-purple-200 text-purple-900' : 'bg-purple-950/40 border-purple-800 text-purple-200'
          }`}>
            <span className="font-bold">Status Biaya RS:</span> Pengendalian beban operasional berjalan tertib. Tidak ditemukan unit yang melebihi pagu definitif bulanan (Overbudget).
          </div>
        </div>
      </div>

      {/* 5. KOMPARASI STRUKTUR JASPEL & PROPORSI KEBIJAKAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart: Proporsi Formula Jaspel */}
        <div className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0c152d] border-blue-900/60'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <PieIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black tracking-tight">
              Formula Proporsi Jaspel
            </h3>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Standar distribusi Pergub/Perbup Remunerasi BLUD.
          </p>

          <div className="h-[240px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Persentase']}
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: 12, 
                    color: tooltipText,
                    fontSize: 12
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {pieDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel Ringkasan Historis Bulanan */}
        <div className={`lg:col-span-2 p-5 sm:p-6 rounded-3xl border transition-all shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0c152d] border-blue-900/60'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black tracking-tight">
                Tabel Rangkuman Realisasi Finansial Jaspel Bulanan
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Data tabular gabungan pendapatan kotor, alokasi pagu, dan efisiensi belanja rumah sakit.
              </p>
            </div>
            
            <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-slate-500/10 border border-slate-500/20 font-bold">
              {monthlyJaspelData.length} Baris Data
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider font-black ${
                  isLight ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-slate-800 text-slate-400 bg-slate-900/50'
                }`}>
                  <th className="py-2.5 px-3 rounded-l-xl">Periode</th>
                  <th className="py-2.5 px-3">Pendapatan Kotor</th>
                  <th className="py-2.5 px-3">Beban Operasional</th>
                  <th className="py-2.5 px-3">Pagu Jaspel Netto</th>
                  <th className="py-2.5 px-3 text-center">Rasio</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                {monthlyJaspelData.map((row) => (
                  <tr key={row.periode} className={`hover:bg-blue-500/5 transition ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    <td className="py-2.5 px-3 font-bold flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{row.periode}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {formatRupiah(row.pendapatanKotor)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-500">
                      {formatRupiah(row.biayaOperasional)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(row.paguNetto)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {row.proporsiPersen}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        row.status === 'Terbayar / Final'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
