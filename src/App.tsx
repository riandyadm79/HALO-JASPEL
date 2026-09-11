import React, { useState, useEffect } from 'react';
import { 
  INITIAL_USERS, 
  INITIAL_ALOKASI, 
  INITIAL_PENERIMA, 
  INITIAL_GENERAL_INDEX, 
  INITIAL_COST_CENTER, 
  INITIAL_REVENUE_CENTER, 
  INITIAL_INDEKS_JASA_LANGSUNG,
  DEFAULT_INDEKS_JASA_HEADER_CONFIG,
  INITIAL_PERMISSIONS, 
  INITIAL_STORAGE_FILES 
} from './data/initialData';
import { 
  User, 
  AlokasiJaspel, 
  PenerimaAlokasi, 
  GeneralIndexItem, 
  CostCenterItem, 
  RevenueCenterItem, 
  IndeksJasaLangsungItem,
  IndeksJasaHeaderConfig,
  Permission, 
  SupabaseConfig, 
  BucketStorageFile 
} from './types';
import { INITIAL_SUPABASE_CONFIG } from './config/supabase_config';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { AlokasiManager } from './components/AlokasiManager';
import { DatabaseManager } from './components/DatabaseManager';
import { RbacMatrixManager } from './components/RbacMatrixManager';
import { SupabaseSyncManager } from './components/SupabaseSyncManager';
import { ExportImportCenter } from './components/ExportImportCenter';
import { SimulasiKalkulator } from './components/SimulasiKalkulator';
import { SlipJaspelModal } from './components/SlipJaspelModal';
import { VisualisasiDashboard } from './components/VisualisasiDashboard';
import { RekapCetakManager } from './components/RekapCetakManager';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { HospitalProfileModal, HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from './components/HospitalProfileModal';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { supabase } from './lib/supabase';
import { seedDatabase } from './data/seedDatabase';
import { pushAllDataToSupabase, pullAllDataFromSupabase, testSupabaseConnection } from './lib/syncService';
import { formatRupiah } from './utils/calculations';
import { FileText, Sparkles, Check, Download, AlertCircle, Info, Edit3, X, Loader2 } from 'lucide-react';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // View state: 'landing' (public portal), 'login' (auth screen), 'app' (authenticated dashboard)
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'app'>('landing');

  // 1. User & Persona State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('halo_japel_users_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_USERS;
  });

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('rekap_cetak');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dbSubTab, setDbSubTab] = useState<'general' | 'cost' | 'revenue' | 'indeks_jasa'>('general');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Alokasi & Penerima State
  const [alokasiList, setAlokasiList] = useState<AlokasiJaspel[]>(() => {
    const saved = localStorage.getItem('halo_japel_alokasi_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ALOKASI;
  });
  const [penerimaList, setPenerimaList] = useState<PenerimaAlokasi[]>(() => {
    const saved = localStorage.getItem('halo_japel_penerima_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(p => p.id === 'pen-1' || p.nama?.includes('Satria Pratama') || p.nama?.includes('Ratna Kartika'))) {
          localStorage.removeItem('halo_japel_penerima_list');
          return [];
        }
        return parsed;
      } catch (e) {}
    }
    return INITIAL_PENERIMA;
  });

  // 4. Database Master State
  const [generalIndexList, setGeneralIndexList] = useState<GeneralIndexItem[]>(() => {
    const saved = localStorage.getItem('halo_japel_genidx_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_GENERAL_INDEX;
  });
  const [costCenterList, setCostCenterList] = useState<CostCenterItem[]>(() => {
    const saved = localStorage.getItem('halo_japel_cost_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_COST_CENTER;
  });
  const [revenueCenterList, setRevenueCenterList] = useState<RevenueCenterItem[]>(() => {
    const saved = localStorage.getItem('halo_japel_rev_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_REVENUE_CENTER;
  });

  const [indeksJasaList, setIndeksJasaList] = useState<IndeksJasaLangsungItem[]>(() => {
    const saved = localStorage.getItem('halo_japel_indeks_jasa_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_INDEKS_JASA_LANGSUNG;
  });

  const [indeksJasaHeaderConfig, setIndeksJasaHeaderConfig] = useState<IndeksJasaHeaderConfig>(() => {
    const saved = localStorage.getItem('halo_japel_indeks_jasa_hdr_cfg');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_INDEKS_JASA_HEADER_CONFIG;
  });

  // 5. Hospital Profile State
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(() => {
    const saved = localStorage.getItem('halo_japel_hospital_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_HOSPITAL_PROFILE;
  });

  // Automatically keep localStorage in sync with user edits
  useEffect(() => {
    localStorage.setItem('halo_japel_alokasi_list', JSON.stringify(alokasiList));
  }, [alokasiList]);

  useEffect(() => {
    localStorage.setItem('halo_japel_penerima_list', JSON.stringify(penerimaList));
  }, [penerimaList]);

  useEffect(() => {
    localStorage.setItem('halo_japel_genidx_list', JSON.stringify(generalIndexList));
  }, [generalIndexList]);

  useEffect(() => {
    localStorage.setItem('halo_japel_cost_list', JSON.stringify(costCenterList));
  }, [costCenterList]);

  useEffect(() => {
    localStorage.setItem('halo_japel_rev_list', JSON.stringify(revenueCenterList));
  }, [revenueCenterList]);

  useEffect(() => {
    localStorage.setItem('halo_japel_indeks_jasa_list', JSON.stringify(indeksJasaList));
  }, [indeksJasaList]);

  useEffect(() => {
    localStorage.setItem('halo_japel_indeks_jasa_hdr_cfg', JSON.stringify(indeksJasaHeaderConfig));
  }, [indeksJasaHeaderConfig]);

  useEffect(() => {
    localStorage.setItem('halo_japel_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('halo_japel_hospital_profile', JSON.stringify(hospitalProfile));
  }, [hospitalProfile]);

  // Auto-check Supabase Connection on initial app load
  useEffect(() => {
    const checkInitialConnection = async () => {
      try {
        const diag = await testSupabaseConnection();
        setSupabaseConfig(prev => ({
          ...prev,
          connected: diag.connected,
          latency: diag.latencyMs,
          lastCheckedDate: new Date().toISOString()
        }));
      } catch (err) {
        console.warn('Initial Supabase connection check error:', err);
      }
    };
    checkInitialConnection();
  }, []);

  // Auto-push to Supabase whenever changes are made & saved
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await pushAllDataToSupabase({
          alokasiList,
          penerimaList,
          generalIndexList,
          costCenterList,
          revenueCenterList,
          indeksJasaList,
          users,
          hospitalProfile
        });
      } catch (err) {
        console.warn('Background auto-push notice:', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [alokasiList, penerimaList, generalIndexList, costCenterList, revenueCenterList, indeksJasaList, users, hospitalProfile]);

  // 5. RBAC & Permissions State
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS);

  // 6. Supabase & Bucket Storage State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const envConfig = typeof window !== 'undefined' && (window as any).ENV;
    if (envConfig && envConfig.SUPABASE_URL) {
      return {
        ...INITIAL_SUPABASE_CONFIG,
        supabaseUrl: envConfig.SUPABASE_URL,
        supabaseAnonKey: envConfig.SUPABASE_ANON_KEY || INITIAL_SUPABASE_CONFIG.supabaseAnonKey,
        databaseUrl: envConfig.DATABASE_URL || INITIAL_SUPABASE_CONFIG.databaseUrl
      };
    }
    return INITIAL_SUPABASE_CONFIG;
  });

  const [storageFiles, setStorageFiles] = useState<BucketStorageFile[]>(INITIAL_STORAGE_FILES);

  // 7. Modals / Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stafSlipOpen, setStafSlipOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showHospitalProfileModal, setShowHospitalProfileModal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // 8. Announcement
  const [announcement, setAnnouncement] = useState({ message: '', isVisible: false, type: 'info' });
  const [showAnnouncementEdit, setShowAnnouncementEdit] = useState(false);

  // Auth & Data Fetching
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setViewMode('app');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setViewMode('app');
      } else if (!currentUser) {
        setViewMode('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: alokasi, error: alokasiErr },
        { data: penerima, error: penerimaErr },
        { data: genIdx, error: genIdxErr },
        { data: cost, error: costErr },
        { data: revenue, error: revErr },
        { data: ijlData, error: ijlErr },
        { data: usr, error: usrErr },
        { data: hospData, error: hospErr }
      ] = await Promise.all([
        supabase.from('alokasi_jaspel').select('*'),
        supabase.from('penerima_alokasi').select('*'),
        supabase.from('general_index').select('*'),
        supabase.from('cost_center').select('*'),
        supabase.from('revenue_center').select('*'),
        supabase.from('indeks_jasa_langsung').select('*'),
        supabase.from('users_rbac').select('*'),
        supabase.from('hospital_profile').select('*').limit(1).maybeSingle()
      ]);

      if (hospData) {
        setHospitalProfile({
          badgeText: hospData.badge_text || DEFAULT_HOSPITAL_PROFILE.badgeText,
          badgeColor: hospData.badge_color || DEFAULT_HOSPITAL_PROFILE.badgeColor,
          hospitalName: hospData.hospital_name || DEFAULT_HOSPITAL_PROFILE.hospitalName,
          subtitle: hospData.subtitle || DEFAULT_HOSPITAL_PROFILE.subtitle,
          hospitalType: hospData.hospital_type || DEFAULT_HOSPITAL_PROFILE.hospitalType,
          pemdaName: hospData.pemda_name || DEFAULT_HOSPITAL_PROFILE.pemdaName,
          address: hospData.address || DEFAULT_HOSPITAL_PROFILE.address,
          city: hospData.city || DEFAULT_HOSPITAL_PROFILE.city,
          phone: hospData.phone || DEFAULT_HOSPITAL_PROFILE.phone,
          directorName: hospData.director_name || DEFAULT_HOSPITAL_PROFILE.directorName,
          directorNip: hospData.director_nip || DEFAULT_HOSPITAL_PROFILE.directorNip,
          directorTitle: hospData.director_title || DEFAULT_HOSPITAL_PROFILE.directorTitle,
          committeeLeadName: hospData.committee_lead_name || DEFAULT_HOSPITAL_PROFILE.committeeLeadName,
          committeeLeadNip: hospData.committee_lead_nip || DEFAULT_HOSPITAL_PROFILE.committeeLeadNip,
          committeeLeadTitle: hospData.committee_lead_title || DEFAULT_HOSPITAL_PROFILE.committeeLeadTitle,
        });
      }

      if (alokasi && alokasi.length > 0) {
        setAlokasiList(alokasi.map((a: any) => ({
          id: a.id, kodePeriode: a.kode_periode, bulan: a.bulan, tahun: a.tahun,
          sumberDana: a.sumber_dana, pendapatanKotor: Number(a.pendapatan_kotor) || 0, 
          biayaOperasionalRs: Number(a.biaya_operasional_rs) || 0,
          paguJaspelNetto: Number(a.pagu_jaspel_netto) || 0, 
          proporsiJaspelPersen: Number(a.proporsi_jaspel_persen) || 42,
          jasaMedisKlinisPersen: Number(a.jasa_medis_klinis_persen) || 60, 
          jasaNonKlinisPersen: Number(a.jasa_non_klinis_persen) || 30,
          jasaManajemenPersen: Number(a.jasa_manajemen_persen) || 10, 
          status: a.status, keterangan: a.keterangan
        })));
      }

      if (penerima && penerima.length > 0) {
        setPenerimaList(penerima.map((p: any) => ({
          id: p.id, alokasiId: p.alokasi_id, pegawaiId: p.pegawai_id, nama: p.nama,
          unitKerja: p.unit_kerja, kategori: p.kategori, jabatan: p.jabatan,
          poinDasar: Number(p.poin_dasar) || 0, poinKompetensi: Number(p.poin_kompetensi) || 0, 
          poinRisiko: Number(p.poin_risiko) || 0, poinKinerja: Number(p.poin_kinerja) || 0, 
          totalPoin: Number(p.total_poin) || 0, nilaiPerPoin: Number(p.nilai_per_poin) || 0,
          brutoJaspel: Number(p.bruto_jaspel) || 0, pajakPph21Persen: Number(p.pajak_pph21_persen) || 5, 
          potonganPph21: Number(p.potongan_pph21) || 0, nettoDiterima: Number(p.netto_diterima) || 0,
          statusKoreksi: p.status_koreksi, catatanKoreksi: p.catatan_koreksi, sudahDibayar: p.sudah_dibayar
        })));
      }

      if (genIdx && genIdx.length > 0) {
        setGeneralIndexList(genIdx.map((g: any) => ({
          id: g.id, kode: g.kode, nip: g.nip, namaPegawai: g.nama_pegawai, unitKerja: g.unit_kerja,
          golongan: g.golongan, pendidikan: g.pendidikan, masaKerjaTahun: g.masa_kerja_tahun,
          skorDasar: Number(g.skor_dasar) || 0, skorKompetensi: Number(g.skor_kompetensi) || 0,
          skorRisiko: Number(g.skor_risiko) || 0, skorKinerja: Number(g.skor_kinerja) || 0, 
          bobotPresensi: Number(g.bobot_presensi) || 0, statusPegawai: g.status_pegawai
        })));
      }

      if (cost && cost.length > 0) {
        setCostCenterList(cost.map((c: any) => ({
          id: c.id, kodeCostCenter: c.kode_cost_center, namaPusatBiaya: c.nama_pusat_biaya,
          kategori: c.kategori, alokasiAnggaranBulanan: Number(c.alokasi_anggaran_bulanan) || 0,
          realisasiBiaya: Number(c.realisasi_biaya) || 0, penanggungJawab: c.penanggung_jawab, 
          status: c.status, keterangan: c.keterangan
        })));
      }

      if (revenue && revenue.length > 0) {
        setRevenueCenterList(revenue.map((r: any) => ({
          id: r.id, kodeRevenueCenter: r.kode_revenue_center, namaPusatLayanan: r.nama_pusat_layanan,
          kategoriLayanan: r.kategori_layanan, targetPendapatanBulanan: Number(r.target_pendapatan_bulanan) || 0,
          realisasiPendapatan: Number(r.realisasi_pendapatan) || 0, 
          persentasePencapaian: Number(r.persentase_pencapaian) || 0
        })));
      }

      if (ijlData && ijlData.length > 0) {
        setIndeksJasaList(ijlData.map((ijl: any) => ({
          id: ijl.id,
          kode: ijl.kode,
          instalasiLayanan: ijl.instalasi_layanan || ijl.instalasiLayanan,
          kategori: ijl.kategori || '',
          kinerja1: Number(ijl.kinerja1) || 0,
          kinerja2: Number(ijl.kinerja2) || 0,
          kinerja3: Number(ijl.kinerja3) || 0,
          totalPoin: Number(ijl.total_poin) || 0,
          jumlahAlokasi: Number(ijl.jumlah_alokasi) || 0,
          rupiahPerPoin1: Number(ijl.rupiah_per_poin1) || 0,
          rupiahPerPoin2: Number(ijl.rupiah_per_poin2) || 0,
          nilaiJpLangsung: Number(ijl.nilai_jp_langsung) || 0
        })));
      }

      if (usr && usr.length > 0) {
        setUsers(usr.map((u: any) => ({
          id: u.id, nama: u.nama, role: u.role, unit: u.unit, jabatan: u.jabatan, email: u.email
        })));
      }

    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    const result = await seedDatabase();
    if (result.success) {
      showToast('Berhasil melakukan sinkronisasi & push data ke Supabase Cloud!');
      await fetchData();
    } else {
      showToast('Gagal sinkronisasi: ' + (result.error as Error).message);
    }
    setIsSeeding(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Push Trigger Handler - Push CURRENT app state to Supabase Cloud
  const handlePushCloud = async () => {
    setIsLoading(true);
    try {
      const res = await pushAllDataToSupabase({
        alokasiList,
        penerimaList,
        generalIndexList,
        costCenterList,
        revenueCenterList,
        indeksJasaList,
        users,
        hospitalProfile
      });
      if (res.success) {
        showToast(res.message);
        setSupabaseConfig(prev => ({
          ...prev,
          lastPushDate: new Date().toISOString()
        }));
      } else {
        showToast(res.message);
      }
    } catch (e: any) {
      showToast('Gagal Push: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Pull Trigger Handler - Pull real data from Supabase Cloud
  const handlePullCloud = async () => {
    setIsLoading(true);
    try {
      const res = await pullAllDataFromSupabase();
      if (res.success && res.data) {
        if (res.data.alokasiList && res.data.alokasiList.length > 0) {
          setAlokasiList(res.data.alokasiList);
        }
        if (res.data.penerimaList && res.data.penerimaList.length > 0) {
          setPenerimaList(res.data.penerimaList);
        }
        if (res.data.generalIndexList && res.data.generalIndexList.length > 0) {
          setGeneralIndexList(res.data.generalIndexList);
        }
        if (res.data.costCenterList && res.data.costCenterList.length > 0) {
          setCostCenterList(res.data.costCenterList);
        }
        if (res.data.revenueCenterList && res.data.revenueCenterList.length > 0) {
          setRevenueCenterList(res.data.revenueCenterList);
        }
        if (res.data.indeksJasaList && res.data.indeksJasaList.length > 0) {
          setIndeksJasaList(res.data.indeksJasaList);
        }
        if (res.data.users && res.data.users.length > 0) {
          setUsers(res.data.users);
        }
        if (res.data.hospitalProfile) {
          setHospitalProfile(res.data.hospitalProfile);
        }
        setSupabaseConfig(prev => ({
          ...prev,
          lastPullDate: new Date().toISOString()
        }));
        showToast(res.message);
      } else {
        showToast(res.message);
      }
    } catch (e: any) {
      showToast('Gagal Pull: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply simulated pagu to first active alokasi draft
  const handleApplySimulation = (paguBaru: number, nilaiPoinBaru: number) => {
    if (alokasiList.length > 0) {
      setAlokasiList(alokasiList.map((a, idx) => {
        if (idx === 0) {
          return {
            ...a,
            paguJaspelNetto: paguBaru
          };
        }
        return a;
      }));
      showToast(`Pagu simulasi ${formatRupiah(paguBaru)} diterapkan ke draft alokasi!`);
      setActiveTab('alokasi');
    }
  };

  // Check if current user has an assigned recipient record in current active alokasi
  const activeAlokasi = alokasiList[0];
  const myPenerimaRecord = penerimaList.find(
    p => (currentUser?.nama && p.nama.toLowerCase().includes(currentUser.nama.toLowerCase().split(' ')[0])) || 
         (currentUser?.id && p.pegawaiId === currentUser.id)
  ) || penerimaList[0];

  // Logout Handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setSession(null);
    setCurrentUser(null);
    setViewMode('landing');
    showToast('Anda telah keluar dari sistem secara aman.');
  };

  // Loading Screen
  if (isLoading && !alokasiList.length) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center space-y-4 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm font-bold text-slate-300 animate-pulse">
          Menghubungkan ke Database Supabase Cloud RSUD...
        </p>
      </div>
    );
  }

  // 1. VIEW MODE: LANDING PAGE (Shown before login, contains Visualisasi Dashboard)
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onGoToLogin={() => setViewMode('login')}
        alokasiList={alokasiList}
        costCenterList={costCenterList}
        revenueCenterList={revenueCenterList}
        penerimaList={penerimaList}
        hospitalProfile={hospitalProfile}
      />
    );
  }

  // 2. VIEW MODE: LOGIN SCREEN
  if (viewMode === 'login' || (!currentUser && !session)) {
    return (
      <Login 
        onLogin={(user) => {
          setCurrentUser(user);
          setViewMode('app');
          showToast(`Berhasil masuk sebagai ${user.nama} (${user.role.toUpperCase()})`);
        }} 
        onBackToLanding={() => setViewMode('landing')}
        hospitalProfile={hospitalProfile}
      />
    );
  }

  // 3. VIEW MODE: AUTHENTICATED DASHBOARD APPLICATION
  const effectiveUser = currentUser || {
    id: session?.user?.id || 'usr-default',
    nama: session?.user?.email?.split('@')[0] || 'Super Administrator',
    role: 'superadmin',
    unit: 'Direksi',
    jabatan: 'Direktur RSUD'
  };

  return (
    <div className="app-root min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={effectiveUser}
        users={users}
        onSelectUser={(user) => {
          setCurrentUser(user);
          showToast(`Beralih ke peran: ${user.nama} (${(user.role || 'staf').toUpperCase()})`);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rlsEnabled={supabaseConfig.rlsEnabled}
        onOpenSyncModal={() => setActiveTab('supabase')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        onLogout={handleLogout}
        onGoToLanding={() => setViewMode('landing')}
        hospitalProfile={hospitalProfile}
        onOpenHospitalProfile={() => setShowHospitalProfileModal(true)}
      />

      {/* System Announcement Banner */}
      {(announcement.isVisible || effectiveUser?.role === 'superadmin') && (
        <div className={`px-4 py-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b z-30 transition-all ${
          announcement.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
          announcement.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' :
          'bg-blue-500/10 border-blue-500/30 text-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {announcement.type === 'warning' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
            <span className="font-medium">
              {announcement.message || (effectiveUser?.role === 'superadmin' ? 'Pengumuman Sistem RSUD (Admin Only View).' : '')}
            </span>
          </div>
          {effectiveUser?.role === 'superadmin' && (
            <button
              onClick={() => setShowAnnouncementEdit(true)}
              className="flex items-center space-x-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 border border-slate-600 transition shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              <span>Kelola Pengumuman</span>
            </button>
          )}
        </div>
      )}

      {/* Main Responsive Body (Sidebar + Content Canvas) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* 2. Desktop Persistent Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={effectiveUser}
          rlsEnabled={supabaseConfig.rlsEnabled}
          onOpenSyncModal={() => setActiveTab('supabase')}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          dbSubTab={dbSubTab}
          setDbSubTab={setDbSubTab}
          hospitalProfile={hospitalProfile}
          onOpenHospitalProfile={() => setShowHospitalProfileModal(true)}
        />

        {/* 3. Main Workspace Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          
          {/* Active Persona Banner for Staff */}
          {(effectiveUser?.role === 'staf' || !effectiveUser?.role) && activeTab === 'alokasi' && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-900 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Mode Transparansi Staf</span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Selamat datang, {effectiveUser?.nama || 'Pengguna'}!
                </h3>
                <p className="text-xs text-slate-300">
                  Sebagai Staf/Penerima, Anda memiliki akses penuh melihat transparansi slip jaspel pribadi Anda.
                </p>
              </div>

              <button
                onClick={() => setStafSlipOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
              >
                <FileText className="w-4 h-4" />
                <span>Lihat & Cetak Slip Jaspel Saya</span>
              </button>
            </div>
          )}

          {/* TAB 0: REKAP PENERIMAAN & CETAK SEMUA TABEL */}
          {activeTab === 'rekap_cetak' && (
            <RekapCetakManager
              alokasiList={alokasiList}
              penerimaList={penerimaList}
              generalIndexList={generalIndexList}
              costCenterList={costCenterList}
              revenueCenterList={revenueCenterList}
              currentUser={effectiveUser}
              permissions={permissions}
              hospitalProfile={hospitalProfile}
            />
          )}

          {/* TAB 1: ALOKASI JASPEL (CRUD, Rekap, Rincian, Status Workflow) */}
          {activeTab === 'alokasi' && (
            <AlokasiManager
              alokasiList={alokasiList}
              setAlokasiList={setAlokasiList}
              penerimaList={penerimaList}
              setPenerimaList={setPenerimaList}
              generalIndexList={generalIndexList}
              currentUser={effectiveUser}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          )}

          {/* TAB 2: DATABASE MANAJER (General Index, Cost Center, Revenue Center, Indeks Jasa) */}
          {activeTab === 'database' && (
            <DatabaseManager
              generalIndexList={generalIndexList}
              setGeneralIndexList={setGeneralIndexList}
              costCenterList={costCenterList}
              setCostCenterList={setCostCenterList}
              revenueCenterList={revenueCenterList}
              setRevenueCenterList={setRevenueCenterList}
              indeksJasaList={indeksJasaList}
              setIndeksJasaList={setIndeksJasaList}
              indeksJasaHeaderConfig={indeksJasaHeaderConfig}
              setIndeksJasaHeaderConfig={setIndeksJasaHeaderConfig}
              currentUser={effectiveUser}
              subTab={dbSubTab}
              setSubTab={setDbSubTab}
            />
          )}

          {/* TAB 3: MATRIX RBAC & PENGGUNA */}
          {activeTab === 'rbac' && (
            <RbacMatrixManager
              users={users}
              setUsers={setUsers}
              permissions={permissions}
              setPermissions={setPermissions}
              currentUser={effectiveUser}
              onSelectUser={(u) => {
                setCurrentUser(u);
                showToast(`Beralih ke persona: ${u.nama} (${u.role.toUpperCase()})`);
              }}
            />
          )}

          {/* TAB 4: SUPABASE RLS, PUSH/PULL & STORAGE BUCKET */}
          {activeTab === 'supabase' && (
            <SupabaseSyncManager
              supabaseConfig={supabaseConfig}
              setSupabaseConfig={setSupabaseConfig}
              storageFiles={storageFiles}
              setStorageFiles={setStorageFiles}
              currentUser={effectiveUser}
              onTriggerPush={handlePushCloud}
              onTriggerPull={handlePullCloud}
              onSeed={handleSeedDatabase}
              isSeeding={isSeeding}
              alokasiList={alokasiList}
              penerimaList={penerimaList}
              generalIndexList={generalIndexList}
              costCenterList={costCenterList}
              revenueCenterList={revenueCenterList}
              indeksJasaList={indeksJasaList}
              users={users}
              hospitalProfile={hospitalProfile}
            />
          )}

          {/* TAB 5: SIMULASI & FORMULA SANDBOX */}
          {activeTab === 'simulasi' && (
            <SimulasiKalkulator
              onApplyToAlokasi={handleApplySimulation}
            />
          )}

          {/* TAB 6: MULTI-FORMAT EXPORT & IMPORT */}
          {(activeTab === 'export-import' || activeTab === 'export') && (
            <ExportImportCenter
              alokasiList={alokasiList}
              penerimaList={penerimaList}
              setPenerimaList={setPenerimaList}
              generalIndexList={generalIndexList}
              setGeneralIndexList={setGeneralIndexList}
              costCenterList={costCenterList}
              revenueCenterList={revenueCenterList}
              currentUser={effectiveUser}
              hospitalProfile={hospitalProfile}
            />
          )}

          {/* TAB 7: VISUALISASI DASHBOARD */}
          {activeTab === 'visualisasi' && (
            <VisualisasiDashboard
              alokasiList={alokasiList}
              costCenterList={costCenterList}
              revenueCenterList={revenueCenterList}
              penerimaList={penerimaList}
              currentUser={effectiveUser}
            />
          )}

        </main>
      </div>

      {/* 4. Mobile Bottom Navigation & Slide Drawer */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={effectiveUser}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSyncModal={() => setActiveTab('supabase')}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 5. Staf Remuneration Slip Modal */}
      {stafSlipOpen && activeAlokasi && myPenerimaRecord && (
        <SlipJaspelModal
          penerima={myPenerimaRecord}
          alokasi={activeAlokasi}
          hospitalProfile={hospitalProfile}
          onClose={() => setStafSlipOpen(false)}
        />
      )}

      {/* 6. Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          currentUser={effectiveUser}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* 6.1 Hospital Profile Customization Modal (Image 2) */}
      {showHospitalProfileModal && (
        <HospitalProfileModal
          profile={hospitalProfile}
          onClose={() => setShowHospitalProfileModal(false)}
          onSave={async (updated) => {
            setHospitalProfile(updated);
            try {
              await supabase.from('hospital_profile').upsert({
                id: 'default',
                hospital_name: updated.hospitalName,
                subtitle: updated.subtitle,
                hospital_type: updated.hospitalType,
                badge_text: updated.badgeText,
                badge_color: updated.badgeColor,
                pemda_name: updated.pemdaName,
                address: updated.address,
                city: updated.city,
                phone: updated.phone,
                director_name: updated.directorName,
                director_nip: updated.directorNip,
                director_title: updated.directorTitle,
                committee_lead_name: updated.committeeLeadName,
                committee_lead_nip: updated.committeeLeadNip,
                committee_lead_title: updated.committeeLeadTitle,
                updated_at: new Date().toISOString()
              });
            } catch (err) {
              console.warn("Could not upsert hospital_profile to Supabase:", err);
            }
            showToast('Profil dan identitas instansi berhasil diperbarui dan diselaraskan ke seluruh sistem!');
          }}
        />
      )}

      {/* 7. Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex items-center space-x-2 bg-gradient-to-r from-[#172554] to-[#1e3a8a] border border-blue-400/50 text-white px-4 py-3 rounded-2xl shadow-2xl animate-fade-in text-xs font-bold">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 8. Announcement Edit Modal */}
      {showAnnouncementEdit && effectiveUser?.role === 'superadmin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                Kelola Pengumuman Sistem
              </h3>
              <button onClick={() => setShowAnnouncementEdit(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Pesan Pengumuman</label>
                <textarea
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
                  placeholder="Masukkan pesan pengumuman untuk seluruh pengguna..."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tipe Pesan</label>
                <select
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  value={announcement.type}
                  onChange={(e) => setAnnouncement({...announcement, type: e.target.value})}
                >
                  <option value="info">Info (Biru)</option>
                  <option value="warning">Peringatan (Kuning)</option>
                  <option value="success">Sukses (Hijau)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={announcement.isVisible}
                  onChange={(e) => setAnnouncement({...announcement, isVisible: e.target.checked})}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900"
                />
                <label htmlFor="isVisible" className="text-slate-300 font-medium">Tampilkan pengumuman ini ke semua pengguna</label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setShowAnnouncementEdit(false);
                    showToast('Pengumuman sistem berhasil diperbarui.');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition"
                >
                  Simpan & Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
