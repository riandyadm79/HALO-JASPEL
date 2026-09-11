import { supabase } from './supabase';
import { 
  AlokasiJaspel, 
  PenerimaAlokasi, 
  GeneralIndexItem, 
  CostCenterItem, 
  RevenueCenterItem, 
  IndeksJasaLangsungItem,
  User 
} from '../types';
import { HospitalProfile } from '../components/HospitalProfileModal';

export interface TableDiagnostic {
  tableName: string;
  displayName: string;
  status: 'ok' | 'empty' | 'missing' | 'error';
  rowCount: number;
  errorMessage?: string;
}

export interface DiagnosticsResult {
  connected: boolean;
  latencyMs: number;
  url: string;
  tables: TableDiagnostic[];
  totalRows: number;
  error?: string;
}

// 1. LIVE DIAGNOSTIC CHECK
export const testSupabaseConnection = async (): Promise<DiagnosticsResult> => {
  const startTime = performance.now();
  const tablesToCheck = [
    { name: 'alokasi_jaspel', label: 'Alokasi Jaspel (Header)' },
    { name: 'penerima_alokasi', label: 'Penerima Alokasi (Rincian)' },
    { name: 'general_index', label: 'General Index (Indeks Pegawai)' },
    { name: 'cost_center', label: 'Cost Center (Pusat Biaya)' },
    { name: 'revenue_center', label: 'Revenue Center (Pusat Pendapatan)' },
    { name: 'indeks_jasa_langsung', label: 'Indeks Jasa Langsung (Layanan)' },
    { name: 'users_rbac', label: 'Users & RBAC' },
    { name: 'hospital_profile', label: 'Profil Instansi BLUD' },
  ];

  const tableResults: TableDiagnostic[] = [];
  let totalRows = 0;
  let hasAnySuccess = false;

  for (const t of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(t.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        // Check if relation does not exist
        const isMissing = error.message?.toLowerCase().includes('does not exist') ||
                          error.message?.toLowerCase().includes('relation') ||
                          error.code === '42P01' ||
                          error.code === 'PGRST204' ||
                          error.code === 'PGRST200';

        tableResults.push({
          tableName: t.name,
          displayName: t.label,
          status: isMissing ? 'missing' : 'error',
          rowCount: 0,
          errorMessage: error.message
        });
      } else {
        hasAnySuccess = true;
        const c = count || 0;
        totalRows += c;
        tableResults.push({
          tableName: t.name,
          displayName: t.label,
          status: c > 0 ? 'ok' : 'empty',
          rowCount: c
        });
      }
    } catch (err: any) {
      tableResults.push({
        tableName: t.name,
        displayName: t.label,
        status: 'error',
        rowCount: 0,
        errorMessage: err.message || 'Gagal menghubungi Supabase'
      });
    }
  }

  const latencyMs = Math.round(performance.now() - startTime);
  const currentUrl = (supabase as any).supabaseUrl || '';

  return {
    connected: hasAnySuccess,
    latencyMs,
    url: currentUrl,
    tables: tableResults,
    totalRows,
    error: hasAnySuccess ? undefined : 'Tidak dapat terhubung atau tabel belum dibuat di Supabase.'
  };
};

