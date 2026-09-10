import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  ShieldAlert, 
  Users, 
  Building2, 
  Stethoscope, 
  Award, 
  Filter,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { GeneralIndexItem, CostCenterItem, RevenueCenterItem, User } from '../types';
import { formatRupiah, formatNumber, formatPercentage } from '../utils/calculations';
import { exportToCSV } from '../utils/exportImport';
import { INSTALASI_LAYANAN_LIST } from '../data/initialData';

interface DatabaseManagerProps {
  generalIndexList: GeneralIndexItem[];
  setGeneralIndexList: React.Dispatch<React.SetStateAction<GeneralIndexItem[]>>;
  costCenterList: CostCenterItem[];
  setCostCenterList: React.Dispatch<React.SetStateAction<CostCenterItem[]>>;
  revenueCenterList: RevenueCenterItem[];
  setRevenueCenterList: React.Dispatch<React.SetStateAction<RevenueCenterItem[]>>;
  currentUser: User;
  subTab?: 'general' | 'cost' | 'revenue';
  setSubTab?: (tab: 'general' | 'cost' | 'revenue') => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  generalIndexList,
  setGeneralIndexList,
  costCenterList,
  setCostCenterList,
  revenueCenterList,
  setRevenueCenterList,
  currentUser,
  subTab,
  setSubTab
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'general' | 'cost' | 'revenue'>('general');
  const activeSubTab = subTab !== undefined ? subTab : internalSubTab;
  const setActiveSubTab = (tab: 'general' | 'cost' | 'revenue') => {
    if (setSubTab) setSubTab(tab);
    setInternalSubTab(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<GeneralIndexItem | null>(null);

  const [showCostModal, setShowCostModal] = useState(false);
  const [editingCost, setEditingCost] = useState<CostCenterItem | null>(null);

  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<RevenueCenterItem | null>(null);

  // Forms state
  const [indexForm, setIndexForm] = useState<Omit<GeneralIndexItem, 'id'>>({
    kode: 'GI-009',
    namaPegawai: '',
    nip: '',
    unitKerja: 'Instalasi Gawat Darurat (IGD)',
    golongan: 'III/c - Penata',
    pendidikan: 'D4 / S1',
    masaKerjaTahun: 10,
    skorDasar: 80,
    skorKompetensi: 70,
    skorRisiko: 75,
    skorKinerja: 85,
    bobotPresensi: 98,
    statusPegawai: 'PNS'
  });

  const [costForm, setCostForm] = useState<Omit<CostCenterItem, 'id'>>({
    kodeCostCenter: 'CC-GEN-06',
    namaPusatBiaya: '',
    kategori: 'Operasional Penunjang',
    alokasiAnggaranBulanan: 100000000,
    realisasiBiaya: 90000000,
    penanggungJawab: '',
    status: 'Aktif',
    keterangan: ''
  });

  const [revenueForm, setRevenueForm] = useState<Omit<RevenueCenterItem, 'id'>>({
    kodeRevenueCenter: 'RC-GEN-07',
    namaPusatLayanan: '',
    kategoriLayanan: 'Instalasi Gawat Darurat (IGD)',
    targetPendapatanBulanan: 500000000,
    realisasiPendapatan: 520000000,
    persentasePencapaian: 104,
    proporsiRetensiJaspel: 42,
    kepalaUnit: '',
    jumlahPasienBulanIni: 1000
  });

  const canEdit = ['superadmin', 'perumus'].includes(currentUser?.role || 'staf');

  // Filtered lists
  const filteredGeneral = generalIndexList.filter(item => 
    item.namaPegawai.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nip.includes(searchQuery) ||
    item.unitKerja.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCost = costCenterList.filter(item => 
    item.namaPusatBiaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kodeCostCenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.penanggungJawab.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRevenue = revenueCenterList.filter(item => 
    item.namaPusatLayanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kodeRevenueCenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kepalaUnit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers for General Index
  const handleSaveIndex = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex) {
      setGeneralIndexList(generalIndexList.map(i => i.id === editingIndex.id ? { ...indexForm, id: i.id } : i));
    } else {
      setGeneralIndexList([...generalIndexList, { ...indexForm, id: `idx-${Date.now()}` }]);
    }
    setShowIndexModal(false);
  };

  const handleDeleteIndex = (id: string) => {
    if (confirm('Hapus pegawai dari master General Index?')) {
      setGeneralIndexList(generalIndexList.filter(i => i.id !== id));
    }
  };

  // Handlers for Cost Center
  const handleSaveCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCost) {
      setCostCenterList(costCenterList.map(c => c.id === editingCost.id ? { ...costForm, id: c.id } : c));
    } else {
      setCostCenterList([...costCenterList, { ...costForm, id: `cc-${Date.now()}` }]);
    }
    setShowCostModal(false);
  };

  const handleDeleteCost = (id: string) => {
    if (confirm('Hapus Cost Center ini?')) {
      setCostCenterList(costCenterList.filter(c => c.id !== id));
    }
  };

  // Handlers for Revenue Center
  const handleSaveRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    const percent = Number(((revenueForm.realisasiPendapatan / (revenueForm.targetPendapatanBulanan || 1)) * 100).toFixed(1));
    const payload = { ...revenueForm, persentasePencapaian: percent };

    if (editingRevenue) {
      setRevenueCenterList(revenueCenterList.map(r => r.id === editingRevenue.id ? { ...payload, id: r.id } : r));
    } else {
      setRevenueCenterList([...revenueCenterList, { ...payload, id: `rc-${Date.now()}` }]);
    }
    setShowRevenueModal(false);
  };

