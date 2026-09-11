import React, { useState, useMemo, useRef } from 'react';
import { 
  Printer, 
  Download, 
  Filter, 
  Calendar, 
  Wallet, 
  FileSpreadsheet, 
  Layers, 
  Users, 
  Search, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  FileText, 
  ArrowUpDown,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { 
  AlokasiJaspel, 
  PenerimaAlokasi, 
  GeneralIndexItem, 
  CostCenterItem, 
  RevenueCenterItem, 
  User,
  Permission
} from '../types';
import { HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from './HospitalProfileModal';
import { formatRupiah, formatNumber, formatPercentage } from '../utils/calculations';
import { exportToCSV } from '../utils/exportImport';

interface RekapCetakManagerProps {
  alokasiList: AlokasiJaspel[];
  penerimaList: PenerimaAlokasi[];
  generalIndexList: GeneralIndexItem[];
  costCenterList: CostCenterItem[];
  revenueCenterList: RevenueCenterItem[];
  currentUser: User | null;
  permissions?: Permission[];
  hospitalProfile?: HospitalProfile;
}

const ALL_INSTALASI_UNITS = [
  'Pengelola BLUD',
  'Dewan Pengawas',
  'Tugas Tambahan',
  'Struktural',
  'Administrasi',
  'Psikiatri',
  'Spesialis',
  'Dokter Umum',
  'Perawat',
  'Gizi',
  'OT/TW',
  'Psikolog',
  'Fisioterapi',
  'Radiologi',
  'Laboratorium',
  'Farmasi',
  'Elektromedik',
  'Rekam Medik',
  'Kesling'
];

export const RekapCetakManager: React.FC<RekapCetakManagerProps> = ({
  alokasiList,
  penerimaList,
  generalIndexList,
  costCenterList,
  revenueCenterList,
  currentUser,
  permissions = [],
  hospitalProfile = DEFAULT_HOSPITAL_PROFILE
}) => {
  const isSuperadmin = currentUser?.role === 'superadmin';
  const userRole = currentUser?.role || 'staf';

  const checkUnitAccess = (unitName: string): boolean => {
    if (isSuperadmin) return true;
    if (currentUser?.unit && currentUser.unit.toLowerCase() === unitName.toLowerCase()) return true;
    const perm = permissions.find(p => p.name.toLowerCase().includes(unitName.toLowerCase()));
    if (perm) {
      if ((perm as any)[userRole]) return true;
      if (perm.roles && perm.roles[userRole]) return true;
    }
    return false;
  };

  // 1. Filter States
  const [selectedTableType, setSelectedTableType] = useState<'rekap_penerimaan' | 'general_index' | 'cost_center' | 'revenue_center'>('rekap_penerimaan');
  const [selectedInstalasi, setSelectedInstalasi] = useState<string>('all');
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>(alokasiList[0]?.id || 'all');
  const [selectedSumberDana, setSelectedSumberDana] = useState<string>('all');
  const [selectedKelompokJasa, setSelectedKelompokJasa] = useState<string>('all');
  const [selectedStatusPegawai, setSelectedStatusPegawai] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Find active alokasi object
  const currentAlokasi = useMemo(() => {
    if (selectedPeriodeId === 'all') return alokasiList[0] || null;
    return alokasiList.find(a => a.id === selectedPeriodeId) || alokasiList[0] || null;
  }, [alokasiList, selectedPeriodeId]);

  // 2. Filter Penerima Alokasi Data
  const filteredPenerima = useMemo(() => {
    let result = [...penerimaList];

    // Filter by period
    if (selectedPeriodeId !== 'all') {
      result = result.filter(p => p.alokasiId === selectedPeriodeId || !p.alokasiId);
    }

    // Filter by Instalasi
    if (selectedInstalasi !== 'all') {
      result = result.filter(p => 
        (p.unitKerja && p.unitKerja.toLowerCase().includes(selectedInstalasi.toLowerCase())) ||
        (p.kategori && p.kategori.toLowerCase().includes(selectedInstalasi.toLowerCase()))
      );
    }

    // Role-based unit filter for non-superadmin if viewing 'all'
    if (!isSuperadmin && selectedInstalasi === 'all') {
      result = result.filter(p => checkUnitAccess(p.unitKerja) || (currentUser?.unit && p.unitKerja.toLowerCase().includes(currentUser.unit.toLowerCase())));
    }

    // Filter by kelompok jasa
    if (selectedKelompokJasa !== 'all') {
      result = result.filter(p => {
        const cat = p.kategori?.toLowerCase() || '';
        if (selectedKelompokJasa === 'medis') return cat.includes('medis') || cat.includes('spesialis') || cat.includes('dokter');
        if (selectedKelompokJasa === 'keperawatan') return cat.includes('perawat') || cat.includes('bidan') || cat.includes('keperawatan');
        if (selectedKelompokJasa === 'penunjang') return cat.includes('farmasi') || cat.includes('lab') || cat.includes('radiologi') || cat.includes('gizi') || cat.includes('nakes');
        if (selectedKelompokJasa === 'manajemen') return cat.includes('manajemen') || cat.includes('administrasi') || cat.includes('struktural') || cat.includes('non-klinis');
        return true;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.nama.toLowerCase().includes(q) || 
        p.unitKerja.toLowerCase().includes(q) || 
        p.jabatan.toLowerCase().includes(q) ||
        (p.pegawaiId && p.pegawaiId.toLowerCase().includes(q))
      );
    }

    return result;
  }, [penerimaList, selectedPeriodeId, selectedInstalasi, selectedKelompokJasa, searchQuery, isSuperadmin, currentUser, permissions]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalPenerima = filteredPenerima.length;
    const totalPoin = filteredPenerima.reduce((acc, curr) => acc + (curr.totalPoin || 0), 0);
    const totalBruto = filteredPenerima.reduce((acc, curr) => acc + (curr.brutoJaspel || 0), 0);
    const totalPph21 = filteredPenerima.reduce((acc, curr) => acc + (curr.potonganPph21 || 0), 0);
    const totalNetto = filteredPenerima.reduce((acc, curr) => acc + (curr.nettoDiterima || 0), 0);

    return { totalPenerima, totalPoin, totalBruto, totalPph21, totalNetto };
  }, [filteredPenerima]);

  // Filtered General Index
  const filteredGeneralIndex = useMemo(() => {
    let list = [...generalIndexList];
    if (selectedInstalasi !== 'all') {
      list = list.filter(g => g.unitKerja && g.unitKerja.toLowerCase().includes(selectedInstalasi.toLowerCase()));
    }
    if (!isSuperadmin && selectedInstalasi === 'all') {
      list = list.filter(g => checkUnitAccess(g.unitKerja) || (currentUser?.unit && g.unitKerja.toLowerCase().includes(currentUser.unit.toLowerCase())));
    }
    if (selectedStatusPegawai !== 'all') {
      list = list.filter(g => g.statusPegawai === selectedStatusPegawai);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(g => g.namaPegawai.toLowerCase().includes(q) || g.nip.toLowerCase().includes(q) || g.unitKerja.toLowerCase().includes(q));
    }
    return list;
  }, [generalIndexList, selectedInstalasi, selectedStatusPegawai, searchQuery, isSuperadmin, currentUser]);

  // Filtered Cost Center
  const filteredCostCenter = useMemo(() => {
    let list = [...costCenterList];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.namaPusatBiaya.toLowerCase().includes(q) || c.kodeCostCenter.toLowerCase().includes(q) || c.kategori.toLowerCase().includes(q));
    }
    return list;
  }, [costCenterList, searchQuery]);

  // Filtered Revenue Center
  const filteredRevenueCenter = useMemo(() => {
    let list = [...revenueCenterList];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.namaPusatLayanan.toLowerCase().includes(q) || r.kodeRevenueCenter.toLowerCase().includes(q) || r.kategoriLayanan.toLowerCase().includes(q));
    }
    return list;
  }, [revenueCenterList, searchQuery]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (selectedTableType === 'rekap_penerimaan') {
      const dataToExport = filteredPenerima.map((p, idx) => ({
        'No': idx + 1,
        'Nama Pegawai': p.nama,
        'ID/NIP': p.pegawaiId,
        'Unit Kerja': p.unitKerja,
        'Jabatan': p.jabatan,
        'Kelompok Jasa': p.kategori,
        'Total Poin': p.totalPoin,
        'Nilai Per Poin': p.nilaiPerPoin,
        'Bruto Jaspel': p.brutoJaspel,
        'PPh 21 (%)': p.pajakPph21Persen,
        'Potongan PPh 21': p.potonganPph21,
        'Besaran JP (Netto)': p.nettoDiterima,
        'Status Pembayaran': p.sudahDibayar ? 'Lunas' : 'Draft'
      }));
      exportToCSV(dataToExport, `Rekap_Penerimaan_Jaspel_${currentAlokasi?.bulan || 'Periode'}_${currentAlokasi?.tahun || 2026}`);
    } else if (selectedTableType === 'general_index') {
      const dataToExport = filteredGeneralIndex.map((g, idx) => ({
        'No': idx + 1,
        'Kode': g.kode,
        'NIP': g.nip,
        'Nama Pegawai': g.namaPegawai,
        'Unit Kerja': g.unitKerja,
        'Golongan': g.golongan,
        'Pendidikan': g.pendidikan,
        'Status Pegawai': g.statusPegawai,
        'Skor Dasar': g.skorDasar,
        'Skor Kompetensi': g.skorKompetensi,
        'Skor Risiko': g.skorRisiko,
        'Skor Kinerja': g.skorKinerja
      }));
      exportToCSV(dataToExport, `Tabel_General_Index_Pegawai`);
    } else if (selectedTableType === 'cost_center') {
      const dataToExport = filteredCostCenter.map((c, idx) => ({
        'No': idx + 1,
        'Kode': c.kodeCostCenter,
        'Nama Pusat Biaya': c.namaPusatBiaya,
        'Kategori': c.kategori,
        'Alokasi Anggaran': c.alokasiAnggaranBulanan,
        'Realisasi Biaya': c.realisasiBiaya,
        'Penanggung Jawab': c.penanggungJawab,
        'Status': c.status
      }));
      exportToCSV(dataToExport, `Tabel_Cost_Center_Beban`);
    } else {
      const dataToExport = filteredRevenueCenter.map((r, idx) => ({
        'No': idx + 1,
        'Kode': r.kodeRevenueCenter,
        'Nama Pusat Layanan': r.namaPusatLayanan,
        'Kategori Layanan': r.kategoriLayanan,
        'Target Pendapatan': r.targetPendapatanBulanan,
        'Realisasi Pendapatan': r.realisasiPendapatan,
        'Capaian (%)': r.persentasePencapaian
      }));
      exportToCSV(dataToExport, `Tabel_Revenue_Center_Layanan`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in print:m-0 print:p-0">
      
      {/* 1. Header Banner & Actions (Hidden on Print) */}
      <div className="print:hidden p-6 rounded-3xl bg-gradient-to-r from-[#172554] via-[#0f1d38] to-[#1e3a8a] border border-blue-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-amber-300 text-[11px] font-bold mb-2">
            <Printer className="w-3.5 h-3.5" />
            <span>Pusat Rekapitulasi & Cetak Laporan Resmi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Rekap Penerimaan & Cetak Semua Tabel
          </h2>
          <p className="text-xs text-blue-200/80 mt-1">
            Format laporan terintegrasi per periode, per alokasi pagu, per kelompok jasa, dan per tabel master data.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-center">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Excel/CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition flex items-center space-x-2 shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Navigation Toolbar (Hidden on Print) */}
      <div className="print:hidden p-5 rounded-3xl bg-[#0c1633] border border-blue-900/60 shadow-xl space-y-4">
        
        {/* Table Type Selector */}
        <div className="flex flex-wrap items-center gap-2 border-b border-blue-900/40 pb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-2">Pilih Tabel:</span>
          
          <button
            onClick={() => setSelectedTableType('rekap_penerimaan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedTableType === 'rekap_penerimaan'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Rekap Penerimaan Jaspel</span>
          </button>

          <button
            onClick={() => setSelectedTableType('general_index')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedTableType === 'general_index'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>2. General Index Pegawai</span>
          </button>

          <button
            onClick={() => setSelectedTableType('cost_center')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedTableType === 'cost_center'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>3. Cost Center (Pusat Biaya)</span>
          </button>

          <button
            onClick={() => setSelectedTableType('revenue_center')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedTableType === 'revenue_center'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>4. Revenue Center (Pusat Layanan)</span>
          </button>
        </div>

        {/* Multi-Dimensional Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Filter Instalasi / Layanan (RBAC Controlled) */}
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1 flex items-center justify-between">
              <span>Filter Unit / Layanan</span>
              {!isSuperadmin && <span className="text-[9px] text-amber-400 font-normal">Sesuai Hak Akses</span>}
            </label>
            <select
              value={selectedInstalasi}
              onChange={e => setSelectedInstalasi(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="all">Semua Unit ({isSuperadmin ? 'Semua Akses' : 'Terverifikasi'})</option>
              {ALL_INSTALASI_UNITS.map(unit => {
                const allowed = checkUnitAccess(unit);
                return (
                  <option 
                    key={unit} 
                    value={unit}
                    disabled={!allowed}
                  >
                    {allowed ? `✓ ${unit}` : `🔒 ${unit} (Terkunci)`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter Periode */}
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Per Periode (Bulan & Tahun)
            </label>
            <select
              value={selectedPeriodeId}
              onChange={e => setSelectedPeriodeId(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="all">Semua Periode Alokasi</option>
              {alokasiList.map(a => (
                <option key={a.id} value={a.id}>
                  {a.bulan} {a.tahun} — ({a.kodePeriode})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Sumber Dana / Alokasi */}
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Per Sumber Dana
            </label>
            <select
              value={selectedSumberDana}
              onChange={e => setSelectedSumberDana(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="all">Semua Sumber Dana</option>
              <option value="Gabungan Seluruh Layanan">Gabungan Seluruh Layanan</option>
              <option value="BPJS / JKN">Klaim BPJS / JKN</option>
              <option value="Pasien Umum">Pasien Umum Tunai</option>
              <option value="Klaim Asuransi">Klaim Asuransi Swasta</option>
              <option value="Tindakan VIP">Tindakan VIP & Eksekutif</option>
            </select>
          </div>

          {/* Filter Kelompok Jasa */}
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Kelompok Jasa
            </label>
            <select
              value={selectedKelompokJasa}
              onChange={e => setSelectedKelompokJasa(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="all">Semua Kelompok</option>
              <option value="medis">Medis Klinis</option>
              <option value="keperawatan">Keperawatan</option>
              <option value="penunjang">Nakes Penunjang</option>
              <option value="manajemen">Manajemen BLUD</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Cari Nama / NIP / Unit
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari pegawai / unit..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

        </div>

      </div>

      {/* 3. Executive KPI Summary Cards (When Rekap Penerimaan is active) */}
      {selectedTableType === 'rekap_penerimaan' && (
        <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Penerima</span>
            <p className="text-lg font-black text-white mt-1">{formatNumber(summary.totalPenerima)} Pegawai</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Poin Kinerja</span>
            <p className="text-lg font-black text-blue-300 mt-1">{formatNumber(summary.totalPoin)} Poin</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Bruto Jaspel</span>
            <p className="text-base font-black text-slate-200 mt-1">{formatRupiah(summary.totalBruto)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="text-[10px] font-bold uppercase text-rose-400">Potongan PPh 21</span>
            <p className="text-base font-black text-rose-300 mt-1">{formatRupiah(summary.totalPph21)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-400/40 shadow-md">
            <span className="text-[10px] font-bold uppercase text-amber-400">Besaran JP (Netto)</span>
            <p className="text-base font-black text-amber-300 mt-1">{formatRupiah(summary.totalNetto)}</p>
          </div>

        </div>
      )}

      {/* 4. PRINTABLE REPORT CANVAS (Styled for screen and crystal-clear print) */}
      <div 
        id="printable-report-canvas"
        className="bg-white dark:bg-[#0c1633] text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/60 shadow-2xl print:shadow-none print:border-none print:p-0 print:bg-white print:text-black"
      >
        
        {/* KOP SURAT RESMI RUMAH SAKIT (Always rendered nicely for print) */}
        <div className="border-b-2 border-slate-800 dark:border-slate-300 pb-4 mb-6 print:border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-900 text-amber-300 font-black text-xl flex items-center justify-center border border-blue-400 print:bg-gray-100 print:text-black print:border-black">
                {hospitalProfile.hospitalName.substring(0, 4).toUpperCase()}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900 dark:text-white print:text-black">
                  {hospitalProfile.pemdaName || 'PEMERINTAH DAERAH / DINAS KESEHATAN'}
                </h1>
                <h2 className="text-sm sm:text-base font-bold text-blue-900 dark:text-amber-400 print:text-black">
                  {hospitalProfile.hospitalName} ({hospitalProfile.hospitalType || 'BLUD'})
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 print:text-black">
                  {hospitalProfile.address} • {hospitalProfile.city} • Telp: {hospitalProfile.phone} • {hospitalProfile.subtitle}
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block print:block">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 print:border-black print:text-black">
                {hospitalProfile.badgeText || 'DOKUMEN RESMI BLUD'}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 print:text-black">
                {hospitalProfile.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs font-semibold print:text-black">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Nama Laporan: </span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black">
                {selectedTableType === 'rekap_penerimaan' && 'REKAPITULASI PENERIMAAN JASA PELAYANAN (JASPEL)'}
                {selectedTableType === 'general_index' && 'TABEL MASTER GENERAL INDEX BOBOT SKOR PEGAWAI'}
                {selectedTableType === 'cost_center' && 'TABEL COST CENTER (PUSAT BIAYA & BEBAN TETAP)'}
                {selectedTableType === 'revenue_center' && 'TABEL REVENUE CENTER (PUSAT PENDAPATAN LAYANAN)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Periode: </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 print:text-black">
                {currentAlokasi ? `${currentAlokasi.bulan} ${currentAlokasi.tahun} (${currentAlokasi.sumberDana})` : 'Semua Periode'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. DYNAMIC TABLES */}
        
        {/* TABEL 1: REKAP PENERIMAAN JASPEL (No, Nama, Status, Besaran JP) */}
        {selectedTableType === 'rekap_penerimaan' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-300 dark:border-slate-700 print:bg-gray-200 print:text-black print:border-black">
                  <th className="py-2.5 px-2 text-center w-10">No</th>
                  <th className="py-2.5 px-3">Nama Pegawai & ID</th>
                  <th className="py-2.5 px-3">Unit Kerja & Jabatan</th>
                  <th className="py-2.5 px-3 text-center">Kelompok Jasa</th>
                  <th className="py-2.5 px-3 text-right">Total Poin</th>
                  <th className="py-2.5 px-3 text-right">Nilai / Poin</th>
                  <th className="py-2.5 px-3 text-right">Bruto Jaspel</th>
                  <th className="py-2.5 px-3 text-right">PPh 21</th>
                  <th className="py-2.5 px-3 text-right font-black text-amber-600 dark:text-amber-400 print:text-black">
                    Besaran JP (Netto)
                  </th>
                  <th className="py-2.5 px-2 text-center print:hidden">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 print:divide-black print:text-black">
                {filteredPenerima.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Tidak ada data penerima yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredPenerima.map((p, idx) => (
                    <tr 
                      key={p.id || idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition print:hover:bg-transparent"
                    >
                      <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-500 dark:text-slate-400 print:text-black">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white print:text-black">
                        <div>{p.nama}</div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 print:text-black">
                          {p.pegawaiId || `PEG-00${idx + 1}`}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium">{p.unitKerja}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.jabatan}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 print:border-none print:text-black">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">
                        {formatNumber(p.totalPoin)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500 dark:text-slate-400 print:text-black">
                        {formatRupiah(p.nilaiPerPoin || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatRupiah(p.brutoJaspel || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400 print:text-black">
                        {formatRupiah(p.potonganPph21 || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-amber-600 dark:text-amber-400 print:text-black">
                        {formatRupiah(p.nettoDiterima || 0)}
                      </td>
                      <td className="py-2.5 px-2 text-center print:hidden">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {p.sudahDibayar ? 'Lunas' : 'Valid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 dark:bg-slate-900 font-bold border-t-2 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-white print:border-black print:text-black print:bg-gray-100">
                  <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px]">
                    Total Keseluruhan ({filteredPenerima.length} Pegawai):
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {formatNumber(summary.totalPoin)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">-</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatRupiah(summary.totalBruto)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400 print:text-black">
                    {formatRupiah(summary.totalPph21)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-amber-600 dark:text-amber-400 print:text-black text-sm">
                    {formatRupiah(summary.totalNetto)}
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* TABEL 2: GENERAL INDEX */}
        {selectedTableType === 'general_index' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-300 dark:border-slate-700 print:bg-gray-200 print:text-black">
                  <th className="py-2.5 px-2 text-center w-10">No</th>
                  <th className="py-2.5 px-3">Kode & NIP</th>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3">Unit Kerja</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-2 text-right">Skor Dasar</th>
                  <th className="py-2.5 px-2 text-right">Kompetensi</th>
                  <th className="py-2.5 px-2 text-right">Risiko</th>
                  <th className="py-2.5 px-2 text-right">Kinerja</th>
                  <th className="py-2.5 px-3 text-right font-bold">Total Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 print:divide-black print:text-black">
                {filteredGeneralIndex.map((g, idx) => {
                  const total = (g.skorDasar || 0) + (g.skorKompetensi || 0) + (g.skorRisiko || 0) + (g.skorKinerja || 0);
                  return (
                    <tr key={g.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-medium">{g.nip || g.kode}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white print:text-black">{g.namaPegawai}</td>
                      <td className="py-2.5 px-3">{g.unitKerja}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                          {g.statusPegawai}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">{g.skorDasar}</td>
                      <td className="py-2.5 px-2 text-right font-mono">{g.skorKompetensi}</td>
                      <td className="py-2.5 px-2 text-right font-mono">{g.skorRisiko}</td>
                      <td className="py-2.5 px-2 text-right font-mono">{g.skorKinerja}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400 print:text-black">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TABEL 3: COST CENTER */}
        {selectedTableType === 'cost_center' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-300 dark:border-slate-700 print:bg-gray-200 print:text-black">
                  <th className="py-2.5 px-2 text-center w-10">No</th>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Pusat Biaya</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Alokasi Anggaran (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Realisasi Biaya (Rp)</th>
                  <th className="py-2.5 px-3">Penanggung Jawab</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 print:divide-black print:text-black">
                {filteredCostCenter.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td className="py-2.5 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{c.kodeCostCenter}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white print:text-black">{c.namaPusatBiaya}</td>
                    <td className="py-2.5 px-3">{c.kategori}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-600 dark:text-blue-400 print:text-black">
                      {formatRupiah(c.alokasiAnggaranBulanan || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-600 dark:text-rose-400 print:text-black">
                      {formatRupiah(c.realisasiBiaya || 0)}
                    </td>
                    <td className="py-2.5 px-3">{c.penanggungJawab}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABEL 4: REVENUE CENTER */}
        {selectedTableType === 'revenue_center' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-300 dark:border-slate-700 print:bg-gray-200 print:text-black">
                  <th className="py-2.5 px-2 text-center w-10">No</th>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Pusat Layanan</th>
                  <th className="py-2.5 px-3">Kategori Layanan</th>
                  <th className="py-2.5 px-3 text-right">Target Pendapatan (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Realisasi Pendapatan (Rp)</th>
                  <th className="py-2.5 px-3 text-center">Capaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 print:divide-black print:text-black">
                {filteredRevenueCenter.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td className="py-2.5 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{r.kodeRevenueCenter}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white print:text-black">{r.namaPusatLayanan}</td>
                    <td className="py-2.5 px-3">{r.kategoriLayanan}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300 print:text-black">
                      {formatRupiah(r.targetPendapatanBulanan || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                      {formatRupiah(r.realisasiPendapatan || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400 print:text-black">
                      {formatPercentage(r.persentasePencapaian || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. LEMBAR PENGESAHAN (SIGNATURE BLOCK FOR OFFICIAL PRINT) */}
        <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs print:border-black print:text-black">
          <div>
            <p className="text-slate-500 dark:text-slate-400 print:text-black">Diverifikasi & Diajukan Oleh,</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black mt-0.5">{hospitalProfile.committeeLeadTitle || 'Ketua Tim Remunerasi & Jaspel'}</p>
            <div className="h-20 flex items-end justify-center">
              <span className="font-semibold text-slate-400 dark:text-slate-500 print:hidden text-[10px] italic">
                (Tanda Tangan & Cap Tim Perumus)
              </span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white print:text-black underline underline-offset-4">
              {hospitalProfile.committeeLeadName || 'dr. H. Hendra Setiawan, Sp.B'}
            </p>
            <p className="text-[10px] text-slate-500 print:text-black font-mono">NIP. {hospitalProfile.committeeLeadNip || '19780512 200312 1 002'}</p>
          </div>

          <div>
            <p className="text-slate-500 dark:text-slate-400 print:text-black">Mengetahui & Menyetujui,</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black mt-0.5">{hospitalProfile.directorTitle || `Direktur ${hospitalProfile.hospitalName}`}</p>
            <div className="h-20 flex items-end justify-center">
              <span className="font-semibold text-slate-400 dark:text-slate-500 print:hidden text-[10px] italic">
                (Tanda Tangan & Cap Direktur)
              </span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white print:text-black underline underline-offset-4">
              {hospitalProfile.directorName || 'dr. Hj. Ratna Sari, M.Kes, Sp.A'}
            </p>
            <p className="text-[10px] text-slate-500 print:text-black font-mono">NIP. {hospitalProfile.directorNip || '19720415 199803 2 001'}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
