import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanInput = identifier.trim();

      // 1. If user typed an email, try Supabase Auth
      if (cleanInput.includes('@')) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanInput,
          password: password,
        });

        if (!authError && authData?.user) {
          const { data: userData } = await supabase
            .from('users_rbac')
            .select('*')
            .ilike('email', cleanInput)
            .maybeSingle();

          if (userData) {
            onLogin({
              id: String(userData.id),
              nama: userData.nama,
              role: userData.role,
              unit: userData.unit || '',
              jabatan: userData.jabatan || '',
              email: userData.email || cleanInput
            });
            return;
          } else {
            onLogin({
              id: authData.user.id,
              nama: authData.user.email?.split('@')[0] || 'Pengguna',
              role: 'staf',
              unit: '',
              jabatan: '',
              email: cleanInput
            });
            return;
          }
        }
      }

      // 2. Query users_rbac by email or username
      const { data: rbacUser, error: rbacError } = await supabase
        .from('users_rbac')
        .select('*')
        .or(`email.ilike.${cleanInput},username.ilike.${cleanInput}`)
        .maybeSingle();

      if (rbacError) {
        console.warn('RBAC query error:', rbacError.message);
      }

      if (rbacUser) {
        onLogin({
          id: String(rbacUser.id),
          nama: rbacUser.nama,
          role: rbacUser.role,
          unit: rbacUser.unit || '',
          jabatan: rbacUser.jabatan || '',
          email: rbacUser.email || cleanInput
        });
        return;
      }

      throw new Error('Email atau username tidak terdaftar, atau kata sandi tidak valid.');
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa kembali data login Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] p-4 font-sans selection:bg-amber-400 selection:text-slate-950">
      <div className="w-full max-w-md bg-[#0c1633] rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#1e3a8a] to-[#0f172a] border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-950/60 mb-3">
            <span className="font-black text-amber-300 text-2xl tracking-tighter">HJ</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            HALO <span className="text-amber-400">JASPEL</span>
          </h1>
          <p className="text-xs text-blue-200/70 mt-1 font-medium text-center">
            RSJD Atma Husada Mahakam • Distribusi Jasa Pelayanan BLUD 2026
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Email atau Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="Masukkan email atau username"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? 'Memverifikasi...' : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Masuk Sistem</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
