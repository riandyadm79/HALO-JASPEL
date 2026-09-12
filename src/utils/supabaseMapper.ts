import { 
  AlokasiJaspel, 
  PenerimaAlokasi, 
  GeneralIndexItem, 
  CostCenterItem, 
  RevenueCenterItem, 
  User, 
  HospitalProfile,
  IndeksJasaLangsungItem,
  UnitKinerjaLayanan,
  PegawaiKinerjaLayanan
} from '../types';

export const mapAlokasiFromSupabase = (row: any): AlokasiJaspel => ({
  id: String(row.id),
  kodePeriode: row.kode_periode || row.kodePeriode || '',
  bulan: row.bulan || '',
  tahun: Number(row.tahun) || 2026,
  sumberDana: row.sumber_dana || row.sumberDana || 'Gabungan Seluruh Layanan',
  pendapatanKotor: Number(row.pendapatan_kotor ?? row.pendapatanKotor ?? 0),
  biayaOperasionalRs: Number(row.biaya_operasional_rs ?? row.biayaOperasionalRs ?? 0),
  proporsiJaspelPersen: Number(row.proporsi_jaspel_persen ?? row.proporsiJaspelPersen ?? 0),
  paguJaspelKotor: Number(row.pagu_jaspel_kotor ?? row.paguJaspelKotor ?? 0),
  paguJaspelNetto: Number(row.pagu_jaspel_netto ?? row.paguJaspelNetto ?? 0),
  jasaMedisKlinisPersen: Number(row.jasa_medis_klinis_persen ?? row.jasaMedisKlinisPersen ?? 60),
  jasaNonKlinisPersen: Number(row.jasa_non_klinis_persen ?? row.jasaNonKlinisPersen ?? 30),
  jasaManajemenPersen: Number(row.jasa_manajemen_persen ?? row.jasaManajemenPersen ?? 10),
  status: row.status || 'Draft',
  tanggalDibuat: row.tanggal_dibuat || row.tanggalDibuat || new Date().toISOString(),
  tanggalUpdate: row.tanggal_update || row.tanggalUpdate || new Date().toISOString(),
  keterangan: row.keterangan || '',
  createdBy: row.created_by || row.createdBy || ''
});

export const mapPenerimaFromSupabase = (row: any): PenerimaAlokasi => ({
  id: String(row.id),
  alokasiId: row.alokasi_id || row.alokasiId || '',
  pegawaiId: row.pegawai_id || row.pegawaiId || '',
  nama: row.nama || '',
  unitKerja: row.unit_kerja || row.unitKerja || '',
  jabatan: row.jabatan || '',
  kategori: row.kategori || 'Medis',
  poinDasar: Number(row.poin_dasar ?? row.poinDasar ?? 0),
  poinKompetensi: Number(row.poin_kompetensi ?? row.poinKompetensi ?? 0),
  poinRisiko: Number(row.poin_risiko ?? row.poinRisiko ?? 0),
  poinKinerja: Number(row.poin_kinerja ?? row.poinKinerja ?? 0),
  totalPoin: Number(row.total_poin ?? row.totalPoin ?? 0),
  nilaiPerPoin: Number(row.nilai_per_poin ?? row.nilaiPerPoin ?? 0),
  brutoJaspel: Number(row.bruto_jaspel ?? row.brutoJaspel ?? 0),
  pajakPph21Persen: Number(row.pajak_pph21_persen ?? row.pajakPph21Persen ?? 0),
  potonganPph21: Number(row.potongan_pph21 ?? row.potonganPph21 ?? 0),
  nettoDiterima: Number(row.netto_diterima ?? row.nettoDiterima ?? 0),
  statusKoreksi: row.status_koreksi || row.statusKoreksi || 'Sesuai',
  catatanKoreksi: row.catatan_koreksi || row.catatanKoreksi || '',
  sudahDibayar: Boolean(row.sudah_dibayar ?? row.sudahDibayar ?? false)
});

