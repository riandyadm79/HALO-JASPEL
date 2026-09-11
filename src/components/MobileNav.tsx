import React from 'react';
import { 
  Calculator, 
  Database, 
  ShieldCheck, 
  Cloud, 
  FileSpreadsheet,
  X,
  Lock,
  ChevronRight,
  Filter,
  Sun,
  Moon,
  TrendingUp
} from 'lucide-react';
import { RoleType, User } from '../types';
import { INSTALASI_LAYANAN_LIST } from '../data/initialData';
import { useTheme } from '../context/ThemeContext';


interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onOpenSyncModal: () => void;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isOpen,
  onClose,
  onOpenSyncModal,
  selectedCategory,
  setSelectedCategory
}) => {
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    {
      id: 'rekap_cetak',
      label: 'Rekap & Cetak',
      icon: FileSpreadsheet,
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[]
    },
    {
      id: 'alokasi',
      label: 'Alokasi Jaspel',
      icon: Calculator,
      roles: ['superadmin'] as RoleType[]
    },
    {
      id: 'visualisasi',
      label: 'Visualisasi',
      icon: TrendingUp,
      roles: ['superadmin'] as RoleType[]
    },
    {
      id: 'database',
      label: 'DB Manajer',
      icon: Database,
      roles: ['superadmin'] as RoleType[]
    },
    {
      id: 'rbac',
      label: 'Matrix RBAC',
      icon: ShieldCheck,
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[]
    },
    {
      id: 'supabase',
      label: 'Supabase Sync',
      icon: Cloud,
      roles: ['superadmin', 'perumus', 'pic'] as RoleType[]
    },
    {
      id: 'export-import',
      label: 'Ekspor & Impor',
      icon: FileSpreadsheet,
      roles: ['superadmin', 'perumus', 'pic', 'staf'] as RoleType[]
    }
  ];

  return (
    <>
      {/* 1. BOTTOM DOCK (ALWAYS ACCESSIBLE ON MOBILE/TABLET PORTRAIT) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c1633] border-t border-blue-900/60 shadow-2xl px-2 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isAllowed = item.roles.includes(currentUser?.role || 'staf');
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isAllowed) {
                    setActiveTab(item.id);
                  }
                }}
                disabled={!isAllowed}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[58px] min-h-[48px] ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : isAllowed
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-700 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-900/90 border border-amber-400/50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 2. SLIDE-OVER DRAWER FOR DEEPER NAVIGATION & ACTIONS */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          <div className={`relative flex-1 flex flex-col max-w-xs w-full p-5 space-y-5 shadow-2xl overflow-y-auto transition-colors ${
            theme === 'light'
              ? 'bg-white border-r border-slate-200 text-slate-900'
              : 'bg-[#0c1633] border-r border-blue-900/60 text-slate-100'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-4 ${theme === 'light' ? 'border-slate-200' : 'border-blue-900/60'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] flex items-center justify-center font-black text-amber-300 border border-blue-400/40">
                  HJ
                </div>
                <div>
                  <h2 className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>HALO JASPEL</h2>
                  <p className={`text-[10px] font-bold ${theme === 'light' ? 'text-blue-700' : 'text-amber-400'}`}>BLUD SEHAT SENTOSA</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl transition ${
                  theme === 'light'
                    ? 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    : 'bg-blue-950 text-slate-300 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className={`p-3.5 rounded-2xl border shadow-sm ${
              theme === 'light'
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border-blue-200 text-slate-900'
                : 'bg-gradient-to-br from-blue-950 to-slate-900 border-blue-800/60 text-white'
            }`}>
              <p className={`text-[10px] uppercase font-bold ${theme === 'light' ? 'text-blue-700' : 'text-blue-300'}`}>Pengguna Aktif</p>
              <p className={`text-sm font-bold truncate mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currentUser?.nama || 'Pengguna'}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  theme === 'light'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-blue-950 text-amber-300 border-blue-800'
                }`}>
                  {currentUser?.role || 'staf'}
                </span>
                <span className={`text-[11px] truncate max-w-[130px] ${theme === 'light' ? 'text-slate-600' : 'text-blue-200/80'}`}>
                  {currentUser?.unit || '-'}
                </span>
              </div>
            </div>

            {/* Drawer Links */}
            <div className="space-y-1.5">
              <p className={`text-[10px] font-black tracking-wider uppercase px-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-blue-300/80'
              }`}>
                Menu Utama
              </p>
              {menuItems.map((item) => {
                const isAllowed = item.roles.includes(currentUser?.role || 'staf');
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isAllowed) {
                        setActiveTab(item.id);
                        onClose();
                      }
                    }}
                    disabled={!isAllowed}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold border border-blue-400/50 shadow-md'
                        : isAllowed
                        ? theme === 'light'
                          ? 'text-slate-800 font-semibold hover:bg-slate-100 hover:text-blue-900'
                          : 'text-slate-100 font-semibold hover:bg-blue-950/80'
                        : theme === 'light'
                        ? 'text-slate-400 opacity-50 cursor-not-allowed'
                        : 'text-slate-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${theme === 'light' && !isActive ? 'text-blue-600' : 'text-amber-400'}`} />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                    {isAllowed ? (
                      <ChevronRight className={`w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`} />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instalasi / Layanan Quick Filter List */}
            {setSelectedCategory && (
              <div className={`space-y-1.5 pt-2 border-t ${theme === 'light' ? 'border-slate-200' : 'border-blue-900/60'}`}>
                <div className="flex items-center justify-between px-1">
                  <span className={`text-[10px] font-black tracking-wider uppercase ${
                    theme === 'light' ? 'text-slate-700' : 'text-blue-300/80'
                  }`}>
                    Pilih Instalasi / Layanan
                  </span>
                  <Filter className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                  {INSTALASI_LAYANAN_LIST.map((name) => {
                    const isSelected = selectedCategory === name;
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          setActiveTab('alokasi');
                          setSelectedCategory(name);
                          onClose();
                        }}
                        className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-medium truncate transition ${
                          isSelected 
                            ? 'bg-blue-600 text-white font-bold' 
                            : theme === 'light'
                            ? 'bg-slate-100 text-slate-800 hover:bg-blue-50 hover:text-blue-800'
                            : 'bg-blue-950/60 text-slate-200 hover:bg-blue-900/60'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Theme & Cloud Actions */}
            <div className={`pt-2 border-t space-y-2 ${theme === 'light' ? 'border-slate-200' : 'border-blue-900/60'}`}>
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs border transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-900'
                    : 'bg-blue-950/80 border-blue-800 hover:border-amber-400 text-amber-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Moon className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{theme === 'light' ? 'Mode Terang (Light)' : 'Mode Gelap (Navy)'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border ${
                  theme === 'light'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-blue-900 text-amber-300 border-blue-700'
                }`}>
                  {theme === 'light' ? 'Ganti ke Dark' : 'Ganti ke Light'}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenSyncModal();
                  onClose();
                }}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs border transition ${
                  theme === 'light'
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800'
                    : 'bg-blue-950 border-blue-800 hover:border-amber-400 text-amber-400'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>Supabase Cloud & Storage</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
