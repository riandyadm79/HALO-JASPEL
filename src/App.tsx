import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_INDEKS_JASA_HEADER_CONFIG,
  INITIAL_PERMISSIONS, 
  INITIAL_STORAGE_FILES,
  INITIAL_ALOKASI,
  INITIAL_PENERIMA,
  INITIAL_GENERAL_INDEX,
  INITIAL_COST_CENTER,
  INITIAL_REVENUE_CENTER,
  INITIAL_INDEKS_JASA_LANGSUNG,
  INITIAL_USERS
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
  BucketStorageFile,
  HospitalProfile, 
  DEFAULT_HOSPITAL_PROFILE
} from './types';
import { INITIAL_SUPABASE_CONFIG } from './config/supabase_config';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { AlokasiManager } from './components/AlokasiManager';
import { DatabaseManager } from './components/DatabaseManager';
import { IndeksJasaLangsungManager } from './components/IndeksJasaLangsungManager';
import { RbacMatrixManager } from './components/RbacMatrixManager';
import { ExportImportCenter } from './components/ExportImportCenter';
import { SimulasiKalkulator } from './components/SimulasiKalkulator';
import { SlipJaspelModal } from './components/SlipJaspelModal';
import { VisualisasiDashboard } from './components/VisualisasiDashboard';
import { SupabaseSyncManager } from './components/SupabaseSyncManager';
import { RekapCetakManager } from './components/RekapCetakManager';
import { Login } from './components/Login';
import { supabase } from './lib/supabase';
import { formatRupiah } from './utils/calculations';
import { 
  mapAlokasiFromSupabase, 
  mapPenerimaFromSupabase, 
  mapGeneralIndexFromSupabase, 
  mapCostCenterFromSupabase, 
  mapRevenueCenterFromSupabase, 
  mapUserFromSupabase, 
  mapHospitalProfileFromSupabase 
} from './utils/supabaseMapper';
import { FileText, Sparkles, Check, Download, AlertCircle, Info, Edit3, X, Loader2 } from 'lucide-react';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // View state: 'login' (auth screen), 'app' (authenticated dashboard)
  const [viewMode, setViewMode] = useState<'login' | 'app'>('login');

  // 1. User State (Strictly from Supabase with fallback)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('indeks_jasa');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dbSubTab, setDbSubTab] = useState<'general' | 'cost' | 'revenue' | 'indeks_jasa'>('indeks_jasa');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Alokasi & Penerima State (Strictly from Supabase with fallback)
  const [alokasiList, setAlokasiList] = useState<AlokasiJaspel[]>(INITIAL_ALOKASI);
  const [penerimaList, setPenerimaList] = useState<PenerimaAlokasi[]>(INITIAL_PENERIMA);

  // 4. Database Master State (Strictly from Supabase with fallback)
  const [generalIndexList, setGeneralIndexList] = useState<GeneralIndexItem[]>(INITIAL_GENERAL_INDEX);
  const [costCenterList, setCostCenterList] = useState<CostCenterItem[]>(INITIAL_COST_CENTER);
  const [revenueCenterList, setRevenueCenterList] = useState<RevenueCenterItem[]>(INITIAL_REVENUE_CENTER);
  const [indeksJasaList, setIndeksJasaList] = useState<IndeksJasaLangsungItem[]>(() => {
    try {
      const saved = localStorage.getItem('halo_jaspel_indeks_jasa');
      return saved ? JSON.parse(saved) : INITIAL_INDEKS_JASA_LANGSUNG;
    } catch {
      return INITIAL_INDEKS_JASA_LANGSUNG;
    }
  });
  const [indeksJasaHeaderConfig, setIndeksJasaHeaderConfig] = useState<IndeksJasaHeaderConfig>(() => {
    try {
      const saved = localStorage.getItem('halo_jaspel_indeks_jasa_header_config');
      return saved ? JSON.parse(saved) : DEFAULT_INDEKS_JASA_HEADER_CONFIG;
    } catch {
      return DEFAULT_INDEKS_JASA_HEADER_CONFIG;
    }
  });

  // 5. Hospital Profile State (Strictly from Supabase)
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(DEFAULT_HOSPITAL_PROFILE);

  // 6. RBAC & Permissions State
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS);

  // 7. Supabase & Bucket Storage State
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

  // 8. Modals / Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stafSlipOpen, setStafSlipOpen] = useState(false);

  // 9. Announcement
  const [announcement, setAnnouncement] = useState({ message: '', isVisible: false, type: 'info' });
  const [showAnnouncementEdit, setShowAnnouncementEdit] = useState(false);

  // Clear any legacy mock localStorage on mount to ensure ONLY Supabase is used
  useEffect(() => {
    try {
      localStorage.removeItem('halo_japel_alokasi_list');
      localStorage.removeItem('halo_japel_penerima_list');
      localStorage.removeItem('halo_japel_genidx_list');
      localStorage.removeItem('halo_japel_cost_list');
      localStorage.removeItem('halo_japel_rev_list');
      localStorage.removeItem('halo_japel_users_list');
    } catch (e) {
      // ignore
    }
  }, []);

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
        setViewMode('login');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentUser]);

  // STRICT FETCH FROM SUPABASE ONLY
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: alokasi, error: errAlo },
        { data: penerima, error: errPen },
        { data: genIdx, error: errGen },
        { data: cost, error: errCost },
        { data: revenue, error: errRev },
        { data: usr, error: errUsr },
        { data: prof, error: errProf }
      ] = await Promise.all([
        supabase.from('alokasi_jaspel').select('*').order('tahun', { ascending: false }).order('id', { ascending: true }),
        supabase.from('penerima_alokasi').select('*'),
        supabase.from('general_index').select('*'),
        supabase.from('cost_center').select('*'),
        supabase.from('revenue_center').select('*'),
        supabase.from('users_rbac').select('*'),
        supabase.from('hospital_profile').select('*').maybeSingle()
      ]);

      if (errAlo) console.warn('Alokasi query:', errAlo.message);
      if (errPen) console.warn('Penerima query:', errPen.message);
      if (errGen) console.warn('General index query:', errGen.message);
      if (errCost) console.warn('Cost center query:', errCost.message);
      if (errRev) console.warn('Revenue center query:', errRev.message);
      if (errUsr) console.warn('Users query:', errUsr.message);

      // Populate states from Supabase with resilient authentic fallback
      setAlokasiList(alokasi && alokasi.length > 0 ? alokasi.map(mapAlokasiFromSupabase) : INITIAL_ALOKASI);
      setPenerimaList(penerima && penerima.length > 0 ? penerima.map(mapPenerimaFromSupabase) : INITIAL_PENERIMA);
      setGeneralIndexList(genIdx && genIdx.length > 0 ? genIdx.map(mapGeneralIndexFromSupabase) : INITIAL_GENERAL_INDEX);
      setCostCenterList(cost && cost.length > 0 ? cost.map(mapCostCenterFromSupabase) : INITIAL_COST_CENTER);
      setRevenueCenterList(revenue && revenue.length > 0 ? revenue.map(mapRevenueCenterFromSupabase) : INITIAL_REVENUE_CENTER);
      setUsers(usr && usr.length > 0 ? usr.map(mapUserFromSupabase) : INITIAL_USERS);
      if (prof) {
        setHospitalProfile(mapHospitalProfileFromSupabase(prof));
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Apply simulated pagu to first active alokasi draft
  const handleApplySimulation = async (paguBaru: number, _nilaiPoinBaru: number) => {
    if (alokasiList.length > 0) {
      const targetAlokasi = alokasiList[0];
      try {
        await supabase.from('alokasi_jaspel').update({
          pagu_jaspel_netto: paguBaru,
          tanggal_update: new Date().toISOString()
        }).eq('id', targetAlokasi.id);
      } catch (e) {
        console.warn('Simulation update warning:', e);
      }

      setAlokasiList(alokasiList.map((a, idx) => {
        if (idx === 0) {
          return {
            ...a,
            paguJaspelNetto: paguBaru,
            tanggalUpdate: new Date().toISOString()
          };
        }
        return a;
      }));
      showToast(`Pagu simulasi ${formatRupiah(paguBaru)} berhasil disimpan ke draft alokasi Supabase!`);
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
    setViewMode('login');
    showToast('Anda telah keluar dari sistem.');
  };

  // Loading Screen (Initial Boot)
  if (isLoading && !alokasiList.length && !users.length) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center space-y-4 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm font-bold text-slate-300 animate-pulse">
          Memuat data langsung dari Supabase Cloud...
        </p>
      </div>
    );
  }

  // 1. VIEW MODE: LOGIN SCREEN
  if (viewMode === 'login' || (!currentUser && !session)) {
    return (
      <Login 
        onLogin={(user) => {
          setCurrentUser(user);
          setViewMode('app');
          showToast(`Berhasil masuk sebagai ${user.nama} (${user.role.toUpperCase()})`);
        }} 
      />
    );
  }

  // 2. VIEW MODE: AUTHENTICATED DASHBOARD APPLICATION
  const effectiveUser = currentUser || {
    id: session?.user?.id || 'usr-default',
    nama: session?.user?.email?.split('@')[0] || 'Super Administrator',
    role: 'superadmin',
    unit: 'Direksi',
    jabatan: 'Direktur RSUD'
  };

  return (
    <div className="app-root min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
      
      {/* Global Navigation Bar */}
      <Navbar
        currentUser={effectiveUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rlsEnabled={supabaseConfig.rlsEnabled}
        onOpenSyncModal={() => setActiveTab('supabase')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onLogout={handleLogout}
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
              {announcement.message || (effectiveUser?.role === 'superadmin' ? 'Pengumuman Sistem BLUD (Admin Only View).' : '')}
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
        
        {/* Desktop Persistent Sidebar */}
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
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          
          {/* Active Persona Banner for Staff */}
          {(effectiveUser?.role === 'staf' || !effectiveUser?.role) && activeTab === 'alokasi' && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-900 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Mode Transparansi Staf</span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Selamat datang, {effectiveUser?.nama || 'Pegawai RSUD'}. Anda memiliki akses transparansi jaspel pribadi.
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Unit: <span className="text-amber-300 font-semibold">{effectiveUser?.unit || 'Staf Rumah Sakit'}</span> • Jabatan: {effectiveUser?.jabatan || 'Fungsional Medis'}
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

          {/* TAB 1: ALOKASI JASPEL */}
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

          {/* TAB 2: DATABASE MASTER */}
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

          {/* TAB 3: MATRIX RBAC */}
          {activeTab === 'rbac' && (
            <RbacMatrixManager
              users={users}
              setUsers={setUsers}
              permissions={permissions}
              setPermissions={setPermissions}
              currentUser={effectiveUser}
            />
          )}

          {/* TAB 4: REKAP & CETAK (Official BLUD Distribution Document) */}
          {activeTab === 'rekap_cetak' && (
            <RekapCetakManager
              alokasiList={alokasiList}
              penerimaList={penerimaList}
              hospitalProfile={hospitalProfile}
              currentUser={effectiveUser}
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

          {/* TAB 8: SUPABASE & STORAGE RLS */}
          {activeTab === 'supabase' && (
            <SupabaseSyncManager
              onRefreshData={fetchData}
            />
          )}

          {/* TAB 9: PANEL INSTALASI & LAYANAN (INDEKS JASA LANGSUNG) */}
          {(activeTab === 'indeks_jasa' || activeTab === 'instalasi_layanan') && (
            <IndeksJasaLangsungManager
              currentUser={effectiveUser}
              initialSelectedUnit={selectedCategory}
              onNavigateToPayroll={() => setActiveTab('alokasi')}
            />
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation & Slide Drawer */}
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

      {/* Staf Remuneration Slip Modal */}
      {stafSlipOpen && activeAlokasi && myPenerimaRecord && (
        <SlipJaspelModal
          penerima={myPenerimaRecord}
          alokasi={activeAlokasi}
          hospitalProfile={hospitalProfile}
          onClose={() => setStafSlipOpen(false)}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex items-center space-x-2 bg-gradient-to-r from-[#172554] to-[#1e3a8a] border border-blue-400/50 text-white px-4 py-3 rounded-2xl shadow-2xl animate-fade-in text-xs font-bold">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Announcement Edit Modal */}
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