export const mapGeneralIndexFromSupabase = (row: any): GeneralIndexItem => ({
  id: String(row.id),
  kode: row.kode || '',
  namaPegawai: row.nama_pegawai || row.namaPegawai || '',
  nip: row.nip || '',
  unitKerja: row.unit_kerja || row.unitKerja || '',
  golongan: row.golongan || '',
  pendidikan: row.pendidikan || '',
  masaKerjaTahun: Number(row.masa_kerja_tahun ?? row.masaKerjaTahun ?? 0),
  skorDasar: Number(row.skor_dasar ?? row.skorDasar ?? 0),
  skorKompetensi: Number(row.skor_kompetensi ?? row.skorKompetensi ?? 0),
  skorRisiko: Number(row.skor_risiko ?? row.skorRisiko ?? 0),
  skorKinerja: Number(row.skor_kinerja ?? row.skorKinerja ?? 0),
  bobotPresensi: Number(row.bobot_presensi ?? row.bobotPresensi ?? 100),
  statusPegawai: row.status_pegawai || row.statusPegawai || 'PNS',

  no: row.no,
  jabatan: row.jabatan,
  tmtTanggal: row.tmt_tanggal || row.tmtTanggal,
  ruangan: row.ruangan,
  kelompokJasa: row.kelompok_jasa || row.kelompokJasa,
  riskCategory: row.risk_category || row.riskCategory,
  jabatanUnit: row.jabatan_unit || row.jabatanUnit,
  skorMk: Number(row.skor_mk ?? row.skorMk ?? 0),
  skorPd: Number(row.skor_pd ?? row.skorPd ?? 0),
  skorJab: Number(row.skor_jab ?? row.skorJab ?? 0),
  skorRis: Number(row.skor_ris ?? row.skorRis ?? 0),
  skorEmg: Number(row.skor_emg ?? row.skorEmg ?? 0),
  skorTotal: Number(row.skor_total ?? row.skorTotal ?? 0),
  rpMk: Number(row.rp_mk ?? row.rpMk ?? 0),
  rpPd: Number(row.rp_pd ?? row.rpPd ?? 0),
  rpJab: Number(row.rp_jab ?? row.rpJab ?? 0),
  rpRis: Number(row.rp_ris ?? row.rpRis ?? 0),
  rpEmg: Number(row.rp_emg ?? row.rpEmg ?? 0),
  jaspelPostRemunerasi: Number(row.jaspel_post_remunerasi ?? row.jaspelPostRemunerasi ?? 0),
  postPenyesuaianBebanKerja: Number(row.post_penyesuaian_beban_kerja ?? row.postPenyesuaianBebanKerja ?? 0),
  jaspelPostTotal: Number(row.jaspel_post_total ?? row.jaspelPostTotal ?? 0),
  kelompokRekap: row.kelompok_rekap || row.kelompokRekap,
  kelompokPelayanan: row.kelompok_pelayanan || row.kelompokPelayanan,
  persenAdministrasi: row.persen_administrasi || row.persenAdministrasi,
});

export const mapCostCenterFromSupabase = (row: any): CostCenterItem => ({
  id: String(row.id),
  kodeCostCenter: row.kode_cost_center || row.kodeCostCenter || '',
  namaPusatBiaya: row.nama_pusat_biaya || row.namaPusatBiaya || '',
  kategori: row.kategori || '',
  alokasiAnggaranBulanan: Number(row.alokasi_anggaran_bulanan ?? row.alokasiAnggaranBulanan ?? 0),
  realisasiBiaya: Number(row.realisasi_biaya ?? row.realisasiBiaya ?? 0),
  penanggungJawab: row.penanggung_jawab || row.penanggungJawab || '',
  status: row.status || 'Aktif',
  keterangan: row.keterangan || ''
});

export const mapRevenueCenterFromSupabase = (row: any): RevenueCenterItem => ({
  id: String(row.id),
  kodeRevenueCenter: row.kode_revenue_center || row.kodeRevenueCenter || '',
  namaPusatLayanan: row.nama_pusat_layanan || row.namaPusatLayanan || '',
  kategoriLayanan: row.kategori_layanan || row.kategoriLayanan || '',
  targetPendapatanBulanan: Number(row.target_pendapatan_bulanan ?? row.targetPendapatanBulanan ?? 0),
  realisasiPendapatan: Number(row.realisasi_pendapatan ?? row.realisasiPendapatan ?? 0),
  persentasePencapaian: Number(row.persentase_pencapaian ?? row.persentasePencapaian ?? 0),
  proporsiRetensiJaspel: Number(row.proporsi_retensi_jaspel ?? row.proporsiRetensiJaspel ?? 0),
  kepalaUnit: row.kepala_unit || row.kepalaUnit || '',
  jumlahPasienBulanIni: Number(row.jumlah_pasien_bulan_ini ?? row.jumlahPasienBulanIni ?? 0)
});