  const handleDeleteRevenue = (id: string) => {
    if (confirm('Hapus Revenue Center ini?')) {
      setRevenueCenterList(revenueCenterList.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Banner & Header */}
      <div className="bg-gradient-to-r from-[#172554] via-[#0f1d38] to-[#1e3a8a] rounded-3xl p-5 sm:p-7 border border-blue-700/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                DATABASE MANAJER
              </span>
              <span className="text-xs text-blue-200 font-medium">Master Data Rumah Sakit & BLUD</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              General Index, Cost Center & Revenue Center
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl mt-1">
              Pondasi utama rumus alokasi jasa pelayanan: skor dasar SDM, pusat biaya beban tetap, dan unit penghasil pendapatan.
            </p>
          </div>

          {/* Quick Export Master */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (activeSubTab === 'general') exportToCSV(generalIndexList as any, 'HALO_JASPEL_GENERAL_INDEX');
                if (activeSubTab === 'cost') exportToCSV(costCenterList as any, 'HALO_JASPEL_COST_CENTER');
                if (activeSubTab === 'revenue') exportToCSV(revenueCenterList as any, 'HALO_JASPEL_REVENUE_CENTER');
              }}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-blue-950/80 hover:bg-blue-900 text-amber-300 text-xs font-bold border border-blue-800 transition shadow"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Unduh CSV Sub-Tabel</span>
            </button>
          </div>
        </div>

        {/* Database Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-blue-900/60">
          <div 
            onClick={() => setActiveSubTab('general')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeSubTab === 'general' 
                ? 'bg-blue-900/70 border-blue-400 shadow-lg shadow-blue-950/50' 
                : 'bg-[#0b142b]/80 border-blue-900/60 hover:border-blue-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-blue-300">1. GENERAL INDEX</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {generalIndexList.length} Pegawai
            </p>
            <p className="text-[11px] text-blue-200/80 mt-0.5">
              Rata-rata Skor: {(generalIndexList.reduce((acc, c) => acc + (c.skorDasar + c.skorKompetensi + c.skorRisiko + c.skorKinerja), 0) / (generalIndexList.length || 1)).toFixed(0)} Poin
            </p>
          </div>

          <div 
            onClick={() => setActiveSubTab('cost')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeSubTab === 'cost' 
                ? 'bg-blue-900/70 border-blue-400 shadow-lg shadow-blue-950/50' 
                : 'bg-[#0b142b]/80 border-blue-900/60 hover:border-blue-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-blue-300">2. COST CENTER</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1 truncate">
              {formatRupiah(costCenterList.reduce((acc, c) => acc + c.realisasiBiaya, 0))}
            </p>
            <p className="text-[11px] text-blue-200/80 mt-0.5">
              {costCenterList.length} Pos Biaya & Beban Tetap
            </p>
          </div>

          <div 
            onClick={() => setActiveSubTab('revenue')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeSubTab === 'revenue' 
                ? 'bg-emerald-950/70 border-emerald-400 shadow-lg shadow-emerald-950/50' 
                : 'bg-[#0b142b]/80 border-blue-900/60 hover:border-blue-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-blue-300">3. REVENUE CENTER</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1 truncate">
              {formatRupiah(revenueCenterList.reduce((acc, c) => acc + c.realisasiPendapatan, 0))}
            </p>
            <p className="text-[11px] text-emerald-400 mt-0.5 font-semibold">
              {revenueCenterList.length} Unit Layanan Klinis
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation & Search Bar */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Sub-Tabs Button Group */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('general')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeSubTab === 'general'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>General Index</span>
            </button>

            <button
              onClick={() => setActiveSubTab('cost')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeSubTab === 'cost'
                  ? 'bg-blue-900 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Cost Center</span>
            </button>

            <button
              onClick={() => setActiveSubTab('revenue')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeSubTab === 'revenue'
                  ? 'bg-emerald-900 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Revenue Center</span>
            </button>
          </div>

          {/* Search and Add Record */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari dalam database..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            {canEdit && (
              <button
                onClick={() => {
                  if (activeSubTab === 'general') {
                    setEditingIndex(null);
                    setShowIndexModal(true);
                  } else if (activeSubTab === 'cost') {
                    setEditingCost(null);
                    setShowCostModal(true);
                  } else {
                    setEditingRevenue(null);
                    setShowRevenueModal(true);
                  }
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Data</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: GENERAL INDEX TABLE */}
        {activeSubTab === 'general' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Nama & NIP</th>
                  <th className="py-3.5 px-3">Unit Kerja</th>
                  <th className="py-3.5 px-3">Golongan & Masa</th>
                  <th className="py-3.5 px-3 text-center">Dasar</th>
                  <th className="py-3.5 px-3 text-center">Kompetensi</th>
                  <th className="py-3.5 px-3 text-center">Risiko</th>
                  <th className="py-3.5 px-3 text-center">Kinerja</th>
                  <th className="py-3.5 px-3 text-center font-bold text-amber-400">Total Skor</th>
                  <th className="py-3.5 px-3 text-center">Presensi</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  {canEdit && <th className="py-3.5 px-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredGeneral.map((item) => {
                  const total = item.skorDasar + item.skorKompetensi + item.skorRisiko + item.skorKinerja;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs sm:text-sm">{item.namaPegawai}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIP. {item.nip}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{item.unitKerja}</td>
                      <td className="py-3 px-3 text-slate-300">
                        <div>{item.golongan}</div>
                        <div className="text-[10px] text-slate-400">{item.masaKerjaTahun} Tahun • {item.pendidikan}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{item.skorDasar}</td>
                      <td className="py-3 px-3 text-center font-mono">{item.skorKompetensi}</td>
                      <td className="py-3 px-3 text-center font-mono">{item.skorRisiko}</td>
                      <td className="py-3 px-3 text-center font-mono">{item.skorKinerja}</td>
                      <td className="py-3 px-3 text-center font-mono font-black text-amber-400 text-xs sm:text-sm">
                        {total}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-emerald-400 font-semibold">{item.bobotPresensi}%</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                          {item.statusPegawai}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingIndex(item);
                                setIndexForm(item);
                                setShowIndexModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteIndex(item.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: COST CENTER TABLE */}
        {activeSubTab === 'cost' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Pusat Biaya / Unit</th>
                  <th className="py-3.5 px-3">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Anggaran Bulanan</th>
                  <th className="py-3.5 px-4 text-right font-bold text-rose-400">Realisasi Biaya</th>
                  <th className="py-3.5 px-3">Penanggung Jawab</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  {canEdit && <th className="py-3.5 px-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredCost.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs sm:text-sm">{item.namaPusatBiaya}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.kodeCostCenter}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.kategori}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formatRupiah(item.alokasiAnggaranBulanan)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {formatRupiah(item.realisasiBiaya)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.penanggungJawab}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Aktif' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        item.status === 'Monitoring' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingCost(item);
                              setCostForm(item);
                              setShowCostModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCost(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: REVENUE CENTER TABLE */}
        {activeSubTab === 'revenue' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Instalasi / Layanan</th>
                  <th className="py-3.5 px-4 text-right">Target Pendapatan</th>
                  <th className="py-3.5 px-4 text-right font-bold text-emerald-400">Realisasi Pendapatan</th>
                  <th className="py-3.5 px-3 text-center">Capaian %</th>
                  <th className="py-3.5 px-3 text-center">Retensi JP</th>
                  <th className="py-3.5 px-3">Kepala Unit</th>
                  <th className="py-3.5 px-3 text-center">Pasien</th>
                  {canEdit && <th className="py-3.5 px-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredRevenue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs sm:text-sm">{item.namaPusatLayanan}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.kodeRevenueCenter} • {item.kategoriLayanan}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formatRupiah(item.targetPendapatanBulanan)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatRupiah(item.realisasiPendapatan)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span className={item.persentasePencapaian >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.persentasePencapaian}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-400 font-bold">
                      {item.proporsiRetensiJaspel}%
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.kepalaUnit}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {formatNumber(item.jumlahPasienBulanIni)}
                    </td>
                    {canEdit && (
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingRevenue(item);
                              setRevenueForm(item);
                              setShowRevenueModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRevenue(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL 1: ADD/EDIT GENERAL INDEX */}
      {showIndexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingIndex ? 'Ubah Data General Index' : 'Tambah Pegawai ke General Index'}
              </h3>
              <button onClick={() => setShowIndexModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveIndex} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Nama Pegawai</label>
                  <input
                    type="text"
                    required
                    value={indexForm.namaPegawai}
                    onChange={e => setIndexForm({ ...indexForm, namaPegawai: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">NIP Pegawai</label>
                  <input
                    type="text"
                    required
                    value={indexForm.nip}
                    onChange={e => setIndexForm({ ...indexForm, nip: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Unit Kerja</label>
                  <input
                    type="text"
                    required
                    value={indexForm.unitKerja}
                    onChange={e => setIndexForm({ ...indexForm, unitKerja: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Golongan</label>
                  <input
                    type="text"
                    value={indexForm.golongan}
                    onChange={e => setIndexForm({ ...indexForm, golongan: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 text-[9px] uppercase font-bold">Skor Dasar</label>
                  <input
                    type="number"
                    value={indexForm.skorDasar}
                    onChange={e => setIndexForm({ ...indexForm, skorDasar: Number(e.target.value) })}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] uppercase font-bold">Kompetensi</label>
                  <input
                    type="number"
                    value={indexForm.skorKompetensi}
                    onChange={e => setIndexForm({ ...indexForm, skorKompetensi: Number(e.target.value) })}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] uppercase font-bold">Risiko</label>
                  <input
                    type="number"
                    value={indexForm.skorRisiko}
                    onChange={e => setIndexForm({ ...indexForm, skorRisiko: Number(e.target.value) })}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-[9px] uppercase font-bold">Kinerja</label>
                  <input
                    type="number"
                    value={indexForm.skorKinerja}
                    onChange={e => setIndexForm({ ...indexForm, skorKinerja: Number(e.target.value) })}
                    className="w-full p-1.5 bg-slate-900 border border-amber-400/40 rounded-lg text-amber-300 font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Masa Kerja (Tahun)</label>
                  <input
                    type="number"
                    value={indexForm.masaKerjaTahun}
                    onChange={e => setIndexForm({ ...indexForm, masaKerjaTahun: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Presensi (%)</label>
                  <input
                    type="number"
                    value={indexForm.bobotPresensi}
                    onChange={e => setIndexForm({ ...indexForm, bobotPresensi: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIndexModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  Simpan Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT COST CENTER */}
      {showCostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingCost ? 'Ubah Data Cost Center' : 'Tambah Cost Center Baru'}
              </h3>
              <button onClick={() => setShowCostModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCost} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Nama Pusat Biaya</label>
                <input
                  type="text"
                  required
                  value={costForm.namaPusatBiaya}
                  onChange={e => setCostForm({ ...costForm, namaPusatBiaya: e.target.value })}
                  placeholder="Contoh: Operasional SIMRS / Listrik Medis"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Anggaran Bulanan (Rp)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={costForm.alokasiAnggaranBulanan}
                    onChange={e => setCostForm({ ...costForm, alokasiAnggaranBulanan: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Realisasi Biaya (Rp)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={costForm.realisasiBiaya}
                    onChange={e => setCostForm({ ...costForm, realisasiBiaya: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-rose-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={costForm.penanggungJawab}
                    onChange={e => setCostForm({ ...costForm, penanggungJawab: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Status</label>
                  <select
                    value={costForm.status}
                    onChange={e => setCostForm({ ...costForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Kritis">Kritis</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowCostModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500">Simpan Biaya</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD/EDIT REVENUE CENTER */}
      {showRevenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingRevenue ? 'Ubah Data Revenue Center' : 'Tambah Revenue Center Baru'}
              </h3>
              <button onClick={() => setShowRevenueModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveRevenue} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Nama Pusat Layanan</label>
                <input
                  type="text"
                  required
                  value={revenueForm.namaPusatLayanan}
                  onChange={e => setRevenueForm({ ...revenueForm, namaPusatLayanan: e.target.value })}
                  placeholder="Contoh: Instalasi Hemodialisa 24 Jam"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Target Pendapatan (Rp)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={revenueForm.targetPendapatanBulanan}
                    onChange={e => setRevenueForm({ ...revenueForm, targetPendapatanBulanan: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Realisasi Pendapatan (Rp)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={revenueForm.realisasiPendapatan}
                    onChange={e => setRevenueForm({ ...revenueForm, realisasiPendapatan: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Retensi Jaspel Unit (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={revenueForm.proporsiRetensiJaspel}
                    onChange={e => setRevenueForm({ ...revenueForm, proporsiRetensiJaspel: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Kepala Unit</label>
                  <input
                    type="text"
                    value={revenueForm.kepalaUnit}
                    onChange={e => setRevenueForm({ ...revenueForm, kepalaUnit: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowRevenueModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500">Simpan Revenue</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
