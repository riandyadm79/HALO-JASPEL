import React, { useState, useEffect } from 'react';
import { 
  INITIAL_USERS, 
  INITIAL_ALOKASI, 
  INITIAL_PENERIMA, 
  INITIAL_GENERAL_INDEX, 
  INITIAL_COST_CENTER, 
  INITIAL_REVENUE_CENTER, 
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
import { formatRupiah } from './utils/calculations';
import { FileText, Sparkles, Check, Download } from 'lucide-react';

export function App() {
  // 1. User & Persona State
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('halo_japel_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.role) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved users', e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return (users && users.length > 0 && users[0]?.role) ? users[0] : INITIAL_USERS[0];
  });

  // Guard against missing currentUser
  useEffect(() => {
    if (!currentUser || !currentUser.role) {
      setCurrentUser(users[0] || INITIAL_USERS[0]);
    }
  }, [currentUser, users]);

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('alokasi');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dbSubTab, setDbSubTab] = useState<'general' | 'cost' | 'revenue'>('general');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Alokasi & Penerima State
  const [alokasiList, setAlokasiList] = useState<AlokasiJaspel[]>(() => {
    const saved = localStorage.getItem('halo_japel_alokasi');
    return saved ? JSON.parse(saved) : INITIAL_ALOKASI;
  });
  const [penerimaList, setPenerimaList] = useState<PenerimaAlokasi[]>(() => {
    const saved = localStorage.getItem('halo_japel_penerima');
    return saved ? JSON.parse(saved) : INITIAL_PENERIMA;
  });

  // 4. Database Master State
  const [generalIndexList, setGeneralIndexList] = useState<GeneralIndexItem[]>(() => {
    const saved = localStorage.getItem('halo_japel_general_index');
    return saved ? JSON.parse(saved) : INITIAL_GENERAL_INDEX;
  });
  const [costCenterList, setCostCenterList] = useState<CostCenterItem[]>(() => {
    const saved = localStorage.getItem('halo_japel_cost_center');
    return saved ? JSON.parse(saved) : INITIAL_COST_CENTER;
  });
  const [revenueCenterList, setRevenueCenterList] = useState<RevenueCenterItem[]>(() => {
    const saved = localStorage.getItem('halo_japel_revenue_center');
    return saved ? JSON.parse(saved) : INITIAL_REVENUE_CENTER;
  });

  // 5. RBAC & Permissions State
  const [permissions, setPermissions] = useState<Permission[]>(() => {
    const saved = localStorage.getItem('halo_japel_permissions');
    return saved ? JSON.parse(saved) : INITIAL_PERMISSIONS;
  });

  // 6. Supabase & Bucket Storage State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    // Read from window.ENV if available
    const envConfig = typeof window !== 'undefined' && (window as any).ENV;
    const saved = localStorage.getItem('halo_japel_supabase_cfg');
    if (saved) return JSON.parse(saved);
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

  const [storageFiles, setStorageFiles] = useState<BucketStorageFile[]>(() => {
    const saved = localStorage.getItem('halo_japel_storage_files');
    return saved ? JSON.parse(saved) : INITIAL_STORAGE_FILES;
  });

  // 7. Modals / Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stafSlipOpen, setStafSlipOpen] = useState(false);

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('halo_japel_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('halo_japel_alokasi', JSON.stringify(alokasiList));
  }, [alokasiList]);
  useEffect(() => {
    localStorage.setItem('halo_japel_penerima', JSON.stringify(penerimaList));
  }, [penerimaList]);
  useEffect(() => {
    localStorage.setItem('halo_japel_general_index', JSON.stringify(generalIndexList));
  }, [generalIndexList]);
  useEffect(() => {
    localStorage.setItem('halo_japel_cost_center', JSON.stringify(costCenterList));
  }, [costCenterList]);
  useEffect(() => {
    localStorage.setItem('halo_japel_revenue_center', JSON.stringify(revenueCenterList));
  }, [revenueCenterList]);
  useEffect(() => {
    localStorage.setItem('halo_japel_permissions', JSON.stringify(permissions));
  }, [permissions]);
  useEffect(() => {
    localStorage.setItem('halo_japel_storage_files', JSON.stringify(storageFiles));
  }, [storageFiles]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Push Trigger Handler
  const handlePushCloud = () => {
    showToast('Snapshot database & alokasi berhasil di-Push ke Supabase Cloud!');
  };

  // Pull Trigger Handler
  const handlePullCloud = () => {
    showToast('Berhasil memuat skema dan data terbaru dari Supabase Cloud!');
  };

  // Apply simulated pagu to first active alokasi draft
  const handleApplySimulation = (paguBaru: number, nilaiPoinBaru: number) => {
    if (alokasiList.length > 0) {
      setAlokasiList(alokasiList.map((a, idx) => {
        if (idx === 0) {
          return {
            ...a,
            totalPaguJaspel: paguBaru,
            nilaiPerPoin: nilaiPoinBaru
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

  return (
    <div className="app-root min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onSelectUser={(user) => {
          setCurrentUser(user);
          showToast(`Beralih ke persona: ${user.nama} (${(user.role || 'staf').toUpperCase()})`);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rlsEnabled={supabaseConfig.rlsEnabled}
        onOpenSyncModal={() => setActiveTab('supabase')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Responsive Body (Sidebar + Content Canvas) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* 2. Desktop Persistent Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          rlsEnabled={supabaseConfig.rlsEnabled}
          onOpenSyncModal={() => setActiveTab('supabase')}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          dbSubTab={dbSubTab}
          setDbSubTab={setDbSubTab}
        />

        {/* 3. Main Workspace Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          
          {/* Active Persona Banner for Staff */}
          {(currentUser?.role === 'staf' || !currentUser?.role) && activeTab === 'alokasi' && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-900 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Mode Transparansi Staf</span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Selamat datang, {currentUser?.nama || 'Pengguna'}!
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

          {/* TAB 1: ALOKASI JASPEL (CRUD, Rekap, Rincian, Status Workflow) */}
          {activeTab === 'alokasi' && (
            <AlokasiManager
              alokasiList={alokasiList}
              setAlokasiList={setAlokasiList}
              penerimaList={penerimaList}
              setPenerimaList={setPenerimaList}
              generalIndexList={generalIndexList}
              currentUser={currentUser}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          )}

          {/* TAB 2: DATABASE MANAJER (General Index, Cost Center, Revenue Center) */}
          {activeTab === 'database' && (
            <DatabaseManager
              generalIndexList={generalIndexList}
              setGeneralIndexList={setGeneralIndexList}
              costCenterList={costCenterList}
              setCostCenterList={setCostCenterList}
              revenueCenterList={revenueCenterList}
              setRevenueCenterList={setRevenueCenterList}
              currentUser={currentUser}
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
              currentUser={currentUser}
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
              currentUser={currentUser}
              onTriggerPush={handlePushCloud}
              onTriggerPull={handlePullCloud}
            />
          )}

          {/* TAB 5: SIMULASI & FORMULA SANDBOX */}
          {activeTab === 'simulasi' && (
            <SimulasiKalkulator
              onApplyToAlokasi={handleApplySimulation}
            />
          )}

          {/* TAB 6: MULTI-FORMAT EXPORT & IMPORT */}
          {activeTab === 'export-import' && (
            <ExportImportCenter
              alokasiList={alokasiList}
              penerimaList={penerimaList}
              setPenerimaList={setPenerimaList}
              generalIndexList={generalIndexList}
              setGeneralIndexList={setGeneralIndexList}
              costCenterList={costCenterList}
              revenueCenterList={revenueCenterList}
              currentUser={currentUser}
            />
          )}

        </main>
      </div>

      {/* 4. Mobile Bottom Navigation & Slide Drawer */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
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
          onClose={() => setStafSlipOpen(false)}
        />
      )}

      {/* 6. Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex items-center space-x-2 bg-gradient-to-r from-[#172554] to-[#1e3a8a] border border-blue-400/50 text-white px-4 py-3 rounded-2xl shadow-2xl animate-fade-in text-xs font-bold">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default App;
