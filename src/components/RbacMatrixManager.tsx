import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Lock, 
  Check, 
  X, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search, 
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { User, Permission, RoleType } from '../types';
import { supabase } from '../lib/supabase';
import { INSTALASI_LAYANAN_LIST } from '../data/initialData';
import { ConfirmModal } from './ConfirmModal';

interface RbacMatrixManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  permissions: Permission[];
  setPermissions: React.Dispatch<React.SetStateAction<Permission[]>>;
  currentUser: User;
}

export const RbacMatrixManager: React.FC<RbacMatrixManagerProps> = ({
  users,
  setUsers,
  permissions,
  setPermissions,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'users'>('matrix');
  const [searchUser, setSearchUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [userForm, setUserForm] = useState<Omit<User, 'id'>>({
    username: '',
    nama: '',
    nip: '',
    role: 'staf',
    unit: 'Instalasi Rawat Jalan',
    jabatan: 'Staf Medis',
    email: '',
    status: 'aktif',
    bank: 'Bank Jatim',
    rekening: '',
    npwp: ''
  });

  const canManageUsers = (currentUser?.role || 'staf') === 'superadmin';

  const roleMeta: Record<RoleType, { label: string; desc: string; color: string }> = {
    superadmin: {
      label: 'Superadmin',
      desc: 'Kendali penuh seluruh modul, bypass RLS, manajemen pengguna & database',
      color: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    perumus: {
      label: 'Tim Perumus',
      desc: 'Formulasi rumus jaspel, pagu anggaran, proporsi, simulasi & ekspor laporan',
      color: 'bg-amber-950 text-amber-300 border-amber-800'
    },
    pic: {
      label: 'PIC (Kepala Unit)',
      desc: 'Validasi kinerja unit, pengajuan koreksi poin staf, verifikasi alokasi unit',
      color: 'bg-blue-950 text-blue-300 border-blue-800'
    },
    staf: {
      label: 'Staf / Penerima',
      desc: 'Transparansi slip jaspel pribadi, rincian skor poin, unduh PDF slip gaji',
      color: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    input_perawat: {
      label: 'Input Perawat',
      desc: 'Operator input & rekap khusus tabel layanan perawat & kebidanan',
      color: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    },
    input_medis: {
      label: 'Input Medis (Dr. Umum)',
      desc: 'Operator input & rekap khusus tabel layanan dokter umum & medis klinis',
      color: 'bg-cyan-950 text-cyan-300 border-cyan-800'
    },
    input_spesialis: {
      label: 'Input Spesialis',
      desc: 'Operator input & rekap khusus tabel layanan dokter spesialis',
      color: 'bg-purple-950 text-purple-300 border-purple-800'
    },
    input_psikiatri: {
      label: 'Input Psikiatri',
      desc: 'Operator input & rekap khusus tabel layanan psikiatri & kesehatan jiwa',
      color: 'bg-pink-950 text-pink-300 border-pink-800'
    },
    input_nakes_lain: {
      label: 'Input Nakes Lain',
      desc: 'Operator input & rekap layanan gizi, farmasi, lab, radiologi, fisio, dll.',
      color: 'bg-teal-950 text-teal-300 border-teal-800'
    },
    input_cuti: {
      label: 'Input Cuti & Presensi',
      desc: 'Operator input & rekap bobot presensi, cuti pegawai, dan indeks presensi',
      color: 'bg-indigo-950 text-indigo-300 border-indigo-800'
    },
    input_ketenagaan: {
      label: 'Input Ketenagaan & Indeks',
      desc: 'Operator input & rekap database ketenagaan, struktural, administrasi & general index',
      color: 'bg-violet-950 text-violet-300 border-violet-800'
    }
  };

  const ALL_ROLE_KEYS: RoleType[] = [
    'superadmin',
    'perumus',
    'pic',
    'staf',
    'input_perawat',
    'input_medis',
    'input_spesialis',
    'input_psikiatri',
    'input_nakes_lain',
    'input_cuti',
    'input_ketenagaan'
  ];

  const categories = Array.from(new Set(permissions.map(p => p.category)));

  const filteredPermissions = permissions.filter(p => {
    return selectedCategory === 'all' || p.category === selectedCategory;
  });

  const filteredUsers = users.filter(u => 
    u.nama.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.nip.includes(searchUser) ||
    u.unit.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchUser.toLowerCase())
  );

  const togglePermission = (permId: string, role: RoleType) => {
    if (!canManageUsers) return;
    setPermissions(permissions.map(p => {
      if (p.id === permId) {
        return {
          ...p,
          [role]: !p[role]
        };
      }
      return p;
    }));
  };

  // Handlers for User CRUD
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      nama: '',
      nip: '',
      role: 'staf',
      unit: 'Instalasi Gawat Darurat (IGD)',
      jabatan: 'Perawat Pelaksana',
      email: '',
      status: 'aktif',
      bank: 'Bank Jatim / BPD',
      rekening: '0019283746',
      npwp: '01.234.567.8-091.000'
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({
      username: u.username,
      nama: u.nama,
      nip: u.nip,
      role: u.role,
      unit: u.unit,
      jabatan: u.jabatan,
      email: u.email,
      status: u.status,
      bank: u.bank || 'Bank Jatim',
      rekening: u.rekening || '',
      npwp: u.npwp || ''
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingUser ? editingUser.id : `u-${Date.now()}`;
    const payload = {
      id,
      username: userForm.username,
      nama: userForm.nama,
      nip: userForm.nip,
      role: userForm.role,
      unit: userForm.unit,
      jabatan: userForm.jabatan,
      email: userForm.email,
      status: userForm.status,
      bank: userForm.bank,
      rekening: userForm.rekening,
      npwp: userForm.npwp
    };
    
    try {
      if (editingUser) {
        await supabase.from('users_rbac').update(payload).eq('id', id);
        setUsers(users.map(u => u.id === id ? { ...userForm, id } : u));
      } else {
        await supabase.from('users_rbac').insert([payload]);
        setUsers([...users, { ...userForm, id }]);
      }
      setShowUserModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengguna');
    }
  };

  const handleDeleteUser = (id: string, namaPengguna?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akses Pengguna',
      message: `Apakah Anda yakin ingin menghapus akun akses ${namaPengguna ? `"${namaPengguna}"` : ''}? Pengguna tidak akan dapat login kembali ke sistem.`,
      confirmText: 'Ya, Hapus Pengguna',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: async () => {
        setUsers(prev => prev.filter(u => u.id !== id));
        try {
          await supabase.from('users_rbac').delete().eq('id', id);
        } catch (err) {
          console.error('Error deleting user from supabase:', err);
        }
      }
    });
  };

  const handleToggleStatus = async (u: User) => {
    if (!canManageUsers) return;
    const newStatus = u.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await supabase.from('users_rbac').update({ status: newStatus }).eq('id', u.id);
      setUsers(users.map(item => item.id === u.id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui status akun di database');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#172554] via-[#0f1d38] to-[#1e3a8a] rounded-3xl p-5 sm:p-7 border border-blue-700/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                RBAC MATRIX & USER ACCESS
              </span>
              <span className="text-xs text-blue-200 font-medium">Role-Based Access Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Matrix 4 Role Inti & Manajemen Akun Pegawai
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl mt-1">
              Superadmin, Tim Perumus, PIC (Kepala Unit), dan Staf/Penerima dengan pembatasan hak akses berbasis Supabase RLS policies.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {canManageUsers && (
              <button
                onClick={handleOpenAddUser}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Pengguna</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Roles Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-blue-900/60">
          {(['superadmin', 'perumus', 'pic', 'staf'] as RoleType[]).map(roleKey => {
            const meta = roleMeta[roleKey];
            const count = users.filter(u => u.role === roleKey).length;
            const isMyRole = (currentUser?.role || 'staf') === roleKey;

            return (
              <div 
                key={roleKey}
                className={`p-4 rounded-2xl border transition-all ${
                  isMyRole 
                    ? 'bg-gradient-to-br from-blue-900/80 to-[#0b142b] border-blue-400 shadow-lg shadow-blue-950/50' 
                    : 'bg-[#0b142b]/80 border-blue-900/60 hover:border-blue-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-blue-300 font-bold">{count} Akun</span>
                </div>
                <p className="text-xs text-blue-100/90 mt-2 font-medium leading-snug">
                  {meta.desc}
                </p>
                {isMyRole && (
                  <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Peran Anda Saat Ini</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Switcher: Matrix vs User Management */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'matrix'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Matrix Hak Akses</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Daftar Pengguna ({users.length})</span>
            </button>
          </div>

          {activeTab === 'matrix' ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Filter Kategori:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Cari nama, NIP, unit..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400"
              />
            </div>
          )}
        </div>

        {/* 1. MATRIX VIEW */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-bold">Matriks Izin Berbasis Role-Based Access Control</p>
                <p className="text-[11px] mt-0.5">
                  {canManageUsers 
                    ? 'Sebagai Superadmin, Anda dapat mencentang atau mematikan izin fitur secara langsung di tabel bawah ini.'
                    : 'Tampilan hak akses terhubung dengan Supabase RLS. Hanya Superadmin yang dapat mengubah kebijakan matriks.'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[200px]">Fitur / Hak Akses</th>
                    <th className="py-3.5 px-2 min-w-[120px]">Kategori</th>
                    {ALL_ROLE_KEYS.map(rk => (
                      <th key={rk} className="py-3.5 px-2 text-center whitespace-nowrap min-w-[70px]">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${roleMeta[rk]?.color || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {roleMeta[rk]?.label.split(' ')[0]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredPermissions.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{p.description}</div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap">
                          {p.category}
                        </span>
                      </td>

                      {ALL_ROLE_KEYS.map(rk => {
                        const isGranted = !!(p as any)[rk];
                        return (
                          <td key={rk} className="py-3.5 px-2 text-center">
                            <button
                              disabled={!canManageUsers}
                              onClick={() => togglePermission(p.id, rk)}
                              title={`${roleMeta[rk]?.label}: ${isGranted ? 'Diizinkan' : 'Dilarang'}`}
                              className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition ${
                                isGranted 
                                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 shadow-sm' 
                                  : 'bg-slate-800/40 text-slate-600'
                              } ${canManageUsers ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                            >
                              {isGranted ? <Check className="w-3.5 h-3.5 font-bold" /> : <X className="w-3 h-3" />}
                            </button>
                          </td>
                        );
                      })}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. USERS LIST VIEW */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Nama Lengkap & Akun</th>
                    <th className="py-3.5 px-3">Unit Kerja & Jabatan</th>
                    <th className="py-3.5 px-3 text-center">Peran (Role)</th>
                    <th className="py-3.5 px-3">Rekening Payroll</th>
                    <th className="py-3.5 px-3 text-center">Status Akun</th>
                    <th className="py-3.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs ${
                            u.role === 'superadmin' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            u.role === 'perumus' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            u.role === 'pic' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {u.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs sm:text-sm">{u.nama}</div>
                            <div className="text-[10px] text-slate-400 font-mono">@{u.username} • NIP. {u.nip}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        <div>{u.unit}</div>
                        <div className="text-[10px] text-slate-400">{u.jabatan}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${roleMeta[u.role]?.color || roleMeta.staf.color}`}>
                          {u.role || 'staf'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px]">
                        <div>{u.bank || 'Bank Jatim'}</div>
                        <div className="text-[10px] text-slate-400">{u.rekening || '-'}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={!canManageUsers}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'aktif'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {u.status.toUpperCase()}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {canManageUsers && (
                            <>
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Edit Akun"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.nama)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                                title="Hapus Akun"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* USER MODAL (ADD / EDIT) */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingUser ? 'Ubah Data Pengguna' : 'Tambah Pengguna RBAC Baru'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Username Akun</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Peran Matrix (Role)</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-bold"
                  >
                    {ALL_ROLE_KEYS.map(rk => (
                      <option key={rk} value={rk}>
                        {roleMeta[rk]?.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={userForm.nama}
                  onChange={e => setUserForm({ ...userForm, nama: e.target.value })}
                  placeholder="Contoh: dr. Budi Santoso, Sp.A"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">NIP Pegawai</label>
                  <input
                    type="text"
                    required
                    value={userForm.nip}
                    onChange={e => setUserForm({ ...userForm, nip: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Unit Kerja / Ruangan</label>
                  <input
                    type="text"
                    required
                    list="instalasi-list"
                    value={userForm.unit}
                    onChange={e => setUserForm({ ...userForm, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    placeholder="Pilih atau ketik unit..."
                  />
                  <datalist id="instalasi-list">
                    {INSTALASI_LAYANAN_LIST.map(inst => (
                      <option key={inst} value={inst} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Jabatan</label>
                  <input
                    type="text"
                    required
                    value={userForm.jabatan}
                    onChange={e => setUserForm({ ...userForm, jabatan: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Bank Payroll</label>
                  <input
                    type="text"
                    value={userForm.bank}
                    onChange={e => setUserForm({ ...userForm, bank: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">No. Rekening</label>
                  <input
                    type="text"
                    value={userForm.rekening}
                    onChange={e => setUserForm({ ...userForm, rekening: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300">Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDanger={confirmModal.isDanger !== false}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
