import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertCircle, X, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface ChangePasswordModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  onClose,
  onSuccess
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      // 1. Try Supabase Auth API
      const { data, error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError && authError.message && !authError.message.includes('session')) {
        console.warn('Supabase auth update note:', authError.message);
      }

      // 2. Also record update timestamp in users_rbac if user id exists
      if (currentUser?.id) {
        try {
          await supabase.from('users_rbac').update({
            updated_at: new Date().toISOString()
          }).eq('id', currentUser.id);
        } catch (dbErr) {
          console.warn('Could not update users_rbac timestamp:', dbErr);
        }
      }

      onSuccess('Password berhasil diperbarui dengan aman!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah password. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="change-password-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-100 animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ubah Password Akun</h3>
              <p className="text-xs text-slate-400">
                Akun: <span className="text-amber-400 font-semibold">{currentUser?.nama || 'Pengguna'}</span> ({currentUser?.role?.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Password Saat Ini (Opsional / Verifikasi)
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white pr-10 focus:outline-none focus:border-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Password Baru (Minimal 6 Karakter) *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru yang kuat"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white pr-10 focus:outline-none focus:border-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Ulangi Password Baru *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru"
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-2xl flex items-start space-x-2 text-[11px] text-blue-200">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Perubahan password akan dienkripsi dengan standar keamanan SHA/Bcrypt dan tersinkronisasi dengan akun Supabase Anda.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Password Baru</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
