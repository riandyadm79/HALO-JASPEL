import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  RefreshCw,
  Eye,
  FileCheck2,
  FileCode,
  Globe
} from 'lucide-react';
import { AlokasiJaspel, PenerimaAlokasi, GeneralIndexItem, CostCenterItem, RevenueCenterItem, User } from '../types';
import { HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from '../types';
import { 
  exportToXLSX, 
  exportDatabaseToXLSX, 
  exportToCSV, 
  exportToTextSummary, 
  parseCSVFile, 
  parseXLSXFile,
  downloadCsvTemplatePenerima,
  downloadCsvTemplateSupabasePenerima,
  downloadCsvTemplateIndeksJasa,
  downloadCsvTemplateGeneralIndex,
  downloadCsvTemplateManajemenDana,
  downloadCsvTemplateRekapKinerjaPelayanan
} from '../utils/exportImport';
import { formatRupiah, formatNumber } from '../utils/calculations';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';

interface ExportImportCenterProps {
  alokasiList: AlokasiJaspel[];
  penerimaList: PenerimaAlokasi[];
  setPenerimaList: React.Dispatch<React.SetStateAction<PenerimaAlokasi[]>>;
  generalIndexList: GeneralIndexItem[];
  setGeneralIndexList: React.Dispatch<React.SetStateAction<GeneralIndexItem[]>>;
  costCenterList: CostCenterItem[];
  revenueCenterList: RevenueCenterItem[];
  currentUser: User;
  hospitalProfile?: HospitalProfile;
}

export const ExportImportCenter: React.FC<ExportImportCenterProps> = ({
  alokasiList,
  penerimaList,
  setPenerimaList,
  generalIndexList,
  setGeneralIndexList,
  costCenterList,
  revenueCenterList,
  currentUser,
  hospitalProfile = DEFAULT_HOSPITAL_PROFILE
}) => {
  const [selectedAlokasiId, setSelectedAlokasiId] = useState<string>(alokasiList[0]?.id || '');
  const [textPreview, setTextPreview] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [importTarget, setImportTarget] = useState<'penerima' | 'generalIndex'>('penerima');
  const [importedRows, setImportedRows] = useState<Record<string, unknown>[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string>('');
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

  const selectedAlokasi = alokasiList.find(a => a.id === selectedAlokasiId) || alokasiList[0];
  const currentPenerima = penerimaList.filter(p => p.alokasiId === selectedAlokasi?.id);

  // Generate text summary on selection
  React.useEffect(() => {
    if (selectedAlokasi) {
      const summary = exportToTextSummary(selectedAlokasi, currentPenerima, hospitalProfile.hospitalName);
      setTextPreview(summary);
    }
  }, [selectedAlokasiId, alokasiList, penerimaList, hospitalProfile]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(textPreview);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleExportSingleFileApp = () => {
    const dataSnapshot = {
      hospitalProfile,
      alokasiList,
      penerimaList,
      generalIndexList,
      costCenterList,
      revenueCenterList,
      exportedAt: new Date().toISOString()
    };

    const standaloneHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${hospitalProfile.hospitalName || 'HALO JASPEL'} - Single File Standalone App</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-8">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-blue-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase">
          SINGLE FILE STANDALONE APPLICATION
        </span>
        <h1 class="text-2xl sm:text-3xl font-black text-white mt-2">${hospitalProfile.hospitalName || 'HALO JASPEL'}</h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">Dokumen Interaktif Portabel & Data Terenkapsulasi (Offline Ready)</p>
      </div>
      <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
        <div class="text-slate-400">Total Periode: <span class="text-amber-400 font-bold">${alokasiList.length}</span></div>
        <div class="text-slate-400">Total Staf Terdaftar: <span class="text-emerald-400 font-bold">${generalIndexList.length}</span></div>
        <div class="text-slate-400">Total Transaksi Penerima: <span class="text-blue-400 font-bold">${penerimaList.length}</span></div>
      </div>
    </div>

    <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
      <h2 class="text-lg font-black text-white flex items-center gap-2">
        <span>Ringkasan Periode Aktif</span>
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-950 text-slate-400 border-b border-slate-800">
              <th class="p-3">Periode</th>
              <th class="p-3">Pagu Bruto</th>
              <th class="p-3">Jaspel Netto</th>
              <th class="p-3">Pos Direksi</th>
              <th class="p-3">Pos Pelayanan</th>
              <th class="p-3">Pos Penunjang</th>
              <th class="p-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            ${alokasiList.map(a => `
              <tr class="hover:bg-slate-800/50">
                <td class="p-3 font-bold text-white">${a.kodePeriode} (${a.bulan} ${a.tahun})</td>
                <td class="p-3 text-slate-300 font-mono">Rp ${(a.paguKlaimBruto || 0).toLocaleString('id-ID')}</td>
                <td class="p-3 text-amber-400 font-bold font-mono">Rp ${(a.jaspelNetto || 0).toLocaleString('id-ID')}</td>
                <td class="p-3 font-mono text-slate-400">Rp ${(a.posDireksi?.nominal || 0).toLocaleString('id-ID')}</td>
                <td class="p-3 font-mono text-emerald-400 font-bold">Rp ${(a.posPelayanan?.nominal || 0).toLocaleString('id-ID')}</td>
                <td class="p-3 font-mono text-blue-400">Rp ${(a.posAdministrasiPenunjang?.nominal || 0).toLocaleString('id-ID')}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">${a.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black text-white">Database Snapshot & JSON Data Port</h2>
        <button onclick="navigator.clipboard.writeText(document.getElementById('raw-json').value); alert('Data snapshot JSON tersalin ke clipboard!');" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition">
          Salin Data JSON
        </button>
      </div>
      <p class="text-xs text-slate-400">File HTML mandiri ini dapat dibuka kapan saja di browser apa pun tanpa koneksi internet atau server backend.</p>
      <textarea id="raw-json" readonly rows="8" class="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-400 custom-scrollbar">${JSON.stringify(dataSnapshot, null, 2)}</textarea>
    </div>

    <footer class="text-center text-xs text-slate-500 pt-4">
      ${hospitalProfile.hospitalName || 'HALO JASPEL'} • Single File Standalone Engine • Diekspor pada ${new Date().toLocaleString('id-ID')}
    </footer>
  </div>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HALO_JASPEL_SINGLE_FILE_${selectedAlokasi?.kodePeriode || 'APP'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportSuccessMessage('');
    try {
      if (file.name.endsWith('.csv')) {
        const rows = await parseCSVFile(file);
        setImportedRows(rows);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const rows = await parseXLSXFile(file);
        setImportedRows(rows);
      } else {
        alert('Mohon gunakan file berformat .xlsx atau .csv');
      }
    } catch (err) {
      alert('Gagal membaca file: ' + String(err));
    }
  };

  const handleCommitImport = async () => {
    if (importedRows.length === 0) return;

    if (importTarget === 'penerima' && selectedAlokasi) {
      const newPenerima: PenerimaAlokasi[] = importedRows.map((row, idx) => {
        const dasar = Number(row['Poin Dasar'] || row['poinDasar'] || 60);
        const komp = Number(row['Poin Kompetensi'] || row['poinKompetensi'] || 60);
        const risiko = Number(row['Poin Risiko'] || row['poinRisiko'] || 60);
        const kinerja = Number(row['Poin Kinerja'] || row['poinKinerja'] || 75);
        const total = dasar + komp + risiko + kinerja;
        const perPoin = Number(row['Nilai Per Poin (Rp)'] || row['nilaiPerPoin'] || 36000);
        const bruto = total * perPoin;
        const pajakRate = Number(row['PPh 21 (%)'] || row['pajakPph21Persen'] || 5);
        const potongan = Math.round(bruto * (pajakRate / 100));
        const netto = bruto - potongan;

        return {
          id: `pen-imp-${Date.now()}-${idx}`,
          alokasiId: selectedAlokasi.id,
          pegawaiId: `peg-imp-${idx}`,
          nama: String(row['Nama Pegawai'] || row['nama'] || `Staf Impor ${idx + 1}`),
          unitKerja: String(row['Unit Kerja'] || row['unitKerja'] || 'Instalasi Gawat Darurat (IGD)'),
          jabatan: String(row['Jabatan'] || row['jabatan'] || 'Staf Pelaksana'),
          kategori: (row['Kategori'] || 'Keperawatan') as any,
          poinDasar: dasar,
          poinKompetensi: komp,
          poinRisiko: risiko,
          poinKinerja: kinerja,
          totalPoin: total,
          nilaiPerPoin: perPoin,
          brutoJaspel: bruto,
          pajakPph21Persen: pajakRate,
          potonganPph21: potongan,
          nettoDiterima: netto,
          statusKoreksi: 'Sesuai',
          sudahDibayar: false
        };
      });

      try {
        const payloads = newPenerima.map(p => ({
          id: p.id,
          alokasi_id: p.alokasiId,
          pegawai_id: p.pegawaiId,
          nama: p.nama,
          unit_kerja: p.unitKerja,
          jabatan: p.jabatan,
          kategori: p.kategori,
          poin_dasar: p.poinDasar,
          poin_kompetensi: p.poinKompetensi,
          poin_risiko: p.poinRisiko,
          poin_kinerja: p.poinKinerja,
          total_poin: p.totalPoin,
          nilai_per_poin: p.nilaiPerPoin,
          bruto_jaspel: p.brutoJaspel,
          pajak_pph21_persen: p.pajakPph21Persen,
          potongan_pph21: p.potonganPph21,
          netto_diterima: p.nettoDiterima,
          status_koreksi: p.statusKoreksi,
          sudah_dibayar: p.sudahDibayar
        }));
        await supabase.from('penerima_alokasi').insert(payloads);
        setPenerimaList([...penerimaList, ...newPenerima]);
        setImportSuccessMessage(`Berhasil mengimpor ${newPenerima.length} baris staf ke database Supabase periode ${selectedAlokasi.bulan} ${selectedAlokasi.tahun}!`);
        setImportedRows([]);
        setImportFileName('');
      } catch (err) {
        console.error(err);
        alert('Gagal mengimpor penerima ke Supabase: ' + String(err));
      }
    } else if (importTarget === 'generalIndex') {
      const newGeneral: GeneralIndexItem[] = importedRows.map((row, idx) => ({
        id: `idx-imp-${Date.now()}-${idx}`,
        kode: String(row['Kode'] || row['kode'] || `GI-${idx + 100}`),
        namaPegawai: String(row['Nama Pegawai'] || row['namaPegawai'] || `Pegawai ${idx + 1}`),
        nip: String(row['NIP'] || row['nip'] || `19900000000000000${idx}`),
        unitKerja: String(row['Unit Kerja'] || row['unitKerja'] || 'Instalasi Rawat Jalan'),
        golongan: String(row['Golongan'] || row['golongan'] || 'III/b'),
        pendidikan: (row['Pendidikan'] || 'D4 / S1') as any,
        masaKerjaTahun: Number(row['Masa Kerja'] || row['masaKerjaTahun'] || 8),
        skorDasar: Number(row['Skor Dasar'] || row['skorDasar'] || 70),
        skorKompetensi: Number(row['Skor Kompetensi'] || row['skorKompetensi'] || 70),
        skorRisiko: Number(row['Skor Risiko'] || row['skorRisiko'] || 70),
        skorKinerja: Number(row['Skor Kinerja'] || row['skorKinerja'] || 80),
        bobotPresensi: Number(row['Presensi'] || row['bobotPresensi'] || 98),
        statusPegawai: (row['Status Pegawai'] || 'PNS') as any
      }));

      try {
        const payloads = newGeneral.map(g => ({
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
        await supabase.from('general_index').insert(payloads);
        setGeneralIndexList([...generalIndexList, ...newGeneral]);
        setImportSuccessMessage(`Berhasil mengimpor ${newGeneral.length} pegawai ke master General Index Supabase!`);
        setImportedRows([]);
        setImportFileName('');
      } catch (err) {
        console.error(err);
        alert('Gagal mengimpor General Index ke Supabase: ' + String(err));
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#172554] via-[#0f1d38] to-[#1e3a8a] rounded-3xl p-5 sm:p-7 border border-blue-700/50 shadow-2xl relative overflow-hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
              MULTI-FORMAT EXPORT & IMPORT
            </span>
            <span className="text-xs text-blue-200 font-medium">XLSX • CSV • TEXT • PDF</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Pusat Ekspor & Impor Data Jasa Pelayanan
          </h2>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl mt-1">
            Ekspor laporan remunerasi resmi ke Excel, CSV data pipeline, plain-text format dot-matrix / WhatsApp blast, serta impor spreadsheet massal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: EXPORT OPTIONS */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-white">
              <Download className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black">Ekspor Data Multi-Format</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1">
                Pilih Periode Alokasi
              </label>
              <select
                value={selectedAlokasiId}
                onChange={e => setSelectedAlokasiId(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                {alokasiList.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.kodePeriode} — {a.bulan} {a.tahun} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Export Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* XLSX Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 uppercase">1. FORMAT XLSX</span>
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Worksheet Excel lengkap dengan 2 sheet: Ringkasan Alokasi & Rincian Penerima
                </p>
                <button
                  onClick={() => selectedAlokasi && exportToXLSX(selectedAlokasi, currentPenerima)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-800 transition flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh XLSX</span>
                </button>
              </div>

              {/* CSV Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 uppercase">2. FORMAT CSV</span>
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  File CSV standar UTF-8 untuk integrasi ke SIMRS, payroll bank, atau aplikasi eksternal
                </p>
                <button
                  onClick={() => selectedAlokasi && exportToCSV(currentPenerima as any, `HALO_JASPEL_${selectedAlokasi.kodePeriode}`)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold text-xs border border-amber-800 transition flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh CSV</span>
                </button>
              </div>

              {/* Database Master XLSX */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-400 uppercase">3. MASTER DB XLSX</span>
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Arsip seluruh data General Index, Cost Center & Revenue Center dalam satu file
                </p>
                <button
                  onClick={() => exportDatabaseToXLSX(generalIndexList, costCenterList, revenueCenterList)}
                  className="w-full py-2 px-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 font-bold text-xs border border-blue-800 transition flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Master DB</span>
                </button>
              </div>

              {/* Text Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-400 uppercase">4. FORMAT PLAIN TEXT</span>
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Format teks tabular ringkas siap cetak dot-matrix atau copy paste ke WhatsApp
                </p>
                <button
                  onClick={handleCopyText}
                  className="w-full py-2 px-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs border border-blue-800 transition flex items-center justify-center space-x-1.5"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Tersalin!' : 'Salin Teks Ringkasan'}</span>
                </button>
              </div>

              {/* Single File Application Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-amber-400 uppercase">5. SINGLE FILE APPLICATION (.HTML)</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      OFFLINE PORTABLE
                    </span>
                  </div>
                  <FileCode className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Unduh seluruh snapshot aplikasi dan basis data dalam 1 file HTML mandiri (Single-File). Bisa dibuka langsung di browser manapun tanpa instalasi software atau server.
                </p>
                <button
                  onClick={handleExportSingleFileApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Aplikasi Single File (.html Mandiri)</span>
                </button>
              </div>

            </div>

            {/* Plain Text Preview Area */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Pratinjau Teks Laporan
                </span>
                <button
                  onClick={handleCopyText}
                  className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText ? 'Tersalin' : 'Salin Semua'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={7}
                value={textPreview}
                className="w-full p-3 bg-black border border-slate-800 rounded-2xl font-mono text-[11px] text-emerald-400 custom-scrollbar"
              />
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: MASS IMPORT PARSER */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-white">
              <Upload className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black">Impor Data Massal (Spreadsheet)</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1">
                Target Tabel Impor
              </label>
              <select
                value={importTarget}
                onChange={e => setImportTarget(e.target.value as any)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold"
              >
                <option value="penerima">Rincian Penerima Alokasi (Periode Aktif)</option>
                <option value="generalIndex">Database Master General Index Pegawai</option>
              </select>
            </div>

            {/* Drag & Drop Input Zone */}
            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-amber-400 transition text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Pilih file spreadsheet (.XLSX atau .CSV)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kolom akan dipetakan otomatis sesuai header
                </p>
              </div>

              <div>
                <label className="cursor-pointer inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow transition active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>Pilih Berkas Komputer</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {importFileName && (
                <div className="text-xs font-mono text-emerald-400 font-bold pt-2">
                  Berkas terbaca: {importFileName} ({importedRows.length} baris)
                </div>
              )}
            </div>

            {/* Download CSV Templates Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Unduh Templat CSV Impor & Supabase</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Format .CSV UTF-8</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gunakan templat resmi ini untuk diisi data baru lalu diimpor ke aplikasi atau diunggah langsung ke tabel Supabase:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={downloadCsvTemplatePenerima}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold border border-slate-700 transition flex items-center justify-between"
                  title="Templat CSV dengan header Bahasa Indonesia untuk Impor Aplikasi"
                >
                  <span>1. Templat Impor Penerima</span>
                  <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={downloadCsvTemplateSupabasePenerima}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold border border-slate-700 transition flex items-center justify-between"
                  title="Templat CSV dengan struktur kolom Supabase (penerima_alokasi)"
                >
                  <span>2. Supabase: penerima_alokasi</span>
                  <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={downloadCsvTemplateIndeksJasa}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 font-bold border border-slate-700 transition flex items-center justify-between"
                  title="Templat CSV dengan struktur kolom Supabase (indeks_jasa_langsung)"
                >
                  <span>3. Supabase: indeks_jasa_langsung</span>
                  <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={downloadCsvTemplateGeneralIndex}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 font-bold border border-slate-700 transition flex items-center justify-between"
                  title="Templat CSV dengan struktur kolom Supabase (general_index)"
                >
                  <span>4. Supabase: general_index</span>
                  <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={downloadCsvTemplateManajemenDana}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold border border-slate-700 transition flex items-center justify-between"
                  title="Templat CSV Distribusi Proporsional Dana Jaspel RSUD (Aturan 40% Pagu Jaspel)"
                >
                  <span>5. Format CSV Distribusi Dana (Pagu 40%)</span>
                  <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={downloadCsvTemplateRekapKinerjaPelayanan}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold border border-slate-700 transition flex items-center justify-between"
                  title="Templat CSV Rekapitulasi Kinerja Pelayanan & Poin Pegawai Jasa Langsung"
                >
                  <span>6. Format CSV Rekap Kinerja Pelayanan (10 Unit)</span>
                  <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* Clear All Recipient Data Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-300 block">Kosongkan Data Penerima</span>
                <span className="text-[10px] text-slate-400">Hapus permanen seluruh data penerima jaspel dari database Supabase.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Kosongkan Seluruh Data Penerima',
                    message: 'Apakah Anda yakin ingin MENGHAPUS SELURUH DATA PENERIMA dari database Supabase? Tindakan ini bersifat permanen dan data yang terhapus tidak dapat dikembalikan.',
                    confirmText: 'Ya, Kosongkan Data',
                    cancelText: 'Batal',
                    isDanger: true,
                    onConfirm: async () => {
                      try {
                        await supabase.from('penerima_alokasi').delete().neq('id', 'keep_none_placeholder');
                        setPenerimaList([]);
                        localStorage.removeItem('halo_japel_penerima_list');
                        setImportSuccessMessage('Seluruh data penerima telah berhasil dikosongkan.');
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800/80 transition cursor-pointer"
              >
                Kosongkan Data Penerima
              </button>
            </div>
            {importSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{importSuccessMessage}</span>
              </div>
            )}

            {/* Preview of Imported Data */}
            {importedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Pratinjau Data Impor ({importedRows.length} baris)
                  </span>
                  <button
                    onClick={handleCommitImport}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs shadow"
                  >
                    Konfirmasi & Masukkan Data
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-48 custom-scrollbar">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        {Object.keys(importedRows[0]).slice(0, 5).map(k => (
                          <th key={k} className="p-2 whitespace-nowrap">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {importedRows.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).slice(0, 5).map((v: any, j) => (
                            <td key={j} className="p-2 whitespace-nowrap font-mono">{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

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
