import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Building2, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Calendar,
  Filter,
  Search,
  Wallet
} from 'lucide-react';
import { AlokasiJaspel, PenerimaAlokasi, HospitalProfile, User } from '../types';
import { formatRupiah } from '../utils/calculations';
import { exportToXLSX, exportToCSV } from '../utils/exportImport';
import { useTheme } from '../context/ThemeContext';

interface RekapCetakManagerProps {
  alokasiList: AlokasiJaspel[];
  penerimaList: PenerimaAlokasi[];
  hospitalProfile: HospitalProfile;
  currentUser: User;
}

export const RekapCetakManager: React.FC<RekapCetakManagerProps> = ({
  alokasiList,
  penerimaList,
  hospitalProfile,
  currentUser
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedAlokasiId, setSelectedAlokasiId] = useState<string>(alokasiList[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Keep selected ID valid
  const currentAlokasi = useMemo(() => {
    return alokasiList.find(a => a.id === selectedAlokasiId) || alokasiList[0] || null;
  }, [alokasiList, selectedAlokasiId]);

  // Filter recipients for current period
  const recipientsForPeriod = useMemo(() => {
    if (!currentAlokasi) return [];
    return penerimaList.filter(p => p.alokasiId === currentAlokasi.id);
  }, [penerimaList, currentAlokasi]);

  const filteredRecipients = useMemo(() => {
    return recipientsForPeriod.filter(p => {
      const matchSearch = (p.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.unitKerja || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.jabatan || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || p.kategori === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [recipientsForPeriod, searchQuery, categoryFilter]);

  // Aggregate totals
  const totalNetto = useMemo(() => {
    return filteredRecipients.reduce((sum, p) => sum + (p.nettoDiterima || 0), 0);
  }, [filteredRecipients]);

  const totalBruto = useMemo(() => {
    return filteredRecipients.reduce((sum, p) => sum + (p.brutoJaspel || 0), 0);
  }, [filteredRecipients]);

  const totalPph = useMemo(() => {
    return filteredRecipients.reduce((sum, p) => sum + (p.potonganPph21 || 0), 0);
  }, [filteredRecipients]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c1633] border-blue-900/60 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Dokumen Resmi BLUD
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {hospitalProfile.hospitalName}
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Rekapitulasi & Cetak Remunerasi Jaspel
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-blue-200/80'}`}>
              Rekapitulasi resmi pencairan jasa pelayanan, rincian potongan PPh21, dan pengesahan Direktur BLUD.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Rekap</span>
            </button>

            {currentAlokasi && (
              <button
                onClick={() => exportToXLSX(currentAlokasi, filteredRecipients)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unduh Excel (XLSX)</span>
              </button>
            )}
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto mt-6 pt-4 border-t border-blue-900/40 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Pilih Periode:
          </span>
          {alokasiList.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAlokasiId(a.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                (currentAlokasi?.id === a.id)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {a.bulan} {a.tahun} ({a.status})
            </button>
          ))}
        </div>
      </div>

      {currentAlokasi ? (
        <>
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60'
            }`}>
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Pagu Netto Periode</span>
              <p className="text-xl font-black text-amber-400 mt-1">
                {formatRupiah(currentAlokasi.paguJaspelNetto)}
              </p>
              <span className="text-[10px] text-slate-500">{currentAlokasi.sumberDana}</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60'
            }`}>
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Netto Terdistribusi</span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {formatRupiah(totalNetto)}
              </p>
              <span className="text-[10px] text-slate-500">Dari {recipientsForPeriod.length} staf terdaftar</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60'
            }`}>
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Potongan PPh 21</span>
              <p className="text-xl font-black text-rose-400 mt-1">
                {formatRupiah(totalPph)}
              </p>
              <span className="text-[10px] text-slate-500">Pajak Negara BLUD</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c152d] border-blue-900/60'
            }`}>
              <span className="text-[10px] font-bold uppercase text-slate-400">Status Dokumen</span>
              <div className="mt-1">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  {currentAlokasi.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Kode: {currentAlokasi.kodePeriode}</span>
            </div>
          </div>

          {/* Table Container */}
          <div className={`p-5 rounded-3xl border shadow-xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0c152d] border-blue-900/60'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, unit, atau jabatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-2 pl-9 pr-4 rounded-xl text-xs font-medium border focus:outline-none ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900' 
                      : 'bg-slate-900/80 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-semibold">
                  {filteredRecipients.length} Staf Terdata
                </span>
              </div>
            </div>

            {filteredRecipients.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold">
                  Belum ada data rincian penerima di Supabase untuk periode {currentAlokasi.bulan} {currentAlokasi.tahun}.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Tambahkan rincian penerima melalui menu Alokasi Jaspel atau Impor data CSV/Excel.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'}`}>
                      <th className="py-3 px-3 font-bold">No</th>
                      <th className="py-3 px-3 font-bold">Nama Pegawai</th>
                      <th className="py-3 px-3 font-bold">Unit Kerja / Jabatan</th>
                      <th className="py-3 px-3 font-bold text-center">Skor Total</th>
                      <th className="py-3 px-3 font-bold text-right">Post Remunerasi</th>
                      <th className="py-3 px-3 font-bold text-right">Beban Kerja</th>
                      <th className="py-3 px-3 font-bold text-right">Bruto Total</th>
                      <th className="py-3 px-3 font-bold text-right">PPh 21</th>
                      <th className="py-3 px-3 font-bold text-right">Netto Diterima</th>
                      <th className="py-3 px-3 font-bold text-center">Adm %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredRecipients.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-blue-950/20 transition">
                        <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{p.nama}</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <div>{p.unitKerja}</div>
                          <div className="text-[10px] text-slate-400">{p.jabatan}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-amber-300 font-bold">{p.totalPoin}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatRupiah(p.jaspelPostRemunerasi || 0)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatRupiah(p.postPenyesuaianBebanKerja || 0)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">{formatRupiah(p.brutoJaspel)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-400">-{formatRupiah(p.potonganPph21)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">{formatRupiah(p.nettoDiterima)}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-emerald-300 font-bold">{p.persenAdministrasi || '0,00%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={`p-12 text-center rounded-3xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0c1633] border-blue-900/60'
        }`}>
          <p className="text-base font-bold text-slate-300">
            Belum ada periode alokasi jaspel di Supabase.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Silakan buat periode alokasi pertama melalui menu Alokasi Jaspel.
          </p>
        </div>
      )}
    </div>
  );
};
