import { 
  DATA_MAKRO_RSUD, 
  REALISASI_BULANAN_RSUD, 
  RINCIAN_BEBAN_TETAP, 
  RINCIAN_JASA_TIDAK_LANGSUNG, 
  RINCIAN_JASA_LANGSUNG,
  EVALUASI_REALISASI_VS_PAGU_RSUD 
} from '../data/danaCsvData';

export interface KalkulasiDanaResult {
  pendapatanInput: number;
  porsiJaspelPersen: number;
  porsiSaranaPersen: number;
  paguJaspel: number;
  paguSarana: number;

  // Beban Tetap (Cost Center)
  bebanTetap: {
    totalBebanTetap: number;
    persenDariJaspel: number;
    timPerumus: {
      persen: number;
      nominal: number;
      personel: number;
      rataRata: number;
    };
    penyesuaianRisiko: {
      persen: number;
      nominal: number;
      items: Array<{
        jabatan: string;
        persen: number;
        nominal: number;
        personel: number;
        rataRata: number;
      }>;
    };
    mouKeahlian: number;
  };

  // Beban Fluktuasi: Jasa Tidak Langsung (Cost Center)
  jasaTidakLangsung: {
    totalJTL: number;
    persenDariJaspel: number;
    struktural: {
      total: number;
      persen: number;
      personel: number;
      items: Array<{
        jabatan: string;
        nominal: number;
        personel: number;
        rataRata: number;
      }>;
    };
    administrasi: {
      nominal: number;
      persen: number;
      personel: number;
      rataRata: number;
    };
    postRemunerasi: {
      nominal: number;
      persen: number;
      personel: number;
      rataRata: number;
    };
    tugasTambahan: {
      nominal: number;
      persen: number;
    };
  };

  // Beban Fluktuasi: Jasa Langsung (Revenue Center)
  jasaLangsung: {
    totalJL: number;
    persenDariJaspel: number;
    perawat: {
      nominal: number;
      persen: number;
      personel: number;
      rataRata: number;
    };
    medis: {
      total: number;
      persen: number;
      personel: number;
      dokterUmum: { nominal: number; personel: number; rataRata: number; persen: number };
      psikiater: { nominal: number; personel: number; rataRata: number; persen: number };
      spesialisNonPsikiatri: { nominal: number; personel: number; rataRata: number; persen: number };
    };
    nakesLain: {
      total: number;
      persen: number;
      personel: number;
      tarif: {
        total: number;
        persen: number;
        items: Array<{ nama: string; nominal: number; personel: number; rataRata: number; persen: number }>;
      };
      nonTarif: {
        total: number;
        persen: number;
        items: Array<{ nama: string; nominal: number; personel: number; rataRata: number; persen: number }>;
      };
    };
  };

  // Evaluasi Realisasi vs Pagu
  evaluasiList: Array<{
    kelompok: string;
    pagu: number;
    realisasi: number;
    selisih: number;
    keterangan: string;
  }>;
  totalRealisasi: number;
  totalPaguEvaluasi: number;
  totalSelisih: number;
}

