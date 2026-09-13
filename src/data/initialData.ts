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
import { INITIAL_UNIT_KINERJA_LAYANAN, INITIAL_PEGAWAI_KINERJA_LAYANAN } from './rekapKinerjaPelayananData';
import { GENERAL_INDEX_CSV_DATA } from './generalIndexCsvData';

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

// All 100 staff from CSV populated into General Index
export const INITIAL_GENERAL_INDEX: GeneralIndexItem[] = GENERAL_INDEX_CSV_DATA;

// Initial Users for authentication fallback (Superadmin, Perumus, Staf)
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'superadmin',
    nama: 'Administrator Utama',
    nip: '198501012010011001',
    role: 'superadmin',
    unit: 'Direksi & Manajemen',
    jabatan: 'Kepala Bagian TI & Remunerasi',
    email: 'test@example.com',
    status: 'aktif'
  },
  {
    id: 'usr-perumus',
    username: 'perumus',
    nama: 'Tim Perumus Jaspel',
    nip: '198802022012021002',
    role: 'perumus',
    unit: 'Tim Perumus Remunerasi',
    jabatan: 'Ketua Tim Perumus',
    email: 'test@example.com',
    status: 'aktif'
  },
  {
    id: 'usr-medis',
    username: 'dokter',
    nama: 'Dokter Spesialis',
    nip: '198003032008011003',
    role: 'input_medis',
    unit: 'Instalasi Rawat Jalan',
    jabatan: 'Dokter Spesialis',
    email: 'test@example.com',
    status: 'aktif'
  },
  {
    id: 'usr-perawat',
    username: 'perawat',
    nama: 'Koordinator Keperawatan',
    nip: '199004042015032004',
    role: 'input_perawat',
    unit: 'Instalasi Rawat Inap',
    jabatan: 'Perawat Penyelia',
    email: 'test@example.com',
    status: 'aktif'
  }
];

// Official Alokasi Data based on CSV 40% regulation
export const INITIAL_ALOKASI: AlokasiJaspel[] = [
  {
    id: 'alo-jul-2026',
    kodePeriode: 'JAPEL-2026-07',
    bulan: 'Juli',
    tahun: 2026,
    sumberDana: 'Gabungan Seluruh Layanan',
    pendapatanKotor: 2859709359,
    biayaOperasionalRs: 69170318,
    proporsiJaspelPersen: 40,
    paguJaspelKotor: 1143883744,
    paguJaspelNetto: 1074713426,
    jasaMedisKlinisPersen: 56.40,
    jasaNonKlinisPersen: 37.55,
    jasaManajemenPersen: 6.05,
    status: 'Disetujui Direktur',
    tanggalDibuat: '2026-07-31T08:00:00.000Z',
    tanggalUpdate: '2026-08-01T09:30:00.000Z',
    keterangan: 'Pagu Jasa Pelayanan 40% (Rp 1.143.883.744) & 60% Jasa Sarana dari Pendapatan Rp 2.859.709.359',
    createdBy: 'Tim Perumus Jaspel'
  }
];
// All 100 staff from General Index CSV loaded as post remunerasi & administrasi recipient data
export const INITIAL_PENERIMA: PenerimaAlokasi[] = GENERAL_INDEX_CSV_DATA.map((item) => {
  const postRemun = item.jaspelPostRemunerasi || 0;
  const postBeban = item.postPenyesuaianBebanKerja || 0;
  // Initially we map Beban Kerja -> Beban Tetap, Post Remun -> Post Remunerasi
  // Jasa Langsung and Administrasi are set to 0 initially for demo
  const nominalBebanTetap = postBeban;
  const nominalPostRemunerasi = postRemun;
  const nominalAdministrasi = 0;
  const nominalJasaLangsung = 0;
  const potonganCuti = 0;
  const nominalKoreksi = 0;

  const bruto = nominalBebanTetap + nominalPostRemunerasi + nominalAdministrasi + nominalJasaLangsung - potonganCuti + nominalKoreksi;

  let pphPersen = 5;
  if (item.statusPegawai === 'Non-PNS' || (item.golongan && item.golongan.includes('II') && !item.golongan.includes('III'))) {
    pphPersen = 2.5;
  }
  
  const pphNilai = Math.round(bruto * (pphPersen / 100));
  const netto = bruto - pphNilai;

  let category = item.kelompokJasa || item.kelompokRekap || 'Administrasi';
  if (item.jabatan === 'Dewas' || item.unitKerja === 'Dewas' || item.ruangan === 'Dewas') {
    category = 'Dewan Pengawas';
  } else if (item.kelompokJasa === 'Direksi' || item.kelompokRekap === 'Direksi') {
    category = 'Direksi & Manajemen Administrasi';
  } else if (item.kelompokJasa === 'Struktural' || item.kelompokRekap === 'Struktural') {
    category = 'Struktural';
  } else if (item.kelompokJasa === 'Administrasi' || item.kelompokRekap === 'Administrasi') {
    category = 'Administrasi';
  } else if (item.kelompokJasa?.includes('Dokter') || item.kelompokJasa?.includes('Medis')) {
    category = 'Medis';
  } else if (item.kelompokJasa?.includes('Perawat') || item.kelompokJasa?.includes('Keperawatan')) {
    category = 'Keperawatan';
  }

  const totalPoin = item.skorTotal || (item.skorDasar + item.skorKompetensi + item.skorRisiko + item.skorKinerja) || 0;

  return {
    id: `pen-${item.id}`,
    alokasiId: 'alo-jul-2026',
    pegawaiId: item.id,
    nama: item.namaPegawai,
    unitKerja: item.ruangan || item.unitKerja || 'Rumah Sakit',
    jabatan: item.jabatan || item.jabatanUnit || item.unitKerja || 'Staf',
    kategori: category,
    poinDasar: item.skorMk || item.skorDasar || 0,
    poinKompetensi: item.skorPd || item.skorKompetensi || 0,
    poinRisiko: item.skorRis || item.skorRisiko || 0,
    poinKinerja: item.skorEmg || item.skorJab || item.skorKinerja || 0,
    totalPoin: Number(totalPoin.toFixed(2)),
    nilaiPerPoin: totalPoin > 0 ? Math.round(bruto / totalPoin) : 0,
    brutoJaspel: bruto,
    pajakPph21Persen: pphPersen,
    potonganPph21: pphNilai,
    nettoDiterima: netto,
    statusKoreksi: 'Sesuai',
    catatanKoreksi: `Post Remun: Rp ${postRemun.toLocaleString('id-ID')} | Beban: Rp ${postBeban.toLocaleString('id-ID')} | Adm: ${item.persenAdministrasi || '0,00%'}`,
    sudahDibayar: true,

    jaspelPostRemunerasi: postRemun,
    postPenyesuaianBebanKerja: postBeban,
    jaspelPostTotal: bruto,

    nominalBebanTetap,
    nominalPostRemunerasi,
    nominalAdministrasi,
    nominalJasaLangsung,
    potonganCuti,
    nominalKoreksi,

    persenAdministrasi: item.persenAdministrasi || '0,00%',
    kelompokJasa: item.kelompokJasa,
    kelompokRekap: item.kelompokRekap,
    kelompokPelayanan: item.kelompokPelayanan,
    nip: item.nip,
    golongan: item.golongan
  };
});

