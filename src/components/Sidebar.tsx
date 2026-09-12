import React from 'react';
import { 
  Wallet, 
  BadgeCheck, 
  Receipt, 
  Calculator, 
  UserCheck, 
  Scale, 
  ListChecks, 
  Network, 
  FileText, 
  Brain, 
  Stethoscope, 
  HeartPulse, 
  Users, 
  UtensilsCrossed, 
  HeartHandshake, 
  Smile, 
  Activity, 
  Scan, 
  FlaskConical, 
  Pill, 
  Zap, 
  FolderArchive, 
  Leaf,
  ShieldCheck, 
  Cloud, 
  FileSpreadsheet, 
  Lock,
  ChevronRight,
  Sun,
  Moon,
  TrendingUp,
  Printer,
  Building2
} from 'lucide-react';
import { User, RoleType, InstalasiLayananType } from '../types';
import { useTheme } from '../context/ThemeContext';


interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  rlsEnabled: boolean;
  onOpenSyncModal: () => void;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
  dbSubTab?: 'general' | 'cost' | 'revenue';
  setDbSubTab?: (subTab: 'general' | 'cost' | 'revenue') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  rlsEnabled,
  onOpenSyncModal,
  selectedCategory = 'all',
  setSelectedCategory,
  dbSubTab = 'general',
  setDbSubTab
}) => {
  const { theme, toggleTheme } = useTheme();

  // Pos & Manajemen Alokasi Keuangan (Top 7)
  const posKeuangan = [
    {
      id: 'alokasi-dana',
      name: 'Alokasi Dana',
      icon: Wallet,
      type: 'alokasi',
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      onClick: () => {
        setActiveTab('alokasi');
        if (setSelectedCategory) setSelectedCategory('all');
      },
      isActive: activeTab === 'alokasi' && selectedCategory === 'all'
    },
    {
      id: 'indeks-jasa-langsung',
      name: 'Indeks Jasa Langsung',
      icon: Stethoscope,
      type: 'instalasi',
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      onClick: () => {
        setActiveTab('indeks_jasa');
        if (setSelectedCategory) setSelectedCategory('all');
      },
      isActive: activeTab === 'indeks_jasa' && (!selectedCategory || selectedCategory === 'all')
    },
    {
      id: 'indeks-pegawai',
      name: 'Indeks Pegawai',
      icon: BadgeCheck,
      type: 'database',
      roles: ['superadmin', 'perumus', 'pic'] as RoleType[],
      onClick: () => {
        setActiveTab('database');
        if (setDbSubTab) setDbSubTab('general');
      },
      isActive: activeTab === 'database' && dbSubTab === 'general'
    },
    {
      id: 'post-remunerasi',
      name: 'Post Remunerasi',
      icon: Receipt,
      type: 'database',
      roles: ['superadmin', 'perumus', 'pic'] as RoleType[],
      onClick: () => {
        setActiveTab('database');
        if (setDbSubTab) setDbSubTab('revenue');
      },
      isActive: activeTab === 'database' && dbSubTab === 'revenue'
    },
    {
      id: 'beban-tetap',
      name: 'Beban Tetap',
      icon: Calculator,
      type: 'database',
      roles: ['superadmin', 'perumus', 'pic'] as RoleType[],
      onClick: () => {
        setActiveTab('database');
        if (setDbSubTab) setDbSubTab('cost');
      },
      isActive: activeTab === 'database' && dbSubTab === 'cost'
    },
    {
      id: 'pengelola-blud',
      name: 'Pengelola BLUD',
      icon: UserCheck,
      type: 'instalasi',
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      onClick: () => {
        setActiveTab('alokasi');
        if (setSelectedCategory) setSelectedCategory('Pengelola BLUD');
      },
      isActive: activeTab === 'alokasi' && selectedCategory === 'Pengelola BLUD'
    },
    {
      id: 'dewan-pengawas',
      name: 'Dewan Pengawas',
      icon: Scale,
      type: 'instalasi',
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      onClick: () => {
        setActiveTab('alokasi');
        if (setSelectedCategory) setSelectedCategory('Dewan Pengawas');
      },
      isActive: activeTab === 'alokasi' && selectedCategory === 'Dewan Pengawas'
    },
    {
      id: 'tugas-tambahan',
      name: 'Tugas Tambahan',
      icon: ListChecks,
      type: 'instalasi',
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      onClick: () => {
        setActiveTab('alokasi');
        if (setSelectedCategory) setSelectedCategory('Tugas Tambahan');
      },
      isActive: activeTab === 'alokasi' && selectedCategory === 'Tugas Tambahan'
    }
  ];

  // Instalasi & Layanan (16 Units exact match)
  const instalasiLayanan = [
    { name: 'Struktural', icon: Network },
    { name: 'Administrasi', icon: FileText },
    { name: 'Psikiatri', icon: Brain },
    { name: 'Spesialis', icon: Stethoscope },
    { name: 'Dokter Umum', icon: HeartPulse },
    { name: 'Perawat', icon: Users },
    { name: 'Gizi', icon: UtensilsCrossed },
    { name: 'OT/TW', icon: HeartHandshake },
    { name: 'Psikolog', icon: Smile },
    { name: 'Fisioterapi', icon: Activity },
    { name: 'Radiologi', icon: Scan },
    { name: 'Laboratorium', icon: FlaskConical },
    { name: 'Farmasi', icon: Pill },
    { name: 'Elektromedik', icon: Zap },
    { name: 'Rekam Medik', icon: FolderArchive },
    { name: 'Kesling', icon: Leaf }
  ];

  // System & Management Tools
  const systemTools = [
    {
      id: 'rekap_cetak',
      label: 'Rekapitulasi & Cetak Tabel',
      icon: Printer,
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      isActive: activeTab === 'rekap_cetak',
      onClick: () => setActiveTab('rekap_cetak')
    },
    {
      id: 'visualisasi',
      label: 'Visualisasi & Tren',
      icon: TrendingUp,
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      isActive: activeTab === 'visualisasi',
      onClick: () => setActiveTab('visualisasi')
    },
    {
      id: 'rbac',
      label: 'Matrix RBAC & User',
      icon: ShieldCheck,
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      isActive: activeTab === 'rbac',
      onClick: () => setActiveTab('rbac')
    },
    {
      id: 'supabase',
      label: 'Supabase & Storage RLS',
      icon: Cloud,
      roles: ['superadmin', 'perumus', 'pic'] as RoleType[],
      isActive: activeTab === 'supabase',
      onClick: () => setActiveTab('supabase')
    },
    {
      id: 'export',
      label: 'Ekspor & Impor (XLSX, PDF)',
      icon: FileSpreadsheet,
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      isActive: activeTab === 'export',
      onClick: () => setActiveTab('export')
    }
  ];

  return (
    <aside className={`w-64 xl:w-72 flex flex-col justify-between hidden lg:flex shrink-0 transition-colors duration-200 border-r sticky top-20 h-[calc(100vh-80px)] ${
      theme === 'light'
        ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
        : 'bg-[#0c152d] border-blue-900/60 text-slate-100'
    }`}>
      
      {/* Scrollable Navigation List */}
      <div className="p-3.5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Hospital Card */}
        <div className={`p-3.5 rounded-2xl border shadow-md transition-all ${
          theme === 'light'
            ? 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-slate-50 border-blue-200 text-slate-900'
            : 'bg-gradient-to-br from-[#1e3a8a]/70 via-[#172554]/80 to-[#0b1329] border-blue-700/40 text-white'
        }`}>
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-emerald-500' : 'bg-amber-400'} animate-pulse`}></span>
            <span className={theme === 'light' ? 'text-blue-800 font-extrabold' : 'text-amber-400 font-extrabold'}>
              BLUD TERDAFTAR
            </span>
          </div>
          <p className={`text-xs font-black leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            RSJD ATMA HUSADA MAHAKAM
          </p>
          <p className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-blue-200/90'}`}>
            Sistem Jaspel & Remunerasi 2026
          </p>
        </div>

        {/* SECTION 1: Pos & Kebijakan Keuangan */}
        <div className="space-y-1">
          <div className={`px-2 pb-1 text-[10px] font-black tracking-widest uppercase flex items-center justify-between ${
            theme === 'light' ? 'text-slate-700' : 'text-blue-300'
          }`}>
            <span>Pos & Kebijakan</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
              theme === 'light'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-blue-950 text-amber-300 border-blue-800'
            }`}>
              7 POS
            </span>
          </div>

          <div className="space-y-0.5">
            {posKeuangan.map((item) => {
              const Icon = item.icon;
              const isAllowed = item.roles.includes(currentUser?.role || 'staf');

              return (
                <button
                  key={item.id}
                  onClick={() => isAllowed && item.onClick()}
                  disabled={!isAllowed}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                    item.isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30 border border-blue-400/50'
                      : isAllowed
                      ? theme === 'light'
                        ? 'text-slate-800 font-semibold hover:bg-slate-100 hover:text-blue-900'
                        : 'text-slate-100 font-semibold hover:bg-blue-950/70 hover:text-white'
                      : theme === 'light'
                      ? 'text-slate-400 cursor-not-allowed opacity-50'
                      : 'text-slate-500 cursor-not-allowed opacity-40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      item.isActive 
                        ? 'bg-white/20 text-white' 
                        : theme === 'light'
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs truncate">{item.name}</span>
                  </div>

                  {!isAllowed ? (
                    <Lock className="w-3 h-3 text-slate-400" />
                  ) : item.isActive ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Instalasi & Layanan */}
        <div className="space-y-1 pt-1">
          <div className={`px-2 pb-1 text-[10px] font-black tracking-widest uppercase flex items-center justify-between ${
            theme === 'light' ? 'text-slate-700' : 'text-blue-300'
          }`}>
            <span>Instalasi & Layanan</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
              theme === 'light'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-blue-950 text-amber-300 border-blue-800'
            }`}>
              16 UNIT
            </span>
          </div>

          <div className="space-y-0.5">
            {/* Overview All Units Button */}
            <button
              onClick={() => {
                setActiveTab('indeks_jasa');
                if (setSelectedCategory) setSelectedCategory('all');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all mb-1.5 ${
                activeTab === 'indeks_jasa' && (!selectedCategory || selectedCategory === 'all')
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md border border-amber-300'
                  : theme === 'light'
                  ? 'bg-blue-50/80 text-blue-900 font-bold hover:bg-blue-100 border border-blue-200/60'
                  : 'bg-blue-950/70 text-blue-200 font-bold hover:bg-blue-900/80 border border-blue-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className={`p-1 rounded-md transition-colors ${
                  activeTab === 'indeks_jasa' && (!selectedCategory || selectedCategory === 'all')
                    ? 'bg-slate-950 text-amber-300'
                    : 'bg-blue-900/30 text-blue-400'
                }`}>
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black">Semua Instalasi & Staf</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeTab === 'indeks_jasa' && (!selectedCategory || selectedCategory === 'all')
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-blue-900/40 text-blue-300'
              }`}>
                10 UNIT
              </span>
            </button>

            {instalasiLayanan.map((unit) => {
              const Icon = unit.icon;
              const isSelected = activeTab === 'indeks_jasa' && selectedCategory === unit.name;

              return (
                <button
                  key={unit.name}
                  onClick={() => {
                    setActiveTab('indeks_jasa');
                    if (setSelectedCategory) setSelectedCategory(unit.name);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md border border-blue-400/50'
                      : theme === 'light'
                      ? 'text-slate-700 font-medium hover:bg-slate-100 hover:text-blue-900'
                      : 'text-slate-200 font-medium hover:bg-blue-950/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-1 rounded-md transition-colors ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : theme === 'light'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-blue-950/60 text-blue-300'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs truncate">{unit.name}</span>
                  </div>

                  {isSelected && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-blue-950 font-black rounded-md">
                      BUKA TABEL
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Modul & Konfigurasi */}
        <div className={`space-y-1 pt-2 border-t ${theme === 'light' ? 'border-slate-200' : 'border-blue-900/40'}`}>
          <div className={`px-2 pb-1 text-[10px] font-black tracking-widest uppercase ${
            theme === 'light' ? 'text-slate-700' : 'text-blue-300'
          }`}>
            Pengaturan Sistem
          </div>

          <div className="space-y-0.5">
            {systemTools.map((tool) => {
              const Icon = tool.icon;
              const isAllowed = tool.roles.includes(currentUser?.role || 'staf');

              return (
                <button
                  key={tool.id}
                  onClick={() => isAllowed && tool.onClick()}
                  disabled={!isAllowed}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                    tool.isActive
                      ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold border border-blue-400/40'
                      : isAllowed
                      ? theme === 'light'
                        ? 'text-slate-800 font-semibold hover:bg-slate-100 hover:text-blue-900'
                        : 'text-slate-100 font-semibold hover:bg-blue-950/70 hover:text-white'
                      : theme === 'light'
                      ? 'text-slate-400 cursor-not-allowed opacity-50'
                      : 'text-slate-600 cursor-not-allowed opacity-40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      tool.isActive 
                        ? 'bg-amber-400 text-blue-950' 
                        : theme === 'light'
                        ? 'bg-slate-100 text-amber-700 border border-slate-200'
                        : 'bg-blue-950 text-amber-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs truncate font-medium">{tool.label}</span>
                  </div>

                  {!isAllowed ? (
                    <Lock className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Cloud & System Widget */}
      <div className={`p-3 border-t space-y-2 transition-colors ${
        theme === 'light' 
          ? 'bg-slate-50 border-slate-200' 
          : 'bg-[#0a1126] border-blue-900/60'
      }`}>
        {/* Theme Switcher Toggle */}
        <button 
          onClick={toggleTheme}
          className={`w-full p-2.5 rounded-xl border transition flex items-center justify-between group ${
            theme === 'light'
              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-900'
              : 'bg-blue-950/40 hover:bg-blue-900/50 border-blue-800/60 text-white'
          }`}
          title="Klik untuk mengganti mode tema"
        >
          <div className="flex items-center space-x-2">
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-600" />
            ) : (
              <Moon className="w-4 h-4 text-amber-400" />
            )}
            <div className="text-left">
              <p className={`text-[11px] font-bold leading-none ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {theme === 'light' ? 'Mode Terang (Light)' : 'Mode Gelap (Navy)'}
              </p>
              <p className={`text-[9px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-blue-200/70'}`}>
                {theme === 'light' ? 'Tema profesional cerah' : 'Tema eksekutif navy'}
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
            theme === 'light' 
              ? 'bg-amber-100 text-amber-900 border-amber-300' 
              : 'bg-blue-900 text-amber-300 border-blue-700'
          }`}>
            {theme === 'light' ? 'LIGHT' : 'DARK'}
          </span>
        </button>

        <div 
          onClick={onOpenSyncModal}
          className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
            theme === 'light'
              ? 'bg-white hover:bg-slate-100 border-slate-200'
              : 'bg-blue-950/60 hover:border-amber-400/70 border-blue-800/80'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className={`text-[11px] font-bold leading-none ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Supabase Sync
              </p>
              <p className={`text-[9px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-blue-200/70'}`}>
                {rlsEnabled ? 'RLS Aktif (Aman)' : 'RLS Dinonaktifkan'}
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
            theme === 'light'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-blue-900 text-amber-300 border-blue-700'
          }`}>
            SYNC
          </span>
        </div>
      </div>

    </aside>
  );
};