export const mapUserFromSupabase = (row: any): User => ({
  id: String(row.id),
  username: row.username || '',
  nama: row.nama || '',
  nip: row.nip || '',
  role: row.role || 'staf',
  unit: row.unit || '',
  jabatan: row.jabatan || '',
  email: row.email || '',
  status: row.status || 'aktif',
  avatarUrl: row.avatar_url || row.avatarUrl || ''
});

export const mapHospitalProfileFromSupabase = (row: any): HospitalProfile => ({
  hospitalName: row.hospital_name || row.hospitalName || 'RSJD ATMA HUSADA MAHAKAM',
  subtitle: row.subtitle || 'Pola Distribusi Jasa Pelayanan 2026',
  hospitalType: row.hospital_type || row.hospitalType || 'RSUD Kelas A',
  badgeText: row.badge_text || row.badgeText || 'BLUD TERDAFTAR',
  badgeColor: row.badge_color || row.badgeColor || 'amber',
  pemdaName: row.pemda_name || row.pemdaName || 'PEMERINTAH DAERAH PROVINSI KALIMANTAN TIMUR DINAS KESEHATAN',
  address: row.address || 'Jl. Kakap No. 23',
  city: row.city || 'Kota Samarinda',
  phone: row.phone || '(0541) 743364',
  directorName: row.director_name || row.directorName || 'dr. Indah Puspitasari, MARS',
  directorNip: row.director_nip || row.directorNip || '19670530 198903 2003',
  directorTitle: row.director_title || row.directorTitle || 'Direktur (Pimpinan BLUD)',
  committeeLeadName: row.committee_lead_name || row.committeeLeadName || 'Ns. Rahmawati, S.Kep.,MM',
  committeeLeadNip: row.committee_lead_nip || row.committeeLeadNip || '-',
  committeeLeadTitle: row.committee_lead_title || row.committeeLeadTitle || 'Ketua Tim Remunerasi & Jaspel'
});

export const mapUnitKinerjaFromSupabase = (row: any): UnitKinerjaLayanan => ({
  id: String(row.id),
  kodeUnit: row.kode_unit || row.kodeUnit || '',
  namaUnit: row.nama_unit || row.namaUnit || '',
  kategori: row.kategori || 'Nakes Ber-Tarif',
  bulan: row.bulan || 'Agustus',
  tahun: Number(row.tahun) || 2026,
  indikator1: row.indikator1 || '',
  volumeTotal1: Number(row.volume_total1 ?? row.volumeTotal1 ?? 0),
  indikator2: row.indikator2 || '',
  volumeTotal2: Number(row.volume_total2 ?? row.volumeTotal2 ?? 0),
  indikator3: row.indikator3 || '',
  volumeTotal3: Number(row.volume_total3 ?? row.volumeTotal3 ?? 0),
  paguJp: Number(row.pagu_jp ?? row.paguJp ?? 0),
  totalPoin: Number(row.total_poin ?? row.totalPoin ?? 0),
  rupiahPerPoin: Number(row.rupiah_per_poin ?? row.rupiahPerPoin ?? 0),
  realisasiJp: Number(row.realisasi_jp ?? row.realisasiJp ?? 0),
  jumlahPegawai: Number(row.jumlah_pegawai ?? row.jumlahPegawai ?? 0),
  subPorsiPagu: row.sub_porsi_pagu || row.subPorsiPagu,
  status: row.status || 'Final'
});

export const mapUnitKinerjaToSupabase = (item: UnitKinerjaLayanan) => ({
  id: item.id,
  kode_unit: item.kodeUnit,
  nama_unit: item.namaUnit,
  kategori: item.kategori,
  bulan: item.bulan,
  tahun: item.tahun,
  indikator1: item.indikator1,
  volume_total1: item.volumeTotal1,
  indikator2: item.indikator2,
  volume_total2: item.volumeTotal2,
  indikator3: item.indikator3,
  volume_total3: item.volumeTotal3,
  pagu_jp: item.paguJp,
  total_poin: item.totalPoin,
  rupiah_per_poin: item.rupiahPerPoin,
  realisasi_jp: item.realisasiJp,
  jumlah_pegawai: item.jumlahPegawai,
  sub_porsi_pagu: item.subPorsiPagu || null,
  status: item.status,
  updated_at: new Date().toISOString()
});

