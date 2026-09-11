import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Lock, 
  Unlock, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Copy, 
  Check, 
  HardDrive, 
  FileText, 
  Trash2, 
  UploadCloud, 
  Eye, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  Database,
  Server,
  ExternalLink,
  CheckCircle2,
  Table,
  AlertTriangle,
  XCircle,
  Activity,
  HelpCircle,
  Code
} from 'lucide-react';
import { 
  User, 
  SupabaseConfig, 
  BucketStorageFile,
  AlokasiJaspel,
  PenerimaAlokasi,
  GeneralIndexItem,
  CostCenterItem,
  RevenueCenterItem,
  IndeksJasaLangsungItem
} from '../types';
import { HospitalProfile } from './HospitalProfileModal';
import { BUCKET_DEFINITIONS, generateSupabaseRlsScript } from '../config/supabase_config';
import { formatDateTimeIndo } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';
import { reconfigureSupabase } from '../lib/supabase';
import { 
  testSupabaseConnection, 
  pushAllDataToSupabase, 
  pullAllDataFromSupabase, 
  DiagnosticsResult 
} from '../lib/syncService';

interface SupabaseSyncManagerProps {
  currentUser: User;
  supabaseConfig: SupabaseConfig;
  setSupabaseConfig: React.Dispatch<React.SetStateAction<SupabaseConfig>>;
  storageFiles: BucketStorageFile[];
  setStorageFiles: React.Dispatch<React.SetStateAction<BucketStorageFile[]>>;
  onTriggerPush: () => Promise<void> | void;
  onTriggerPull: () => Promise<void> | void;
  onSeed?: () => Promise<void> | void;
  isSeeding?: boolean;
  alokasiList?: AlokasiJaspel[];
  penerimaList?: PenerimaAlokasi[];
  generalIndexList?: GeneralIndexItem[];
  costCenterList?: CostCenterItem[];
  revenueCenterList?: RevenueCenterItem[];
  indeksJasaList?: IndeksJasaLangsungItem[];
  users?: User[];
  hospitalProfile?: HospitalProfile;
}

