import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Sliders,
  DollarSign,
  TrendingUp,
  UserCheck,
  Building,
  Sparkles,
  Users
} from 'lucide-react';
import { AlokasiJaspel, PenerimaAlokasi, User, GeneralIndexItem } from '../types';
import { 
  formatRupiah, 
  formatNumber, 
  calculatePaguJaspel, 
  calculatePenerimaNetto 
} from '../utils/calculations';
import { exportToXLSX, exportToCSV, exportToTextSummary } from '../utils/exportImport';
import { INSTALASI_LAYANAN_LIST } from '../data/initialData';
import { SlipJaspelModal } from './SlipJaspelModal';

interface AlokasiManagerProps {
  alokasiList: AlokasiJaspel[];
  setAlokasiList: React.Dispatch<React.SetStateAction<AlokasiJaspel[]>>;
  penerimaList: PenerimaAlokasi[];
  setPenerimaList: React.Dispatch<React.SetStateAction<PenerimaAlokasi[]>>;
  generalIndexList: GeneralIndexItem[];
  currentUser: User;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
}

export const AlokasiManager: React.FC<AlokasiManagerProps> = ({
  alokasiList,
  setAlokasiList,
  penerimaList,
  setPenerimaList,
  generalIndexList,
  currentUser,
  selectedCategory,
  setSelectedCategory
}) => {
  // State
  const [selectedAlokasiId, setSelectedAlokasiId] = useState<string | null>(alokasiList[0]?.id || null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAlokasi, setEditingAlokasi] = useState<AlokasiJaspel | null>(null);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<PenerimaAlokasi | null>(null);
  const [selectedSlipRecipient, setSelectedSlipRecipient] = useState<PenerimaAlokasi | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategory || 'all');

  useEffect(() => {
    if (selectedCategory) {
      setCategoryFilter(selectedCategory);
    }
  }, [selectedCategory]);

  // Form State for Alokasi
  const [formData, setFormData] = useState({
    kodePeriode: '',
    bulan: 'September',
    tahun: 2026,
    sumberDana: 'Gabungan Seluruh Layanan' as AlokasiJaspel['sumberDana'],
    pendapatanKotor: 3800000000,
    biayaOperasionalRs: 380000000,
    proporsiJaspelPersen: 42,
    jasaMedisKlinisPersen: 60,
    jasaNonKlinisPersen: 30,
    jasaManajemenPersen: 10,
    status: 'Draft' as AlokasiJaspel['status'],
    keterangan: ''
  });

  // Form State for Recipient
  const [recipientForm, setRecipientForm] = useState({
    nama: '',
    unitKerja: 'Instalasi Gawat Darurat (IGD)',
    jabatan: 'Perawat Pelaksana',
    kategori: 'Keperawatan' as PenerimaAlokasi['kategori'],
    poinDasar: 70,
    poinKompetensi: 65,
    poinRisiko: 75,
    poinKinerja: 80,
    nilaiPerPoin: 38000,
    pajakPph21Persen: 5,
    statusKoreksi: 'Sesuai' as PenerimaAlokasi['statusKoreksi'],
    catatanKoreksi: ''
  });

  // Role permissions check
  const role = currentUser?.role || 'staf';
  const canManageAlokasi = ['superadmin', 'perumus'].includes(role);
  const canEditPoints = ['superadmin', 'perumus'].includes(role);
  const canSuggestCorrection = ['superadmin', 'perumus', 'pic'].includes(role);
  const canApproveFinal = role === 'superadmin';

  const selectedAlokasi = alokasiList.find(a => a.id === selectedAlokasiId) || alokasiList[0];
  
  // Filter recipients
  const filteredRecipients = penerimaList
    .filter(p => p.alokasiId === selectedAlokasi?.id)
    .filter(p => {
      // If staf, can only see own record!
      if (role === 'staf') {
        return (currentUser?.id && p.pegawaiId === currentUser.id) || 
               (currentUser?.nama && p.nama.toLowerCase().includes(currentUser.nama.toLowerCase()));
      }
      // If pic, can see unit recipients
      if (role === 'pic') {
        return (currentUser?.unit && p.unitKerja.toLowerCase().includes(currentUser.unit.toLowerCase())) || 
               p.nama.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter(p => {
      const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.unitKerja.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || 
                       p.kategori.toLowerCase() === categoryFilter.toLowerCase() ||
                       p.unitKerja.toLowerCase().includes(categoryFilter.toLowerCase());
      return matchSearch && matchCat;
    });

  // Calculate live summary breakdown
  const paguPreview = calculatePaguJaspel(
    formData.pendapatanKotor,
    formData.proporsiJaspelPersen,
    formData.biayaOperasionalRs,
    formData.jasaMedisKlinisPersen,
    formData.jasaNonKlinisPersen,
    formData.jasaManajemenPersen
  );

  // Handlers for Alokasi CRUD
  const handleOpenAddAlokasi = () => {
    const nextMonth = 'September';
    const nextYear = 2026;
    setEditingAlokasi(null);
    setFormData({
      kodePeriode: `JAPEL-${nextYear}-09`,
      bulan: nextMonth,
      tahun: nextYear,
      sumberDana: 'Gabungan Seluruh Layanan',
      pendapatanKotor: 3850000000,
      biayaOperasionalRs: 385000000,
      proporsiJaspelPersen: 42,
      jasaMedisKlinisPersen: 60,
      jasaNonKlinisPersen: 30,
      jasaManajemenPersen: 10,
      status: 'Draft',
      keterangan: 'Alokasi Jaspel Bulan September 2026'
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditAlokasi = (a: AlokasiJaspel) => {
    setEditingAlokasi(a);
    setFormData({
      kodePeriode: a.kodePeriode,
      bulan: a.bulan,
      tahun: a.tahun,
      sumberDana: a.sumberDana,
      pendapatanKotor: a.pendapatanKotor,
      biayaOperasionalRs: a.biayaOperasionalRs,
      proporsiJaspelPersen: a.proporsiJaspelPersen,
      jasaMedisKlinisPersen: a.jasaMedisKlinisPersen,
      jasaNonKlinisPersen: a.jasaNonKlinisPersen,
      jasaManajemenPersen: a.jasaManajemenPersen,
      status: a.status,
      keterangan: a.keterangan
    });
    setShowAddEditModal(true);
  };

  const handleSaveAlokasi = (e: React.FormEvent) => {
    e.preventDefault();
    const pagu = calculatePaguJaspel(
      formData.pendapatanKotor,
      formData.proporsiJaspelPersen,
      formData.biayaOperasionalRs,
      formData.jasaMedisKlinisPersen,
      formData.jasaNonKlinisPersen,
      formData.jasaManajemenPersen
    );

    if (editingAlokasi) {
      const updated = alokasiList.map(item => {
        if (item.id === editingAlokasi.id) {
          return {
            ...item,
            ...formData,
            paguJaspelKotor: pagu.paguKotor,
            paguJaspelNetto: pagu.paguNetto,
            tanggalUpdate: new Date().toISOString()
          };
        }
        return item;
      });
      setAlokasiList(updated);
    } else {
      const newAlokasi: AlokasiJaspel = {
        id: `alo-${Date.now()}`,
        ...formData,
        paguJaspelKotor: pagu.paguKotor,
        paguJaspelNetto: pagu.paguNetto,
        tanggalDibuat: new Date().toISOString(),
        tanggalUpdate: new Date().toISOString(),
        createdBy: currentUser.nama
      };
      setAlokasiList([newAlokasi, ...alokasiList]);
      setSelectedAlokasiId(newAlokasi.id);
    }
    setShowAddEditModal(false);
  };

  const handleDeleteAlokasi = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus alokasi periode ini beserta seluruh rincian stafnya?')) {
      const updated = alokasiList.filter(a => a.id !== id);
      setAlokasiList(updated);
      setPenerimaList(penerimaList.filter(p => p.alokasiId !== id));
      if (selectedAlokasiId === id && updated.length > 0) {
        setSelectedAlokasiId(updated[0].id);
      }
    }
  };

  // Recipient Handlers
  const handleOpenAddRecipient = () => {
    setEditingRecipient(null);
    setRecipientForm({
      nama: '',
      unitKerja: 'Instalasi Gawat Darurat (IGD)',
      jabatan: 'Perawat Pelaksana Terampil',
      kategori: 'Keperawatan',
      poinDasar: 65,
      poinKompetensi: 60,
      poinRisiko: 70,
      poinKinerja: 80,
      nilaiPerPoin: 36000,
      pajakPph21Persen: 5,
      statusKoreksi: 'Sesuai',
      catatanKoreksi: ''
    });
    setShowRecipientModal(true);
  };

  const handleOpenEditRecipient = (p: PenerimaAlokasi) => {
    setEditingRecipient(p);
    setRecipientForm({
      nama: p.nama,
      unitKerja: p.unitKerja,
      jabatan: p.jabatan,
      kategori: p.kategori,
      poinDasar: p.poinDasar,
      poinKompetensi: p.poinKompetensi,
      poinRisiko: p.poinRisiko,
      poinKinerja: p.poinKinerja,
      nilaiPerPoin: p.nilaiPerPoin,
      pajakPph21Persen: p.pajakPph21Persen,
      statusKoreksi: p.statusKoreksi,
      catatanKoreksi: p.catatanKoreksi || ''
    });
    setShowRecipientModal(true);
  };

  const handleSaveRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlokasi) return;

    const totalPoin = 
      Number(recipientForm.poinDasar) + 
      Number(recipientForm.poinKompetensi) + 
      Number(recipientForm.poinRisiko) + 
      Number(recipientForm.poinKinerja);

    const calc = calculatePenerimaNetto(
      totalPoin, 
      recipientForm.nilaiPerPoin, 
      recipientForm.pajakPph21Persen
    );

    if (editingRecipient) {
      const updated = penerimaList.map(item => {
        if (item.id === editingRecipient.id) {
          return {
            ...item,
            ...recipientForm,
            totalPoin,
            brutoJaspel: calc.brutoJaspel,
            potonganPph21: calc.potonganPph21,
            nettoDiterima: calc.nettoDiterima
          };
        }
        return item;
      });
      setPenerimaList(updated);
    } else {
      const newP: PenerimaAlokasi = {
        id: `pen-${Date.now()}`,
        alokasiId: selectedAlokasi.id,
        pegawaiId: `peg-${Date.now()}`,
        ...recipientForm,
        totalPoin,
        brutoJaspel: calc.brutoJaspel,
        potonganPph21: calc.potonganPph21,
        nettoDiterima: calc.nettoDiterima,
        sudahDibayar: false
      };
      setPenerimaList([...penerimaList, newP]);
    }
    setShowRecipientModal(false);
  };

  const handleDeleteRecipient = (id: string) => {
    if (confirm('Hapus penerima ini dari alokasi periode ini?')) {
      setPenerimaList(penerimaList.filter(p => p.id !== id));
    }
  };

  const handleStatusChange = (newStatus: AlokasiJaspel['status']) => {
    if (!selectedAlokasi) return;
    const updated = alokasiList.map(a => 
      a.id === selectedAlokasi.id ? { ...a, status: newStatus, tanggalUpdate: new Date().toISOString() } : a
    );
    setAlokasiList(updated);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Banner Metric Overview */}
      <div className="bg-gradient-to-r from-[#172554] via-[#0f1d38] to-[#1e3a8a] rounded-3xl p-5 sm:p-7 border border-blue-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                CRUD Jasa Pelayanan
              </span>
              <span className="text-xs text-blue-200 font-medium">
                Periode Aktif: <strong className="text-white">{selectedAlokasi?.bulan} {selectedAlokasi?.tahun}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Alokasi & Distribusi Remunerasi
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl mt-1">
              Perhitungan pagu jaspel kotor & netto, bobot indeks kinerja staf, dan pengesahan payroll jaspel BLUD.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {canManageAlokasi && (
              <button
                onClick={handleOpenAddAlokasi}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Periode Alokasi</span>
              </button>
            )}

            {/* Export Buttons */}
            {selectedAlokasi && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportToXLSX(selectedAlokasi, filteredRecipients)}
                  className="p-2.5 rounded-2xl bg-blue-950/80 hover:bg-blue-900 text-emerald-400 border border-blue-800 transition"
                  title="Ekspor ke XLSX (Excel)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => exportToCSV(filteredRecipients as any, `HALO_JASPEL_${selectedAlokasi.kodePeriode}`)}
                  className="p-2.5 rounded-2xl bg-blue-950/80 hover:bg-blue-900 text-amber-400 border border-blue-800 transition"
                  title="Ekspor CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Alokasi Quick Stats Grid */}
        {selectedAlokasi && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-blue-900/60">
            <div className="bg-[#0b142b]/80 p-3.5 rounded-2xl border border-blue-900/60">
              <span className="text-[10px] font-bold uppercase text-blue-300">Pendapatan Kotor</span>
              <p className="text-base sm:text-xl font-extrabold text-white mt-0.5 truncate">
                {formatRupiah(selectedAlokasi.pendapatanKotor)}
              </p>
              <span className="text-[10px] text-blue-300/70">{selectedAlokasi.sumberDana}</span>
            </div>

            <div className="bg-[#0b142b]/80 p-3.5 rounded-2xl border border-blue-900/60">
              <span className="text-[10px] font-bold uppercase text-blue-300">Proporsi Jaspel</span>
              <p className="text-base sm:text-xl font-extrabold text-amber-400 mt-0.5">
                {selectedAlokasi.proporsiJaspelPersen}%
              </p>
              <span className="text-[10px] text-blue-300/70">Beban RS: {formatRupiah(selectedAlokasi.biayaOperasionalRs)}</span>
            </div>

            <div className="bg-[#0b142b]/80 p-3.5 rounded-2xl border border-blue-600/60 bg-gradient-to-br from-blue-950/90 to-[#0c1633]">
              <span className="text-[10px] font-bold uppercase text-blue-300">Pagu Jaspel Netto</span>
              <p className="text-base sm:text-xl font-extrabold text-white mt-0.5 truncate">
                {formatRupiah(selectedAlokasi.paguJaspelNetto)}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold">Siap Didistribusikan</span>
            </div>

            <div className="bg-[#0b142b]/80 p-3.5 rounded-2xl border border-blue-900/60">
              <span className="text-[10px] font-bold uppercase text-blue-300">Status Alokasi</span>
              <div className="mt-1">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedAlokasi.status === 'Terbayar / Final' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  selectedAlokasi.status === 'Disetujui Direktur' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                  selectedAlokasi.status === 'Review Perumus' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {selectedAlokasi.status}
                </span>
              </div>
              <span className="text-[10px] text-blue-200/70 mt-1 block">
                {filteredRecipients.length} Penerima
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Periode Tabs Selector (Scrollable horizontally) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
          Daftar Periode:
        </span>
        {alokasiList.map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedAlokasiId(a.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center space-x-2 ${
              selectedAlokasiId === a.id
                ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white border border-blue-400/50 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{a.bulan} {a.tahun}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono text-amber-300">
              {a.status}
            </span>
          </button>
        ))}
      </div>

      {/* Main Alokasi Details & Recipients List */}
      {selectedAlokasi && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
          
          {/* Header of Table: Search, Filter, Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                <span>Rincian Penerima Jasa Pelayanan</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  {filteredRecipients.length} Staf
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {role === 'staf' 
                  ? 'Menampilkan slip jaspel atas nama akun Anda secara transparan.'
                  : role === 'pic'
                  ? `Unit ${currentUser?.unit || '-'}: PIC dapat meninjau dan mengusulkan koreksi poin.`
                  : 'Seluruh tenaga medis, keperawatan, penunjang, dan manajemen terdaftar.'}
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, unit, jabatan..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  if (setSelectedCategory) setSelectedCategory(e.target.value);
                }}
                className="py-2 px-3 bg-blue-950/80 border border-blue-800 rounded-xl text-xs text-blue-100 focus:outline-none focus:border-amber-400"
              >
                <option value="all">Semua Instalasi / Layanan ({INSTALASI_LAYANAN_LIST.length})</option>
                {INSTALASI_LAYANAN_LIST.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              {canManageAlokasi && (
                <button
                  onClick={handleOpenAddRecipient}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-950 border border-blue-500/60 hover:bg-blue-900 text-amber-300 text-xs font-bold transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Staf</span>
                </button>
              )}

              {canManageAlokasi && (
                <button
                  onClick={() => handleOpenEditAlokasi(selectedAlokasi)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  title="Edit Periode Ini"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              {role === 'superadmin' && (
                <button
                  onClick={() => handleDeleteAlokasi(selectedAlokasi.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs font-semibold"
                  title="Hapus Periode Ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Approval Workflow Strip */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Tahapan Approval:</span>
              <span className="font-bold text-white">{selectedAlokasi.status}</span>
            </div>

            <div className="flex items-center space-x-2">
              {canManageAlokasi && selectedAlokasi.status === 'Draft' && (
                <button
                  onClick={() => handleStatusChange('Review Perumus')}
                  className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition"
                >
                  Ajukan ke Tim Perumus
                </button>
              )}
              {canManageAlokasi && selectedAlokasi.status === 'Review Perumus' && (
                <button
                  onClick={() => handleStatusChange('Verifikasi PIC')}
                  className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition"
                >
                  Kirim Verifikasi ke PIC Ruangan
                </button>
              )}
              {canManageAlokasi && selectedAlokasi.status === 'Verifikasi PIC' && (
                <button
                  onClick={() => handleStatusChange('Disetujui Direktur')}
                  className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
                >
                  Ajukan Persetujuan Direktur
                </button>
              )}
              {canApproveFinal && selectedAlokasi.status === 'Disetujui Direktur' && (
                <button
                  onClick={() => handleStatusChange('Terbayar / Final')}
                  className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sahkan Final & Cairkan Payroll</span>
                </button>
              )}
            </div>
          </div>

          {/* Table of Recipients (Responsive Desktop + Card for mobile) */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Nama & Unit</th>
                  <th className="py-3.5 px-3 text-center">Poin Dasar</th>
                  <th className="py-3.5 px-3 text-center">Kompetensi</th>
                  <th className="py-3.5 px-3 text-center">Risiko</th>
                  <th className="py-3.5 px-3 text-center">Kinerja</th>
                  <th className="py-3.5 px-3 text-center font-extrabold text-amber-300">Total Poin</th>
                  <th className="py-3.5 px-4 text-right">Bruto Jaspel</th>
                  <th className="py-3.5 px-3 text-right">PPh 21</th>
                  <th className="py-3.5 px-4 text-right font-bold text-white">Netto Diterima</th>
                  <th className="py-3.5 px-3 text-center">Koreksi</th>
                  <th className="py-3.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredRecipients.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                      Tidak ada data staf penerima yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecipients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs sm:text-sm">{p.nama}</div>
                        <div className="text-[10px] text-slate-400">{p.unitKerja} • {p.jabatan}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">{p.poinDasar}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">{p.poinKompetensi}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">{p.poinRisiko}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">{p.poinKinerja}</td>
                      <td className="py-3 px-3 text-center font-mono font-black text-amber-400 text-xs sm:text-sm">
                        {p.totalPoin}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatRupiah(p.brutoJaspel)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-400">
                        -{formatRupiah(p.potonganPph21)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-white text-xs sm:text-sm bg-amber-400/5">
                        {formatRupiah(p.nettoDiterima)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.statusKoreksi === 'Sesuai' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          p.statusKoreksi === 'Usulan Koreksi' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {p.statusKoreksi}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setSelectedSlipRecipient(p)}
                            className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-amber-300 border border-rose-800"
                            title="Buka Slip Jaspel"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          
                          {(canEditPoints || canSuggestCorrection) && (
                            <button
                              onClick={() => handleOpenEditRecipient(p)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title={canSuggestCorrection && !canEditPoints ? 'Usulkan Koreksi' : 'Edit Poin & Data'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canManageAlokasi && (
                            <button
                              onClick={() => handleDeleteRecipient(p.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Summary footer */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              Total Skor Poin Keseluruhan:{' '}
              <strong className="text-amber-400 font-mono">
                {formatNumber(filteredRecipients.reduce((acc, c) => acc + c.totalPoin, 0))}
              </strong>
            </div>
            <div className="text-slate-400">
              Total Netto Payroll Jaspel:{' '}
              <strong className="text-white text-sm font-mono">
                {formatRupiah(filteredRecipients.reduce((acc, c) => acc + c.nettoDiterima, 0))}
              </strong>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: ADD / EDIT ALOKASI */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-[#0c1633] text-amber-400 border border-blue-800">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingAlokasi ? 'Ubah Periode Alokasi' : 'Buat Periode Alokasi Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kalkulasi otomatis pagu pendapatan, beban tetap, dan proporsi jaspel
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddEditModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAlokasi} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Kode Periode
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kodePeriode}
                    onChange={e => setFormData({ ...formData, kodePeriode: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Bulan
                  </label>
                  <select
                    value={formData.bulan}
                    onChange={e => setFormData({ ...formData, bulan: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Tahun
                  </label>
                  <input
                    type="number"
                    value={formData.tahun}
                    onChange={e => setFormData({ ...formData, tahun: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Sumber Dana Pendapatan
                  </label>
                  <select
                    value={formData.sumberDana}
                    onChange={e => setFormData({ ...formData, sumberDana: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Gabungan Seluruh Layanan">Gabungan Seluruh Layanan</option>
                    <option value="BPJS / JKN">Klaim BPJS / JKN</option>
                    <option value="Pasien Umum">Pasien Umum Tunai</option>
                    <option value="Klaim Asuransi">Klaim Asuransi Swasta</option>
                    <option value="Tindakan VIP">Tindakan Operasi & Kamar VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Status Alokasi
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Review Perumus">Review Tim Perumus</option>
                    <option value="Verifikasi PIC">Verifikasi PIC</option>
                    <option value="Disetujui Direktur">Disetujui Direktur</option>
                    <option value="Terbayar / Final">Terbayar / Final</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Pendapatan Kotor RS (Rp)
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    required
                    value={formData.pendapatanKotor}
                    onChange={e => setFormData({ ...formData, pendapatanKotor: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Biaya Operasional Beban (Rp)
                  </label>
                  <input
                    type="number"
                    step="500000"
                    value={formData.biayaOperasionalRs}
                    onChange={e => setFormData({ ...formData, biayaOperasionalRs: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Proporsi Jaspel (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    step="0.5"
                    value={formData.proporsiJaspelPersen}
                    onChange={e => setFormData({ ...formData, proporsiJaspelPersen: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Dynamic Pagu Calculation Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/50 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kalkulasi Pagu Otomatis</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Pagu Kotor:</span>
                    <p className="font-bold text-white">{formatRupiah(paguPreview.paguKotor)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Pagu Netto:</span>
                    <p className="font-bold text-amber-400">{formatRupiah(paguPreview.paguNetto)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Medis (60%):</span>
                    <p className="font-semibold text-slate-300">{formatRupiah(paguPreview.jasaMedisKlinis)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Keterangan & Dasar Keputusan Direktur
                </label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Catatan penetapan jaspel, nomor nota dinas, dll..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-amber-300 font-bold border border-blue-400/40 shadow-lg shadow-blue-950/50"
                >
                  Simpan Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT RECIPIENT */}
      {showRecipientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-blue-900/60 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingRecipient ? 'Ubah Rincian Staf / Usulkan Koreksi' : 'Tambah Penerima Baru'}
              </h3>
              <button 
                onClick={() => setShowRecipientModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecipient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Nama Lengkap Pegawai
                </label>
                <input
                  type="text"
                  required
                  value={recipientForm.nama}
                  onChange={e => setRecipientForm({ ...recipientForm, nama: e.target.value })}
                  placeholder="Contoh: dr. Ahmad, Sp.A atau Ns. Maria, S.Kep"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Unit Kerja
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientForm.unitKerja}
                    onChange={e => setRecipientForm({ ...recipientForm, unitKerja: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Instalasi / Layanan
                  </label>
                  <select
                    value={recipientForm.kategori}
                    onChange={e => setRecipientForm({ ...recipientForm, kategori: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {INSTALASI_LAYANAN_LIST.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skor Poin Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 text-[9px] uppercase font-bold">Poin Dasar</label>
                  <input
                    type="number"
                    value={recipientForm.poinDasar}
                    onChange={e => setRecipientForm({ ...recipientForm, poinDasar: Number(e.target.value) })}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] uppercase font-bold">Kompetensi</label>
                  <input
                    type="number"
                    value={recipientForm.poinKompetensi}
                    onChange={e => setRecipientForm({ ...recipientForm, poinKompetensi: Number(e.target.value) })}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] uppercase font-bold">Risiko</label>
                  <input
                    type="number"
                    value={recipientForm.poinRisiko}
                    onChange={e => setRecipientForm({ ...recipientForm, poinRisiko: Number(e.target.value) })}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-[9px] uppercase font-bold">Kinerja</label>
                  <input
                    type="number"
                    value={recipientForm.poinKinerja}
                    onChange={e => setRecipientForm({ ...recipientForm, poinKinerja: Number(e.target.value) })}
                    className="w-full p-1.5 bg-slate-900 border border-amber-400/50 rounded-lg text-amber-300 font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    Nilai Satuan Per Poin (Rp)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={recipientForm.nilaiPerPoin}
                    onChange={e => setRecipientForm({ ...recipientForm, nilaiPerPoin: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                    PPh 21 (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={recipientForm.pajakPph21Persen}
                    onChange={e => setRecipientForm({ ...recipientForm, pajakPph21Persen: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* Status Koreksi Section (Handy for PIC) */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    Status & Usulan Koreksi
                  </span>
                  <select
                    value={recipientForm.statusKoreksi}
                    onChange={e => setRecipientForm({ ...recipientForm, statusKoreksi: e.target.value as any })}
                    className="p-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="Sesuai">Sesuai (Tanpa Usulan)</option>
                    <option value="Usulan Koreksi">Usulan Koreksi PIC</option>
                    <option value="Disetujui Koreksi">Disetujui Koreksi SPI</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={recipientForm.catatanKoreksi}
                  onChange={e => setRecipientForm({ ...recipientForm, catatanKoreksi: e.target.value })}
                  placeholder="Tulis alasan usulan koreksi poin / tugas darurat..."
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecipientModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SLIP JASPEL VIEWER */}
      {selectedSlipRecipient && selectedAlokasi && (
        <SlipJaspelModal
          penerima={selectedSlipRecipient}
          alokasi={selectedAlokasi}
          onClose={() => setSelectedSlipRecipient(null)}
        />
      )}

    </div>
  );
};