export const INITIAL_COST_CENTER: CostCenterItem[] = [];
export const INITIAL_REVENUE_CENTER: RevenueCenterItem[] = [];

// 10 Instalasi / Layanan Matriks Indeks Jasa Langsung
export const INITIAL_INDEKS_JASA_LANGSUNG: IndeksJasaLangsungItem[] = INITIAL_UNIT_KINERJA_LAYANAN.map((u, idx) => ({
  id: `ijl-${u.kodeUnit.toLowerCase()}`,
  kode: `IJL-${String(idx + 1).padStart(3, '0')}`,
  kategori: u.kategori,
  instalasiLayanan: `Instalasi ${u.namaUnit}`,
  namaPegawai: `Penanggung Jawab ${u.namaUnit}`,
  kinerja1: u.volumeTotal1,
  kinerja2: u.volumeTotal2,
  kinerja3: u.volumeTotal3,
  totalPoin: u.totalPoin,
  jumlahAlokasi: u.paguJp,
  rupiahPerPoin1: u.rupiahPerPoin,
  rupiahPerPoin2: u.rupiahPerPoin,
  nilaiJpLangsung: u.realisasiJp || u.paguJp
}));

export const DEFAULT_INDEKS_JASA_HEADER_CONFIG: IndeksJasaHeaderConfig = {
  headerKinerja1: 'Skor Kinerja 1 (Volume Layanan)',
  headerKinerja2: 'Skor Kinerja 2 (Mutu & Komplikasi)',
  headerKinerja3: 'Skor Kinerja 3 (Kedisiplinan / Tim)',
  headerTotalPoin: 'Total Poin',
  headerJumlahAlokasi: 'Jumlah Alokasi',
  headerRupiahPerPoin1: 'Rp per Poin 1',
  headerRupiahPerPoin2: 'Rp per Poin 2',
  headerNilaiJpLangsung: 'Nilai JP Langsung',
  formulaJpLangsung: '((kinerja1 * 0.4) + (kinerja2 * 0.3) + (kinerja3 * 0.3)) * rupiahPerPoin1'
};

export const INITIAL_PERMISSIONS: Permission[] = [];

export const INITIAL_STORAGE_FILES: BucketStorageFile[] = [];