// 2. PUSH CURRENT APP DATA TO SUPABASE CLOUD
export const pushAllDataToSupabase = async (payload: {
  alokasiList: AlokasiJaspel[];
  penerimaList: PenerimaAlokasi[];
  generalIndexList: GeneralIndexItem[];
  costCenterList: CostCenterItem[];
  revenueCenterList: RevenueCenterItem[];
  indeksJasaList?: IndeksJasaLangsungItem[];
  users: User[];
  hospitalProfile: HospitalProfile;
}): Promise<{
  success: boolean;
  message: string;
  counts: Record<string, number>;
  errors: string[];
}> => {
  const counts: Record<string, number> = {};
  const errors: string[] = [];

  try {
    // 1. Push Hospital Profile
    const profileRow = {
      id: 'default',
      hospital_name: payload.hospitalProfile.hospitalName,
      subtitle: payload.hospitalProfile.subtitle,
      hospital_type: payload.hospitalProfile.hospitalType,
      badge_text: payload.hospitalProfile.badgeText,
      badge_color: payload.hospitalProfile.badgeColor,
      pemda_name: payload.hospitalProfile.pemdaName,
      address: payload.hospitalProfile.address,
      city: payload.hospitalProfile.city,
      phone: payload.hospitalProfile.phone,
      director_name: payload.hospitalProfile.directorName,
      director_nip: payload.hospitalProfile.directorNip,
      director_title: payload.hospitalProfile.directorTitle,
      committee_lead_name: payload.hospitalProfile.committeeLeadName,
      committee_lead_nip: payload.hospitalProfile.committeeLeadNip,
      committee_lead_title: payload.hospitalProfile.committeeLeadTitle,
      updated_at: new Date().toISOString()
    };

    const { error: profErr } = await supabase.from('hospital_profile').upsert(profileRow);
    if (profErr) {
      errors.push(`hospital_profile: ${profErr.message}`);
    } else {
      counts.hospital_profile = 1;
    }

    // 2. Push Users RBAC
    if (payload.users.length > 0) {
      const usersToInsert = payload.users.map(u => ({
        id: u.id,
        username: u.username || u.nama.toLowerCase().replace(/\s+/g, ''),
        nama: u.nama,
        nip: u.nip || '',
        role: u.role,
        unit: u.unit || '',
        jabatan: u.jabatan || '',
        email: u.email || '',
        status: u.status || 'aktif'
      }));

      const { error: usrErr } = await supabase.from('users_rbac').upsert(usersToInsert);
      if (usrErr) {
        errors.push(`users_rbac: ${usrErr.message}`);
      } else {
        counts.users_rbac = usersToInsert.length;
      }
    }

    // 3. Push Alokasi Jaspel
    if (payload.alokasiList.length > 0) {
      const alokasiToInsert = payload.alokasiList.map(a => ({
        id: a.id,
        kode_periode: a.kodePeriode,
        bulan: a.bulan,
        tahun: a.tahun,
        sumber_dana: a.sumberDana,
        pendapatan_kotor: a.pendapatanKotor,
        biaya_operasional_rs: a.biayaOperasionalRs,
        pagu_jaspel_kotor: a.paguJaspelKotor,
        pagu_jaspel_netto: a.paguJaspelNetto,
        proporsi_jaspel_persen: a.proporsiJaspelPersen,
        jasa_medis_klinis_persen: a.jasaMedisKlinisPersen,
        jasa_non_klinis_persen: a.jasaNonKlinisPersen,
        jasa_manajemen_persen: a.jasaManajemenPersen,
        status: a.status,
        keterangan: a.keterangan || '',
        created_by: a.createdBy || 'Administrator'
      }));

      const { error: alokErr } = await supabase.from('alokasi_jaspel').upsert(alokasiToInsert);
      if (alokErr) {
        errors.push(`alokasi_jaspel: ${alokErr.message}`);
      } else {
        counts.alokasi_jaspel = alokasiToInsert.length;
      }
    }

    // 4. Push Penerima Alokasi
    if (payload.penerimaList.length > 0) {
      const penerimaToInsert = payload.penerimaList.map(p => ({
        id: p.id,
        alokasi_id: p.alokasiId,
        pegawai_id: p.pegawaiId,
        nama: p.nama,
        unit_kerja: p.unitKerja,
        kategori: p.kategori,
        jabatan: p.jabatan,
        poin_dasar: p.poinDasar,
        poin_kompetensi: p.poinKompetensi,
        poin_risiko: p.poinRisiko,
        poin_kinerja: p.poinKinerja,
        total_poin: p.totalPoin,
        nilai_per_poin: p.nilaiPerPoin,
        pajak_pph21_persen: p.pajakPph21Persen,
        bruto_jaspel: p.brutoJaspel,
        potongan_pph21: p.potonganPph21,
        netto_diterima: p.nettoDiterima,
        status_koreksi: p.statusKoreksi,
        catatan_koreksi: p.catatanKoreksi || '',
        sudah_dibayar: p.sudahDibayar || false
      }));

      const { error: penErr } = await supabase.from('penerima_alokasi').upsert(penerimaToInsert);
      if (penErr) {
        errors.push(`penerima_alokasi: ${penErr.message}`);
      } else {
        counts.penerima_alokasi = penerimaToInsert.length;
      }
    }

    // 5. Push General Index
    if (payload.generalIndexList.length > 0) {
      const genIdxToInsert = payload.generalIndexList.map(g => ({
        id: g.id,
        kode: g.kode,
        nama_pegawai: g.namaPegawai,
        nip: g.nip,
        unit_kerja: g.unitKerja,
        golongan: g.golongan,
        pendidikan: g.pendidikan,
        masa_kerja_tahun: g.masaKerjaTahun,
        skor_dasar: g.skorDasar,
        skor_kompetensi: g.skorKompetensi,
        skor_risiko: g.skorRisiko,
        skor_kinerja: g.skorKinerja,
        bobot_presensi: g.bobotPresensi,
        status_pegawai: g.statusPegawai
      }));

      const { error: genErr } = await supabase.from('general_index').upsert(genIdxToInsert);
      if (genErr) {
        errors.push(`general_index: ${genErr.message}`);
      } else {
        counts.general_index = genIdxToInsert.length;
      }
    }

    // 6. Push Cost Center
    if (payload.costCenterList.length > 0) {
      const costToInsert = payload.costCenterList.map(c => ({
        id: c.id,
        kode_cost_center: c.kodeCostCenter,
        nama_pusat_biaya: c.namaPusatBiaya,
        kategori: c.kategori,
        alokasi_anggaran_bulanan: c.alokasiAnggaranBulanan,
        realisasi_biaya: c.realisasiBiaya,
        penanggung_jawab: c.penanggungJawab,
        status: c.status,
        keterangan: c.keterangan || ''
      }));

      const { error: costErr } = await supabase.from('cost_center').upsert(costToInsert);
      if (costErr) {
        errors.push(`cost_center: ${costErr.message}`);
      } else {
        counts.cost_center = costToInsert.length;
      }
    }

    // 7. Push Revenue Center
    if (payload.revenueCenterList.length > 0) {
      const revToInsert = payload.revenueCenterList.map(r => ({
        id: r.id,
        kode_revenue_center: r.kodeRevenueCenter,
        nama_pusat_layanan: r.namaPusatLayanan,
        kategori_layanan: r.kategoriLayanan,
        target_pendapatan_bulanan: r.targetPendapatanBulanan,
        realisasi_pendapatan: r.realisasiPendapatan,
        persentase_pencapaian: r.persentasePencapaian,
        proporsi_retensi_jaspel: r.proporsiRetensiJaspel || 0,
        kepala_unit: r.kepalaUnit || '',
        jumlah_pasien_bulan_ini: r.jumlahPasienBulanIni || 0
      }));

      const { error: revErr } = await supabase.from('revenue_center').upsert(revToInsert);
      if (revErr) {
        errors.push(`revenue_center: ${revErr.message}`);
      } else {
        counts.revenue_center = revToInsert.length;
      }
    }

    // 8. Push Indeks Jasa Langsung
    if (payload.indeksJasaList && payload.indeksJasaList.length > 0) {
      const ijlToInsert = payload.indeksJasaList.map(ijl => ({
        id: ijl.id,
        kode: ijl.kode || '',
        instalasi_layanan: ijl.instalasiLayanan,
        kategori: ijl.kategori || '',
        kinerja1: ijl.kinerja1 || 0,
        kinerja2: ijl.kinerja2 || 0,
        kinerja3: ijl.kinerja3 || 0,
        total_poin: ijl.totalPoin || 0,
        jumlah_alokasi: ijl.jumlahAlokasi || 0,
        rupiah_per_poin1: ijl.rupiahPerPoin1 || 0,
        rupiah_per_poin2: ijl.rupiahPerPoin2 || 0,
        nilai_jp_langsung: ijl.nilaiJpLangsung || 0
      }));

      const { error: ijlErr } = await supabase.from('indeks_jasa_langsung').upsert(ijlToInsert);
      if (ijlErr) {
        errors.push(`indeks_jasa_langsung: ${ijlErr.message}`);
      } else {
        counts.indeks_jasa_langsung = ijlToInsert.length;
      }
    }

    const totalUploaded = Object.values(counts).reduce((a, b) => a + b, 0);

    if (errors.length > 0) {
      return {
        success: false,
        message: `Sebagian tabel gagal di-push (${errors.length} error): ${errors.join('; ')}`,
        counts,
        errors
      };
    }

    return {
      success: true,
      message: `Berhasil menyimpan total ${totalUploaded} data ke Supabase Cloud PostgreSQL!`,
      counts,
      errors: []
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan saat melakukan Push ke Supabase.',
      counts,
      errors: [err.message]
    };
  }
};

