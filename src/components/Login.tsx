import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Lock, User as UserIcon, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from './HospitalProfileModal';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLogin: (user: User) => void;
  onBackToLanding?: () => void;
  hospitalProfile?: HospitalProfile;
}

export const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  onBackToLanding,
  hospitalProfile = DEFAULT_HOSPITAL_PROFILE 
}) => {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL === '') {
        // Fallback simulation if no active Supabase connection
        setTimeout(() => {
          onLogin({
            id: 'sim-' + Date.now(),
            nama: email.split('@')[0] || 'Administrator Jaspel',
            role: email.includes('admin') || email.includes('direktur') ? 'superadmin' : 
                  email.includes('perumus') ? 'perumus' :
                  email.includes('pic') ? 'pic' : 'staf',
            unit: 'Manajemen RSUD',
            jabatan: 'Penanggung Jawab Jaspel',
            email: email
          });
        }, 800);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Fetch user role from users_rbac
      const { data: userData, error: userError } = await supabase
        .from('users_rbac')
        .select('*')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.warn("users_rbac lookup warning:", userError);
      }

      if (userData) {
        onLogin({
          id: userData.id,
          nama: userData.nama,
          role: userData.role,
          unit: userData.unit || '',
          jabatan: userData.jabatan || '',
          email: userData.email || email
        });
      } else {
        onLogin({
          id: authData.user.id,
          nama: authData.user.email?.split('@')[0] || 'Pegawai RSUD',
          role: 'staf',
          unit: 'Pelayanan Medis',
          jabatan: 'Staf Medis',
          email: authData.user.email || email
        });
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200 ${
      theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#07090e] text-slate-100'
    }`}>
      
      {/* Top Bar on Login Screen */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        {onBackToLanding ? (
          <button
            onClick={onBackToLanding}
            className={`flex items-center space-x-1.5 text-xs font-bold transition ${
              theme === 'light' ? 'text-slate-700 hover:text-blue-700' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Depan</span>
          </button>
        ) : <div />}

        <button
          onClick={toggleTheme}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
            theme === 'light'
              ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
              : 'bg-[#0c1633] border-blue-900/60 text-amber-300 hover:border-amber-400'
          }`}
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Tema Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Tema Gelap</span>
            </>
          )}
        </button>
      </div>

      <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl relative ${
        theme === 'light'
          ? 'bg-white border-slate-300 text-slate-900'
          : 'bg-[#0c1633] border-blue-900/50 text-white'
      }`}>
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#1e3a8a] to-[#0f172a] border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-950/60 mb-3">
            <span className="font-black text-amber-300 text-xl sm:text-2xl tracking-tighter">
              {hospitalProfile.hospitalName.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <h1 className={`text-base sm:text-lg font-black tracking-tight text-center ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {hospitalProfile.hospitalName}
          </h1>
          <p className={`text-xs mt-1 font-medium text-center ${
            theme === 'light' ? 'text-slate-600' : 'text-blue-200/70'
          }`}>
            {hospitalProfile.subtitle || 'Sistem Alokasi Jasa Pelayanan & Database Manajer RS'}<br />
            <span className="text-[10px] font-bold text-amber-500">{hospitalProfile.badgeText || 'BLUD'}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Email Akses
            </label>
            <div className="relative">
              <UserIcon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-xs sm:text-sm font-medium focus:outline-none transition border ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white'
                    : 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-amber-400'
                }`}
                placeholder="nama@rsud.com"
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-xs sm:text-sm font-medium focus:outline-none transition border ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white'
                    : 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-amber-400'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200/50 text-center">
          <p className={`text-[10px] font-medium ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-500'
          }`}>
            Otentikasi Aman PostgreSQL Supabase RLS BLUD 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
