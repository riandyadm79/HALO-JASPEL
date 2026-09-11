import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { AlokasiJaspel, PenerimaAlokasi, GeneralIndexItem, CostCenterItem, RevenueCenterItem } from '../types';
import { formatRupiah, formatNumber, formatDateIndo } from './calculations';

// 1. EXPORT TO XLSX
export const exportToXLSX = (
  alokasi: AlokasiJaspel,
  penerima: PenerimaAlokasi[],
  fileName?: string
) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan Alokasi
  const summaryData = [
    ['HALO JASPEL - SISTEM ALOKASI JASA PELAYANAN RSUD / BLUD'],
    ['RINGKASAN EKSEKUTIF ALOKASI JASA PELAYANAN'],
    [''],
    ['Kode Periode', alokasi.kodePeriode],
    ['Bulan / Tahun', `${alokasi.bulan} ${alokasi.tahun}`],
    ['Sumber Pendapatan', alokasi.sumberDana],
    ['Pendapatan Kotor RS (Rp)', alokasi.pendapatanKotor],
    ['Biaya Operasional Beban (Rp)', alokasi.biayaOperasionalRs],
    ['Proporsi Jaspel (%)', `${alokasi.proporsiJaspelPersen}%`],
    ['Pagu Jaspel Kotor (Rp)', alokasi.paguJaspelKotor],
    ['Pagu Jaspel Netto (Rp)', alokasi.paguJaspelNetto],
    ['Porsi Jasa Medis / Klinis (%)', `${alokasi.jasaMedisKlinisPersen}%`],
    ['Porsi Jasa Non-Klinis (%)', `${alokasi.jasaNonKlinisPersen}%`],
    ['Porsi Jasa Manajemen (%)', `${alokasi.jasaManajemenPersen}%`],
    ['Status Penetapan', alokasi.status],
    ['Tanggal Penetapan', formatDateIndo(alokasi.tanggalUpdate || alokasi.tanggalDibuat)],
    ['Penanggung Jawab / Pembuat', alokasi.createdBy],
    ['Keterangan', alokasi.keterangan]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Alokasi');

  // Sheet 2: Daftar Penerima Alokasi
  const penerimaRows = penerima.map((p, idx) => ({
    No: idx + 1,
    'Nama Pegawai': p.nama,
    'Unit Kerja': p.unitKerja,
    Jabatan: p.jabatan,
    Kategori: p.kategori,
    'Poin Dasar': p.poinDasar,
    'Poin Kompetensi': p.poinKompetensi,
    'Poin Risiko': p.poinRisiko,
    'Poin Kinerja': p.poinKinerja,
    'Total Skor Poin': p.totalPoin,
    'Nilai Per Poin (Rp)': p.nilaiPerPoin,
    'Bruto Jaspel (Rp)': p.brutoJaspel,
    'PPh 21 (%)': `${p.pajakPph21Persen}%`,
    'Potongan Pajak (Rp)': p.potonganPph21,
    'Netto Diterima (Rp)': p.nettoDiterima,
    'Status Koreksi': p.statusKoreksi,
    'Catatan Koreksi': p.catatanKoreksi || '-'
  }));
  const wsPenerima = XLSX.utils.json_to_sheet(penerimaRows);
  XLSX.utils.book_append_sheet(wb, wsPenerima, 'Rincian Penerima');

  const name = fileName || `HALO_JAPEL_ALOKASI_${alokasi.kodePeriode}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, name);
};

// EXPORT DATABASE SHEET TO XLSX
export const exportDatabaseToXLSX = (
  generalIndex: GeneralIndexItem[],
  costCenters: CostCenterItem[],
  revenueCenters: RevenueCenterItem[]
) => {
  const wb = XLSX.utils.book_new();

  // General Index
  const wsIndex = XLSX.utils.json_to_sheet(generalIndex);
  XLSX.utils.book_append_sheet(wb, wsIndex, 'General Index');

  // Cost Centers
  const wsCost = XLSX.utils.json_to_sheet(costCenters);
  XLSX.utils.book_append_sheet(wb, wsCost, 'Cost Centers');

  // Revenue Centers
  const wsRev = XLSX.utils.json_to_sheet(revenueCenters);
  XLSX.utils.book_append_sheet(wb, wsRev, 'Revenue Centers');

  XLSX.writeFile(wb, `HALO_JAPEL_DATABASE_MASTER_${Date.now()}.xlsx`);
};

// 2. EXPORT TO CSV
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(obj =>
    headers
      .map(header => {
        const val = obj[header];
        const strVal = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        return `"${strVal.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 3. EXPORT TO PLAIN TEXT (Dot-Matrix & WhatsApp friendly)
export const exportToTextSummary = (
  alokasi: AlokasiJaspel, 
  penerima: PenerimaAlokasi[],
  instansiName: string = 'INSTANSI RSUD / BLUD'
): string => {
  const line = '='.repeat(68);
  const dash = '-'.repeat(68);

  let text = `${line}\n`;
  text += `        ${instansiName.toUpperCase()}\n`;
  text += `        LAPORAN ALOKASI JASA PELAYANAN (JASPEL)\n`;
  text += `${line}\n`;
  text += `Kode Periode        : ${alokasi.kodePeriode}\n`;
  text += `Bulan / Tahun       : ${alokasi.bulan} ${alokasi.tahun}\n`;
  text += `Sumber Pendapatan   : ${alokasi.sumberDana}\n`;
  text += `Pendapatan Kotor RS : ${formatRupiah(alokasi.pendapatanKotor)}\n`;
  text += `Biaya Operasional   : ${formatRupiah(alokasi.biayaOperasionalRs)}\n`;
  text += `Proporsi Jaspel     : ${alokasi.proporsiJaspelPersen}%\n`;
  text += `PAGU JASPEL KOTOR   : ${formatRupiah(alokasi.paguJaspelKotor)}\n`;
  text += `PAGU JASPEL NETTO   : ${formatRupiah(alokasi.paguJaspelNetto)}\n`;
  text += `Status Penetapan    : ${alokasi.status}\n`;
  text += `Tanggal Cetak       : ${new Date().toLocaleString('id-ID')}\n`;
  text += `${dash}\n`;
  text += `DAFTAR DISTRIBUSI PENERIMA JASA PELAYANAN:\n`;
  text += `${dash}\n`;
  text += `NO | NAMA & JABATAN              | TOTAL POIN | BRUTO (RP) | NETTO (RP)\n`;
  text += `${dash}\n`;

  penerima.forEach((p, i) => {
    const no = String(i + 1).padEnd(2, ' ');
    const nama = (p.nama.length > 25 ? p.nama.substring(0, 24) + '…' : p.nama).padEnd(26, ' ');
    const poin = String(p.totalPoin).padStart(10, ' ');
    const bruto = formatNumber(p.brutoJaspel).padStart(10, ' ');
    const netto = formatNumber(p.nettoDiterima).padStart(10, ' ');
    text += `${no} | ${nama} | ${poin} | ${bruto} | ${netto}\n`;
  });

  text += `${line}\n`;
  const totalNetto = penerima.reduce((acc, curr) => acc + curr.nettoDiterima, 0);
  const totalPoinAll = penerima.reduce((acc, curr) => acc + curr.totalPoin, 0);
  text += `TOTAL POIN TERDISTRIBUSI : ${formatNumber(totalPoinAll)}\n`;
  text += `TOTAL NETTO PENERIMA     : ${formatRupiah(totalNetto)}\n`;
  text += `PENANGGUNG JAWAB         : ${alokasi.createdBy}\n`;
  text += `${line}\n`;
  text += `* Dokumen ini dibuat otomatis oleh Sistem Informasi Remunerasi & Alokasi Jaspel\n`;

  return text;
};

// 4. EXPORT TO PDF (SLIP GAJI & REKAP)
export const exportSlipPdf = (
  p: PenerimaAlokasi,
  alokasi: AlokasiJaspel,
  instansiName: string = '',
  committeeLeadName: string = '',
  committeeLeadNip: string = ''
) => {
  const doc = new jsPDF();

  // Header Navy
  doc.setFillColor(12, 22, 51); // Navy #0c1633
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HALO JASPEL - SLIP JASA PELAYANAN RESMI', 15, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${instansiName} | PERIODE: ${alokasi.bulan.toUpperCase()} ${alokasi.tahun}`, 15, 22);

  // Border & watermark
  doc.setDrawColor(220, 220, 220);
  doc.rect(14, 38, 182, 240);

  // Pegawai Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI PENERIMA REMUNERASI', 20, 48);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama Lengkap   : ${p.nama}`, 20, 56);
  doc.text(`Unit Kerja     : ${p.unitKerja}`, 20, 62);
  doc.text(`Jabatan        : ${p.jabatan}`, 20, 68);
  doc.text(`Kategori       : ${p.kategori}`, 20, 74);

  doc.text(`Kode Periode   : ${alokasi.kodePeriode}`, 115, 56);
  doc.text(`Sumber Dana    : ${alokasi.sumberDana}`, 115, 62);
  doc.text(`Status Alokasi : ${alokasi.status}`, 115, 68);
  doc.text(`Status Koreksi : ${p.statusKoreksi}`, 115, 74);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 80, 188, 80);

  // Breakdown Poin
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(112, 26, 40);
  doc.text('RINCIAN INDEKS & SKOR POIN KINERJA', 20, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const poinRows = [
    ['1. Skor Poin Dasar (Pendidikan & Masa Kerja)', `${p.poinDasar} Poin`],
    ['2. Skor Poin Kompetensi & Kredensial', `${p.poinKompetensi} Poin`],
    ['3. Skor Poin Risiko Paparan Layanan', `${p.poinRisiko} Poin`],
    ['4. Skor Poin Kinerja & Logbook Aktivitas', `${p.poinKinerja} Poin`],
    ['TOTAL SKOR INDEKS POIN', `${p.totalPoin} Poin`]
  ];

  let y = 98;
  poinRows.forEach((row, i) => {
    if (i === 4) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
    }
    doc.text(row[0], 25, y);
    doc.text(row[1], 160, y, { align: 'right' });
    y += 7;
  });

  // Divider
  doc.line(20, y + 2, 188, y + 2);
  y += 10;

  // Breakdown Finansial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(112, 26, 40);
  doc.text('PERHITUNGAN FINANSIAL JASPEL', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const finRows = [
    ['Konversi Nilai Satuan Per Poin', formatRupiah(p.nilaiPerPoin)],
    ['Penghasilan Jaspel Bruto', formatRupiah(p.brutoJaspel)],
    [`Potongan PPh 21 Final (${p.pajakPph21Persen}%)`, `- ${formatRupiah(p.potonganPph21)}`]
  ];

  finRows.forEach(row => {
    doc.text(row[0], 25, y);
    doc.text(row[1], 160, y, { align: 'right' });
    y += 7;
  });

  // Netto Highlight Box (Gold/Amber border with subtle background)
  y += 5;
  doc.setFillColor(254, 243, 199); // yellow-100
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.roundedRect(20, y, 168, 18, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('PENGHASILAN JASPEL NETTO DITERIMA:', 25, y + 11);

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(p.nettoDiterima), 180, y + 11, { align: 'right' });

  // Catatan
  y += 28;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Catatan: ${p.catatanKoreksi || 'Besaran jaspel telah diverifikasi dan disesuaikan dengan ketentuan SK Direktur.'}`, 20, y);
  doc.text('Perhitungan PPh 21 mengacu pada ketentuan perpajakan BLUD dan PMK yang berlaku.', 20, y + 5);

  // Tanda Tangan
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text('Penerima Jasa Pelayanan,', 30, y);
  doc.text('Ketua Tim Perumus Jaspel,', 130, y);

  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.text(p.nama, 30, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Jabatan: ${p.jabatan}`, 30, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(committeeLeadName, 130, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. ${committeeLeadNip}`, 130, y + 5);

  // Footer text
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(`Dicetak melalui aplikasi HALO JASPEL pada ${new Date().toLocaleString('id-ID')}`, 105, 272, { align: 'center' });

  const safeName = p.nama.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`SLIP_JASPEL_${safeName}_${alokasi.kodePeriode}.pdf`);
};

// 5. IMPORT PARSER (CSV / JSON / XLSX)
export const parseCSVFile = async (file: File): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return resolve([]);
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) return resolve([]);

        // Parse headers
        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
        const results: Record<string, unknown>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          const line = lines[i];

          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          const rowObj: Record<string, unknown> = {};
          headers.forEach((hdr, idx) => {
            let val: any = values[idx] || '';
            val = val.replace(/^["']|["']$/g, '').trim();
            // try to parse number
            if (!isNaN(Number(val)) && val !== '') {
              val = Number(val);
            }
            rowObj[hdr] = val;
          });
          results.push(rowObj);
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

export const parseXLSXFile = async (file: File): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json as Record<string, unknown>[]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

// 6. CSV TEMPLATE GENERATORS FOR SUPABASE & APP IMPORT
export const downloadCsvTemplatePenerima = () => {
  const headers = ['Nama Pegawai', 'Unit Kerja', 'Jabatan', 'Kategori', 'Poin Dasar', 'Poin Kompetensi', 'Poin Risiko', 'Poin Kinerja', 'Nilai Per Poin (Rp)', 'PPh 21 (%)'];
  const sampleRow1 = ['dr. Ahmad Subagyo, Sp.B', 'Instalasi Bedah Sentral', 'Dokter Spesialis Bedah', 'Spesialis', 120, 95, 85, 110, 50000, 5];
  const sampleRow2 = ['Ns. Tri Astuti, S.Kep', 'Instalasi Gawat Darurat (IGD)', 'Perawat Pelaksana', 'Perawat', 80, 75, 80, 90, 36000, 5];

  const csvContent = '\uFEFF' + [
    headers.map(h => `"${h}"`).join(','),
    sampleRow1.map(v => typeof v === 'string' ? `"${v}"` : v).join(','),
    sampleRow2.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')
  ].join('\r\n');

  downloadBlobAsFile(csvContent, 'TEMPLAT_IMPOR_PENERIMA_JASPEL.csv');
};

export const downloadCsvTemplateSupabasePenerima = () => {
  const headers = [
    'id', 'alokasi_id', 'pegawai_id', 'nama', 'unit_kerja', 'jabatan', 'kategori',
    'poin_dasar', 'poin_kompetensi', 'poin_risiko', 'poin_kinerja', 'total_poin',
    'nilai_per_poin', 'bruto_jaspel', 'pajak_pph21_persen', 'potongan_pph21',
    'netto_diterima', 'status_koreksi', 'catatan_koreksi', 'sudah_dibayar'
  ];
  const sampleRow = [
    'pen-sup-001', 'alo-1', 'u-101', 'dr. Ahmad Subagyo, Sp.B', 'Instalasi Bedah Sentral',
    'Dokter Spesialis Bedah', 'Spesialis', 120, 95, 85, 110, 410, 50000, 20500000, 5, 1025000,
    19475000, 'Sesuai', '', false
  ];

  const csvContent = '\uFEFF' + [
    headers.join(','),
    sampleRow.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')
  ].join('\r\n');

  downloadBlobAsFile(csvContent, 'SUPABASE_TABEL_penerima_alokasi.csv');
};

export const downloadCsvTemplateIndeksJasa = () => {
  const headers = [
    'id', 'kode', 'instalasi_layanan', 'kategori', 'kinerja1', 'kinerja2', 'kinerja3',
    'total_poin', 'jumlah_alokasi', 'rupiah_per_poin1', 'rupiah_per_poin2', 'nilai_jp_langsung'
  ];
  const sampleRow = [
    'ijl-001', 'IJL-001', 'Instalasi Gawat Darurat (IGD)', 'Pelayanan Medis',
    100, 80, 85, 265, 150000000, 150000, 120000, 39750000
  ];

  const csvContent = '\uFEFF' + [
    headers.join(','),
    sampleRow.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')
  ].join('\r\n');

  downloadBlobAsFile(csvContent, 'SUPABASE_TABEL_indeks_jasa_langsung.csv');
};

export const downloadCsvTemplateGeneralIndex = () => {
  const headers = [
    'id', 'kode', 'nama_pegawai', 'nip', 'unit_kerja', 'golongan', 'pendidikan',
    'masa_kerja_tahun', 'skor_dasar', 'skor_kompetensi', 'skor_risiko', 'skor_kinerja',
    'bobot_presensi', 'status_pegawai'
  ];
  const sampleRow = [
    'idx-001', 'GI-001', 'dr. Ahmad Subagyo, Sp.B', '198001012005011001',
    'Instalasi Bedah Sentral', 'IV/a', 'Spesialis', 15, 120, 95, 85, 110, 100, 'PNS'
  ];

  const csvContent = '\uFEFF' + [
    headers.join(','),
    sampleRow.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')
  ].join('\r\n');

  downloadBlobAsFile(csvContent, 'SUPABASE_TABEL_general_index.csv');
};

const downloadBlobAsFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

