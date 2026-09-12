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
  PieChart,
  Sliders,
  Calculator,
  HelpCircle,
  Check,
  Sparkles,
  Code,
  Info,
  Printer
} from 'lucide-react';
import { 
  GeneralIndexItem, 
  CostCenterItem, 
  RevenueCenterItem, 
  IndeksJasaLangsungItem,
  IndeksJasaHeaderConfig,
  User 
} from '../types';
import { formatRupiah, formatNumber, formatPercentage, evaluateJpFormula } from '../utils/calculations';
import { supabase } from "../lib/supabase";
import { exportToCSV } from '../utils/exportImport';
import { INSTALASI_LAYANAN_LIST, DEFAULT_INDEKS_JASA_HEADER_CONFIG, INITIAL_INDEKS_JASA_LANGSUNG } from '../data/initialData';
import { CurrencyInput } from './CurrencyInput';
import { ConfirmModal } from './ConfirmModal';
import { IndeksJasaLangsungManager } from './IndeksJasaLangsungManager';

interface DatabaseManagerProps {
  generalIndexList: GeneralIndexItem[];
  setGeneralIndexList: React.Dispatch<React.SetStateAction<GeneralIndexItem[]>>;
  costCenterList: CostCenterItem[];
  setCostCenterList: React.Dispatch<React.SetStateAction<CostCenterItem[]>>;
  revenueCenterList: RevenueCenterItem[];
  setRevenueCenterList: React.Dispatch<React.SetStateAction<RevenueCenterItem[]>>;
  indeksJasaList?: IndeksJasaLangsungItem[];
  setIndeksJasaList?: React.Dispatch<React.SetStateAction<IndeksJasaLangsungItem[]>>;
  indeksJasaHeaderConfig?: IndeksJasaHeaderConfig;
  setIndeksJasaHeaderConfig?: React.Dispatch<React.SetStateAction<IndeksJasaHeaderConfig>>;
  currentUser: User;
  subTab?: 'general' | 'cost' | 'revenue' | 'indeks_jasa';
  setSubTab?: (tab: 'general' | 'cost' | 'revenue' | 'indeks_jasa') => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  generalIndexList,
  setGeneralIndexList,
  costCenterList,
  setCostCenterList,
  revenueCenterList,
  setRevenueCenterList,
  indeksJasaList,
  setIndeksJasaList,
  indeksJasaHeaderConfig,
  setIndeksJasaHeaderConfig,
  currentUser,
  subTab,
  setSubTab
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'general' | 'cost' | 'revenue' | 'indeks_jasa'>('general');
  const activeSubTab = subTab !== undefined ? subTab : internalSubTab;
  const setActiveSubTab = (tab: 'general' | 'cost' | 'revenue' | 'indeks_jasa') => {
    if (setSubTab) setSubTab(tab);
    setInternalSubTab(tab);
  };

  const [internalIndeksJasaList, setInternalIndeksJasaList] = useState<IndeksJasaLangsungItem[]>(INITIAL_INDEKS_JASA_LANGSUNG);
  const currentIndeksJasaList = indeksJasaList || internalIndeksJasaList;
  const updateIndeksJasaList = setIndeksJasaList || setInternalIndeksJasaList;

  const [internalHeaderConfig, setInternalHeaderConfig] = useState<IndeksJasaHeaderConfig>(DEFAULT_INDEKS_JASA_HEADER_CONFIG);
  const currentHeaderConfig = indeksJasaHeaderConfig || internalHeaderConfig;
  const updateHeaderConfig = setIndeksJasaHeaderConfig || setInternalHeaderConfig;

  const [searchQuery, setSearchQuery] = useState('');
  const [indeksJasaViewMode, setIndeksJasaViewMode] = useState<'rekap_kinerja_csv' | 'matriks_formula'>('rekap_kinerja_csv');

  // Modals state
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<GeneralIndexItem | null>(null);

  const [showCostModal, setShowCostModal] = useState(false);
  const [editingCost, setEditingCost] = useState<CostCenterItem | null>(null);

  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<RevenueCenterItem | null>(null);

  const [showIndeksJasaModal, setShowIndeksJasaModal] = useState(false);
  const [editingIndeksJasa, setEditingIndeksJasa] = useState<IndeksJasaLangsungItem | null>(null);

  const [showFormulaHeaderModal, setShowFormulaHeaderModal] = useState(false);
  const [tempHeaderConfig, setTempHeaderConfig] = useState<IndeksJasaHeaderConfig>(currentHeaderConfig);

  useEffect(() => {
    setTempHeaderConfig(currentHeaderConfig);
  }, [currentHeaderConfig]);

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

