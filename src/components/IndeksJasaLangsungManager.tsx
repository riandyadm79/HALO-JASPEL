import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Calculator, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Sliders, 
  ChevronRight, 
  AlertCircle,
  FileSpreadsheet,
  Info,
  Sparkles,
  Cloud,
  Database,
  UploadCloud,
  Code,
  Copy,
  Check
} from 'lucide-react';
import { UnitKinerjaLayanan, PegawaiKinerjaLayanan, User } from '../types';
import { INITIAL_UNIT_KINERJA_LAYANAN, INITIAL_PEGAWAI_KINERJA_LAYANAN } from '../data/rekapKinerjaPelayananData';
import { formatRupiah, formatNumber } from '../utils/calculations';
import { CurrencyInput } from './CurrencyInput';
import { ConfirmModal } from './ConfirmModal';
import { downloadBlobAsFile } from '../utils/exportImport';
import { supabase } from '../lib/supabase';
import {
  mapUnitKinerjaToSupabase,
  mapUnitKinerjaFromSupabase,
  mapPegawaiKinerjaToSupabase,
  mapPegawaiKinerjaFromSupabase
} from '../utils/supabaseMapper';

interface IndeksJasaLangsungManagerProps {
  currentUser: User;
  onNavigateToPayroll?: () => void;
  initialSelectedUnit?: string;
}

