import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
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
        // Fallback for simulation if no Supabase configured
        console.warn("Simulating login since no Supabase URL is set");
        setTimeout(() => {
          onLogin({
            id: 'sim-' + Date.now(),
            nama: email.split('@')[0] || 'Super Admin',
            role: 'superadmin', 
            unit: 'Manajemen',
            jabatan: 'Direktur'
          });
        }, 1000);
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
        throw userError;
      }

      if (userData) {
        onLogin({
          id: userData.id,
          nama: userData.nama,
          role: userData.role,
          unit: userData.unit || '',
          jabatan: userData.jabatan || ''
        });
      } else {
        // Fallback if not in users_rbac
        onLogin({
          id: authData.user.id,
          nama: authData.user.email?.split('@')[0] || 'User',
          role: 'staf', // Default role
          unit: '',
          jabatan: ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] p-4 font-sans selection:bg-amber-400 selection:text-slate-950">
      <div className="w-full max-w-md bg-[#0c1633] rounded-3xl p-8 border border-blue-900/50 shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#1e3a8a] to-[#0f172a] border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-950/60 mb-4">
            <span className="font-black text-amber-300 text-2xl tracking-tighter">HJ</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            HALO <span className="text-amber-400">JASPEL</span>
          </h1>
          <p className="text-xs text-blue-200/70 mt-1 font-medium text-center">
            Pola Distribusi Jasa Pelayanan RS<br />
            BLUD 2026
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Akses</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="email@rsud.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
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

        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500">
            Pastikan Anda memiliki kredensial dari administrator Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};
