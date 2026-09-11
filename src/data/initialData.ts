import { 
  User, 
  AlokasiJaspel, 
  PenerimaAlokasi, 
  GeneralIndexItem, 
  CostCenterItem, 
  RevenueCenterItem, 
  IndeksJasaLangsungItem, 
  IndeksJasaHeaderConfig, 
  Permission, 
  BucketStorageFile 
} from '../types';
import { OFFICIAL_GENERAL_INDEX_DATA } from './generalIndexData';

// Standard Hospital Installation list for dropdowns
export const INSTALASI_LAYANAN_LIST = [
  'Instalasi Rawat Jalan (IRJ)',
  'Instalasi Rawat Inap (IRNA)',
  'Instalasi Gawat Darurat (IGD)',
  'Instalasi Bedah Sentral (IBS)',
  'Instalasi Intensive Care Unit (ICU)',
  'Instalasi Laboratorium & Patologi',
  'Instalasi Radiologi',
  'Instalasi Farmasi',
  'Instalasi Gizi & Tata Boga',
  'Instalasi Rehabilitasi Medis',
  'Instalasi Kesehatan Jiwa & Psikiatri',
  'Direksi & Manajemen Administrasi'
];

// Initial Users for authentication fallback (Superadmin, Perumus, Staf)
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'superadmin',
    nama: 'Administrator Utama',
    nip: '198501012010011001',
    role: 'superadmin',
    unitKerja: 'Direksi & Manajemen',
    jabatan: 'Kepala Bagian TI & Remunerasi',
    kategori: 'Non-Medis',
    statusAktif: true
  },
  {
    id: 'usr-perumus',
    username: 'perumus',
    nama: 'Tim Perumus Jaspel',
    nip: '198802022012021002',
    role: 'perumus',
    unitKerja: 'Tim Perumus Remunerasi',
    jabatan: 'Ketua Tim Perumus',
    kategori: 'Medis',
    statusAktif: true
  },
  {
    id: 'usr-medis',
    username: 'dokter',
    nama: 'Dokter Spesialis',
    nip: '198003032008011003',
    role: 'input_medis',
    unitKerja: 'Instalasi Rawat Jalan',
    jabatan: 'Dokter Spesialis',
    kategori: 'Medis',
    statusAktif: true
  },
  {
    id: 'usr-perawat',
    username: 'perawat',
    nama: 'Koordinator Keperawatan',
    nip: '199004042015032004',
    role: 'input_perawat',
    unitKerja: 'Instalasi Rawat Inap',
    jabatan: 'Perawat Penyelia',
    kategori: 'Keperawatan',
    statusAktif: true
  }
];

// No dummy records - pure Supabase data or empty arrays
export const INITIAL_ALOKASI: AlokasiJaspel[] = [];
export const INITIAL_PENERIMA: PenerimaAlokasi[] = [];

// Official General Index Data from RSUD / RSJD
export const INITIAL_GENERAL_INDEX: GeneralIndexItem[] = OFFICIAL_GENERAL_INDEX_DATA;

export const INITIAL_COST_CENTER: CostCenterItem[] = [];
export const INITIAL_REVENUE_CENTER: RevenueCenterItem[] = [];
export const INITIAL_INDEKS_JASA_LANGSUNG: IndeksJasaLangsungItem[] = [];

export const DEFAULT_INDEKS_JASA_HEADER_CONFIG: IndeksJasaHeaderConfig = {
  headerKinerja1: 'Skor Kinerja 1 (Volume Layanan)',
  headerKinerja2: 'Skor Kinerja 2 (Mutu & Komplikasi)',
  headerKinerja3: 'Skor Kinerja 3 (Kedisiplinan / Tim)',
  formulaJpLangsung: '((kinerja1 * 0.4) + (kinerja2 * 0.3) + (kinerja3 * 0.3)) * rupiahPerPoin1'
};

export const INITIAL_PERMISSIONS: Permission[] = [
  { id: 'p1', role: 'superadmin', module: 'Alokasi Jaspel', canRead: true, canCreate: true, canUpdate: true, canDelete: true },
  { id: 'p2', role: 'superadmin', module: 'Database Master', canRead: true, canCreate: true, canUpdate: true, canDelete: true },
  { id: 'p3', role: 'superadmin', module: 'Sinkronisasi Cloud', canRead: true, canCreate: true, canUpdate: true, canDelete: true },
  { id: 'p4', role: 'perumus', module: 'Alokasi Jaspel', canRead: true, canCreate: true, canUpdate: true, canDelete: false },
  { id: 'p5', role: 'perumus', module: 'Database Master', canRead: true, canCreate: true, canUpdate: true, canDelete: false },
  { id: 'p6', role: 'input_medis', module: 'Indeks Jasa Langsung', canRead: true, canCreate: true, canUpdate: true, canDelete: false },
  { id: 'p7', role: 'input_perawat', module: 'Indeks Jasa Langsung', canRead: true, canCreate: true, canUpdate: true, canDelete: false },
  { id: 'p8', role: 'staf', module: 'Slip & Rekap', canRead: true, canCreate: false, canUpdate: false, canDelete: false }
];

export const INITIAL_STORAGE_FILES: BucketStorageFile[] = [];