  const [indeksJasaForm, setIndeksJasaForm] = useState<Omit<IndeksJasaLangsungItem, 'id'>>({
    kode: 'IJL-007',
    instalasiLayanan: 'Instalasi Rawat Jalan (IRJ)',
    kategori: 'Pelayanan Medis',
    kinerja1: 100,
    kinerja2: 80,
    kinerja3: 90,
    totalPoin: 270,
    jumlahAlokasi: 200000000,
    rupiahPerPoin1: 150000,
    rupiahPerPoin2: 120000,
    nilaiJpLangsung: 0
  });

  const canEdit = ['superadmin', 'perumus', 'pic', 'input_medis', 'input_perawat', 'input_nakes_lain', 'input_psikiatri', 'input_spesialis'].includes(currentUser?.role || 'staf');

  // Modal konfirmasi custom yang aman untuk lingkungan iframe
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

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

  const filteredIndeksJasa = currentIndeksJasaList.filter(item => {
    const matchesSearch = 
      item.instalasiLayanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchQuery.toLowerCase());

    const role = currentUser?.role || 'staf';
    if (role === 'input_perawat') {
      return matchesSearch && (item.kategori.toLowerCase().includes('perawat') || item.instalasiLayanan.toLowerCase().includes('perawat'));
    }
    if (role === 'input_medis') {
      return matchesSearch && (item.kategori.toLowerCase().includes('medis') || item.instalasiLayanan.toLowerCase().includes('dokter'));
    }
    if (role === 'input_psikiatri') {
      return matchesSearch && (item.instalasiLayanan.toLowerCase().includes('psikiatri') || item.kategori.toLowerCase().includes('psikiatri'));
    }
    if (role === 'input_spesialis') {
      return matchesSearch && (item.instalasiLayanan.toLowerCase().includes('spesialis') || item.kategori.toLowerCase().includes('spesialis'));
    }
    if (role === 'input_nakes_lain') {
      return matchesSearch && (item.kategori.toLowerCase().includes('penunjang') || item.kategori.toLowerCase().includes('nakes'));
    }

    return matchesSearch;
  });

  // Handlers for General Index
  const handleSaveIndex = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingIndex ? editingIndex.id : `idx-${Date.now()}`;
    const payload = {
      id,
      kode: indexForm.kode,
      nama_pegawai: indexForm.namaPegawai,
      nip: indexForm.nip,
      unit_kerja: indexForm.unitKerja,
      golongan: indexForm.golongan,
      pendidikan: indexForm.pendidikan,
      masa_kerja_tahun: indexForm.masaKerjaTahun,
      skor_dasar: indexForm.skorDasar,
      skor_kompetensi: indexForm.skorKompetensi,
      skor_risiko: indexForm.skorRisiko,
      skor_kinerja: indexForm.skorKinerja,
      bobot_presensi: indexForm.bobotPresensi,
      status_pegawai: indexForm.statusPegawai
    };

    try {
      if (editingIndex) {
        await supabase.from('general_index').update(payload).eq('id', id);
        setGeneralIndexList(generalIndexList.map(i => i.id === id ? { ...indexForm, id } : i));
      } else {
        await supabase.from('general_index').insert([payload]);
        setGeneralIndexList([...generalIndexList, { ...indexForm, id }]);
      }
      setShowIndexModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data ke database');
    }
  };

  const handleDeleteIndex = (id: string, namaPegawai?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pegawai dari Master Index',
      message: `Apakah Anda yakin ingin menghapus data pegawai ${namaPegawai ? `"${namaPegawai}"` : ''} dari master General Index? Tindakan ini akan menghapus data dari daftar dan database.`,
      confirmText: 'Ya, Hapus Pegawai',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: async () => {
        setGeneralIndexList(prev => prev.filter(i => i.id !== id));
        try {
          await supabase.from('general_index').delete().eq('id', id);
        } catch (err) {
          console.error('Error deleting general index item:', err);
        }
      }
    });
  };

  // Handlers for Cost Center
  const handleSaveCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingCost ? editingCost.id : `cc-${Date.now()}`;
    const payload = {
      id,
      kode_cost_center: costForm.kodeCostCenter,
      nama_pusat_biaya: costForm.namaPusatBiaya,
      kategori: costForm.kategori,
      alokasi_anggaran_bulanan: costForm.alokasiAnggaranBulanan,
      realisasi_biaya: costForm.realisasiBiaya,
      penanggung_jawab: costForm.penanggungJawab,
      status: costForm.status,
      keterangan: costForm.keterangan
    };

    try {
      if (editingCost) {
        await supabase.from('cost_center').update(payload).eq('id', id);
        setCostCenterList(costCenterList.map(c => c.id === id ? { ...costForm, id } : c));
      } else {
        await supabase.from('cost_center').insert([payload]);
        setCostCenterList([...costCenterList, { ...costForm, id }]);
      }
      setShowCostModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan Cost Center');
    }
  };

  const handleDeleteCost = (id: string, namaPusatBiaya?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Cost Center (Pusat Biaya RS)',
      message: `Apakah Anda yakin ingin menghapus pusat biaya ${namaPusatBiaya ? `"${namaPusatBiaya}"` : ''}? Data biaya operasional ini akan dihapus dari sistem.`,
      confirmText: 'Ya, Hapus Sekarang',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: async () => {
        setCostCenterList(prev => prev.filter(c => c.id !== id));
        try {
          await supabase.from('cost_center').delete().eq('id', id);
        } catch (err) {
          console.error('Error deleting cost center:', err);
        }
      }
    });
  };

  // Handlers for Revenue Center
  const handleSaveRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    const percent = Number(((revenueForm.realisasiPendapatan / (revenueForm.targetPendapatanBulanan || 1)) * 100).toFixed(1));
    const newRevenueForm = { ...revenueForm, persentasePencapaian: percent };
    
    const id = editingRevenue ? editingRevenue.id : `rc-${Date.now()}`;
    const payload = {
      id,
      kode_revenue_center: newRevenueForm.kodeRevenueCenter,
      nama_pusat_layanan: newRevenueForm.namaPusatLayanan,
      kategori_layanan: newRevenueForm.kategoriLayanan,
      target_pendapatan_bulanan: newRevenueForm.targetPendapatanBulanan,
      realisasi_pendapatan: newRevenueForm.realisasiPendapatan,
      persentase_pencapaian: newRevenueForm.persentasePencapaian,
      proporsi_retensi_jaspel: newRevenueForm.proporsiRetensiJaspel,
      kepala_unit: newRevenueForm.kepalaUnit,
      jumlah_pasien_bulan_ini: newRevenueForm.jumlahPasienBulanIni
    };

    try {
      if (editingRevenue) {
        await supabase.from('revenue_center').update(payload).eq('id', id);
        setRevenueCenterList(revenueCenterList.map(r => r.id === id ? { ...newRevenueForm, id } : r));
      } else {
        await supabase.from('revenue_center').insert([payload]);
        setRevenueCenterList([...revenueCenterList, { ...newRevenueForm, id }]);
      }
      setShowRevenueModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan Revenue Center');
    }
  };

  const handleDeleteRevenue = (id: string, namaLayanan?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Revenue Center (Pusat Pendapatan)',
      message: `Apakah Anda yakin ingin menghapus Revenue Center ${namaLayanan ? `"${namaLayanan}"` : ''}?`,
      confirmText: 'Ya, Hapus Sekarang',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: async () => {
        setRevenueCenterList(prev => prev.filter(r => r.id !== id));
        try {
          await supabase.from('revenue_center').delete().eq('id', id);
        } catch (err) {
          console.error('Error deleting revenue center:', err);
        }
      }
    });
  };

  // Handlers for Indeks Jasa Langsung
  const handleSaveIndeksJasa = async (e: React.FormEvent) => {
    e.preventDefault();
    const computedJp = evaluateJpFormula(indeksJasaForm, currentHeaderConfig.formulaJpLangsung);
    const newForm = { ...indeksJasaForm, nilaiJpLangsung: computedJp };

    const id = editingIndeksJasa ? editingIndeksJasa.id : `ijl-${Date.now()}`;
    const updatedList = editingIndeksJasa 
      ? currentIndeksJasaList.map(i => i.id === id ? { ...newForm, id } : i)
      : [...currentIndeksJasaList, { ...newForm, id }];

    updateIndeksJasaList(updatedList);
    try {
      localStorage.setItem('halo_jaspel_indeks_jasa', JSON.stringify(updatedList));
    } catch (err) {
      console.warn('Local storage save error:', err);
    }

    setShowIndeksJasaModal(false);
  };

  const handleDeleteIndeksJasa = (id: string, namaPegawai?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Item Indeks Jasa Langsung',
      message: `Apakah Anda yakin ingin menghapus baris indeks jasa ${namaPegawai ? `"${namaPegawai}"` : ''}?`,
      confirmText: 'Ya, Hapus Item',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        const filtered = currentIndeksJasaList.filter(i => i.id !== id);
        updateIndeksJasaList(filtered);
        try {
          localStorage.setItem('halo_jaspel_indeks_jasa', JSON.stringify(filtered));
        } catch (err) {
          console.warn('Local storage save error:', err);
        }
      }
    });
  };

  const handleSaveHeaderAndFormula = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeaderConfig(tempHeaderConfig);
    try {
      localStorage.setItem('halo_jaspel_indeks_jasa_header_config', JSON.stringify(tempHeaderConfig));
    } catch (err) {
      console.warn('Local storage save error:', err);
    }
    setShowFormulaHeaderModal(false);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-blue-900/60">
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

          <div 
            onClick={() => setActiveSubTab('indeks_jasa')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeSubTab === 'indeks_jasa' 
                ? 'bg-amber-950/70 border-amber-400 shadow-lg shadow-amber-950/50' 
                : 'bg-[#0b142b]/80 border-blue-900/60 hover:border-blue-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-blue-300">4. INDEKS JASA LANGSUNG</span>
              <Stethoscope className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1 truncate">
              {formatRupiah(currentIndeksJasaList.reduce((acc, c) => acc + evaluateJpFormula(c, currentHeaderConfig.formulaJpLangsung), 0))}
            </p>
            <p className="text-[11px] text-amber-300 mt-0.5 font-semibold">
              {currentIndeksJasaList.length} Instalasi & Layanan
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation & Search Bar */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Sub-Tabs Button Group */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveSubTab('general')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
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
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
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
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeSubTab === 'revenue'
                  ? 'bg-emerald-900 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Revenue Center</span>
            </button>

            <button
              onClick={() => setActiveSubTab('indeks_jasa')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeSubTab === 'indeks_jasa'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Indeks Jasa Langsung</span>
            </button>
          </div>

          {/* Search, Formula Config & Add Record */}
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

            {activeSubTab === 'indeks_jasa' && canEdit && (
              <button
                onClick={() => {
                  setTempHeaderConfig(currentHeaderConfig);
                  setShowFormulaHeaderModal(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition active:scale-95 shrink-0"
                title="Kustomisasi Header Kolom & Formula Nilai JP Langsung"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Header & Formula</span>
              </button>
            )}

            {activeSubTab === 'general' && canEdit && (
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Reset Master Data RSUD',
                    message: 'Apakah Anda yakin ingin mereset dan mengosongkan General Index untuk memuat ulang dataset resmi RSUD lengkap?',
                    confirmText: 'Ya, Reset Data',
                    cancelText: 'Batal',
                    isDanger: false,
                    onConfirm: () => {
                      setGeneralIndexList([]);
                    }
                  });
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700 font-bold text-xs transition active:scale-95 shrink-0"
                title="Muat ulang tabel General Indeks resmi RSUD"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Reset Data RSUD</span>
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => {
                  if (activeSubTab === 'general') {
                    setEditingIndex(null);
                    setShowIndexModal(true);
                  } else if (activeSubTab === 'cost') {
                    setEditingCost(null);
                    setShowCostModal(true);
                  } else if (activeSubTab === 'revenue') {
                    setEditingRevenue(null);
                    setShowRevenueModal(true);
                  } else if (activeSubTab === 'indeks_jasa') {
                    setEditingIndeksJasa(null);
                    setIndeksJasaForm({
                      kode: `IJL-00${currentIndeksJasaList.length + 1}`,
                      instalasiLayanan: 'Instalasi Gawat Darurat (IGD)',
                      kategori: 'Pelayanan Medis',
                      kinerja1: 100,
                      kinerja2: 80,
                      kinerja3: 85,
                      totalPoin: 265,
                      jumlahAlokasi: 150000000,
                      rupiahPerPoin1: 150000,
                      rupiahPerPoin2: 120000,
                      nilaiJpLangsung: 0
                    });
                    setShowIndeksJasaModal(true);
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
                  <th className="py-3.5 px-4">Nama & Jabatan</th>
                  <th className="py-3.5 px-3">Ruangan / Unit</th>
                  <th className="py-3.5 px-3">Kelompok Jasa</th>
                  <th className="py-3.5 px-3 text-center">Skor Total</th>
                  <th className="py-3.5 px-3 text-right">Rp Total (MK+PD+Jab+dll)</th>
                  <th className="py-3.5 px-3 text-right">Post Remunerasi</th>
                  <th className="py-3.5 px-3 text-right text-amber-400 font-bold">Jaspel Total</th>
                  <th className="py-3.5 px-3 text-center">Administrasi %</th>
                  {canEdit && <th className="py-3.5 px-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredGeneral.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 11 : 10} className="py-16 text-center text-slate-400">
                      <div className="max-w-md mx-auto space-y-2">
                        <p className="font-semibold text-slate-300 text-sm">
                          {generalIndexList.length === 0
                            ? 'Belum ada data General Index Pegawai di Supabase'
                            : 'Tidak ada data pegawai yang cocok dengan kata kunci pencarian'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {generalIndexList.length === 0
                            ? 'Tabel murni kosong sesuai data asli. Silakan tambahkan pegawai baru dengan tombol "+ Tambah Pegawai" atau impor data berkas resmi.'
                            : 'Coba periksa kembali ejaan nama atau NIP yang dicari.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGeneral.map((item) => {
                  const rpTotalKinerja = (item.rpMk || 0) + (item.rpPd || 0) + (item.rpJab || 0) + (item.rpRis || 0) + (item.rpEmg || 0);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs sm:text-sm">{item.namaPegawai}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.jabatan || item.jabatanUnit || '-'}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div className="font-semibold text-xs">{item.ruangan || item.unitKerja || '-'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.kelompokPelayanan || '-'}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs text-blue-300 font-medium">
                          {item.kelompokJasa || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {Number(item.skorTotal || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {formatRupiah(rpTotalKinerja)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {formatRupiah(item.jaspelPostRemunerasi || 0)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-amber-400">
                        {formatRupiah(item.jaspelPostTotal || 0)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-emerald-400 font-semibold">{item.persenAdministrasi || '0%'}</span>
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
                              onClick={() => handleDeleteIndex(item.id, item.namaPegawai)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                              title="Hapus data pegawai"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                }))}
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
                {filteredCost.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="py-12 text-center text-slate-400">
                      <div className="max-w-md mx-auto space-y-2">
                        <p className="font-semibold text-slate-300 text-sm">
                          {costCenterList.length === 0
                            ? 'Belum ada data Cost Center tersimpan di database'
                            : 'Tidak ada Cost Center yang sesuai dengan pencarian'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {costCenterList.length === 0
                            ? 'Klik tombol "+ Tambah Cost Center" di atas untuk menambahkan pos beban RS.'
                            : 'Coba ubah kata kunci pencarian.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCost.map((item) => (
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
                              onClick={() => handleDeleteCost(item.id, item.namaPusatBiaya)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                              title="Hapus Cost Center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
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
                {filteredRevenue.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 8 : 7} className="py-12 text-center text-slate-400">
                      <div className="max-w-md mx-auto space-y-2">
                        <p className="font-semibold text-slate-300 text-sm">
                          {revenueCenterList.length === 0
                            ? 'Belum ada data Revenue Center tersimpan di database'
                            : 'Tidak ada Revenue Center yang sesuai dengan pencarian'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {revenueCenterList.length === 0
                            ? 'Klik tombol "+ Tambah Revenue Center" di atas untuk menambahkan unit penghasil pendapatan.'
                            : 'Coba ubah kata kunci pencarian.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRevenue.map((item) => (
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
                              onClick={() => handleDeleteRevenue(item.id, item.namaPusatLayanan)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                              title="Hapus Revenue Center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: INDEKS JASA LANGSUNG TABLE */}
        {activeSubTab === 'indeks_jasa' && (
          <div className="space-y-4">
            {/* View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 gap-2 shadow-md">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIndeksJasaViewMode('rekap_kinerja_csv')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
                    indeksJasaViewMode === 'rekap_kinerja_csv'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>1. Input Kinerja Pelayanan (CSV 10 Unit & 65 Staf)</span>
                </button>

                <button
                  onClick={() => setIndeksJasaViewMode('matriks_formula')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
                    indeksJasaViewMode === 'matriks_formula'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>2. Matriks Indeks Jasa & Formula Kustom</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono hidden md:inline-block pr-2">
                {indeksJasaViewMode === 'rekap_kinerja_csv' ? 'Mode: Rekapitulasi CSV Pelayanan' : 'Mode: Formula Dinamis'}
              </span>
            </div>

            {indeksJasaViewMode === 'rekap_kinerja_csv' ? (
              <IndeksJasaLangsungManager currentUser={currentUser} />
            ) : (
              <div className="space-y-4">
                {/* Active Formula Banner */}
                <div className="bg-[#0b162c] border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-inner">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-0.5">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-white text-xs uppercase tracking-wider">Formula Aritmatika Nilai JP Langsung (Customized)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">LIVE FORMULA</span>
                      </div>
                      <p className="font-mono text-amber-300 text-xs font-bold mt-1 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
                        {currentHeaderConfig.headerNilaiJpLangsung} = {currentHeaderConfig.formulaJpLangsung}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Header & formula dapat dikustomisasi secara interaktif. Nilai JP dihitung otomatis secara langsung per instalasi/layanan.
                      </p>
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => {
                        setTempHeaderConfig(currentHeaderConfig);
                        setShowFormulaHeaderModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition flex items-center space-x-1.5 shrink-0 self-start md:self-center"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Ubah Formula / Header</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 whitespace-nowrap">Instalasi & Layanan</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">{currentHeaderConfig.headerKinerja1}</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">{currentHeaderConfig.headerKinerja2}</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">{currentHeaderConfig.headerKinerja3}</th>
                        <th className="py-3.5 px-3 text-center font-bold text-blue-300 whitespace-nowrap">{currentHeaderConfig.headerTotalPoin}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{currentHeaderConfig.headerJumlahAlokasi}</th>
                        <th className="py-3.5 px-3 text-right whitespace-nowrap">{currentHeaderConfig.headerRupiahPerPoin1}</th>
                        <th className="py-3.5 px-3 text-right whitespace-nowrap">{currentHeaderConfig.headerRupiahPerPoin2}</th>
                        <th className="py-3.5 px-4 text-right font-black text-amber-300 bg-amber-950/30 whitespace-nowrap border-l border-amber-900/50">
                          {currentHeaderConfig.headerNilaiJpLangsung}
                        </th>
                        {canEdit && <th className="py-3.5 px-3 text-center whitespace-nowrap">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredIndeksJasa.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400">
                            Tidak ada data Indeks Jasa Langsung yang sesuai kriteria.
                          </td>
                        </tr>
                      ) : (
                        filteredIndeksJasa.map((item) => {
                          const calculatedJp = evaluateJpFormula(item, currentHeaderConfig.formulaJpLangsung);
                          return (
                            <tr key={item.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white text-xs sm:text-sm">{item.instalasiLayanan}</div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                                  <span>{item.kode}</span>
                                  <span>•</span>
                                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">{item.kategori}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-slate-300">{formatNumber(item.kinerja1)}</td>
                              <td className="py-3 px-3 text-center font-mono text-slate-300">{formatNumber(item.kinerja2)}</td>
                              <td className="py-3 px-3 text-center font-mono text-slate-300">{formatNumber(item.kinerja3)}</td>
                              <td className="py-3 px-3 text-center font-mono font-bold text-blue-300 bg-blue-950/20">{formatNumber(item.totalPoin)}</td>
                              <td className="py-3 px-4 text-right font-mono text-slate-300">{formatRupiah(item.jumlahAlokasi)}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-400">{formatRupiah(item.rupiahPerPoin1)}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-400">{formatRupiah(item.rupiahPerPoin2)}</td>
                              <td className="py-3 px-4 text-right font-mono font-black text-amber-300 bg-amber-950/30 text-sm border-l border-amber-900/50">
                                {formatRupiah(calculatedJp)}
                              </td>
                              {canEdit && (
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      onClick={() => {
                                        setEditingIndeksJasa(item);
                                        setIndeksJasaForm(item);
                                        setShowIndeksJasaModal(true);
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                      title="Ubah Data Indeks Jasa"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteIndeksJasa(item.id, item.namaPegawai)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                                      title="Hapus Data Indeks Jasa"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
                <CurrencyInput
                  value={costForm.alokasiAnggaranBulanan}
                  onChange={val => setCostForm({ ...costForm, alokasiAnggaranBulanan: val })}
                  placeholder="25000000"
                />
                <CurrencyInput
                  value={costForm.realisasiBiaya}
                  onChange={val => setCostForm({ ...costForm, realisasiBiaya: val })}
                  placeholder="21000000"
                />
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
                <CurrencyInput
                  value={revenueForm.targetPendapatanBulanan}
                  onChange={val => setRevenueForm({ ...revenueForm, targetPendapatanBulanan: val })}
                  placeholder="650000000"
                />
                <CurrencyInput
                  value={revenueForm.realisasiPendapatan}
                  onChange={val => setRevenueForm({ ...revenueForm, realisasiPendapatan: val })}
                  placeholder="720000000"
                />
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

      {/* MODAL 4: ADD/EDIT INDEKS JASA LANGSUNG */}
      {showIndeksJasaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  {editingIndeksJasa ? 'Ubah Data Indeks Jasa Langsung' : 'Tambah Indeks Jasa Langsung Baru'}
                </h3>
              </div>
              <button onClick={() => setShowIndeksJasaModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveIndeksJasa} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Kode / ID</label>
                  <input
                    type="text"
                    required
                    value={indeksJasaForm.kode}
                    onChange={e => setIndeksJasaForm({ ...indeksJasaForm, kode: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Kategori Layanan</label>
                  <select
                    value={indeksJasaForm.kategori}
                    onChange={e => setIndeksJasaForm({ ...indeksJasaForm, kategori: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-bold"
                  >
                    <option value="Pelayanan Medis">Pelayanan Medis</option>
                    <option value="Pelayanan Keperawatan">Pelayanan Keperawatan</option>
                    <option value="Pelayanan Penunjang">Pelayanan Penunjang</option>
                    <option value="Spesialis / Subspesialis">Spesialis / Subspesialis</option>
                    <option value="Layanan Khusus Jiwa / Psikiatri">Layanan Khusus Jiwa / Psikiatri</option>
                    <option value="Manajemen & Ketenagaan">Manajemen & Ketenagaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Nama Instalasi & Layanan</label>
                <input
                  type="text"
                  required
                  value={indeksJasaForm.instalasiLayanan}
                  onChange={e => setIndeksJasaForm({ ...indeksJasaForm, instalasiLayanan: e.target.value })}
                  placeholder="Contoh: Instalasi Rawat Jalan (IRJ) Spesialis"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              {/* Dynamic Kinerja inputs */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-extrabold text-blue-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Input Nilai Kinerja ({currentHeaderConfig.headerTotalPoin})</span>
                  <span className="text-amber-400 font-mono">Poin = Kinerja 1+2+3</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1 truncate">{currentHeaderConfig.headerKinerja1}</label>
                    <input
                      type="number"
                      required
                      value={indeksJasaForm.kinerja1}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        setIndeksJasaForm(prev => ({
                          ...prev,
                          kinerja1: val,
                          totalPoin: val + prev.kinerja2 + prev.kinerja3
                        }));
                      }}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1 truncate">{currentHeaderConfig.headerKinerja2}</label>
                    <input
                      type="number"
                      required
                      value={indeksJasaForm.kinerja2}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        setIndeksJasaForm(prev => ({
                          ...prev,
                          kinerja2: val,
                          totalPoin: prev.kinerja1 + val + prev.kinerja3
                        }));
                      }}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1 truncate">{currentHeaderConfig.headerKinerja3}</label>
                    <input
                      type="number"
                      required
                      value={indeksJasaForm.kinerja3}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        setIndeksJasaForm(prev => ({
                          ...prev,
                          kinerja3: val,
                          totalPoin: prev.kinerja1 + prev.kinerja2 + val
                        }));
                      }}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-center font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{currentHeaderConfig.headerTotalPoin}</span>
                  <input
                    type="number"
                    value={indeksJasaForm.totalPoin}
                    onChange={e => setIndeksJasaForm({ ...indeksJasaForm, totalPoin: Number(e.target.value) || 0 })}
                    className="w-32 p-1.5 bg-slate-900 border border-blue-500/40 rounded-lg text-blue-300 font-mono text-right font-black"
                  />
                </div>
              </div>

              {/* Alokasi & Rupiah Per Poin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CurrencyInput
                  label={currentHeaderConfig.headerJumlahAlokasi}
                  value={indeksJasaForm.jumlahAlokasi}
                  onChange={val => setIndeksJasaForm({ ...indeksJasaForm, jumlahAlokasi: val })}
                  placeholder="250000000"
                />
                <CurrencyInput
                  label={currentHeaderConfig.headerRupiahPerPoin1}
                  value={indeksJasaForm.rupiahPerPoin1}
                  onChange={val => setIndeksJasaForm({ ...indeksJasaForm, rupiahPerPoin1: val })}
                  placeholder="150000"
                />
                <CurrencyInput
                  label={currentHeaderConfig.headerRupiahPerPoin2}
                  value={indeksJasaForm.rupiahPerPoin2}
                  onChange={val => setIndeksJasaForm({ ...indeksJasaForm, rupiahPerPoin2: val })}
                  placeholder="120000"
                />
              </div>

              {/* Calculated Value Box */}
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-300 block">{currentHeaderConfig.headerNilaiJpLangsung} (Hasil Evaluasi)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Formula: {currentHeaderConfig.formulaJpLangsung}</span>
                </div>
                <span className="text-base font-black text-amber-300 font-mono">
                  {formatRupiah(evaluateJpFormula(indeksJasaForm, currentHeaderConfig.formulaJpLangsung))}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowIndeksJasaModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300">Simpan Indeks Jasa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: HEADER & FORMULA CUSTOMIZER MODAL */}
      {showFormulaHeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-black text-white">
                    Kustomisasi Header Kolom & Formula JP Langsung
                  </h3>
                  <p className="text-[11px] text-slate-400">Atur nama label kolom dan rumus aritmatika secara interaktif.</p>
                </div>
              </div>
              <button onClick={() => setShowFormulaHeaderModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveHeaderAndFormula} className="space-y-4 text-xs">
              
              {/* SECTION A: HEADER LABELS */}
              <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-300 uppercase text-[11px] tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>1. Kustomisasi Label Header Kolom</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Bisa diubah sesuai istilah internal RS</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Header Kinerja 1</label>
                    <input
                      type="text"
                      value={tempHeaderConfig.headerKinerja1}
                      onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, headerKinerja1: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Header Kinerja 2</label>
                    <input
                      type="text"
                      value={tempHeaderConfig.headerKinerja2}
                      onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, headerKinerja2: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Header Kinerja 3</label>
                    <input
                      type="text"
                      value={tempHeaderConfig.headerKinerja3}
                      onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, headerKinerja3: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Header Total Poin</label>
                    <input
                      type="text"
                      value={tempHeaderConfig.headerTotalPoin}
                      onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, headerTotalPoin: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Header Jumlah Alokasi</label>
                    <input
                      type="text"
                      value={tempHeaderConfig.headerJumlahAlokasi}
                      onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, headerJumlahAlokasi: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Header Rp / Poin 1</label>
                    <input
                      type="text"
                      value={tempHeaderConfig.headerRupiahPerPoin1}
                      onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, headerRupiahPerPoin1: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Header Rp / Poin 2</label>
                    <input
                      type="text"
                      value={tempHeaderConfig.headerRupiahPerPoin2}
                      onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, headerRupiahPerPoin2: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-amber-300 text-[10px] font-extrabold mb-1">Header Kolom Nilai JP Langsung</label>
                    <input
                      type="text"
                      value={tempHeaderConfig.headerNilaiJpLangsung}
                      onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, headerNilaiJpLangsung: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-amber-500/50 rounded-xl text-amber-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: FORMULA EDITOR */}
              <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-300 uppercase text-[11px] tracking-wider flex items-center space-x-1.5">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span>2. Editor Formula Aritmatika Nilai JP Langsung</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Variabel: kinerja1, kinerja2, kinerja3, totalPoin, jumlahAlokasi, rupiahPerPoin1, rupiahPerPoin2</span>
                </div>

                {/* Preset Dropdown */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1">Pilih Template Formula Cepat</label>
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        setTempHeaderConfig({ ...tempHeaderConfig, formulaJpLangsung: e.target.value });
                      }
                    }}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs"
                  >
                    <option value="">-- Pilih Template Formula --</option>
                    <option value="(totalPoin * rupiahPerPoin1) + (jumlahAlokasi * 0.1)">1. Standard: (Total Poin × Rp1) + 10% Jumlah Alokasi</option>
                    <option value="(kinerja1 * rupiahPerPoin1) + (kinerja2 * rupiahPerPoin2)">2. Multi-Poin: (Kinerja 1 × Rp1) + (Kinerja 2 × Rp2)</option>
                    <option value="totalPoin * rupiahPerPoin1">3. Murni Poin: Total Poin × Rp / Poin 1</option>
                    <option value="jumlahAlokasi">4. Murni Alokasi: Jumlah Alokasi Instalasi/Layanan</option>
                  </select>
                </div>

                {/* Formula Expression Input */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1">Ekspresi Formula (String Aritmatika JS)</label>
                  <input
                    type="text"
                    required
                    value={tempHeaderConfig.formulaJpLangsung}
                    onChange={e => setTempHeaderConfig({ ...tempHeaderConfig, formulaJpLangsung: e.target.value })}
                    placeholder="Contoh: (totalPoin * rupiahPerPoin1) + (jumlahAlokasi * 0.1)"
                    className="w-full p-3 bg-slate-900 border border-blue-500/60 rounded-xl text-amber-300 font-mono text-xs font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Quick Variable Insertion Pills */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1.5">Klik Variabel / Operator untuk Menyisipkan:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'totalPoin',
                      'rupiahPerPoin1',
                      'jumlahAlokasi',
                      'kinerja1',
                      'kinerja2',
                      'kinerja3',
                      'rupiahPerPoin2'
                    ].map(varName => (
                      <button
                        key={varName}
                        type="button"
                        onClick={() => {
                          setTempHeaderConfig(prev => ({
                            ...prev,
                            formulaJpLangsung: prev.formulaJpLangsung ? `${prev.formulaJpLangsung} * ${varName}` : varName
                          }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 font-mono text-[10px] font-bold border border-blue-800 transition"
                      >
                        + {varName}
                      </button>
                    ))}
                    {['+', '-', '*', '/', '(', ')', '0.1', '0.5'].map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => {
                          setTempHeaderConfig(prev => ({
                            ...prev,
                            formulaJpLangsung: prev.formulaJpLangsung ? `${prev.formulaJpLangsung} ${op} ` : op
                          }));
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[10px] font-bold border border-slate-700 transition"
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Formula Preview Test */}
                <div className="p-3.5 rounded-xl bg-[#0a1529] border border-emerald-500/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-emerald-400">Hasil Pengujian Live Evaluasi Simulasi:</span>
                    <span className="text-slate-400 font-mono">Sample: Total Poin=295, Rp1=150.000, Alokasi=250.000.000</span>
                  </div>
                  <div className="text-sm font-black text-amber-300 font-mono">
                    = {formatRupiah(evaluateJpFormula({
                      kinerja1: 120,
                      kinerja2: 85,
                      kinerja3: 90,
                      totalPoin: 295,
                      jumlahAlokasi: 250000000,
                      rupiahPerPoin1: 150000,
                      rupiahPerPoin2: 120000,
                    }, tempHeaderConfig.formulaJpLangsung))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTempHeaderConfig(DEFAULT_INDEKS_JASA_HEADER_CONFIG)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold"
                >
                  Reset Default
                </button>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setShowFormulaHeaderModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Batal</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold hover:from-amber-400 hover:to-amber-500 shadow-lg">Simpan Formula & Header</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI PENGHAPUSAN (Aman untuk iframe & mobile) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDanger={confirmModal.isDanger !== false}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
