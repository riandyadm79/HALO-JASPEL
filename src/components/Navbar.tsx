import React, { useState } from 'react';
import { 
  Menu, 
  ChevronDown, 
  FileSpreadsheet,
  Sun,
  Moon,
  KeyRound,
  LogOut,
  Home,
  Cloud,
  Building2
} from 'lucide-react';
import { User, RoleType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from './HospitalProfileModal';

interface NavbarProps {
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  rlsEnabled: boolean;
  onOpenSyncModal: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  onGoToLanding?: () => void;
  hospitalProfile?: HospitalProfile;
  onOpenHospitalProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSelectUser,
  activeTab,
  setActiveTab,
  rlsEnabled,
  onOpenSyncModal,
  onToggleMobileMenu,
  isMobileMenuOpen,
  onOpenChangePassword,
  onLogout,
  onGoToLanding,
  hospitalProfile = DEFAULT_HOSPITAL_PROFILE,
  onOpenHospitalProfile
}) => {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadge = (role?: RoleType) => {
    switch (role) {
      case 'superadmin':
        return { label: 'SUPERADMIN', bg: 'bg-blue-900 text-blue-200 border-blue-700' };
      case 'perumus':
        return { label: 'TIM PERUMUS', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'pic':
        return { label: 'PIC UNIT', bg: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'input_perawat':
        return { label: 'INPUT PERAWAT', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'input_medis':
        return { label: 'INPUT MEDIS', bg: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'input_spesialis':
        return { label: 'INPUT SPESIALIS', bg: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'input_psikiatri':
        return { label: 'INPUT PSIKIATRI', bg: 'bg-pink-950 text-pink-300 border-pink-800' };
      case 'input_nakes_lain':
        return { label: 'INPUT NAKES LAIN', bg: 'bg-teal-950 text-teal-300 border-teal-800' };
      case 'input_cuti':
        return { label: 'INPUT CUTI/PRESENSI', bg: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'input_ketenagaan':
        return { label: 'INPUT KETENAGAAN', bg: 'bg-violet-950 text-violet-300 border-violet-800' };
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

            <div className="flex items-center space-x-3 cursor-pointer" onClick={onGoToLanding} title="Buka Landing Page Transparansi">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#1e3a8a] to-[#0f172a] border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-950/60">
                <span className="font-black text-amber-300 text-lg sm:text-xl tracking-tighter">HJ</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    HALO <span className="text-amber-400">JASPEL</span>
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-900/80 text-blue-200 border border-blue-700/60">
                    {hospitalProfile.badgeText || 'BLUD 2026'}
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/70 hidden sm:block font-medium truncate max-w-xs">
                  {hospitalProfile.hospitalName || 'Sistem Alokasi Jasa Pelayanan & Database Manajer RS'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Indicators & Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Landing Page Button */}
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-blue-950/60 text-slate-200 border border-blue-800/80 hover:border-amber-400 hover:text-white transition text-xs font-bold"
                title="Halaman Depan Publik / Transparansi"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Publik</span>
              </button>
            )}

            {/* Supabase Status Button */}
            <button
              onClick={onOpenSyncModal}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-800/80 hover:border-amber-400/80 transition group"
              title="Konfigurasi Supabase, RLS & Sinkronisasi Cloud"
            >
              <Cloud className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">Supabase Cloud</span>
                  <span className={`w-2 h-2 rounded-full ${rlsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                </div>
                <div className="text-[9px] text-blue-200/70">
                  {rlsEnabled ? 'RLS Enabled • Ready' : 'RLS Paused'}
                </div>
              </div>
            </button>

            {/* Rekap & Cetak Quick Button */}
            <button
              onClick={() => setActiveTab('rekap_cetak')}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-xl border transition-all text-xs font-bold ${
                activeTab === 'rekap_cetak'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md shadow-amber-400/20'
                  : 'bg-blue-950/60 text-slate-200 border-blue-800/80 hover:border-amber-400 hover:text-white'
              }`}
              title="Pusat Rekapitulasi & Cetak Semua Tabel"
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${activeTab === 'rekap_cetak' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Rekap & Cetak</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-2 px-3 py-1.5 sm:py-2 rounded-xl border transition-all shadow-sm ${
                theme === 'light'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                  : 'bg-blue-950/80 text-amber-300 border-blue-800 hover:border-amber-400'
              }`}
              title={theme === 'light' ? 'Beralih ke Dark Theme (Navy Executive)' : 'Beralih ke Light Theme (Kontras Tinggi)'}
              aria-label="Ganti Tema"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold hidden sm:inline text-amber-950">Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold hidden sm:inline text-amber-300">Gelap</span>
                </>
              )}
            </button>

            {/* User Dropdown & Action Menu */}
            <div className="relative">
              <button
                id="user-profile-menu-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-800/70 hover:border-amber-400 transition-all text-left shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-300 font-bold flex items-center justify-center text-xs border border-blue-400/30">
                  {(currentUser?.nama || 'U').charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">
                    {currentUser?.nama || 'Pengguna'}
                  </p>
                  <p className="text-[10px] text-amber-400/90 font-medium truncate max-w-[120px]">
                    {currentUser?.jabatan || 'Staf Medis'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0f1d38] border border-blue-800 shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
                    
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 border-b border-blue-900/80 mb-2 bg-blue-950/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {currentUser?.nama || 'Pengguna'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-200/70 mt-0.5 truncate">
                        {currentUser?.email || currentUser?.jabatan || 'Akun Terautentikasi'}
                      </p>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="space-y-1">
                      
                      {/* Ubah Password Action */}
                      <button
                        id="btn-ubah-password-toolbar"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onOpenChangePassword) onOpenChangePassword();
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-blue-900/70 hover:text-amber-300 transition"
                      >
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span>Ubah Password Akun</span>
                      </button>

                      {/* Kustomisasi Profil RSUD */}
                      {onOpenHospitalProfile && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenHospitalProfile();
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-blue-900/70 hover:text-amber-300 transition"
                        >
                          <Building2 className="w-4 h-4 text-blue-400" />
                          <span>Kustomisasi Profil RSUD (Gambar 2)</span>
                        </button>
                      )}

                      {/* Halaman Depan */}
                      {onGoToLanding && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onGoToLanding();
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-blue-900/70 hover:text-white transition"
                        >
                          <Home className="w-4 h-4 text-emerald-400" />
                          <span>Halaman Depan Transparansi</span>
                        </button>
                      )}

                      {/* Divider */}
                      <div className="border-t border-blue-900/60 my-1" />

                      {/* Logout Action (Explicit - User must logout and login to change role) */}
                      <button
                        id="btn-logout-toolbar"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Keluar / Logout Akun</span>
                      </button>

                    </div>

                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