export const mapPegawaiKinerjaFromSupabase = (row: any): PegawaiKinerjaLayanan => ({
  id: String(row.id),
  unitKode: row.unit_kode || row.unitKode || '',
  unitNama: row.unit_nama || row.unitNama || '',
  nama: row.nama || '',
  nip: row.nip || '',
  subKategori: row.sub_kategori || row.subKategori || '',
  prestasi1: Number(row.prestasi1 ?? 0),
  totalBulan1: Number(row.total_bulan1 ?? row.totalBulan1 ?? 0),
  poin1: Number(row.poin1 ?? 0),
  prestasi2: Number(row.prestasi2 ?? 0),
  totalBulan2: Number(row.total_bulan2 ?? row.totalBulan2 ?? 0),
  poin2: Number(row.poin2 ?? 0),
  prestasi3: Number(row.prestasi3 ?? 0),
  totalBulan3: Number(row.total_bulan3 ?? row.totalBulan3 ?? 0),
  poin3: Number(row.poin3 ?? 0),
  jumlahPoin: Number(row.jumlah_poin ?? row.jumlahPoin ?? 0),
  persenPoin: Number(row.persen_poin ?? row.persenPoin ?? 0),
  jpLangsung: Number(row.jp_langsung ?? row.jpLangsung ?? 0),
  keterangan: row.keterangan || ''
});

export const mapPegawaiKinerjaToSupabase = (item: PegawaiKinerjaLayanan) => ({
  id: item.id,
  unit_kode: item.unitKode,
  unit_nama: item.unitNama,
  nama: item.nama,
  nip: item.nip || '',
  sub_kategori: item.subKategori || '',
  prestasi1: item.prestasi1,
  total_bulan1: item.totalBulan1,
  poin1: item.poin1,
  prestasi2: item.prestasi2,
  total_bulan2: item.totalBulan2,
  poin2: item.poin2,
  prestasi3: item.prestasi3,
  total_bulan3: item.totalBulan3,
  poin3: item.poin3,
  jumlah_poin: item.jumlahPoin,
  persen_poin: item.persenPoin,
  jp_langsung: item.jpLangsung,
  keterangan: item.keterangan || '',
  updated_at: new Date().toISOString()
});

export const mapIndeksJasaFromSupabase = (row: any): IndeksJasaLangsungItem => ({
  id: String(row.id),
  kode: row.kode || '',
  kategori: row.kategori || '',
  instalasiLayanan: row.instalasi_layanan || row.instalasiLayanan || '',
  namaPegawai: row.nama_pegawai || row.namaPegawai || '',
  kinerja1: Number(row.kinerja1 ?? 0),
  kinerja2: Number(row.kinerja2 ?? 0),
  kinerja3: Number(row.kinerja3 ?? 0),
  totalPoin: Number(row.total_poin ?? row.totalPoin ?? 0),
  jumlahAlokasi: Number(row.jumlah_alokasi ?? row.jumlahAlokasi ?? 0),
  rupiahPerPoin1: Number(row.rupiah_per_poin1 ?? row.rupiahPerPoin1 ?? 0),
  rupiahPerPoin2: Number(row.rupiah_per_poin2 ?? row.rupiahPerPoin2 ?? 0),
  nilaiJpLangsung: Number(row.nilai_jp_langsung ?? row.nilaiJpLangsung ?? 0)
});

export const mapIndeksJasaToSupabase = (item: IndeksJasaLangsungItem) => ({
  id: item.id,
  kode: item.kode,
  kategori: item.kategori,
  instalasi_layanan: item.instalasiLayanan,
  nama_pegawai: item.namaPegawai || '',
  kinerja1: item.kinerja1,
  kinerja2: item.kinerja2,
  kinerja3: item.kinerja3,
  total_poin: item.totalPoin,
  jumlah_alokasi: item.jumlahAlokasi,
  rupiah_per_poin1: item.rupiahPerPoin1,
  rupiah_per_poin2: item.rupiahPerPoin2,
  nilai_jp_langsung: item.nilaiJpLangsung
});

