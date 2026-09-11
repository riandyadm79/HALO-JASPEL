import React from 'react';
import { X, Printer, Download, Copy, Check, FileText, Sparkles, Building2, User } from 'lucide-react';
import { PenerimaAlokasi, AlokasiJaspel } from '../types';
import { HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from './HospitalProfileModal';
import { formatRupiah, formatNumber, formatDateIndo } from '../utils/calculations';
import { exportSlipPdf } from '../utils/exportImport';

interface SlipJaspelModalProps {
  penerima: PenerimaAlokasi;
  alokasi: AlokasiJaspel;
  onClose: () => void;
  hospitalProfile?: HospitalProfile;
}

export const SlipJaspelModal: React.FC<SlipJaspelModalProps> = ({
  penerima,
  alokasi,
  onClose,
  hospitalProfile = DEFAULT_HOSPITAL_PROFILE
}) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    exportSlipPdf(penerima, alokasi, hospitalProfile.hospitalName);
  };

  const handleCopyText = () => {
    const text = `
*SLIP JASA PELAYANAN (HALO JASPEL)*
${hospitalProfile.hospitalName}
Periode: ${alokasi.bulan} ${alokasi.tahun}
----------------------------------------
Nama      : ${penerima.nama}
Unit      : ${penerima.unitKerja}
Jabatan   : ${penerima.jabatan}
Total Poin: ${penerima.totalPoin} Poin
Bruto     : ${formatRupiah(penerima.brutoJaspel)}
PPh 21    : -${formatRupiah(penerima.potonganPph21)} (${penerima.pajakPph21Persen}%)
----------------------------------------
*NETTO DITERIMA: ${formatRupiah(penerima.nettoDiterima)}*
Status: ${penerima.statusKoreksi}
----------------------------------------
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Modal Action Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-white">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold">
              Slip Elektronik Jasa Pelayanan
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Salin Rincian Teks"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="p-2 rounded-xl bg-blue-950 border border-blue-500/60 hover:bg-blue-900 text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition"
              title="Unduh Slip PDF"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Cetak Langsung"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-blue-950 text-slate-400 hover:text-blue-300 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Paper Container */}
        <div id="printable-slip" className="p-5 sm:p-8 bg-white text-slate-900 text-xs sm:text-sm font-sans space-y-6">
          
          {/* Header Kop RS */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#0c1633] flex items-center justify-center font-black text-amber-400 text-xl shadow border border-blue-900">
                  {hospitalProfile.hospitalName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-[#0c1633] uppercase">
                    {hospitalProfile.hospitalName}
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-600">
                    {hospitalProfile.subtitle || 'Sistem Remunerasi Jasa Pelayanan Terintegrasi (HALO JASPEL)'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {hospitalProfile.address} • {hospitalProfile.city} • Telp: {hospitalProfile.phone}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                  {hospitalProfile.badgeText || 'DOKUMEN RESMI'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {alokasi.kodePeriode}
                </p>
              </div>
            </div>
            <div className="mt-3 py-1 px-3 bg-[#0c1633] text-amber-300 font-bold text-center text-xs tracking-wider rounded">
              BUKTI PEMBAGIAN JASA PELAYANAN — PERIODE: {alokasi.bulan.toUpperCase()} {alokasi.tahun}
            </div>
          </div>

          {/* Pegawai Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Nama Pegawai</span>
              <p className="font-extrabold text-slate-900 text-sm">{penerima.nama}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Unit Kerja / Ruangan</span>
              <p className="font-bold text-slate-800">{penerima.unitKerja}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Jabatan & Kategori</span>
              <p className="font-medium text-slate-800">{penerima.jabatan} ({penerima.kategori})</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status Koreksi SPI</span>
              <p className="font-bold text-emerald-700">{penerima.statusKoreksi}</p>
            </div>
          </div>

          {/* Skor Indeks Poin Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0c1633] flex items-center space-x-1.5">
              <span>Rincian Indeks & Skor Poin</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex justify-between py-2 px-3 bg-slate-100 font-bold text-slate-600">
                <span>Komponen Poin</span>
                <span>Skor Poin</span>
              </div>
              <div className="flex justify-between py-2 px-3">
                <span className="text-slate-700">1. Poin Dasar (Pendidikan & Masa Kerja)</span>
                <span className="font-bold text-slate-900">{penerima.poinDasar} Poin</span>
              </div>
              <div className="flex justify-between py-2 px-3">
                <span className="text-slate-700">2. Poin Kompetensi & Pelatihan Kredensial</span>
                <span className="font-bold text-slate-900">{penerima.poinKompetensi} Poin</span>
              </div>
              <div className="flex justify-between py-2 px-3">
                <span className="text-slate-700">3. Poin Tingkat Risiko Paparan Tindakan</span>
                <span className="font-bold text-slate-900">{penerima.poinRisiko} Poin</span>
              </div>
              <div className="flex justify-between py-2 px-3">
                <span className="text-slate-700">4. Poin Kinerja & Logbook Pelayanan</span>
                <span className="font-bold text-slate-900">{penerima.poinKinerja} Poin</span>
              </div>
              <div className="flex justify-between py-2.5 px-3 bg-amber-50 font-black text-slate-900">
                <span>TOTAL SKOR INDEKS POIN</span>
                <span className="text-amber-800 text-sm font-extrabold">{penerima.totalPoin} Poin</span>
              </div>
            </div>
          </div>

          {/* Perhitungan Finansial */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0c1633]">
              Perhitungan Finansial
            </h4>
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs bg-slate-50/50">
              <div className="flex justify-between">
                <span className="text-slate-600">Nilai Konversi Per Poin</span>
                <span className="font-semibold text-slate-900">{formatRupiah(penerima.nilaiPerPoin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Jaspel Bruto ({penerima.totalPoin} × {formatRupiah(penerima.nilaiPerPoin)})</span>
                <span className="font-bold text-slate-900 text-sm">{formatRupiah(penerima.brutoJaspel)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-medium border-t border-slate-200 pt-2">
                <span>Potongan PPh 21 Final ({penerima.pajakPph21Persen}%)</span>
                <span>- {formatRupiah(penerima.potonganPph21)}</span>
              </div>

              {/* Netto Banner */}
              <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-amber-400 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                    Netto Jaspel Diterima
                  </span>
                  <p className="text-[10px] text-amber-800">
                    (Ditransfer langsung ke rekening terdaftar)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg sm:text-2xl font-black text-slate-900">
                    {formatRupiah(penerima.nettoDiterima)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <p className="text-slate-500 text-[11px]">Penerima Jasa Pelayanan,</p>
              <div className="h-16 flex items-end justify-center">
                <p className="font-bold underline text-slate-900">{penerima.nama}</p>
              </div>
              <p className="text-[10px] text-slate-500">{penerima.jabatan}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px]">{hospitalProfile.committeeLeadTitle || 'Ketua Tim Remunerasi & Jaspel'},</p>
              <div className="h-16 flex items-end justify-center">
                <p className="font-bold underline text-slate-900">{hospitalProfile.committeeLeadName || 'drg. Ratna Kartika, Sp.KGA'}</p>
              </div>
              <p className="text-[10px] text-slate-500">NIP. {hospitalProfile.committeeLeadNip || '198204152006042003'}</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-2">
            Dokumen ini dihasilkan secara sah melalui Aplikasi HALO JASPEL — Validasi digital BLUD {hospitalProfile.hospitalName}.
          </div>

        </div>

      </div>
    </div>
  );
};