export const SupabaseSyncManager: React.FC<SupabaseSyncManagerProps> = ({
  currentUser,
  supabaseConfig,
  setSupabaseConfig,
  storageFiles,
  setStorageFiles,
  onTriggerPush,
  onTriggerPull,
  onSeed,
  isSeeding = false,
  alokasiList = [],
  penerimaList = [],
  generalIndexList = [],
  costCenterList = [],
  revenueCenterList = [],
  users = [],
  hospitalProfile
}) => {
  const { theme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'diagnostik' | 'storage' | 'rls' | 'config' | 'sync'>('diagnostik');
  const [selectedBucket, setSelectedBucket] = useState<string>('dokumen-jaspel');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<BucketStorageFile | null>(null);

  // Form state for updating Supabase config
  const [formUrl, setFormUrl] = useState(supabaseConfig.supabaseUrl);
  const [formKey, setFormKey] = useState(supabaseConfig.supabaseAnonKey);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Live Diagnostics State
  const [isTesting, setIsTesting] = useState(false);
  const [diagResult, setDiagResult] = useState<DiagnosticsResult | null>(null);
  const [lastTestedTime, setLastTestedTime] = useState<string | null>(null);

  const canManageSupabase = ['superadmin', 'perumus'].includes(currentUser?.role || 'staf');

  // RLS SQL
  const rlsSql = generateSupabaseRlsScript(supabaseConfig.rlsEnabled);

  const runDiagnostics = async () => {
    setIsTesting(true);
    try {
      const res = await testSupabaseConnection();
      setDiagResult(res);
      setLastTestedTime(new Date().toLocaleTimeString('id-ID'));
    } catch (e: any) {
      setDiagResult({
        connected: false,
        latencyMs: 0,
        url: formUrl,
        tables: [],
        totalRows: 0,
        error: e.message || 'Gagal melakukan tes koneksi.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [supabaseConfig.supabaseUrl]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(rlsSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(supabaseConfig.supabaseUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleToggleRls = () => {
    if (!canManageSupabase) return;
    setSupabaseConfig({
      ...supabaseConfig,
      rlsEnabled: !supabaseConfig.rlsEnabled
    });
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      await onTriggerPush();
      setSupabaseConfig(prev => ({
        ...prev,
        lastPushDate: new Date().toISOString()
      }));
      await runDiagnostics();
    } finally {
      setIsPushing(false);
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    try {
      await onTriggerPull();
      setSupabaseConfig(prev => ({
        ...prev,
        lastPullDate: new Date().toISOString()
      }));
      await runDiagnostics();
    } finally {
      setIsPulling(false);
    }
  };

  const handleSaveCustomConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    reconfigureSupabase(formUrl, formKey);
    const updated = {
      ...supabaseConfig,
      supabaseUrl: formUrl,
      supabaseAnonKey: formKey
    };
    setSupabaseConfig(updated);
    localStorage.setItem('halo_japel_supabase_cfg', JSON.stringify(updated));
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
    await runDiagnostics();
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

  const missingTablesCount = diagResult?.tables.filter(t => t.status === 'missing').length || 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Banner */}
      <div className={`rounded-3xl p-5 sm:p-7 border shadow-xl relative overflow-hidden transition-all ${
        theme === 'light'
          ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border-blue-800 text-white'
          : 'bg-gradient-to-r from-[#172554] via-[#0f1d38] to-[#1e3a8a] border-blue-700/50 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 shadow-sm">
                SUPABASE CLOUD POSTGRESQL
              </span>
              <span className="text-xs text-blue-100 font-medium">Real-Time Database & Diagnostics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              Pusat Integrasi & Sinkronisasi Supabase Cloud
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl mt-1">
              Pantau status koneksi, jumlah data per tabel, serta lakukan Push (simpan ke cloud) dan Pull (tarik dari cloud) secara transparan.
            </p>
          </div>

          {/* Sync Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={runDiagnostics}
              disabled={isTesting}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 font-bold text-xs transition"
              title="Cek koneksi dan hitung data di Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Mengecek...' : 'Tes Koneksi'}</span>
            </button>

            <button
              onClick={handlePull}
              disabled={isPulling}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-slate-100 border border-blue-600/80 font-bold text-xs transition active:scale-95"
              title="Tarik data dari Supabase Cloud"
            >
              <ArrowDownCircle className={`w-4 h-4 text-amber-400 ${isPulling ? 'animate-spin' : ''}`} />
              <span>{isPulling ? 'Menarik Data...' : 'Tarik Data (Pull)'}</span>
            </button>

            <button
              onClick={handlePush}
              disabled={isPushing}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
              title="Kirim dan simpan data aplikasi saat ini ke Supabase Cloud"
            >
              <ArrowUpCircle className={`w-4 h-4 text-slate-950 ${isPushing ? 'animate-spin' : ''}`} />
              <span>{isPushing ? 'Menyimpan...' : 'Simpan ke Cloud (Push)'}</span>
            </button>

            {onSeed && currentUser?.role === 'superadmin' && (
              <button
                onClick={async () => {
                  if (onSeed) {
                    await onSeed();
                    await runDiagnostics();
                  }
                }}
                disabled={isSeeding}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95"
                title="Isi data awal komprehensif ke Supabase"
              >
                <Database className={`w-4 h-4 text-white ${isSeeding ? 'animate-bounce' : ''}`} />
                <span>{isSeeding ? 'Seeding...' : 'Seed Data Awal'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Status Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-blue-700/50 text-xs">
          
          {/* Card 1: Status Koneksi */}
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-blue-700/60 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-200">Koneksi Supabase</span>
              {diagResult?.latencyMs ? (
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {diagResult.latencyMs} ms
                </span>
              ) : null}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${
                diagResult?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`} />
              <span className="font-bold text-white text-xs">
                {diagResult?.connected ? 'Supabase Online' : 'Belum Terhubung / Error'}
              </span>
            </div>
            <span className="text-[10px] text-blue-200 font-mono truncate block mt-1" title={supabaseConfig.supabaseUrl}>
              {supabaseConfig.supabaseUrl}
            </span>
          </div>

          {/* Card 2: Status Tabel di Supabase */}
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-blue-700/60 shadow-md">
            <span className="text-[10px] uppercase font-bold text-blue-200">Struktur Tabel</span>
            <div className="flex items-center space-x-2 mt-1">
              {missingTablesCount > 0 ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span className={`font-bold text-xs ${missingTablesCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                {missingTablesCount > 0 ? `${missingTablesCount} Tabel Perlu Dibuat` : 'Semua Tabel Siap'}
              </span>
            </div>
            <span className="text-[10px] text-blue-200 mt-1 block">
              {diagResult ? `Total ${diagResult.totalRows} baris data di cloud` : 'Mengecek data...'}
            </span>
          </div>

          {/* Card 3: Waktu Sinkronisasi */}
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-blue-700/60 shadow-md">
            <span className="text-[10px] uppercase font-bold text-blue-200">Waktu Push Terakhir</span>
            <p className="font-bold text-white text-xs mt-1">
              {formatDateTimeIndo(supabaseConfig.lastPushDate)}
            </p>
            <span className="text-[10px] text-emerald-300 font-semibold block mt-1">
              {lastTestedTime ? `Cek terakhir: ${lastTestedTime}` : 'Siap Sinkron'}
            </span>
          </div>

          {/* Card 4: Dokumen & Storage */}
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-blue-700/60 shadow-md">
            <span className="text-[10px] uppercase font-bold text-blue-200">Supabase Storage</span>
            <p className="font-bold text-amber-300 text-xs mt-1">
              {storageFiles.length} Dokumen Terdaftar
            </p>
            <span className="text-[10px] text-blue-200 mt-1 block">
              4 Bucket Dokumen Aktif
            </span>
          </div>

        </div>
      </div>

      {/* Missing Tables Alert Banner if SQL not yet run */}
      {missingTablesCount > 0 && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          theme === 'light' ? 'bg-amber-50 border-amber-300 text-slate-900' : 'bg-amber-950/40 border-amber-500/50 text-amber-100'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">
                Tabel di Database Supabase Belum Dibuat ({missingTablesCount} tabel)
              </h4>
              <p className="text-xs mt-0.5 text-slate-600 dark:text-slate-300">
                Data belum bisa tersimpan ke Supabase karena tabel PostgreSQL belum ada. Salin skrip SQL lengkap di tab <strong>"Skrip SQL & RLS"</strong> lalu jalankan 1x di menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveSubTab('rls');
              handleCopySql();
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition shrink-0 self-start md:self-auto flex items-center space-x-1.5"
          >
            <Code className="w-4 h-4" />
            <span>Salin Skrip SQL Sekarang</span>
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className={`flex flex-wrap items-center gap-2 border-b pb-3 ${
        theme === 'light' ? 'border-slate-300' : 'border-slate-800'
      }`}>
        <button
          onClick={() => setActiveSubTab('diagnostik')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'diagnostik'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Diagnostik & Status Tabel Live</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rls')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'rls'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Skrip SQL & Kebijakan RLS</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'config'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Kredensial & URL Project</span>
        </button>

        <button
          onClick={() => setActiveSubTab('storage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'storage'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Supabase Storage Buckets</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'sync'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Riwayat Sinkronisasi</span>
        </button>
      </div>

      {/* TAB 1: LIVE DIAGNOSTIK & TABEL STATUS */}
      {activeSubTab === 'diagnostik' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-300' : 'bg-[#0c1633] border-blue-900/50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Pemeriksaan Status Live Tabel PostgreSQL Supabase
                </h3>
                <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-blue-200/70'}`}>
                  Status langsung dari setiap tabel di cloud Supabase Anda (apakah tabel sudah ada, kosong, atau memiliki baris data).
                </p>
              </div>

              <button
                onClick={runDiagnostics}
                disabled={isTesting}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Table status list */}
            <div className={`overflow-x-auto rounded-xl border ${
              theme === 'light' ? 'border-slate-300' : 'border-slate-800'
            }`}>
              <table className="w-full text-left text-xs">
                <thead className={`uppercase text-[10px] font-black tracking-wider border-b ${
                  theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Nama Tabel PostgreSQL</th>
                    <th className="py-3 px-3">Fungsi Data</th>
                    <th className="py-3 px-3 text-center">Status Tabel</th>
                    <th className="py-3 px-3 text-right">Data di Supabase</th>
                    <th className="py-3 px-3 text-right">Data di Aplikasi Saat Ini</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  theme === 'light' ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                }`}>
                  {diagResult?.tables.map(t => {
                    let localCount = 0;
                    if (t.tableName === 'alokasi_jaspel') localCount = alokasiList.length;
                    else if (t.tableName === 'penerima_alokasi') localCount = penerimaList.length;
                    else if (t.tableName === 'general_index') localCount = generalIndexList.length;
                    else if (t.tableName === 'cost_center') localCount = costCenterList.length;
                    else if (t.tableName === 'revenue_center') localCount = revenueCenterList.length;
                    else if (t.tableName === 'users_rbac') localCount = users.length;
                    else if (t.tableName === 'hospital_profile') localCount = 1;

                    return (
                      <tr key={t.tableName} className={theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={theme === 'light' ? 'text-blue-700' : 'text-amber-400'}>{t.tableName}</span>
                        </td>
                        <td className="py-3 px-3 font-medium">{t.displayName}</td>
                        <td className="py-3 px-3 text-center">
                          {t.status === 'ok' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Terisi & Aktif
                            </span>
                          ) : t.status === 'empty' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              0 Baris (Kosong)
                            </span>
                          ) : t.status === 'missing' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              ✕ Tabel Belum Ada
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                              Error Query
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          {t.status === 'missing' ? '-' : `${t.rowCount} baris`}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium text-slate-500 dark:text-slate-400">
                          {localCount} baris
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Action Guidance */}
            <div className={`mt-5 p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>Petunjuk Aksi Cepat:</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  1. Jika tabel <strong>Belum Ada</strong>: Buka tab <em>Skrip SQL & Kebijakan RLS</em>, klik Salin SQL, lalu jalankan di Supabase.<br />
                  2. Jika tabel <strong>Kosong (0 Baris)</strong>: Klik tombol <strong>Simpan ke Cloud (Push)</strong> di atas untuk mengunggah seluruh data saat ini ke Supabase.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handlePush}
                  disabled={isPushing}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition"
                >
                  {isPushing ? 'Menyimpan...' : 'Push / Isi Data ke Supabase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RLS & SQL GENERATOR VIEW */}
      {activeSubTab === 'rls' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className={`text-sm font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Skrip Lengkap DDL Tabel & Row Level Security (RLS) PostgreSQL
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  supabaseConfig.rlsEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {supabaseConfig.rlsEnabled ? 'RLS ENABLED' : 'RLS DISABLED'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Skrip SQL idempotent untuk membuat seluruh 7 tabel master (<code className="font-bold text-emerald-700 dark:text-emerald-400">alokasi_jaspel</code>, <code className="font-bold text-emerald-700 dark:text-emerald-400">penerima_alokasi</code>, <code className="font-bold text-emerald-700 dark:text-emerald-400">general_index</code>, <code className="font-bold text-emerald-700 dark:text-emerald-400">hospital_profile</code>, dll.), index performa, serta aturan RBAC.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {canManageSupabase && (
                <button
                  onClick={handleToggleRls}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
                    supabaseConfig.rlsEnabled
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-rose-700 text-white hover:bg-rose-800'
                  }`}
                >
                  {supabaseConfig.rlsEnabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{supabaseConfig.rlsEnabled ? 'RLS Aktif' : 'RLS Mati'}</span>
                </button>
              )}

              <button
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-lg shadow-amber-400/20 active:scale-95"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? '✓ Tersalin ke Clipboard' : 'Salin Seluruh Skrip SQL'}</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[420px] custom-scrollbar">
            <pre>{rlsSql}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURATION VIEW */}
      {activeSubTab === 'config' && (
        <div className="space-y-5">
          <form onSubmit={handleSaveCustomConfig} className={`p-5 rounded-2xl border space-y-4 ${
            theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Konfigurasi Endpoint & Kredensial Supabase
                </h4>
                <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Masukkan Project URL dan Anon Public Key Supabase asli Anda agar aplikasi terhubung langsung ke proyek cloud Anda.
                </p>
              </div>

              {saveSuccessMsg && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kredensial Diterapkan!</span>
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  required
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  placeholder="https://xxxxxxxxxxxx.supabase.co"
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono font-medium focus:outline-none ${
                    theme === 'light' ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600' : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                  Supabase Anon Public Key (JWT)
                </label>
                <textarea
                  rows={2}
                  required
                  value={formKey}
                  onChange={e => setFormKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono font-medium focus:outline-none ${
                    theme === 'light' ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-600' : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                  }`}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95"
              >
                Simpan & Hubungkan ke Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: STORAGE VIEW */}
      {activeSubTab === 'storage' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {BUCKET_DEFINITIONS.map(b => (
              <button
                key={b.name}
                onClick={() => setSelectedBucket(b.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  selectedBucket === b.name
                    ? 'bg-blue-600 text-white shadow-md'
                    : theme === 'light'
                      ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>{b.name}</span>
                <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[10px]">
                  {storageFiles.filter(f => f.bucketName === b.name).length}
                </span>
              </button>
            ))}
          </div>

          {canManageSupabase && (
            <div className={`p-4 rounded-2xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Keterangan / Catatan Dokumen..."
                  value={uploadDescription}
                  onChange={e => setUploadDescription(e.target.value)}
                  className={`flex-1 p-2 rounded-xl border text-xs ${
                    theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
                <label className="cursor-pointer px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition shrink-0">
                  <span>Pilih File Unggah</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          <div className={`overflow-x-auto rounded-2xl border ${
            theme === 'light' ? 'border-slate-300' : 'border-slate-800'
          }`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead className={`uppercase text-[10px] font-black tracking-wider border-b ${
                theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="py-3.5 px-4">Nama Dokumen</th>
                  <th className="py-3.5 px-3">Ukuran</th>
                  <th className="py-3.5 px-3">Diunggah Oleh</th>
                  <th className="py-3.5 px-3">Waktu Unggah</th>
                  <th className="py-3.5 px-3">Keterangan</th>
                  <th className="py-3.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'light' ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
              }`}>
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`py-10 text-center font-medium ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      Belum ada dokumen di dalam bucket <strong>{selectedBucket}</strong>.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map(f => (
                    <tr key={f.id} className={theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}>
                      <td className="py-3 px-4 font-bold">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-amber-500" />
                          <span>{f.fileName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">{formatFileSize(f.fileSize)}</td>
                      <td className="py-3 px-3">{f.uploadedBy}</td>
                      <td className="py-3 px-3">{formatDateTimeIndo(f.uploadedAt)}</td>
                      <td className="py-3 px-3 text-[11px]">{f.description}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteFile(f.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                          title="Hapus berkas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SYNC LOGS VIEW */}
      {activeSubTab === 'sync' && (
        <div className="space-y-4 text-xs">
          <div className={`p-4 rounded-2xl border space-y-3 ${
            theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Log Sinkronisasi Cloud & PostgreSQL</h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className={`p-3 rounded-xl border flex justify-between ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <span className="text-emerald-600 font-bold">PUSH_SNAPSHOT_SUCCESS</span>
                <span>{formatDateTimeIndo(supabaseConfig.lastPushDate)}</span>
              </div>
              <div className={`p-3 rounded-xl border flex justify-between ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <span className="text-blue-600 font-bold">PULL_SCHEMA_SUCCESS</span>
                <span>{formatDateTimeIndo(supabaseConfig.lastPullDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
