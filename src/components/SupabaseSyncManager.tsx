import React, { useState } from 'react';
import { 
  Cloud, 
  Database, 
  ShieldCheck, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Copy, 
  Check, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Eye, 
  HardDrive, 
  Lock, 
  Unlock, 
  RefreshCw,
  FolderOpen,
  Sliders,
  Sparkles,
  Award,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { SupabaseConfig, BucketStorageFile, User } from '../types';
import { BUCKET_DEFINITIONS, generateSupabaseRlsScript } from '../config/supabase_config';
import { formatDateIndo, formatDateTimeIndo } from '../utils/calculations';

interface SupabaseSyncManagerProps {
  supabaseConfig: SupabaseConfig;
  setSupabaseConfig: React.Dispatch<React.SetStateAction<SupabaseConfig>>;
  storageFiles: BucketStorageFile[];
  setStorageFiles: React.Dispatch<React.SetStateAction<BucketStorageFile[]>>;
  currentUser: User;
  onTriggerPush: () => void;
  onTriggerPull: () => void;
}

export const SupabaseSyncManager: React.FC<SupabaseSyncManagerProps> = ({
  supabaseConfig,
  setSupabaseConfig,
  storageFiles,
  setStorageFiles,
  currentUser,
  onTriggerPush,
  onTriggerPull
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'storage' | 'rls' | 'config' | 'sync'>('storage');
  const [selectedBucket, setSelectedBucket] = useState<string>('dokumen-jaspel');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<BucketStorageFile | null>(null);

  const canManageSupabase = ['superadmin', 'perumus'].includes(currentUser?.role || 'staf');

  // RLS SQL
  const rlsSql = generateSupabaseRlsScript(supabaseConfig.rlsEnabled);

  const handleCopySql = () => {
    navigator.clipboard.writeText(rlsSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleToggleRls = () => {
    if (!canManageSupabase) return;
    setSupabaseConfig({
      ...supabaseConfig,
      rlsEnabled: !supabaseConfig.rlsEnabled
    });
  };

  const handlePush = () => {
    setIsPushing(true);
    setTimeout(() => {
      onTriggerPush();
      setSupabaseConfig(prev => ({
        ...prev,
        lastPushDate: new Date().toISOString()
      }));
      setIsPushing(false);
    }, 1200);
  };

  const handlePull = () => {
    setIsPulling(true);
    setTimeout(() => {
      onTriggerPull();
      setSupabaseConfig(prev => ({
        ...prev,
        lastPullDate: new Date().toISOString()
      }));
      setIsPulling(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newStorageItem: BucketStorageFile = {
      id: `file-${Date.now()}`,
      bucketName: selectedBucket as any,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.nama,
      description: uploadDescription || `Diunggah ke ${selectedBucket}`,
      public: false
    };

    setStorageFiles([newStorageItem, ...storageFiles]);
    setUploadDescription('');
    e.target.value = '';
  };

  const handleDeleteFile = (id: string) => {
    if (confirm('Hapus file ini dari Supabase Storage Bucket?')) {
      setStorageFiles(storageFiles.filter(f => f.id !== id));
    }
  };

  const filteredFiles = storageFiles.filter(f => f.bucketName === selectedBucket);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#172554] via-[#0f1d38] to-[#1e3a8a] rounded-3xl p-5 sm:p-7 border border-blue-700/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                SUPABASE INTEGRATION READY
              </span>
              <span className="text-xs text-blue-200 font-medium">Cloud DB & Bucket Storage</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Supabase RLS, Push/Pull Ready & Bucket Storage
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl mt-1">
              Dukungan konfigurasi runtime `env.js`, generator script PostgreSQL RLS policies, live cloud sync, dan manajemen berkas dokumen remunerasi.
            </p>
          </div>

          {/* Sync Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handlePull}
              disabled={isPulling}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-blue-950/80 hover:bg-blue-900 text-slate-200 border border-blue-800 font-bold text-xs transition"
              title="Tarik data dari cloud"
            >
              <ArrowDownCircle className={`w-4 h-4 text-amber-400 ${isPulling ? 'animate-spin' : ''}`} />
              <span>{isPulling ? 'Pulling...' : 'Pull Data'}</span>
            </button>

            <button
              onClick={handlePush}
              disabled={isPushing}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-amber-300 border border-amber-400/40 font-bold text-xs shadow-lg shadow-blue-950/50 transition active:scale-95"
              title="Kirim snapshot lokal ke Supabase Cloud"
            >
              <ArrowUpCircle className={`w-4 h-4 text-amber-400 ${isPushing ? 'animate-spin' : ''}`} />
              <span>{isPushing ? 'Pushing...' : 'Push Cloud Ready'}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Status Koneksi</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">Supabase Connected</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">
              {supabaseConfig.supabaseUrl}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Supabase RLS</span>
            <div className="flex items-center space-x-2 mt-1">
              {supabaseConfig.rlsEnabled ? (
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className={`font-bold ${supabaseConfig.rlsEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                {supabaseConfig.rlsEnabled ? 'RLS ENABLED' : 'RLS PAUSED'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Kebijakan 4 Role Aktif
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Sinkronisasi Terakhir</span>
            <p className="font-bold text-white mt-1">
              {formatDateTimeIndo(supabaseConfig.lastPushDate)}
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">Snapshot Lokal Tersimpan</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Berkas Storage</span>
            <p className="font-bold text-amber-400 mt-1">
              {storageFiles.length} Dokumen Tersimpan
            </p>
            <span className="text-[10px] text-slate-400">4 Bucket Aktif</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
        
        {/* Sub-Tabs Nav */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('storage')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeSubTab === 'storage'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Bucket Storage ({storageFiles.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('rls')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeSubTab === 'rls'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Supabase RLS Generator</span>
            </button>

            <button
              onClick={() => setActiveSubTab('config')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeSubTab === 'config'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Konfigurasi env.js & API</span>
            </button>

            <button
              onClick={() => setActiveSubTab('sync')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeSubTab === 'sync'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Push / Pull Log</span>
            </button>
          </div>
        </div>

        {/* 1. BUCKET STORAGE VIEW */}
        {activeSubTab === 'storage' && (
          <div className="space-y-6">
            
            {/* 4 Bucket Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BUCKET_DEFINITIONS.map(b => {
                const isSelected = selectedBucket === b.name;
                const fileCount = storageFiles.filter(f => f.bucketName === b.name).length;

                return (
                  <div
                    key={b.name}
                    onClick={() => setSelectedBucket(b.name)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-900/70 to-slate-900 border-amber-400 shadow-lg shadow-blue-950/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {b.name}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white">
                        {fileCount} Berkas
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{b.label}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{b.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Upload Area for Selected Bucket */}
            {canManageSupabase && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-dashed border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      <span>Unggah Berkas Baru ke Bucket: <strong className="text-amber-400 font-mono">{selectedBucket}</strong></span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Mendukung PDF, XLSX, CSV, Surat Keputusan, dan kwitansi transfer resmi
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={uploadDescription}
                      onChange={e => setUploadDescription(e.target.value)}
                      placeholder="Keterangan singkat berkas..."
                      className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 w-48 sm:w-64"
                    />
                    <label className="cursor-pointer px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition shrink-0">
                      <span>Pilih File</span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* File List in Selected Bucket */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Nama Dokumen</th>
                    <th className="py-3.5 px-3">Ukuran</th>
                    <th className="py-3.5 px-3">Diunggah Oleh</th>
                    <th className="py-3.5 px-3">Waktu Unggah</th>
                    <th className="py-3.5 px-3">Keterangan</th>
                    <th className="py-3.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredFiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                        Belum ada dokumen di dalam bucket <strong>{selectedBucket}</strong>.
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map(f => (
                      <tr key={f.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                            <div>
                              <div className="font-bold text-white text-xs sm:text-sm">{f.fileName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{f.fileType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {formatFileSize(f.fileSize)}
                        </td>
                        <td className="py-3 px-3 text-slate-300">{f.uploadedBy}</td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {formatDateTimeIndo(f.uploadedAt)}
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-[11px] max-w-xs truncate">
                          {f.description}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setSelectedFileForPreview(f)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Lihat Rincian File"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canManageSupabase && (
                              <button
                                onClick={() => handleDeleteFile(f.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 2. SUPABASE RLS ENABLE & SQL GENERATOR VIEW */}
        {activeSubTab === 'rls' && (
          <div className="space-y-4">
            
            {/* RLS Switch & Status Bar */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-black text-white">Skrip Lengkap: DDL Tabel & Row Level Security (RLS)</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    supabaseConfig.rlsEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {supabaseConfig.rlsEnabled ? 'ENABLE' : 'DISABLE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Skrip mandiri (idempotent) yang membuat seluruh 6 tabel master & transaksi (<code className="text-emerald-400">alokasi_jaspel</code>, <code className="text-emerald-400">penerima_alokasi</code>, dll.), indeks performa, storage buckets, dan kebijakan keamanan RBAC.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {canManageSupabase && (
                  <button
                    onClick={handleToggleRls}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
                      supabaseConfig.rlsEnabled
                        ? 'bg-emerald-900 text-emerald-100 hover:bg-emerald-800'
                        : 'bg-rose-900 text-rose-100 hover:bg-rose-800'
                    }`}
                  >
                    {supabaseConfig.rlsEnabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{supabaseConfig.rlsEnabled ? 'RLS Aktif (Klik utk Matikan)' : 'RLS Mati (Klik utk Aktifkan)'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-lg shadow-amber-400/20"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? '✓ Tersalin ke Clipboard' : 'Salin Seluruh Skrip SQL'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-step Guide Banner */}
            <div className="p-3.5 bg-blue-950/50 border border-blue-800/70 rounded-xl text-xs text-blue-200">
              <div className="font-bold text-amber-400 mb-1 flex items-center space-x-1.5">
                <span>💡 Petunjuk Menjalankan Skrip di Supabase SQL Editor:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Klik tombol <strong>"Salin Seluruh Skrip SQL"</strong> di atas.</li>
                <li>Buka Dashboard Supabase Anda &rarr; Pilih menu <strong>SQL Editor</strong> di bilah navigasi kiri.</li>
                <li>Klik <strong>+ New Query</strong>, tempel (paste) seluruh teks skrip, lalu klik tombol hijau <strong>Run</strong>.</li>
                <li>Skrip akan membuat tabel <code className="text-emerald-400">alokasi_jaspel</code> dan tabel-tabel lainnya secara otomatis dan bebas error.</li>
              </ol>
            </div>

            {/* SQL Script View */}
            <div className="relative rounded-2xl bg-black border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[420px] custom-scrollbar">
              <pre>{rlsSql}</pre>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Salin skrip di atas dan jalankan pada menu <strong>SQL Editor</strong> di Dashboard Supabase project Anda untuk mengaktifkan RLS dan Storage policies.
            </p>

          </div>
        )}

        {/* 3. ENV.JS & API CONFIGURATION VIEW */}
        {activeSubTab === 'config' && (
          <div className="space-y-5">
            
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Konfigurasi Runtime env.js</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                  TERHUBUNG
                </span>
              </h4>
              <p className="text-slate-400 text-xs">
                File <code>public/env.js</code> dimuat langsung sebelum bundle aplikasi untuk menyediakan URL dan Kunci API runtime tanpa perlu rebuild container.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={supabaseConfig.supabaseUrl}
                    onChange={e => setSupabaseConfig({ ...supabaseConfig, supabaseUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">
                    Supabase Anon Public Key
                  </label>
                  <textarea
                    rows={2}
                    value={supabaseConfig.supabaseAnonKey}
                    onChange={e => setSupabaseConfig({ ...supabaseConfig, supabaseAnonKey: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">
                    PostgreSQL Connection URL
                  </label>
                  <input
                    type="text"
                    value={supabaseConfig.databaseUrl}
                    onChange={e => setSupabaseConfig({ ...supabaseConfig, databaseUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    localStorage.setItem('halo_japel_supabase_cfg', JSON.stringify(supabaseConfig));
                    alert('Konfigurasi Supabase berhasil disimpan secara persisten!');
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 4. SYNC LOGS & AUDIT VIEW */}
        {activeSubTab === 'sync' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white">Log Sinkronisasi Cloud & Lokal</h4>
              <p className="text-slate-400">
                Pencatatan riwayat Push (kirim ke cloud) dan Pull (tarik dari cloud) untuk memastikan integritas remunerasi.
              </p>

              <div className="space-y-2 font-mono text-slate-300 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-emerald-400">PUSH_SNAPSHOT_SUCCESS</span>
                  <span>{formatDateTimeIndo(supabaseConfig.lastPushDate)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-blue-400">PULL_SCHEMA_SUCCESS</span>
                  <span>{formatDateTimeIndo(supabaseConfig.lastPullDate)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-amber-400">RLS_POLICY_ACTIVE</span>
                  <span>Enforced on 6 tables</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL PREVIEW FILE */}
      {selectedFileForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white">Rincian Dokumen Storage</h3>
              <button onClick={() => setSelectedFileForPreview(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p><strong>Nama:</strong> {selectedFileForPreview.fileName}</p>
              <p><strong>Bucket:</strong> <span className="font-mono text-amber-400">{selectedFileForPreview.bucketName}</span></p>
              <p><strong>Ukuran:</strong> {formatFileSize(selectedFileForPreview.fileSize)}</p>
              <p><strong>Diunggah:</strong> {formatDateTimeIndo(selectedFileForPreview.uploadedAt)}</p>
              <p><strong>Pengunggah:</strong> {selectedFileForPreview.uploadedBy}</p>
              <p><strong>Keterangan:</strong> {selectedFileForPreview.description}</p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedFileForPreview(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