export const hitungAlurDistribusiDana = (
  pendapatanInput: number = DATA_MAKRO_RSUD.realisasiPendapatanBulan,
  porsiJaspelPersen: number = 40.0
): KalkulasiDanaResult => {
  const porsiSaranaPersen = 100 - porsiJaspelPersen;
  const paguJaspel = Math.round(pendapatanInput * (porsiJaspelPersen / 100));
  const paguSarana = Math.round(pendapatanInput * (porsiSaranaPersen / 100));

  // Faktor rasio terhadap sampel baseline CSV (Juli: Rp 1.143.883.744)
  const baselineJP = DATA_MAKRO_RSUD.realisasiPaguJaspelBulan;
  const ratio = baselineJP > 0 ? paguJaspel / baselineJP : 1;

  // 1. Beban Tetap
  const timPerumusNominal = Math.round(paguJaspel * 0.015); // 1.5%
  const penyesuaianRisikoNominal = Math.round(paguJaspel * 0.045); // 4.5%
  const mouKeahlian = 10000000; // Tetap 10jt / menyesuaikan

  const risikoItems = [
    { jabatan: 'Pengelola BLUD (Ketua)', persen: 18.2, nominal: Math.round(penyesuaianRisikoNominal * 0.1822), personel: 1, rataRata: 0 },
    { jabatan: 'Pengelola Keuangan BLUD', persen: 15.7, nominal: Math.round(penyesuaianRisikoNominal * 0.1569), personel: 1, rataRata: 0 },
    { jabatan: 'Pengelola Teknis BLUD I', persen: 15.7, nominal: Math.round(penyesuaianRisikoNominal * 0.1569), personel: 1, rataRata: 0 },
    { jabatan: 'Pengelola Teknis BLUD II', persen: 15.7, nominal: Math.round(penyesuaianRisikoNominal * 0.1569), personel: 1, rataRata: 0 },
    { jabatan: 'Dewan Pengawas (Ketua)', persen: 6.4, nominal: Math.round(penyesuaianRisikoNominal * 0.0638), personel: 1, rataRata: 0 },
    { jabatan: 'Dewan Pengawas (Anggota)', persen: 7.3, nominal: Math.round(penyesuaianRisikoNominal * 0.0729), personel: 2, rataRata: 0 },
    { jabatan: 'Dewan Pengawas (Sekretaris)', persen: 1.8, nominal: Math.round(penyesuaianRisikoNominal * 0.0182), personel: 1, rataRata: 0 }
  ].map(it => ({
    ...it,
    rataRata: it.personel > 0 ? Math.round(it.nominal / it.personel) : 0
  }));

  const totalBebanTetap = timPerumusNominal + penyesuaianRisikoNominal + (paguJaspel === baselineJP ? 10000000 : Math.round(10000000 * ratio));

  // 2. Jasa Tidak Langsung (Cost Center: ~37,55%)
  const totalJTL = Math.round(paguJaspel * 0.3755);
  const strukturalNominal = Math.round(totalJTL * 0.244); // 24.4%
  const adminNominal = Math.round(totalJTL * 0.163); // 16.3%
  const postRemunNominal = Math.round(totalJTL * 0.593); // 59.3%

  const strukturalItems = [
    { jabatan: 'Direktur', nominal: Math.round(strukturalNominal * 0.1033), personel: 1, rataRata: 0 },
    { jabatan: 'Wakil Direktur (Wadir)', nominal: Math.round(strukturalNominal * 0.2545), personel: 3, rataRata: 0 },
    { jabatan: 'Kabag / Kabid', nominal: Math.round(strukturalNominal * 0.4629), personel: 8, rataRata: 0 },
    { jabatan: 'JAFUNG Disetarakan / Keahlian', nominal: Math.round(strukturalNominal * 0.0174), personel: 1, rataRata: 0 },
    { jabatan: 'Ketua / Komite', nominal: Math.round(strukturalNominal * 0.0362), personel: 1, rataRata: 0 },
    { jabatan: 'Anggota Komite', nominal: Math.round(strukturalNominal * 0.0413), personel: 2, rataRata: 0 },
    { jabatan: 'Sekretaris Komite', nominal: Math.round(strukturalNominal * 0.0103), personel: 1, rataRata: 0 }
  ].map(it => ({
    ...it,
    rataRata: it.personel > 0 ? Math.round(it.nominal / it.personel) : 0
  }));

  // 3. Jasa Langsung (Revenue Center: ~56,40%)
  const totalJL = Math.round(paguJaspel * 0.5640);
  const perawatNominal = Math.round(totalJL * 0.409); // 40.9%
  const totalMedis = Math.round(totalJL * 0.430); // 43.0%
  const totalNakesLain = Math.round(totalJL * 0.161); // 16.1%

  // Dokter rincian
  const dokUmum = Math.round(totalMedis * 0.276);
  const dokPsi = Math.round(totalMedis * 0.480);
  const dokNonPsi = Math.round(totalMedis * 0.144);

  // Nakes Lain: Tarif (86%) vs Non-Tarif (14%)
  const nakesTarif = Math.round(totalNakesLain * 0.86);
  const nakesNonTarif = Math.round(totalNakesLain * 0.14);

  const nakesTarifItems = [
    { nama: 'Farmasi', persen: 39.0, nominal: Math.round(nakesTarif * 0.39), personel: 20, rataRata: 0 },
    { nama: 'Analis Laboratorium', persen: 18.0, nominal: Math.round(nakesTarif * 0.18), personel: 11, rataRata: 0 },
    { nama: 'Psikolog Klinis', persen: 7.5, nominal: Math.round(nakesTarif * 0.075), personel: 2, rataRata: 0 },
    { nama: 'Okupasi Terapis & Wicara (OT/TW)', persen: 15.0, nominal: Math.round(nakesTarif * 0.15), personel: 6, rataRata: 0 },
    { nama: 'Fisioterapis', persen: 7.5, nominal: Math.round(nakesTarif * 0.075), personel: 4, rataRata: 0 },
    { nama: 'Radiografer / Radiologi', persen: 7.5, nominal: Math.round(nakesTarif * 0.075), personel: 3, rataRata: 0 },
    { nama: 'Nutrisionist / Gizi', persen: 5.5, nominal: Math.round(nakesTarif * 0.055), personel: 3, rataRata: 0 }
  ].map(it => ({
    ...it,
    rataRata: it.personel > 0 ? Math.round(it.nominal / it.personel) : 0
  }));

  const nakesNonTarifItems = [
    { nama: 'Elektromedis', persen: 12.0, nominal: Math.round(nakesNonTarif * 0.12), personel: 2, rataRata: 0 },
    { nama: 'Kesehatan Lingkungan (Kesling)', persen: 30.0, nominal: Math.round(nakesNonTarif * 0.30), personel: 5, rataRata: 0 },
    { nama: 'Rekam Medik', persen: 58.0, nominal: Math.round(nakesNonTarif * 0.58), personel: 8, rataRata: 0 }
  ].map(it => ({
    ...it,
    rataRata: it.personel > 0 ? Math.round(it.nominal / it.personel) : 0
  }));

  // Evaluasi Realisasi vs Pagu
  const evaluasiList = EVALUASI_REALISASI_VS_PAGU_RSUD.map(row => {
    const scaledPagu = Math.round(row.pagu * ratio);
    const scaledRealisasi = Math.round(row.realisasi * ratio);
    const scaledSelisih = scaledPagu - scaledRealisasi;
    return {
      kelompok: row.kelompok,
      pagu: scaledPagu,
      realisasi: scaledRealisasi,
      selisih: scaledSelisih,
      keterangan: scaledSelisih >= 0 ? `Sisa Efisiensi (+${Math.round(scaledSelisih).toLocaleString('id-ID')})` : `Melampaui Pagu (${Math.round(scaledSelisih).toLocaleString('id-ID')})`
    };
  });

  const totalRealisasi = evaluasiList.reduce((acc, c) => acc + c.realisasi, 0);
  const totalPaguEvaluasi = evaluasiList.reduce((acc, c) => acc + c.pagu, 0);
  const totalSelisih = totalPaguEvaluasi - totalRealisasi;

  return {
    pendapatanInput,
    porsiJaspelPersen,
    porsiSaranaPersen,
    paguJaspel,
    paguSarana,
    bebanTetap: {
      totalBebanTetap,
      persenDariJaspel: 6.05,
      timPerumus: {
        persen: 1.5,
        nominal: timPerumusNominal,
        personel: 14,
        rataRata: Math.round(timPerumusNominal / 14)
      },
      penyesuaianRisiko: {
        persen: 4.5,
        nominal: penyesuaianRisikoNominal,
        items: risikoItems
      },
      mouKeahlian
    },
    jasaTidakLangsung: {
      totalJTL,
      persenDariJaspel: 37.55,
      struktural: {
        total: strukturalNominal,
        persen: 24.4,
        personel: 12,
        items: strukturalItems
      },
      administrasi: {
        nominal: adminNominal,
        persen: 16.3,
        personel: 514,
        rataRata: Math.round(adminNominal / 514)
      },
      postRemunerasi: {
        nominal: postRemunNominal,
        persen: 59.3,
        personel: 424,
        rataRata: Math.round(postRemunNominal / 424)
      },
      tugasTambahan: {
        nominal: 0,
        persen: 0.0
      }
    },
    jasaLangsung: {
      totalJL,
      persenDariJaspel: 56.40,
      perawat: {
        nominal: perawatNominal,
        persen: 40.9,
        personel: 198,
        rataRata: Math.round(perawatNominal / 198)
      },
      medis: {
        total: totalMedis,
        persen: 43.0,
        personel: 26,
        dokterUmum: {
          nominal: dokUmum,
          personel: 17,
          rataRata: Math.round(dokUmum / 17),
          persen: 27.6
        },
        psikiater: {
          nominal: dokPsi,
          personel: 4,
          rataRata: Math.round(dokPsi / 4),
          persen: 48.0
        },
        spesialisNonPsikiatri: {
          nominal: dokNonPsi,
          personel: 4,
          rataRata: Math.round(dokNonPsi / 4),
          persen: 14.4
        }
      },
      nakesLain: {
        total: totalNakesLain,
        persen: 16.1,
        personel: 64,
        tarif: {
          total: nakesTarif,
          persen: 86.0,
          items: nakesTarifItems
        },
        nonTarif: {
          total: nakesNonTarif,
          persen: 14.0,
          items: nakesNonTarifItems
        }
      }
    },
    evaluasiList,
    totalRealisasi,
    totalPaguEvaluasi,
    totalSelisih
  };
};