export const IndeksJasaLangsungManager: React.FC<IndeksJasaLangsungManagerProps> = ({
  currentUser,
  onNavigateToPayroll,
  initialSelectedUnit
}) => {
  // State for Unit and Pegawai
  const [unitList, setUnitList] = useState<UnitKinerjaLayanan[]>(() => {
    const saved = localStorage.getItem('RSUD_UNIT_KINERJA_LAYANAN');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_UNIT_KINERJA_LAYANAN;
  });

  const [pegawaiList, setPegawaiList] = useState<PegawaiKinerjaLayanan[]>(() => {
    const saved = localStorage.getItem('RSUD_PEGAWAI_KINERJA_LAYANAN');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_PEGAWAI_KINERJA_LAYANAN;
  });

  // Column View Mode: 'csv' (15 Kolom Resmi CSV) or 'compact' (Tampilan Ringkas)
  const [columnMode, setColumnMode] = useState<'csv' | 'compact'>('csv');

  // Supabase Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'synced' | 'local_only' | 'error'>('idle');
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

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
`;

  // Automatic Load from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const loadFromSupabase = async () => {
      try {
        const [{ data: unitsData, error: errUnits }, { data: pegData, error: errPeg }] = await Promise.all([
          supabase.from('unit_kinerja_layanan').select('*'),
          supabase.from('pegawai_kinerja_layanan').select('*')
        ]);

        if (!isMounted) return;

        if (!errUnits && unitsData && unitsData.length > 0) {
          const mappedUnits = unitsData.map(mapUnitKinerjaFromSupabase);
          setUnitList(mappedUnits);
          localStorage.setItem('RSUD_UNIT_KINERJA_LAYANAN', JSON.stringify(mappedUnits));
        }

        if (!errPeg && pegData && pegData.length > 0) {
          const mappedPeg = pegData.map(mapPegawaiKinerjaFromSupabase);
          setPegawaiList(mappedPeg);
          localStorage.setItem('RSUD_PEGAWAI_KINERJA_LAYANAN', JSON.stringify(mappedPeg));
          setSyncStatus('synced');
        } else if (errUnits || errPeg) {
          setSyncStatus('local_only');
        }
      } catch (err) {
        console.warn('Supabase auto-fetch warning:', err);
        if (isMounted) setSyncStatus('local_only');
      }
    };

    loadFromSupabase();
    return () => { isMounted = false; };
  }, []);

  // Save to localStorage & trigger Supabase push
  const saveUnits = (newUnits: UnitKinerjaLayanan[]) => {
    setUnitList(newUnits);
    localStorage.setItem('RSUD_UNIT_KINERJA_LAYANAN', JSON.stringify(newUnits));
  };

  const savePegawai = (newPegawai: PegawaiKinerjaLayanan[]) => {
    setPegawaiList(newPegawai);
    localStorage.setItem('RSUD_PEGAWAI_KINERJA_LAYANAN', JSON.stringify(newPegawai));
  };

  // Full Push / Sync to Supabase
  const handleSyncToSupabase = async (customUnits?: UnitKinerjaLayanan[], customPegawai?: PegawaiKinerjaLayanan[]) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const unitsToSave = customUnits || unitList;
      const pegToSave = customPegawai || pegawaiList;

      const mappedUnits = unitsToSave.map(mapUnitKinerjaToSupabase);
      const { error: errUnits } = await supabase
        .from('unit_kinerja_layanan')
        .upsert(mappedUnits, { onConflict: 'id' });

      if (errUnits) {
        throw new Error(`Unit Kinerja: ${errUnits.message}. Buat tabel 'unit_kinerja_layanan' via SQL Editor.`);
      }

      const mappedPeg = pegToSave.map(mapPegawaiKinerjaToSupabase);
      const { error: errPeg } = await supabase
        .from('pegawai_kinerja_layanan')
        .upsert(mappedPeg, { onConflict: 'id' });

      if (errPeg) {
        throw new Error(`Pegawai Kinerja: ${errPeg.message}. Buat tabel 'pegawai_kinerja_layanan' via SQL Editor.`);
      }

      setSyncStatus('synced');
      setSyncNotification('Sukses! Seluruh 10 Instalasi dan 65 Staf Kinerja CSV tersimpan di Supabase Cloud.');
      setTimeout(() => setSyncNotification(null), 4500);
    } catch (err: any) {
      console.error('Sync to Supabase failed:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Gagal tersambung ke Supabase Cloud.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_DDL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Active view: 'rekap_instalasi' | 'rincian_pegawai'
  const [activeView, setActiveView] = useState<'rekap_instalasi' | 'rincian_pegawai'>('rincian_pegawai');
  const [selectedUnitKode, setSelectedUnitKode] = useState<string>(initialSelectedUnit || 'GIZI');
  const [searchQuery, setSearchQuery] = useState('');
  const [subKategoriFilter, setSubKategoriFilter] = useState<string>('all');

  // Helper to normalize unit name/code from navigation
  const normalizeUnitCode = (raw?: string): string => {
    if (!raw || raw === 'all' || raw === 'Semua') return 'ALL';
    const s = raw.toLowerCase().trim();
    if (s.includes('gizi')) return 'GIZI';
    if (s.includes('farmasi')) return 'FARMASI';
    if (s.includes('lab') || s.includes('laboratorium')) return 'LABORATORIUM';
    if (s.includes('radio') || s.includes('radiologi')) return 'RADIOLOGI';
    if (s.includes('fisio')) return 'FISIOTERAPI';
    if (s.includes('ot') || s.includes('tw') || s.includes('okupasi') || s.includes('wicara')) return 'OT_TW';
    if (s.includes('psiko')) return 'PSIKOLOGI';
    if (s.includes('elektro')) return 'ELEKTROMEDIK';
    if (s.includes('rekam') || s.includes('rmik')) return 'REKAM_MEDIK';
    if (s.includes('kesling') || s.includes('lingkungan')) return 'KESLING';
    return raw.toUpperCase();
  };

  // Sync when initialSelectedUnit prop changes from Sidebar or MobileNav
  useEffect(() => {
    if (initialSelectedUnit) {
      const code = normalizeUnitCode(initialSelectedUnit);
      if (code === 'ALL') {
        setSelectedUnitKode('ALL');
        setActiveView('rincian_pegawai');
      } else {
        const found = unitList.find(u => 
          u.kodeUnit === code || 
          u.namaUnit.toLowerCase().includes(initialSelectedUnit.toLowerCase())
        );
        if (found) {
          setSelectedUnitKode(found.kodeUnit);
          setActiveView('rincian_pegawai');
        } else {
          // If a general category was selected (e.g. Spesialis, Perawat)
          setSelectedUnitKode('ALL');
          setActiveView('rincian_pegawai');
        }
      }
    }
  }, [initialSelectedUnit, unitList]);

  // Modals
  const [showPegawaiModal, setShowPegawaiModal] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<PegawaiKinerjaLayanan | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitKinerjaLayanan | null>(null);

  // Form State for Pegawai
  const [pegawaiForm, setPegawaiForm] = useState<Omit<PegawaiKinerjaLayanan, 'id'>>({
    unitKode: 'GIZI',
    unitNama: 'Gizi',
    nama: '',
    nip: '',
    subKategori: '',
    prestasi1: 0,
    totalBulan1: 1198,
    poin1: 0,
    prestasi2: 0,
    totalBulan2: 114,
    poin2: 0,
    prestasi3: 0,
    totalBulan3: 31,
    poin3: 0,
    jumlahPoin: 0,
    persenPoin: 0,
    jpLangsung: 0,
    keterangan: ''
  });

  // Form State for Unit Config
  const [unitForm, setUnitForm] = useState<Omit<UnitKinerjaLayanan, 'id'>>({
    kodeUnit: 'GIZI',
    namaUnit: 'Gizi',
    kategori: 'Nakes Ber-Tarif',
    bulan: 'Agustus',
    tahun: 2026,
    indikator1: 'Jumlah Diet Pasien',
    volumeTotal1: 1198,
    indikator2: 'Asuhan Gizi',
    volumeTotal2: 114,
    indikator3: 'Pengawasan Mutu Makanan',
    volumeTotal3: 31,
    paguJp: 4669497.15,
    totalPoin: 3,
    rupiahPerPoin: 1556499.05,
    realisasiJp: 4669497.15,
    jumlahPegawai: 3,
    status: 'Final'
  });

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const canEdit = ['superadmin', 'perumus', 'pic', 'input_nakes_lain', 'input_medis', 'input_perawat'].includes(currentUser?.role || 'staf');

  // Active unit object
  const currentUnit = useMemo(() => {
    if (selectedUnitKode === 'ALL') {
      return {
        id: 'unit-all',
        kodeUnit: 'ALL',
        namaUnit: 'Semua 10 Instalasi & Layanan',
        kategori: 'Seluruh Layanan Nakes & Penunjang Medis',
        bulan: 'Agustus',
        tahun: 2026,
        indikator1: 'Rekap Kinerja Layanan 1',
        volumeTotal1: unitList.reduce((acc, u) => acc + (u.volumeTotal1 || 0), 0),
        indikator2: 'Rekap Kinerja Layanan 2',
        volumeTotal2: unitList.reduce((acc, u) => acc + (u.volumeTotal2 || 0), 0),
        indikator3: 'Rekap Kinerja Layanan 3',
        volumeTotal3: unitList.reduce((acc, u) => acc + (u.volumeTotal3 || 0), 0),
        paguJp: unitList.reduce((acc, u) => acc + (u.paguJp || 0), 0),
        totalPoin: unitList.reduce((acc, u) => acc + (u.totalPoin || 0), 0),
        rupiahPerPoin: 0,
        realisasiJp: unitList.reduce((acc, u) => acc + (u.realisasiJp || 0), 0),
        jumlahPegawai: pegawaiList.length,
        status: 'Final'
      } as UnitKinerjaLayanan;
    }
    return unitList.find(u => u.kodeUnit === selectedUnitKode) || unitList[0];
  }, [unitList, pegawaiList, selectedUnitKode]);

  // Pegawai of current unit
  const unitPegawaiList = useMemo(() => {
    if (selectedUnitKode === 'ALL') {
      return pegawaiList;
    }
    return pegawaiList.filter(p => p.unitKode === currentUnit?.kodeUnit);
  }, [pegawaiList, currentUnit, selectedUnitKode]);

  // Filtered pegawai
  const filteredPegawai = useMemo(() => {
    return unitPegawaiList.filter(p => {
      const matchesSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.keterangan && p.keterangan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.subKategori && p.subKategori.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubKat = subKategoriFilter === 'all' || p.subKategori === subKategoriFilter;
      return matchesSearch && matchesSubKat;
    });
  }, [unitPegawaiList, searchQuery, subKategoriFilter]);

  // Macro Summary Statistics
  const macroStats = useMemo(() => {
    const totalPagu = unitList.reduce((acc, u) => acc + (u.paguJp || 0), 0);
    const totalRealisasi = unitList.reduce((acc, u) => acc + (u.realisasiJp || 0), 0);
    const totalPegawai = pegawaiList.length;
    const totalUnit = unitList.length;
    return { totalPagu, totalRealisasi, totalPegawai, totalUnit };
  }, [unitList, pegawaiList]);

  // Unique subcategories for current unit (e.g. Farmasi: Apoteker vs Asisten Apoteker)
  const availableSubKategori = useMemo(() => {
    const set = new Set<string>();
    unitPegawaiList.forEach(p => {
      if (p.subKategori) set.add(p.subKategori);
    });
    return Array.from(set);
  }, [unitPegawaiList]);

  // Handlers for Reset to Baseline CSV
  const handleResetToBaselineCsv = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Terapkan Data Baseline Rekapitulasi CSV (65 Staf)?',
      message: 'Ini akan menyinkronkan 10 instalasi/layanan dan seluruh 65 pegawai dengan nilai prestasi, poin, dan nominal JP Langsung persis dari file CSV resmi Rumah Sakit ke penyimpanan lokal dan Supabase Cloud.',
      onConfirm: async () => {
        saveUnits(INITIAL_UNIT_KINERJA_LAYANAN);
        savePegawai(INITIAL_PEGAWAI_KINERJA_LAYANAN);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        // Also push to Supabase Cloud
        await handleSyncToSupabase(INITIAL_UNIT_KINERJA_LAYANAN, INITIAL_PEGAWAI_KINERJA_LAYANAN);
      }
    });
  };

  // Open Edit Pegawai
  const handleOpenEditPegawai = (p: PegawaiKinerjaLayanan) => {
    setEditingPegawai(p);
    setPegawaiForm({
      unitKode: p.unitKode,
      unitNama: p.unitNama,
      nama: p.nama,
      nip: p.nip || '',
      subKategori: p.subKategori || '',
      prestasi1: p.prestasi1,
      totalBulan1: p.totalBulan1,
      poin1: p.poin1,
      prestasi2: p.prestasi2,
      totalBulan2: p.totalBulan2,
      poin2: p.poin2,
      prestasi3: p.prestasi3,
      totalBulan3: p.totalBulan3,
      poin3: p.poin3,
      jumlahPoin: p.jumlahPoin,
      persenPoin: p.persenPoin,
      jpLangsung: p.jpLangsung,
      keterangan: p.keterangan || ''
    });
    setShowPegawaiModal(true);
  };

  // Open Add Pegawai
  const handleOpenAddPegawai = () => {
    setEditingPegawai(null);
    setPegawaiForm({
      unitKode: currentUnit.kodeUnit,
      unitNama: currentUnit.namaUnit,
      nama: '',
      nip: '',
      subKategori: availableSubKategori[0] || '',
      prestasi1: 0,
      totalBulan1: currentUnit.volumeTotal1 || 1,
      poin1: 0,
      prestasi2: 0,
      totalBulan2: currentUnit.volumeTotal2 || 1,
      poin2: 0,
      prestasi3: 0,
      totalBulan3: currentUnit.volumeTotal3 || 1,
      poin3: 0,
      jumlahPoin: 0,
      persenPoin: 0,
      jpLangsung: 0,
      keterangan: ''
    });
    setShowPegawaiModal(true);
  };

  // Recalculate Pegawai Poin & JP Langsung on form change
  const handlePegawaiFormChange = (field: string, val: any) => {
    const nextForm = { ...pegawaiForm, [field]: val };

    if (field === 'prestasi1' || field === 'prestasi2' || field === 'prestasi3') {
      const p1 = Number(field === 'prestasi1' ? val : nextForm.prestasi1);
      const t1 = Number(nextForm.totalBulan1) || 1;
      const poin1 = t1 > 0 ? Number((p1 / t1).toFixed(3)) : 0;

      const p2 = Number(field === 'prestasi2' ? val : nextForm.prestasi2);
      const t2 = Number(nextForm.totalBulan2) || 1;
      const poin2 = t2 > 0 ? Number((p2 / t2).toFixed(3)) : 0;

      const p3 = Number(field === 'prestasi3' ? val : nextForm.prestasi3);
      const t3 = Number(nextForm.totalBulan3) || 1;
      const poin3 = t3 > 0 ? Number((p3 / t3).toFixed(3)) : 0;

      const totalPoinUnit = currentUnit.totalPoin || 1;
      const jumlahPoin = Number((poin1 + poin2 + poin3).toFixed(3));
      const persenPoin = Number(((jumlahPoin / totalPoinUnit) * 100).toFixed(1));
      
      // Hitung JP Langsung
      const rupiahPerPoin = currentUnit.rupiahPerPoin || (currentUnit.paguJp / totalPoinUnit);
      const jpLangsung = Math.round(jumlahPoin * rupiahPerPoin);

      nextForm.poin1 = poin1;
      nextForm.poin2 = poin2;
      nextForm.poin3 = poin3;
      nextForm.jumlahPoin = jumlahPoin;
      nextForm.persenPoin = persenPoin;
      nextForm.jpLangsung = jpLangsung;
    }

    setPegawaiForm(nextForm);
  };

  // Save Pegawai
  const handleSavePegawai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pegawaiForm.nama.trim()) return;

    const itemToSave: PegawaiKinerjaLayanan = editingPegawai ? {
      ...editingPegawai,
      ...pegawaiForm
    } : {
      id: `peg-${Date.now()}`,
      ...pegawaiForm
    };

    let updated: PegawaiKinerjaLayanan[];
    if (editingPegawai) {
      updated = pegawaiList.map(p => p.id === editingPegawai.id ? itemToSave : p);
    } else {
      updated = [...pegawaiList, itemToSave];
    }
    savePegawai(updated);

    // Persist to Supabase asynchronously
    (async () => {
      try {
        const { error } = await supabase
          .from('pegawai_kinerja_layanan')
          .upsert(mapPegawaiKinerjaToSupabase(itemToSave), { onConflict: 'id' });
        if (!error) setSyncStatus('synced');
      } catch (e) {
        console.warn('Supabase save pegawai failed:', e);
      }
    })();

    // Update realisasi and headcount in unit
    setTimeout(() => {
      syncUnitAggregates(currentUnit.kodeUnit, updated);
    }, 50);

    setShowPegawaiModal(false);
  };

  // Delete Pegawai
  const handleDeletePegawai = (id: string, nama: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pegawai dari Kinerja Pelayanan?',
      message: `Apakah Anda yakin ingin menghapus "${nama}" dari daftar kinerja ${currentUnit.namaUnit}?`,
      onConfirm: () => {
        const updated = pegawaiList.filter(p => p.id !== id);
        savePegawai(updated);
        syncUnitAggregates(currentUnit.kodeUnit, updated);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        // Delete from Supabase asynchronously
        (async () => {
          try {
            await supabase
              .from('pegawai_kinerja_layanan')
              .delete()
              .eq('id', id);
          } catch (e) {
            console.warn('Supabase delete pegawai failed:', e);
          }
        })();
      }
    });
  };

  // Sync unit aggregates (total realisasi and pegawai count)
  const syncUnitAggregates = (kodeUnit: string, customList?: PegawaiKinerjaLayanan[]) => {
    const list = customList || pegawaiList;
    const unitStaff = list.filter(p => p.unitKode === kodeUnit);
    const sumJp = unitStaff.reduce((acc, p) => acc + (p.jpLangsung || 0), 0);
    let updatedTargetUnit: UnitKinerjaLayanan | null = null;
    const updatedUnits = unitList.map(u => {
      if (u.kodeUnit === kodeUnit) {
        updatedTargetUnit = {
          ...u,
          realisasiJp: sumJp,
          jumlahPegawai: unitStaff.length
        };
        return updatedTargetUnit;
      }
      return u;
    });
    saveUnits(updatedUnits);

    if (updatedTargetUnit) {
      const targetUnitToSave = updatedTargetUnit;
      (async () => {
        try {
          await supabase
            .from('unit_kinerja_layanan')
            .upsert(mapUnitKinerjaToSupabase(targetUnitToSave), { onConflict: 'id' });
        } catch (e) {
          console.warn('Supabase unit aggregate sync failed:', e);
        }
      })();
    }
  };

  // Open Edit Unit
  const handleOpenEditUnit = (u: UnitKinerjaLayanan) => {
    setEditingUnit(u);
    setUnitForm({
      kodeUnit: u.kodeUnit,
      namaUnit: u.namaUnit,
      kategori: u.kategori,
      bulan: u.bulan,
      tahun: u.tahun,
      indikator1: u.indikator1,
      volumeTotal1: u.volumeTotal1,
      indikator2: u.indikator2,
      volumeTotal2: u.volumeTotal2,
      indikator3: u.indikator3,
      volumeTotal3: u.volumeTotal3,
      paguJp: u.paguJp,
      totalPoin: u.totalPoin,
      rupiahPerPoin: u.rupiahPerPoin,
      realisasiJp: u.realisasiJp,
      jumlahPegawai: u.jumlahPegawai,
      status: u.status
    });
    setShowUnitModal(true);
  };

  // Save Unit Config
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;

    const rupiahPerPoinCalc = unitForm.totalPoin > 0 ? Math.round(unitForm.paguJp / unitForm.totalPoin) : unitForm.rupiahPerPoin;

    const updatedUnitObj: UnitKinerjaLayanan = {
      ...editingUnit,
      ...unitForm,
      rupiahPerPoin: rupiahPerPoinCalc
    };

    const updated = unitList.map(u => u.id === editingUnit.id ? updatedUnitObj : u);

    saveUnits(updated);
    setShowUnitModal(false);

    // Persist to Supabase asynchronously
    (async () => {
      try {
        await supabase
          .from('unit_kinerja_layanan')
          .upsert(mapUnitKinerjaToSupabase(updatedUnitObj), { onConflict: 'id' });
      } catch (e) {
        console.warn('Supabase unit save failed:', e);
      }
    })();
  };

  // Export CSV format Rekapitulasi Poin Kinerja Pelayanan
  const handleExportCsv = () => {
    const lines: string[] = [
      '# REKAPITULASI POIN KINERJA PELAYANAN RSUD',
      `# BULAN: ${currentUnit.bulan.toUpperCase()} ${currentUnit.tahun}`,
      `# UNIT / INSTALASI: ${currentUnit.namaUnit}`,
      `# PAGU JASA PELAYANAN (Rp): ${currentUnit.paguJp}`,
      `# TOTAL POIN: ${currentUnit.totalPoin}`,
      `# RUPIAH PER POIN: ${currentUnit.rupiahPerPoin}`,
      '',
      `No;Nama;Prestasi ${currentUnit.indikator1};Total ${currentUnit.indikator1};Prestasi ${currentUnit.indikator2};Total ${currentUnit.indikator2};Prestasi ${currentUnit.indikator3};Total ${currentUnit.indikator3};Poin 1;Poin 2;Poin 3;Jumlah Poin;JP Langsung (Rp.);Persentase;Kategori / Profesi`
    ];

    unitPegawaiList.forEach((p, idx) => {
      lines.push(
        `${idx + 1};"${p.nama}";${p.prestasi1};${p.totalBulan1};${p.prestasi2};${p.totalBulan2};${p.prestasi3};${p.totalBulan3};${p.poin1};${p.poin2};${p.poin3};${p.jumlahPoin};${p.jpLangsung};${p.persenPoin}%;"${p.subKategori || p.keterangan || ''}"`
      );
    });

    // Summary line
    lines.push('');
    lines.push(`;;${currentUnit.volumeTotal1};;${currentUnit.volumeTotal2};;${currentUnit.volumeTotal3};;;;;${currentUnit.totalPoin};${currentUnit.realisasiJp};100%;Total Terdistribusi`);

    const csvContent = '\uFEFF' + lines.join('\r\n');
    downloadBlobAsFile(csvContent, `REKAP_KINERJA_${currentUnit.kodeUnit}_${currentUnit.bulan.toUpperCase()}_${currentUnit.tahun}.csv`);
  };

  // Export All 10 Units Overview
  const handleExportAllUnitsCsv = () => {
    const lines: string[] = [
      '# MASTER REKAPITULASI 10 INSTALASI & LAYANAN (JASA LANGSUNG RSUD)',
      '# Regulasi Pagu 40% Jaspel',
      'Kode Unit;Nama Instalasi / Layanan;Kategori;Indikator Kinerja 1;Indikator Kinerja 2;Indikator Kinerja 3;Personel;Pagu JP (Rp);Realisasi JP (Rp);Total Poin;Rupiah Per Poin;Status'
    ];

    unitList.forEach(u => {
      lines.push(
        `"${u.kodeUnit}";"${u.namaUnit}";"${u.kategori}";"${u.indikator1}";"${u.indikator2}";"${u.indikator3}";${u.jumlahPegawai};${u.paguJp};${u.realisasiJp};${u.totalPoin};${u.rupiahPerPoin};"${u.status}"`
      );
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    downloadBlobAsFile(csvContent, 'REKAP_MASTER_10_INSTALASI_JASA_LANGSUNG.csv');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner: Indeks Jasa Langsung */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-7 border border-blue-800/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-amber-400 text-slate-950 shadow-md">
                INPUT INDEKS JASA LANGSUNG RESMI
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-900/60 text-blue-200 border border-blue-700/50">
                10 UNIT INSTALASI AKTIF
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Tabel Instalasi & Layanan: Rekapitulasi Poin Kinerja</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Manajemen capaian volume tindakan per indikator kinerja unit, perhitungan poin proporsional per orang, dan penetapan nilai Jasa Pelayanan Langsung (Rp) sesuai data CSV rekapitulasi pelayanan.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSyncToSupabase()}
              disabled={isSyncing}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black shadow-lg transition flex items-center space-x-2 ${
                isSyncing 
                  ? 'bg-blue-800 text-blue-200 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              title="Simpan & Sinkronkan 10 Unit dan 65 Pegawai CSV ke Supabase Cloud"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <UploadCloud className="w-4 h-4 text-white" />
              )}
              <span>{isSyncing ? 'Menyimpan...' : 'Simpan ke Supabase Cloud'}</span>
            </button>

            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center space-x-1.5 shadow"
              title="Lihat & Salin Script SQL DDL Tabel Supabase"
            >
              <Code className="w-4 h-4 text-cyan-400" />
              <span>Script SQL Supabase</span>
            </button>

            <button
              onClick={handleResetToBaselineCsv}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center space-x-2 shadow"
              title="Reset ke Data Baseline CSV Resmi Rumah Sakit (65 Staf)"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Muat Baseline CSV (65 Staf)</span>
            </button>

            <button
              onClick={handleExportAllUnitsCsv}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg transition flex items-center space-x-2"
              title="Ekspor Seluruh Rekapitulasi 10 Unit ke CSV"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Master CSV</span>
            </button>
          </div>
        </div>

        {/* Sync Status Badge Indicator */}
        <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Status Sinkronisasi Cloud:</span>
            {syncStatus === 'synced' ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tersimpan di Supabase Cloud (10 Unit & 65 Staf CSV)</span>
              </span>
            ) : syncStatus === 'error' ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Belum Tersimpan di Cloud (Perlu Buat Tabel Supabase)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold text-[11px]">
                <Database className="w-3.5 h-3.5" />
                <span>Penyimpanan Aktif: Lokal & Cloud Supabase</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400">
            Total Record: <strong className="text-white">{unitList.length} Instalasi</strong> | <strong className="text-amber-300">{pegawaiList.length} Staf CSV</strong>
          </div>
        </div>

        {syncNotification && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{syncNotification}</span>
          </div>
        )}

        {syncError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{syncError}</span>
            </div>
            <button
              onClick={() => setShowSqlModal(true)}
              className="px-2.5 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-bold text-[11px] underline ml-3 flex-shrink-0"
            >
              Buka Script SQL
            </button>
          </div>
        )}

        {/* 4 Macro Metrics Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pagu JP 10 Unit</div>
            <div className="text-base sm:text-lg font-black text-amber-300 font-mono mt-1">
              {formatRupiah(macroStats.totalPagu)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Alokasi Pagu Anggaran</div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Realisasi JP Terbagi</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-1">
              {formatRupiah(macroStats.totalRealisasi)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              {((macroStats.totalRealisasi / (macroStats.totalPagu || 1)) * 100).toFixed(1)}% Serapan Efisiensi
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Personel Layanan</div>
            <div className="text-base sm:text-lg font-black text-blue-300 font-mono mt-1">
              {macroStats.totalPegawai} Petugas
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">10 Instalasi / Layanan</div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-Rata JP / Personel</div>
            <div className="text-base sm:text-lg font-black text-cyan-300 font-mono mt-1">
              {formatRupiah(macroStats.totalPegawai > 0 ? Math.round(macroStats.totalRealisasi / macroStats.totalPegawai) : 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Per Orang per Bulan</div>
          </div>
        </div>
      </div>

      {/* Primary Sub-Tab Switcher: 1. Overview Rekap Instalasi | 2. Input Kinerja Pegawai */}
      <div className="bg-slate-900 rounded-2xl p-1.5 border border-slate-800 flex items-center space-x-2 shadow-lg">
        <button
          onClick={() => setActiveView('rekap_instalasi')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center space-x-2 ${
            activeView === 'rekap_instalasi'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Rekapitulasi 10 Instalasi & Layanan (Pagu & Serapan)</span>
        </button>

        <button
          onClick={() => setActiveView('rincian_pegawai')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center space-x-2 ${
            activeView === 'rincian_pegawai'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Input & Rincian Kinerja Pegawai ({currentUnit?.namaUnit})</span>
        </button>
      </div>

      {/* VIEW 1: REKAPITULASI 10 INSTALASI & LAYANAN (OVERVIEW TABLE) */}
      {activeView === 'rekap_instalasi' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Daftar Master 10 Instalasi & Layanan Jasa Langsung</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Klik tombol <span className="text-amber-300 font-bold">"Buka Input Kinerja"</span> pada instalasi untuk mengelola capaian poin individu petugas.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Instalasi / Layanan</th>
                    <th className="py-3.5 px-3">Kategori</th>
                    <th className="py-3.5 px-3">3 Indikator Kinerja Spesifik</th>
                    <th className="py-3.5 px-3 text-center">Staf</th>
                    <th className="py-3.5 px-4 text-right">Pagu JP (Rp)</th>
                    <th className="py-3.5 px-4 text-right font-bold text-emerald-400">Realisasi JP (Rp)</th>
                    <th className="py-3.5 px-3 text-center">Total Poin</th>
                    <th className="py-3.5 px-3 text-right">Rp / Poin</th>
                    <th className="py-3.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-200">
                  {unitList.map((u) => {
                    const staffCount = pegawaiList.filter(p => p.unitKode === u.kodeUnit).length;
                    const realisasi = pegawaiList.filter(p => p.unitKode === u.kodeUnit).reduce((sum, p) => sum + p.jpLangsung, 0);
                    const serapanPersen = u.paguJp > 0 ? (realisasi / u.paguJp) * 100 : 100;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{u.namaUnit}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.kodeUnit} • Periode {u.bulan} {u.tahun}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.kategori === 'Nakes Ber-Tarif'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          }`}>
                            {u.kategori}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-300 max-w-xs">
                          <div className="space-y-0.5 text-[11px]">
                            <div>1. <span className="text-slate-200 font-medium">{u.indikator1}</span> <span className="text-slate-500 font-mono">({formatNumber(u.volumeTotal1)})</span></div>
                            <div>2. <span className="text-slate-200 font-medium">{u.indikator2}</span> <span className="text-slate-500 font-mono">({formatNumber(u.volumeTotal2)})</span></div>
                            {u.volumeTotal3 > 0 && (
                              <div>3. <span className="text-slate-200 font-medium">{u.indikator3}</span> <span className="text-slate-500 font-mono">({formatNumber(u.volumeTotal3)})</span></div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-200">
                          {staffCount} org
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          {formatRupiah(u.paguJp)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {formatRupiah(realisasi)}
                          <div className="text-[10px] text-slate-400 font-normal">
                            {serapanPersen.toFixed(1)}% serapan
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-blue-300 font-bold">
                          {u.totalPoin}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                          {formatRupiah(u.rupiahPerPoin)}
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedUnitKode(u.kodeUnit);
                                setActiveView('rincian_pegawai');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center space-x-1 shadow"
                              title="Buka Input Kinerja Pegawai Unit Ini"
                            >
                              <span>Input Kinerja</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {canEdit && (
                              <button
                                onClick={() => handleOpenEditUnit(u)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Ubah Pagu & Indikator Unit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-950 font-mono font-bold text-white border-t-2 border-slate-800">
                  <tr>
                    <td colSpan={3} className="py-3.5 px-4 text-right uppercase text-[10px] text-slate-400 tracking-wider">
                      TOTAL REKAPITULASI KESELURUHAN
                    </td>
                    <td className="py-3.5 px-3 text-center text-blue-300">
                      {macroStats.totalPegawai} org
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-300">
                      {formatRupiah(macroStats.totalPagu)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-400">
                      {formatRupiah(macroStats.totalRealisasi)}
                    </td>
                    <td colSpan={3} className="py-3.5 px-3 text-center text-xs text-slate-400">
                      10 Instalasi Siap Cetak
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INPUT & RINCIAN KINERJA PEGAWAI PER UNIT */}
      {activeView === 'rincian_pegawai' && (
        <div className="space-y-4">
          
          {/* Unit Selector Pills Bar */}
          <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800 shadow-md">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 pb-1 flex items-center justify-between">
              <span>PILIH INSTALASI / LAYANAN JASA LANGSUNG:</span>
              <span className="text-amber-400 font-bold">{currentUnit?.namaUnit} Terpilih</span>
            </div>
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {unitList.map((u) => {
                const isSelected = u.kodeUnit === selectedUnitKode;
                const count = pegawaiList.filter(p => p.unitKode === u.kodeUnit).length;
                return (
                  <button
                    key={u.kodeUnit}
                    onClick={() => {
                      setSelectedUnitKode(u.kodeUnit);
                      setSubKategoriFilter('all');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{u.namaUnit}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit Header Detail Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl p-5 border border-slate-800 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    INSTALASI AKTIF
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Bulan: {currentUnit.bulan} {currentUnit.tahun}</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1 flex items-center space-x-2">
                  <span>Unit: {currentUnit.namaUnit}</span>
                  <span className="text-sm font-normal text-slate-400">({currentUnit.kategori})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Formula Hitung: <span className="font-mono text-amber-300 font-bold">Poin per Orang = (Poin1 + Poin2 + Poin3) / Total Poin</span> • JP Langsung = Poin per Orang x Rp per Poin.
                </p>
              </div>

              {/* Action Buttons for Unit */}
              <div className="flex flex-wrap items-center gap-2">
                {canEdit && (
                  <button
                    onClick={handleOpenAddPegawai}
                    className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pegawai</span>
                  </button>
                )}

                {canEdit && (
                  <button
                    onClick={() => handleOpenEditUnit(currentUnit)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center space-x-1.5"
                  >
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span>Ubah Pagu / Indikator</span>
                  </button>
                )}

                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center space-x-1.5"
                  title="Unduh format CSV Rekapitulasi Pelayanan Unit Ini"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor CSV Unit</span>
                </button>
              </div>
            </div>

            {/* 3 Indikator & Pagu Mini Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Indikator 1 (Total {formatNumber(currentUnit.volumeTotal1)})</div>
                <div className="text-xs font-black text-slate-200 truncate mt-0.5">{currentUnit.indikator1}</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Indikator 2 (Total {formatNumber(currentUnit.volumeTotal2)})</div>
                <div className="text-xs font-black text-slate-200 truncate mt-0.5">{currentUnit.indikator2}</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Indikator 3 (Total {formatNumber(currentUnit.volumeTotal3)})</div>
                <div className="text-xs font-black text-slate-200 truncate mt-0.5">{currentUnit.indikator3}</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-amber-400 font-bold uppercase">Pagu JP Unit ({formatRupiah(currentUnit.paguJp)})</div>
                <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                  Rp {formatNumber(currentUnit.rupiahPerPoin)} / Poin
                </div>
              </div>
            </div>
          </div>

          {/* Search, Sub-category Filter & Column Mode Switcher */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Cari pegawai di ${currentUnit.namaUnit}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* Column View Toggle Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto shadow-inner">
                <button
                  onClick={() => setColumnMode('csv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    columnMode === 'csv'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilkan semua kolom resmi sesuai berkas CSV (15 Kolom Lengkap)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>15 Kolom CSV Lengkap</span>
                </button>
                <button
                  onClick={() => setColumnMode('compact')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    columnMode === 'compact'
                      ? 'bg-blue-600 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan ringkas"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Ringkas</span>
                </button>
              </div>
            </div>

            {availableSubKategori.length > 0 && (
              <div className="flex items-center space-x-1.5 self-start lg:self-auto overflow-x-auto max-w-full pb-1">
                <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Profesi:</span>
                <button
                  onClick={() => setSubKategoriFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                    subKategoriFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({unitPegawaiList.length})
                </button>
                {availableSubKategori.map(kat => (
                  <button
                    key={kat}
                    onClick={() => setSubKategoriFilter(kat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                      subKategoriFilter === kat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {kat} ({unitPegawaiList.filter(p => p.subKategori === kat).length})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Pegawai Kinerja Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
            {columnMode === 'csv' ? (
              /* TABEL LENGKAP 15 KOLOM PERSIS FILE CSV */
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-3 text-center w-10">No</th>
                    <th className="py-3.5 px-4 min-w-[170px]">Nama Staf</th>
                    <th className="py-3.5 px-3 min-w-[130px]">Kategori / Profesi</th>
                    <th className="py-3.5 px-3 text-center bg-blue-950/40 text-blue-300">
                      <div>Prestasi {currentUnit.indikator1}</div>
                    </th>
                    <th className="py-3.5 px-3 text-center bg-slate-900/70 text-slate-400">
                      <div>Total {currentUnit.indikator1}</div>
                    </th>
                    <th className="py-3.5 px-3 text-center bg-blue-950/40 text-blue-300">
                      <div>Prestasi {currentUnit.indikator2}</div>
                    </th>
                    <th className="py-3.5 px-3 text-center bg-slate-900/70 text-slate-400">
                      <div>Total {currentUnit.indikator2}</div>
                    </th>
                    <th className="py-3.5 px-3 text-center bg-blue-950/40 text-blue-300">
                      <div>Prestasi {currentUnit.indikator3}</div>
                    </th>
                    <th className="py-3.5 px-3 text-center bg-slate-900/70 text-slate-400">
                      <div>Total {currentUnit.indikator3}</div>
                    </th>
                    <th className="py-3.5 px-2.5 text-center text-cyan-300">Poin 1</th>
                    <th className="py-3.5 px-2.5 text-center text-cyan-300">Poin 2</th>
                    <th className="py-3.5 px-2.5 text-center text-cyan-300">Poin 3</th>
                    <th className="py-3.5 px-3 text-center font-black text-indigo-300 bg-indigo-950/30">Jumlah Poin</th>
                    <th className="py-3.5 px-4 text-right font-black text-amber-300 bg-amber-950/30 border-l border-amber-900/40">
                      JP Langsung (Rp.)
                    </th>
                    <th className="py-3.5 px-3 text-center font-bold text-slate-300">Persentase</th>
                    {canEdit && <th className="py-3.5 px-3 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredPegawai.length === 0 ? (
                    <tr>
                      <td colSpan={canEdit ? 16 : 15} className="py-12 text-center text-slate-400">
                        <div className="max-w-md mx-auto space-y-2">
                          <p className="font-semibold text-slate-300 text-sm">
                            Tidak ada data pegawai kinerja pada unit {currentUnit.namaUnit}.
                          </p>
                          <p className="text-xs text-slate-500">
                            Klik "+ Tambah Pegawai" di atas atau tombol "Muat Baseline CSV" untuk mengisi data resmi.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPegawai.map((p, index) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition font-mono">
                        <td className="py-3 px-3 text-center text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4 font-sans font-bold text-white">
                          <div className="text-xs sm:text-sm">{p.nama}</div>
                          {p.nip && <div className="text-[10px] text-slate-500 font-mono">NIP: {p.nip}</div>}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded-md bg-blue-950/90 text-blue-300 font-bold border border-blue-800 text-[11px] inline-block">
                            {p.subKategori || p.keterangan || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-200 bg-blue-950/15 font-bold">
                          {formatNumber(p.prestasi1)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 bg-slate-900/40">
                          {formatNumber(p.totalBulan1)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-200 bg-blue-950/15 font-bold">
                          {formatNumber(p.prestasi2)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 bg-slate-900/40">
                          {formatNumber(p.totalBulan2)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-200 bg-blue-950/15 font-bold">
                          {formatNumber(p.prestasi3)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 bg-slate-900/40">
                          {formatNumber(p.totalBulan3)}
                        </td>
                        <td className="py-3 px-2.5 text-center text-cyan-300 font-bold">{p.poin1}</td>
                        <td className="py-3 px-2.5 text-center text-cyan-300 font-bold">{p.poin2}</td>
                        <td className="py-3 px-2.5 text-center text-cyan-300 font-bold">{p.poin3}</td>
                        <td className="py-3 px-3 text-center font-black text-indigo-300 bg-indigo-950/25 text-xs">
                          {p.jumlahPoin}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-amber-300 bg-amber-950/20 text-sm border-l border-amber-900/40">
                          {formatRupiah(p.jpLangsung)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-300 font-bold">
                          {p.persenPoin}%
                        </td>
                        {canEdit && (
                          <td className="py-3 px-3 text-center whitespace-nowrap font-sans">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleOpenEditPegawai(p)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Ubah Nilai Kinerja"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePegawai(p.id, p.nama)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                                title="Hapus Pegawai"
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
                <tfoot className="bg-slate-950 font-mono font-bold text-white border-t-2 border-slate-800">
                  <tr>
                    <td colSpan={3} className="py-3.5 px-4 text-right uppercase text-[10px] text-slate-400">
                      TOTAL VOLUME & POIN KINERJA BULANAN
                    </td>
                    <td className="py-3.5 px-3 text-center text-blue-300 font-bold">
                      {formatNumber(unitPegawaiList.reduce((sum, p) => sum + p.prestasi1, 0))}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">
                      {formatNumber(currentUnit.volumeTotal1)}
                    </td>
                    <td className="py-3.5 px-3 text-center text-blue-300 font-bold">
                      {formatNumber(unitPegawaiList.reduce((sum, p) => sum + p.prestasi2, 0))}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">
                      {formatNumber(currentUnit.volumeTotal2)}
                    </td>
                    <td className="py-3.5 px-3 text-center text-blue-300 font-bold">
                      {formatNumber(unitPegawaiList.reduce((sum, p) => sum + p.prestasi3, 0))}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">
                      {formatNumber(currentUnit.volumeTotal3)}
                    </td>
                    <td className="py-3.5 px-2.5 text-center text-cyan-300">
                      {unitPegawaiList.reduce((sum, p) => sum + p.poin1, 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-2.5 text-center text-cyan-300">
                      {unitPegawaiList.reduce((sum, p) => sum + p.poin2, 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-2.5 text-center text-cyan-300">
                      {unitPegawaiList.reduce((sum, p) => sum + p.poin3, 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-center text-indigo-300">
                      {currentUnit.totalPoin}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-300 text-sm">
                      {formatRupiah(unitPegawaiList.reduce((acc, p) => acc + p.jpLangsung, 0))}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-300">
                      100%
                    </td>
                    {canEdit && <td></td>}
                  </tr>
                </tfoot>
              </table>
            ) : (
              /* TABEL RINGKAS */
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-4">Nama Pegawai / Petugas</th>
                    <th className="py-3 px-3 text-center bg-slate-900/50">
                      <div className="truncate max-w-[130px]" title={currentUnit.indikator1}>{currentUnit.indikator1}</div>
                      <div className="text-[9px] text-slate-500 font-normal">Total: {formatNumber(currentUnit.volumeTotal1)}</div>
                    </th>
                    <th className="py-3 px-3 text-center bg-slate-900/50">
                      <div className="truncate max-w-[130px]" title={currentUnit.indikator2}>{currentUnit.indikator2}</div>
                      <div className="text-[9px] text-slate-500 font-normal">Total: {formatNumber(currentUnit.volumeTotal2)}</div>
                    </th>
                    <th className="py-3 px-3 text-center bg-slate-900/50">
                      <div className="truncate max-w-[130px]" title={currentUnit.indikator3}>{currentUnit.indikator3}</div>
                      <div className="text-[9px] text-slate-500 font-normal">Total: {formatNumber(currentUnit.volumeTotal3)}</div>
                    </th>
                    <th className="py-3 px-3 text-center font-bold text-blue-300">Poin 1</th>
                    <th className="py-3 px-3 text-center font-bold text-blue-300">Poin 2</th>
                    <th className="py-3 px-3 text-center font-bold text-blue-300">Poin 3</th>
                    <th className="py-3 px-3 text-center font-black text-indigo-300 bg-indigo-950/20">Jumlah Poin</th>
                    <th className="py-3 px-3 text-center font-bold text-slate-400">% Porsi</th>
                    <th className="py-3 px-4 text-right font-black text-amber-300 bg-amber-950/20 border-l border-amber-900/40">
                      JP Langsung (Rp)
                    </th>
                    {canEdit && <th className="py-3 px-3 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredPegawai.length === 0 ? (
                    <tr>
                      <td colSpan={canEdit ? 12 : 11} className="py-12 text-center text-slate-400">
                        <div className="max-w-md mx-auto space-y-2">
                          <p className="font-semibold text-slate-300 text-sm">
                            Tidak ada data pegawai kinerja pada unit {currentUnit.namaUnit}.
                          </p>
                          <p className="text-xs text-slate-500">
                            Klik "+ Tambah Pegawai" di atas atau tombol "Muat Baseline CSV" untuk mengisi data resmi.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPegawai.map((p, index) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs sm:text-sm">{p.nama}</div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                            {p.subKategori && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800">
                                {p.subKategori}
                              </span>
                            )}
                            <span>{p.keterangan || currentUnit.namaUnit}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-200 bg-slate-900/30 font-bold">
                          {formatNumber(p.prestasi1)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-200 bg-slate-900/30 font-bold">
                          {formatNumber(p.prestasi2)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-200 bg-slate-900/30 font-bold">
                          {formatNumber(p.prestasi3)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-blue-300">
                          {p.poin1}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-blue-300">
                          {p.poin2}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-blue-300">
                          {p.poin3}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-indigo-300 bg-indigo-950/20">
                          {p.jumlahPoin}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                          {p.persenPoin}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-amber-300 bg-amber-950/20 text-sm border-l border-amber-900/40">
                          {formatRupiah(p.jpLangsung)}
                        </td>
                        {canEdit && (
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleOpenEditPegawai(p)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Ubah Nilai Kinerja"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePegawai(p.id, p.nama)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                                title="Hapus Pegawai"
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
                <tfoot className="bg-slate-950 font-mono font-bold text-white border-t-2 border-slate-800">
                  <tr>
                    <td colSpan={2} className="py-3.5 px-4 text-right uppercase text-[10px] text-slate-400">
                      TOTAL VOLUME BULANAN UNIT
                    </td>
                    <td className="py-3.5 px-3 text-center text-blue-300 font-bold">
                      {formatNumber(currentUnit.volumeTotal1)}
                    </td>
                    <td className="py-3.5 px-3 text-center text-blue-300 font-bold">
                      {formatNumber(currentUnit.volumeTotal2)}
                    </td>
                    <td className="py-3.5 px-3 text-center text-blue-300 font-bold">
                      {formatNumber(currentUnit.volumeTotal3)}
                    </td>
                    <td colSpan={3} className="py-3.5 px-3 text-center text-slate-500 text-[10px]">
                      Total Bobot Poin:
                    </td>
                    <td className="py-3.5 px-3 text-center text-indigo-300">
                      {currentUnit.totalPoin}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">
                      100%
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-300 text-sm">
                      {formatRupiah(unitPegawaiList.reduce((acc, p) => acc + p.jpLangsung, 0))}
                    </td>
                    {canEdit && <td></td>}
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH / EDIT PEGAWAI KINERJA */}
      {showPegawaiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>{editingPegawai ? 'Ubah Data Kinerja Pegawai' : 'Tambah Pegawai Baru'}</span>
              </h3>
              <span className="text-xs text-amber-300 font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {currentUnit.namaUnit}
              </span>
            </div>

            <form onSubmit={handleSavePegawai} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Lengkap Pegawai</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nurhikmah, S.Gz"
                  value={pegawaiForm.nama}
                  onChange={(e) => setPegawaiForm(prev => ({ ...prev, nama: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kategori / Sub-Profesi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Apoteker / AA"
                    value={pegawaiForm.subKategori}
                    onChange={(e) => setPegawaiForm(prev => ({ ...prev, subKategori: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Keterangan / Jabatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Nutrisionis"
                    value={pegawaiForm.keterangan}
                    onChange={(e) => setPegawaiForm(prev => ({ ...prev, keterangan: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Prestasi Inputs with Live Calculation */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                  Capaian Prestasi Kinerja (Perhitungan Poin Otomatis)
                </div>

                {/* Indikator 1 */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold truncate max-w-[240px]">1. {currentUnit.indikator1}</span>
                    <span className="text-slate-400 font-mono">Poin: <strong className="text-blue-300">{pegawaiForm.poin1}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={pegawaiForm.prestasi1}
                      onChange={(e) => handlePegawaiFormChange('prestasi1', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                    <span className="text-xs text-slate-400 font-mono">/ {currentUnit.volumeTotal1}</span>
                  </div>
                </div>

                {/* Indikator 2 */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold truncate max-w-[240px]">2. {currentUnit.indikator2}</span>
                    <span className="text-slate-400 font-mono">Poin: <strong className="text-blue-300">{pegawaiForm.poin2}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={pegawaiForm.prestasi2}
                      onChange={(e) => handlePegawaiFormChange('prestasi2', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                    <span className="text-xs text-slate-400 font-mono">/ {currentUnit.volumeTotal2}</span>
                  </div>
                </div>

                {/* Indikator 3 */}
                {currentUnit.volumeTotal3 > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span className="font-semibold truncate max-w-[240px]">3. {currentUnit.indikator3}</span>
                      <span className="text-slate-400 font-mono">Poin: <strong className="text-blue-300">{pegawaiForm.poin3}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={pegawaiForm.prestasi3}
                        onChange={(e) => handlePegawaiFormChange('prestasi3', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                      <span className="text-xs text-slate-400 font-mono">/ {currentUnit.volumeTotal3}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Output Live Summary */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase">Estimasi JP Langsung</div>
                  <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                    {formatRupiah(pegawaiForm.jpLangsung)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Jumlah Poin: <strong className="text-white">{pegawaiForm.jumlahPoin}</strong> ({pegawaiForm.persenPoin}%)
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <span>Pagu Unit:</span>
                  <div className="font-mono text-slate-300">{formatRupiah(currentUnit.paguJp)}</div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPegawaiModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg"
                >
                  {editingPegawai ? 'Simpan Perubahan' : 'Tambah ke Tabel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KONFIGURASI PAGU & INDIKATOR UNIT */}
      {showUnitModal && editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <span>Pengaturan Unit: {editingUnit.namaUnit}</span>
              </h3>
              <span className="text-xs text-blue-300 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                {editingUnit.kodeUnit}
              </span>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nama Unit / Instalasi</label>
                  <input
                    type="text"
                    required
                    value={unitForm.namaUnit}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, namaUnit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kategori Layanan</label>
                  <select
                    value={unitForm.kategori}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, kategori: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Nakes Ber-Tarif">Nakes Ber-Tarif</option>
                    <option value="Nakes Non-Tarif">Nakes Non-Tarif</option>
                    <option value="Tenaga Medis">Tenaga Medis</option>
                    <option value="Keperawatan">Keperawatan</option>
                  </select>
                </div>
              </div>

              <div>
                <CurrencyInput
                  label="Pagu Anggaran Jasa Pelayanan Unit (Rp)"
                  value={unitForm.paguJp}
                  onChange={(val) => setUnitForm(prev => ({ ...prev, paguJp: val }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Total Poin Standar</label>
                  <input
                    type="number"
                    step="any"
                    value={unitForm.totalPoin}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, totalPoin: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Rupiah per Poin</label>
                  <input
                    type="number"
                    value={unitForm.rupiahPerPoin}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, rupiahPerPoin: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Indikator Configuration */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase">3 Indikator Spesifik Kinerja Unit</div>
                
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Indikator 1 & Target Volume</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={unitForm.indikator1}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, indikator1: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="number"
                      value={unitForm.volumeTotal1}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, volumeTotal1: Number(e.target.value) }))}
                      className="w-24 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono text-center"
                      placeholder="Volume"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Indikator 2 & Target Volume</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={unitForm.indikator2}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, indikator2: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="number"
                      value={unitForm.volumeTotal2}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, volumeTotal2: Number(e.target.value) }))}
                      className="w-24 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono text-center"
                      placeholder="Volume"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Indikator 3 & Target Volume</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={unitForm.indikator3}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, indikator3: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="number"
                      value={unitForm.volumeTotal3}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, volumeTotal3: Number(e.target.value) }))}
                      className="w-24 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono text-center"
                      placeholder="Volume"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUnitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg"
                >
                  Simpan Konfigurasi Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SQL DDL SCRIPT SUPABASE */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Skrip SQL DDL Supabase (Tabel Jasa Langsung & Kinerja)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Jalankan skrip ini sekali di menu <strong>SQL Editor</strong> pada dasbor Supabase Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 whitespace-pre leading-relaxed select-all">
              {SQL_DDL_SCRIPT}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-shrink-0">
              <div className="text-xs text-slate-400">
                Mencakup tabel: <code className="text-white">unit_kinerja_layanan</code> & <code className="text-white">pegawai_kinerja_layanan</code>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SQL_DDL_SCRIPT);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition flex items-center space-x-2"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Semua Skrip SQL'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