// 3. PULL DATA FROM SUPABASE CLOUD
export const pullAllDataFromSupabase = async (): Promise<{
  success: boolean;
  message: string;
  data?: {
    alokasiList: AlokasiJaspel[];
    penerimaList: PenerimaAlokasi[];
    generalIndexList: GeneralIndexItem[];
    costCenterList: CostCenterItem[];
    revenueCenterList: RevenueCenterItem[];
    indeksJasaList: IndeksJasaLangsungItem[];
    users: User[];
    hospitalProfile?: HospitalProfile;
  };
  counts: Record<string, number>;
  emptyTables: string[];
  missingTables: string[];
  errors: string[];
}> => {
  const counts: Record<string, number> = {};
  const emptyTables: string[] = [];
  const missingTables: string[] = [];
  const errors: string[] = [];

  try {
    const [
      { data: alokasi, error: alokErr },
      { data: penerima, error: penErr },
      { data: genIdx, error: genErr },
      { data: cost, error: costErr },
      { data: revenue, error: revErr },
      { data: ijlData, error: ijlErr },
      { data: usr, error: usrErr },
      { data: hospData, error: hospErr }
    ] = await Promise.all([
      supabase.from('alokasi_jaspel').select('*'),
      supabase.from('penerima_alokasi').select('*'),
      supabase.from('general_index').select('*'),
      supabase.from('cost_center').select('*'),
      supabase.from('revenue_center').select('*'),
      supabase.from('indeks_jasa_langsung').select('*'),
      supabase.from('users_rbac').select('*'),
      supabase.from('hospital_profile').select('*').limit(1).maybeSingle()
    ]);

    const checkErr = (name: string, err: any, data: any[]) => {
      if (err) {
        const isMissing = err.message?.toLowerCase().includes('does not exist') ||
                          err.message?.toLowerCase().includes('relation') ||
                          err.code === '42P01';
        if (isMissing) {
          missingTables.push(name);
        } else {
          errors.push(`${name}: ${err.message}`);
        }
      } else if (!data || data.length === 0) {
        emptyTables.push(name);
        counts[name] = 0;
      } else {
        counts[name] = data.length;
      }
    };

    checkErr('alokasi_jaspel', alokErr, alokasi || []);
    checkErr('penerima_alokasi', penErr, penerima || []);
    checkErr('general_index', genErr, genIdx || []);
    checkErr('cost_center', costErr, cost || []);
    checkErr('revenue_center', revErr, revenue || []);
    checkErr('indeks_jasa_langsung', ijlErr, ijlData || []);
    checkErr('users_rbac', usrErr, usr || []);

    if (hospErr && (hospErr.message?.includes('does not exist') || hospErr.code === '42P01')) {
      missingTables.push('hospital_profile');
    }

    // Format retrieved data
    const formattedAlokasi: AlokasiJaspel[] = (alokasi || []).map((a: any) => ({
      id: a.id,
      kodePeriode: a.kode_periode || a.kodePeriode,
      bulan: a.bulan,
      tahun: a.tahun,
      sumberDana: a.sumber_dana || a.sumberDana || 'BPJS / JKN',
      pendapatanKotor: Number(a.pendapatan_kotor || a.pendapatanKotor) || 0,
      biayaOperasionalRs: Number(a.biaya_operasional_rs || a.biayaOperasionalRs) || 0,
      proporsiJaspelPersen: Number(a.proporsi_jaspel_persen || a.proporsiJaspelPersen) || 42,
      paguJaspelKotor: Number(a.pagu_jaspel_kotor || a.paguJaspelKotor) || 0,
      paguJaspelNetto: Number(a.pagu_jaspel_netto || a.paguJaspelNetto) || 0,
      jasaMedisKlinisPersen: Number(a.jasa_medis_klinis_persen || a.jasaMedisKlinisPersen) || 60,
      jasaNonKlinisPersen: Number(a.jasa_non_klinis_persen || a.jasaNonKlinisPersen) || 30,
      jasaManajemenPersen: Number(a.jasa_manajemen_persen || a.jasaManajemenPersen) || 10,
      status: a.status || 'Draft',
      tanggalDibuat: a.tanggal_dibuat || a.tanggalDibuat || new Date().toISOString(),
      tanggalUpdate: a.tanggal_update || a.tanggalUpdate || new Date().toISOString(),
      keterangan: a.keterangan || '',
      createdBy: a.created_by || a.createdBy || 'Administrator'
    }));

    const formattedPenerima: PenerimaAlokasi[] = (penerima || []).map((p: any) => ({
      id: p.id,
      alokasiId: p.alokasi_id || p.alokasiId,
      pegawaiId: p.pegawai_id || p.pegawaiId,
      nama: p.nama,
      unitKerja: p.unit_kerja || p.unitKerja,
      kategori: p.kategori,
      jabatan: p.jabatan,
      poinDasar: Number(p.poin_dasar || p.poinDasar) || 0,
      poinKompetensi: Number(p.poin_kompetensi || p.poinKompetensi) || 0,
      poinRisiko: Number(p.poin_risiko || p.poinRisiko) || 0,
      poinKinerja: Number(p.poin_kinerja || p.poinKinerja) || 0,
      totalPoin: Number(p.total_poin || p.totalPoin) || 0,
      nilaiPerPoin: Number(p.nilai_per_poin || p.nilaiPerPoin) || 0,
      brutoJaspel: Number(p.bruto_jaspel || p.brutoJaspel) || 0,
      pajakPph21Persen: Number(p.pajak_pph21_persen || p.pajakPph21Persen) || 5,
      potonganPph21: Number(p.potongan_pph21 || p.potonganPph21) || 0,
      nettoDiterima: Number(p.netto_diterima || p.nettoDiterima) || 0,
      statusKoreksi: p.status_koreksi || p.statusKoreksi || 'Sesuai',
      catatanKoreksi: p.catatan_koreksi || p.catatanKoreksi || '',
      sudahDibayar: p.sudah_dibayar || p.sudahDibayar || false
    }));

    const formattedGenIdx: GeneralIndexItem[] = (genIdx || []).map((g: any) => ({
      id: g.id,
      kode: g.kode,
      namaPegawai: g.nama_pegawai || g.namaPegawai,
      nip: g.nip,
      unitKerja: g.unit_kerja || g.unitKerja,
      golongan: g.golongan || '',
      pendidikan: g.pendidikan || '',
      masaKerjaTahun: Number(g.masa_kerja_tahun || g.masaKerjaTahun) || 0,
      skorDasar: Number(g.skor_dasar || g.skorDasar) || 0,
      skorKompetensi: Number(g.skor_kompetensi || g.skorKompetensi) || 0,
      skorRisiko: Number(g.skor_risiko || g.skorRisiko) || 0,
      skorKinerja: Number(g.skor_kinerja || g.skorKinerja) || 0,
      bobotPresensi: Number(g.bobot_presensi || g.bobotPresensi) || 0,
      statusPegawai: g.status_pegawai || g.statusPegawai || 'PNS'
    }));

    const formattedCost: CostCenterItem[] = (cost || []).map((c: any) => ({
      id: c.id,
      kodeCostCenter: c.kode_cost_center || c.kodeCostCenter,
      namaPusatBiaya: c.nama_pusat_biaya || c.namaPusatBiaya,
      kategori: c.kategori,
      alokasiAnggaranBulanan: Number(c.alokasi_anggaran_bulanan || c.alokasiAnggaranBulanan) || 0,
      realisasiBiaya: Number(c.realisasi_biaya || c.realisasiBiaya) || 0,
      penanggungJawab: c.penanggung_jawab || c.penanggungJawab,
      status: c.status || 'Aktif',
      keterangan: c.keterangan || ''
    }));

    const formattedRevenue: RevenueCenterItem[] = (revenue || []).map((r: any) => ({
      id: r.id,
      kodeRevenueCenter: r.kode_revenue_center || r.kodeRevenueCenter,
      namaPusatLayanan: r.nama_pusat_layanan || r.namaPusatLayanan,
      kategoriLayanan: r.kategori_layanan || r.kategoriLayanan,
      targetPendapatanBulanan: Number(r.target_pendapatan_bulanan || r.targetPendapatanBulanan) || 0,
      realisasiPendapatan: Number(r.realisasi_pendapatan || r.realisasiPendapatan) || 0,
      persentasePencapaian: Number(r.persentase_pencapaian || r.persentasePencapaian) || 0,
      proporsiRetensiJaspel: Number(r.proporsi_retensi_jaspel || r.proporsiRetensiJaspel) || 0,
      kepalaUnit: r.kepala_unit || r.kepalaUnit || '',
      jumlahPasienBulanIni: Number(r.jumlah_pasien_bulan_ini || r.jumlahPasienBulanIni) || 0
    }));

    const formattedIndeksJasa: IndeksJasaLangsungItem[] = (ijlData || []).map((ijl: any) => ({
      id: ijl.id,
      kode: ijl.kode,
      instalasiLayanan: ijl.instalasi_layanan || ijl.instalasiLayanan,
      kategori: ijl.kategori || '',
      kinerja1: Number(ijl.kinerja1) || 0,
      kinerja2: Number(ijl.kinerja2) || 0,
      kinerja3: Number(ijl.kinerja3) || 0,
      totalPoin: Number(ijl.total_poin) || 0,
      jumlahAlokasi: Number(ijl.jumlah_alokasi) || 0,
      rupiahPerPoin1: Number(ijl.rupiah_per_poin1) || 0,
      rupiahPerPoin2: Number(ijl.rupiah_per_poin2) || 0,
      nilaiJpLangsung: Number(ijl.nilai_jp_langsung) || 0
    }));

    const formattedUsers: User[] = (usr || []).map((u: any) => ({
      id: u.id,
      username: u.username || u.email?.split('@')[0] || u.nama.toLowerCase().replace(/\s+/g, ''),
      nama: u.nama,
      nip: u.nip || '',
      role: u.role || 'staf',
      unit: u.unit || '',
      jabatan: u.jabatan || '',
      email: u.email || '',
      status: u.status || 'aktif'
    }));

    let formattedProfile: HospitalProfile | undefined = undefined;
    if (hospData) {
      formattedProfile = {
        badgeText: hospData.badge_text,
        badgeColor: hospData.badge_color,
        hospitalName: hospData.hospital_name,
        subtitle: hospData.subtitle,
        hospitalType: hospData.hospital_type,
        pemdaName: hospData.pemda_name,
        address: hospData.address,
        city: hospData.city,
        phone: hospData.phone,
        directorName: hospData.director_name,
        directorNip: hospData.director_nip,
        directorTitle: hospData.director_title,
        committeeLeadName: hospData.committee_lead_name,
        committeeLeadNip: hospData.committee_lead_nip,
        committeeLeadTitle: hospData.committee_lead_title
      };
    }

    const totalRetrieved = Object.values(counts).reduce((a, b) => a + b, 0);

    if (missingTables.length > 0) {
      return {
        success: false,
        message: `Tabel di Supabase belum dibuat (${missingTables.join(', ')}). Silakan jalankan skrip SQL di Supabase SQL Editor.`,
        data: {
          alokasiList: formattedAlokasi,
          penerimaList: formattedPenerima,
          generalIndexList: formattedGenIdx,
          costCenterList: formattedCost,
          revenueCenterList: formattedRevenue,
          indeksJasaList: formattedIndeksJasa,
          users: formattedUsers,
          hospitalProfile: formattedProfile
        },
        counts,
        emptyTables,
        missingTables,
        errors
      };
    }

    if (totalRetrieved === 0) {
      return {
        success: true,
        message: 'Koneksi ke Supabase aktif, tetapi seluruh tabel masih kosong (0 data). Anda dapat menekan tombol "Simpan / Push Cloud" untuk mengunggah data ke Supabase.',
        data: {
          alokasiList: [],
          penerimaList: [],
          generalIndexList: [],
          costCenterList: [],
          revenueCenterList: [],
          indeksJasaList: [],
          users: [],
          hospitalProfile: formattedProfile
        },
        counts,
        emptyTables,
        missingTables: [],
        errors: []
      };
    }

    return {
      success: true,
      message: `Berhasil memuat ${totalRetrieved} data langsung dari Supabase Cloud!`,
      data: {
        alokasiList: formattedAlokasi,
        penerimaList: formattedPenerima,
        generalIndexList: formattedGenIdx,
        costCenterList: formattedCost,
        revenueCenterList: formattedRevenue,
        indeksJasaList: formattedIndeksJasa,
        users: formattedUsers,
        hospitalProfile: formattedProfile
      },
      counts,
      emptyTables,
      missingTables: [],
      errors: []
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal memuat data dari Supabase.',
      counts,
      emptyTables,
      missingTables,
      errors: [err.message]
    };
  }
};
