import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Check, 
  Sparkles, 
  BadgeCheck, 
  FileText, 
  MapPin, 
  UserCheck, 
  Palette,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface HospitalProfile {
  badgeText: string;
  badgeColor: 'emerald' | 'amber' | 'blue' | 'rose' | 'purple';
  hospitalName: string;
  subtitle: string;
  hospitalType: string;
  pemdaName: string;
  address: string;
  city: string;
  phone: string;
  directorName: string;
  directorNip: string;
  directorTitle: string;
  committeeLeadName: string;
  committeeLeadNip: string;
  committeeLeadTitle: string;
}

export const DEFAULT_HOSPITAL_PROFILE: HospitalProfile = {
  badgeText: 'BLUD TERDAFTAR',
  badgeColor: 'amber',
  hospitalName: 'RSUD / BLUD SEHAT SENTOSA',
  subtitle: 'Sistem Jaspel & Remunerasi 2026',
  hospitalType: 'Tipe B - BLUD Penuh',
  pemdaName: 'PEMERINTAH DAERAH / DINAS KESEHATAN',
  address: 'Jl. Kesehatan Utama No. 45, Kompleks Medis',
  city: 'Kota Sentosa',
  phone: '(031) 888-9999',
  directorName: 'dr. Hj. Ratna Sari, M.Kes, Sp.A',
  directorNip: '19780514 200312 2 001',
  directorTitle: 'Direktur RSUD (Pengguna Anggaran BLUD)',
  committeeLeadName: 'dr. H. Hendra Setiawan, Sp.B',
  committeeLeadNip: '19780512 200312 1 002',
  committeeLeadTitle: 'Ketua Tim Remunerasi & Jaspel'
};

interface HospitalProfileModalProps {
  profile: HospitalProfile;
  onSave: (updated: HospitalProfile) => void;
  onClose: () => void;
}

export const HospitalProfileModal: React.FC<HospitalProfileModalProps> = ({
  profile,
  onSave,
  onClose
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<HospitalProfile>({ ...profile });

  const colorOptions: { id: HospitalProfile['badgeColor']; label: string; dotClass: string }[] = [
    { id: 'amber', label: 'Emas / Kuning (BLUD)', dotClass: 'bg-amber-400 ring-amber-400/30' },
    { id: 'emerald', label: 'Hijau (Terdaftar Aktif)', dotClass: 'bg-emerald-400 ring-emerald-400/30' },
    { id: 'blue', label: 'Biru (Medis RSUD)', dotClass: 'bg-blue-400 ring-blue-400/30' },
    { id: 'rose', label: 'Merah (Paripurna)', dotClass: 'bg-rose-400 ring-rose-400/30' },
    { id: 'purple', label: 'Ungu (Eksekutif)', dotClass: 'bg-purple-400 ring-purple-400/30' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_HOSPITAL_PROFILE });
  };

  const getDotBg = (color: HospitalProfile['badgeColor']) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        theme === 'light' 
          ? 'bg-white border-slate-200 text-slate-900' 
          : 'bg-[#0f1d38] border-blue-800 text-slate-100'
      }`}>
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-blue-950/60 border-blue-900/80'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Kustomisasi Banner Profil RSUD / BLUD
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-blue-200/80'}`}>
                Ubah identitas institusi, status badge BLUD, dan nama rumah sakit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              theme === 'light' ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-blue-900 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className={`p-4 sm:p-5 border-b ${theme === 'light' ? 'bg-blue-50/50 border-slate-200' : 'bg-slate-950/50 border-blue-900/60'}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2 text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pratinjau Tampilan Sidebar (Gambar 2):</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-md transition-all max-w-sm ${
            theme === 'light'
              ? 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-slate-50 border-blue-200 text-slate-900'
              : 'bg-gradient-to-br from-[#1e3a8a]/70 via-[#172554]/80 to-[#0b1329] border-blue-700/40 text-white'
          }`}>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span className={`w-2 h-2 rounded-full ${getDotBg(formData.badgeColor)} animate-pulse`}></span>
              <span className={theme === 'light' ? 'text-blue-900 font-extrabold' : 'text-amber-400 font-extrabold'}>
                {formData.badgeText || 'BLUD TERDAFTAR'}
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-black leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {formData.hospitalName || 'RSUD / BLUD SEHAT SENTOSA'}
            </p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-blue-200/90'}`}>
              {formData.subtitle || 'Sistem Jaspel & Remunerasi 2026'}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs sm:text-sm">
          
          {/* Badge & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Teks Status Badge
              </label>
              <input
                type="text"
                required
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="Contoh: BLUD TERDAFTAR"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Warna Titik Status
              </label>
              <select
                value={formData.badgeColor}
                onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value as any })}
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              >
                {colorOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hospital Name */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Nama Resmi Rumah Sakit / Instansi BLUD
            </label>
            <input
              type="text"
              required
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              placeholder="Contoh: RSUD DR. SOETOMO / BLUD SEHAT SENTOSA"
              className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none transition ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
              }`}
            />
          </div>

          {/* Subtitle / Sistem */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Sub-Judul / Nama Aplikasi & Tahun
            </label>
            <input
              type="text"
              required
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Contoh: Sistem Jaspel & Remunerasi 2026"
              className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
              }`}
            />
          </div>

          {/* Pemda & Tipe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Pemerintah Daerah / Dinas Pembina
              </label>
              <input
                type="text"
                value={formData.pemdaName}
                onChange={(e) => setFormData({ ...formData, pemdaName: e.target.value })}
                placeholder="Contoh: PEMERINTAH KABUPATEN / DINAS KESEHATAN"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Kelas / Tipe Rumah Sakit
              </label>
              <input
                type="text"
                value={formData.hospitalType}
                onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                placeholder="Contoh: Kelas B Non-Pendidikan"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Alamat, Kota, Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Alamat Kantor RSUD
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Contoh: Jl. Kusuma Bangsa No. 7"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Contoh: Kota Sentosa"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Telepon / Fax
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: (031) 888-9999"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Direktur & NIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Nama Direktur RSUD
              </label>
              <input
                type="text"
                value={formData.directorName}
                onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                placeholder="Contoh: dr. Nama Lengkap, Sp.X"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                NIP Direktur
              </label>
              <input
                type="text"
                value={formData.directorNip}
                onChange={(e) => setFormData({ ...formData, directorNip: e.target.value })}
                placeholder="Contoh: 19800101 200501 1 001"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Ketua Tim Remunerasi / Jaspel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Ketua Tim Remunerasi / Jaspel
              </label>
              <input
                type="text"
                value={formData.committeeLeadName}
                onChange={(e) => setFormData({ ...formData, committeeLeadName: e.target.value })}
                placeholder="Contoh: dr. H. Hendra Setiawan, Sp.B"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                NIP Ketua Tim Remunerasi
              </label>
              <input
                type="text"
                value={formData.committeeLeadNip}
                onChange={(e) => setFormData({ ...formData, committeeLeadNip: e.target.value })}
                placeholder="Contoh: 19780512 200312 1 002"
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    : 'bg-slate-900/90 border-blue-900 text-white focus:border-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                theme === 'light'
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-blue-950/80 hover:bg-blue-900 text-slate-300'
                }`}
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Kustomisasi</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
