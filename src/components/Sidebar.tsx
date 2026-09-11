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
  Edit2
} from 'lucide-react';
import { User, RoleType, InstalasiLayananType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from './HospitalProfileModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  rlsEnabled: boolean;
  onOpenSyncModal: () => void;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
  dbSubTab?: 'general' | 'cost' | 'revenue' | 'indeks_jasa';
  setDbSubTab?: (subTab: 'general' | 'cost' | 'revenue' | 'indeks_jasa') => void;
  hospitalProfile?: HospitalProfile;
  onOpenHospitalProfile?: () => void;
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
  setDbSubTab,
  hospitalProfile = DEFAULT_HOSPITAL_PROFILE,
  onOpenHospitalProfile
}) => {
  const { theme, toggleTheme } = useTheme();

  // Pos & Manajemen Alokasi Keuangan (Top Items)
  const posKeuangan = [
    {
      id: 'rekap-cetak',
      name: 'Rekap & Cetak Laporan',
      icon: FileSpreadsheet,
      type: 'rekap',
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      onClick: () => {
        setActiveTab('rekap_cetak');
      },
      isActive: activeTab === 'rekap_cetak'
    },
    {
      id: 'alokasi-dana',
      name: 'Alokasi Dana',
      icon: Wallet,
      type: 'alokasi',
      roles: ['superadmin'] as RoleType[],
      onClick: () => {
        setActiveTab('alokasi');
        if (setSelectedCategory) setSelectedCategory('all');
      },
      isActive: activeTab === 'alokasi' && selectedCategory === 'all'
    },
    {
      id: 'visualisasi-tren',
      name: 'Visualisasi & Tren',
      icon: TrendingUp,
      type: 'visualisasi',
      roles: ['superadmin'] as RoleType[],
      onClick: () => {
        setActiveTab('visualisasi');
      },
      isActive: activeTab === 'visualisasi'
    },
    {
      id: 'indeks-pegawai',
      name: 'Indeks Pegawai',
      icon: BadgeCheck,
      type: 'database',
      roles: ['superadmin'] as RoleType[],
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
      roles: ['superadmin'] as RoleType[],
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
      roles: ['superadmin'] as RoleType[],
      onClick: () => {
        setActiveTab('database');
        if (setDbSubTab) setDbSubTab('cost');
      },
      isActive: activeTab === 'database' && dbSubTab === 'cost'
    },
    {
      id: 'indeks-jasa-langsung',
      name: 'Indeks Jasa Langsung',
      icon: Stethoscope,
      type: 'database',
      roles: ['superadmin', 'perumus', 'direktur', 'keuangan', 'input_medis', 'input_perawat', 'input_nakes_lain', 'input_psikiatri', 'input_spesialis'] as RoleType[],
      onClick: () => {
        setActiveTab('database');
        if (setDbSubTab) setDbSubTab('indeks_jasa');
      },
      isActive: activeTab === 'database' && dbSubTab === 'indeks_jasa'
    },
    {
      id: 'pengelola-blud',
      name: 'Pengelola BLUD',
      icon: UserCheck,
      type: 'instalasi',
      roles: ['superadmin'] as RoleType[],
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
      roles: ['superadmin'] as RoleType[],
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
      roles: ['superadmin'] as RoleType[],
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
      id: 'export-import',
      label: 'Ekspor & Impor (XLSX, PDF)',
      icon: FileSpreadsheet,
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[],
      isActive: activeTab === 'export' || activeTab === 'export-import',
      onClick: () => setActiveTab('export-import')
    }
  ];

  const getDotBg = (color?: HospitalProfile['badgeColor']) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500';
      case 'blue': return 'bg-blue-500';
      case 'rose': return 'bg-rose-500';
      case 'purple': return 'bg-purple-500';
      case 'amber':
      default: return 'bg-amber-400';
    }
  };

  return (
    <aside className={`w-64 xl:w-72 flex flex-col justify-between hidden lg:flex shrink-0 transition-colors duration-200 border-r sticky top-20 h-[calc(100vh-80px)] ${
      theme === 'light'
        ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
        : 'bg-[#0c152d] border-blue-900/60 text-slate-100'
    }`}>
      
      {/* Scrollable Navigation List */}
      <div className="p-3.5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Hospital Profile Card (Image 2 - Clickable & Customizable) */}
        <div 
          onClick={onOpenHospitalProfile}
          className={`p-3.5 rounded-2xl border shadow-md transition-all cursor-pointer group relative ${
            theme === 'light'
              ? 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-slate-50 border-blue-200 text-slate-900 hover:border-blue-400 hover:shadow-lg'
              : 'bg-gradient-to-br from-[#1e3a8a]/70 via-[#172554]/80 to-[#0b1329] border-blue-700/40 text-white hover:border-amber-400 hover:shadow-blue-950/60'
          }`}
          title="Klik untuk kustomisasi Nama RSUD & Status BLUD"
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${getDotBg(hospitalProfile.badgeColor)} animate-pulse`}></span>
              <span className={theme === 'light' ? 'text-blue-900 font-extrabold' : 'text-amber-400 font-extrabold'}>
                {hospitalProfile.badgeText || 'BLUD TERDAFTAR'}
              </span>
            </div>

            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </span>
          </div>

          <p className={`text-xs font-black leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {hospitalProfile.hospitalName || 'RSUD / BLUD SEHAT SENTOSA'}
          </p>
          <p className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-slate-700' : 'text-blue-200/90'}`}>
            {hospitalProfile.subtitle || 'Sistem Jaspel & Remunerasi 2026'}
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
                ? 'bg-blue-50 text-blue-900 border-blue-300'
                : 'bg-blue-950 text-amber-300 border-blue-800'
            }`}>
              9 MENU
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
                ? 'bg-blue-50 text-blue-900 border-blue-300'
                : 'bg-blue-950 text-amber-300 border-blue-800'
            }`}>
              16 UNIT
            </span>
          </div>

          <div className="space-y-0.5">
            {instalasiLayanan.map((unit) => {
              const Icon = unit.icon;
              const isSelected = activeTab === 'alokasi' && selectedCategory === unit.name;

              return (
                <button
                  key={unit.name}
                  onClick={() => {
                    setActiveTab('alokasi');
                    if (setSelectedCategory) setSelectedCategory(unit.name);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-sm border border-blue-400/40'
                      : theme === 'light'
                      ? 'text-slate-800 font-semibold hover:bg-slate-100 hover:text-blue-900'
                      : 'text-slate-200 font-medium hover:bg-blue-950/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-1 rounded-md transition-colors ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : theme === 'light'
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-blue-950/60 text-blue-300'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs truncate">{unit.name}</span>
                  </div>

                  {isSelected && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-blue-950 font-black rounded-md">
                      FILTER
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: System & Tools */}
        <div className="space-y-1 pt-1">
          <div className={`px-2 pb-1 text-[10px] font-black tracking-widest uppercase flex items-center justify-between ${
            theme === 'light' ? 'text-slate-700' : 'text-blue-300'
          }`}>
            <span>Sistem & Integrasi</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
              theme === 'light'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            }`}>
              CLOUD
            </span>
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
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-all ${
                    tool.isActive
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : isAllowed
                      ? theme === 'light'
                        ? 'text-slate-800 font-semibold hover:bg-slate-100 hover:text-blue-900'
                        : 'text-slate-300 font-medium hover:bg-blue-950/60 hover:text-white'
                      : 'text-slate-400 cursor-not-allowed opacity-40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-1 rounded-md ${
                      tool.isActive 
                        ? 'bg-white/20 text-white' 
                        : theme === 'light'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-blue-950/60 text-blue-300'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs truncate">{tool.label}</span>
                  </div>

                  {tool.id === 'supabase' && rlsEnabled && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Profile Status */}
      <div className={`p-3 border-t text-xs ${
        theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/80 border-blue-900/60 text-slate-400'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold truncate text-[11px]">{currentUser?.nama || 'Pengguna'}</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 bg-blue-900 text-blue-200 rounded font-bold">
            {currentUser?.role || 'staf'}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 truncate">{currentUser?.jabatan || 'Staf Rumah Sakit'}</p>
      </div>

    </aside>
  );
};
