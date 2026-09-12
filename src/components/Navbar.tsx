import React from 'react';
import { 
  Shield, 
  Database, 
  Cloud, 
  Menu, 
  UserCheck, 
  LogOut, 
  Sparkles,
  Layers,
  FileSpreadsheet,
  Sun,
  Moon,
  TrendingUp,
  Printer
} from 'lucide-react';
import { User, RoleType } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentUser: User;
  users?: User[];
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  rlsEnabled: boolean;
  onOpenSyncModal: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  rlsEnabled,
  onOpenSyncModal,
  onToggleMobileMenu,
  isMobileMenuOpen
}) => {
  const { theme, toggleTheme } = useTheme();


  const getRoleBadge = (role?: RoleType) => {
    switch (role) {
      case 'superadmin':
        return { label: 'SUPERADMIN', bg: 'bg-blue-900 text-blue-200 border-blue-700' };
      case 'perumus':
        return { label: 'TIM PERUMUS', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'pic':
        return { label: 'PIC UNIT', bg: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'staf':
      default:
        return { label: 'STAF / PENERIMA', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-[#0c1633] border-b border-blue-900/50 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-800/90 text-amber-400 hover:bg-slate-700 transition"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#1e3a8a] to-[#0f172a] border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-950/60">
                <span className="font-black text-amber-300 text-lg sm:xl tracking-tighter">HJ</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    HALO <span className="text-amber-400">JASPEL</span>
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-900/80 text-blue-200 border border-blue-700/60">
                    BLUD 2026
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/70 hidden sm:block font-medium">
                  Pola Distribusi Jasa Pelayanan RS
                </p>
              </div>
            </div>
          </div>

          {/* Quick Indicators & Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Supabase Status Button */}
            <button
              onClick={onOpenSyncModal}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-800/80 hover:border-amber-400/80 transition group"
              title="Konfigurasi Supabase, RLS & Bucket Storage"
            >
              <Cloud className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">Supabase</span>
                  <span className={`w-2 h-2 rounded-full ${rlsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                </div>
                <div className="text-[9px] text-blue-200/70">
                  {rlsEnabled ? 'RLS Enabled' : 'RLS Paused'}
                </div>
              </div>
            </button>

            {/* Rekapitulasi & Cetak Quick Button */}
            <button
              onClick={() => setActiveTab('rekap_cetak')}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-xl border transition-all text-xs font-bold ${
                activeTab === 'rekap_cetak'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md shadow-amber-400/20'
                  : 'bg-blue-950/60 text-slate-200 border-blue-800/80 hover:border-amber-400 hover:text-white'
              }`}
              title="Buka Dokumen Rekapitulasi & Cetak Tabel Jaspel"
            >
              <Printer className={`w-3.5 h-3.5 ${activeTab === 'rekap_cetak' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Rekap & Cetak</span>
            </button>

            {/* Visualisasi Dashboard Quick Button */}
            <button
              onClick={() => setActiveTab('visualisasi')}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-xl border transition-all text-xs font-bold ${
                activeTab === 'visualisasi'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md shadow-amber-400/20'
                  : 'bg-blue-950/60 text-slate-200 border-blue-800/80 hover:border-amber-400 hover:text-white'
              }`}
              title="Buka Dashboard Visualisasi & Tren Recharts"
            >
              <TrendingUp className={`w-3.5 h-3.5 ${activeTab === 'visualisasi' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Visualisasi & Tren</span>
            </button>

            {/* Theme Toggle Button (Light Mode / Dark Mode) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-2 px-3 py-1.5 sm:py-2 rounded-xl border transition-all shadow-sm ${
                theme === 'light'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                  : 'bg-blue-950/80 text-amber-300 border-blue-800 hover:border-amber-400'
              }`}
              title={theme === 'light' ? 'Beralih ke Dark Theme (Navy Executive)' : 'Beralih ke Light Theme'}
              aria-label="Ganti Tema"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-600 animate-spin-slow" />
                  <span className="text-xs font-bold hidden sm:inline text-amber-950">Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold hidden sm:inline text-amber-300">Gelap</span>
                </>
              )}
            </button>

            {/* Authenticated User Profile (Fixed - No switcher dropdown) */}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-800/70 text-left shadow-sm">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                currentUser?.role === 'superadmin' ? 'bg-blue-800 text-blue-200 border-blue-600' :
                currentUser?.role === 'perumus' ? 'bg-amber-800 text-amber-200 border-amber-600' :
                currentUser?.role === 'pic' ? 'bg-indigo-800 text-indigo-200 border-indigo-600' :
                'bg-slate-800 text-slate-300 border-slate-600'
              }`}>
                {(currentUser?.nama || 'U').charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white truncate max-w-[130px]">
                  {currentUser?.nama || 'Pengguna'}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="ml-1 sm:ml-2 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition active:scale-95 flex items-center space-x-1"
                title="Keluar / Logout Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold hidden md:inline">Keluar</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
