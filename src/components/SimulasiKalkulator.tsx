import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Building2,
  Stethoscope
} from 'lucide-react';
import { formatRupiah, formatNumber } from '../utils/calculations';
import { AlokasiJaspel } from '../types';

interface SimulasiKalkulatorProps {
  onApplyToAlokasi?: (paguBaru: number, nilaiPoinBaru: number) => void;
}

export const SimulasiKalkulator: React.FC<SimulasiKalkulatorProps> = ({ onApplyToAlokasi }) => {
  // Input state
  const [totalPendapatanKotor, setTotalPendapatanKotor] = useState<number>(3500000000);
  const [biayaOperasional, setBiayaOperasional] = useState<number>(500000000);
  const [persentaseJaspel, setPersentaseJaspel] = useState<number>(44);
  const [totalPoinSDM, setTotalPoinSDM] = useState<number>(37500);

  // Group distributions (percentages of total Jaspel)
  const [distribusi, setDistribusi] = useState({
    manajemen: 8,       // Direksi & Struktural
    medisSpesialis: 42, // Dokter Spesialis & Umum
    keperawatan: 30,    // Perawat & Bidan
    penunjang: 12,      // Farmasi, Lab, Radiologi
    administrasi: 8     // Umum & Keuangan
  });

  // Sample estimated recipient counts
  const headcount = {
    manajemen: 6,
    medisSpesialis: 24,
    keperawatan: 120,
    penunjang: 45,
    administrasi: 35
  };

  // Math derivations
  const pendapatanBersih = Math.max(0, totalPendapatanKotor - biayaOperasional);
  const totalPaguJaspel = Math.round(pendapatanBersih * (persentaseJaspel / 100));
  const nilaiPerPoin = totalPoinSDM > 0 ? Math.round(totalPaguJaspel / totalPoinSDM) : 0;

  // Group allocations
  const alokasiManajemen = Math.round(totalPaguJaspel * (distribusi.manajemen / 100));
  const alokasiMedis = Math.round(totalPaguJaspel * (distribusi.medisSpesialis / 100));
  const alokasiKeperawatan = Math.round(totalPaguJaspel * (distribusi.keperawatan / 100));
  const alokasiPenunjang = Math.round(totalPaguJaspel * (distribusi.penunjang / 100));
  const alokasiAdministrasi = Math.round(totalPaguJaspel * (distribusi.administrasi / 100));

  const totalPersen = Object.values(distribusi).reduce((a: number, b: number) => a + b, 0);

  const resetToDefault = () => {
    setTotalPendapatanKotor(3500000000);
    setBiayaOperasional(500000000);
    setPersentaseJaspel(44);
    setTotalPoinSDM(37500);
    setDistribusi({
      manajemen: 8,
      medisSpesialis: 42,
      keperawatan: 30,
      penunjang: 12,
      administrasi: 8
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#172554] via-[#0f1d38] to-[#1e3a8a] rounded-3xl p-5 sm:p-7 border border-blue-700/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                SIMULASI & FORMULA SANDBOX
              </span>
              <span className="text-xs text-blue-200 font-medium">What-If Analysis & Estimasi Poin</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Kalkulator Simulasi Pagu Jasa Pelayanan
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl mt-1">
              Uji coba variabel pendapatan, beban operasional, dan proporsi jaspel untuk melihat dampaknya pada Nilai Rupiah per Poin SDM secara real-time.
            </p>
          </div>

          <button
            onClick={resetToDefault}
            className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-blue-950/80 hover:bg-blue-900 text-slate-200 border border-blue-800 text-xs font-bold transition shadow self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Default</span>
          </button>
        </div>

        {/* Live Key Metric Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-900/60">
          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Pagu Jaspel Tersedia</span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1 truncate">
              {formatRupiah(totalPaguJaspel)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {persentaseJaspel}% dari Pendapatan Bersih
            </p>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Nilai Rupiah / Poin SDM</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-mono truncate">
              {formatRupiah(nilaiPerPoin)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Membagi {formatNumber(totalPoinSDM)} akumulasi poin
            </p>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Status Validasi Distribusi</span>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${totalPersen === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPersen}% {totalPersen === 100 ? '• Sempurna' : '• Tidak Seimbang'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalPersen === 100 ? 'Siap diterapkan ke draft alokasi' : 'Total harus tepat 100%'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form & Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Input Variables */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-base font-black text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Parameter Keuangan Rumah Sakit</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-bold uppercase text-[10px]">
                  Total Pendapatan Kotor (Revenue)
                </label>
                <span className="font-mono text-emerald-400 font-bold">{formatRupiah(totalPendapatanKotor)}</span>
              </div>
              <input
                type="range"
                min="500000000"
                max="10000000000"
                step="50000000"
                value={totalPendapatanKotor}
                onChange={e => setTotalPendapatanKotor(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-bold uppercase text-[10px]">
                  Beban Operasional & Obat Medis (Cost Center)
                </label>
                <span className="font-mono text-rose-400 font-bold">{formatRupiah(biayaOperasional)}</span>
              </div>
              <input
                type="range"
                min="100000000"
                max="3000000000"
                step="50000000"
                value={biayaOperasional}
                onChange={e => setBiayaOperasional(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-bold uppercase text-[10px]">
                  Persentase Pagu Jasa Pelayanan BLUD
                </label>
                <span className="font-mono text-amber-400 font-black text-sm">{persentaseJaspel}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="60"
                step="1"
                value={persentaseJaspel}
                onChange={e => setPersentaseJaspel(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-bold uppercase text-[10px]">
                  Estimasi Total Poin SDM Rumah Sakit
                </label>
                <span className="font-mono text-white font-bold">{formatNumber(totalPoinSDM)} Poin</span>
              </div>
              <input
                type="range"
                min="10000"
                max="100000"
                step="500"
                value={totalPoinSDM}
                onChange={e => setTotalPoinSDM(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 mt-4">
              <h4 className="font-bold text-white text-xs">Proporsi Distribusi Antar Kelompok Profesi</h4>
              
              <div className="space-y-3 pt-2">
                {[
                  { key: 'medisSpesialis', label: 'Dokter Spesialis & Subspesialis', val: distribusi.medisSpesialis, color: 'text-amber-400' },
                  { key: 'keperawatan', label: 'Perawat, Bidan & Anestesi', val: distribusi.keperawatan, color: 'text-emerald-400' },
                  { key: 'penunjang', label: 'Penunjang Medis (Lab/Rad/Farmasi)', val: distribusi.penunjang, color: 'text-blue-400' },
                  { key: 'manajemen', label: 'Direksi & Manajemen Struktural', val: distribusi.manajemen, color: 'text-rose-400' },
                  { key: 'administrasi', label: 'Staf Administrasi & Teknis', val: distribusi.administrasi, color: 'text-slate-400' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.val}
                        onChange={e => setDistribusi({
                          ...distribusi,
                          [item.key]: Number(e.target.value)
                        })}
                        className="w-14 p-1 bg-slate-900 border border-slate-700 rounded-lg text-center font-bold text-white font-mono"
                      />
                      <span className="text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right: Projected Outcomes */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <PieChart className="w-5 h-5 text-amber-400" />
              <span>Proyeksi Dampak Remunerasi Kelompok</span>
            </h3>

            <div className="space-y-3 mt-4">
              {[
                { 
                  name: 'Medis & Dokter Spesialis', 
                  nominal: alokasiMedis, 
                  count: headcount.medisSpesialis, 
                  pct: distribusi.medisSpesialis,
                  color: 'bg-amber-400' 
                },
                { 
                  name: 'Keperawatan & Kebidanan', 
                  nominal: alokasiKeperawatan, 
                  count: headcount.keperawatan, 
                  pct: distribusi.keperawatan,
                  color: 'bg-emerald-400' 
                },
                { 
                  name: 'Penunjang Medis (Farmasi/Lab)', 
                  nominal: alokasiPenunjang, 
                  count: headcount.penunjang, 
                  pct: distribusi.penunjang,
                  color: 'bg-blue-400' 
                },
                { 
                  name: 'Direksi & Manajemen', 
                  nominal: alokasiManajemen, 
                  count: headcount.manajemen, 
                  pct: distribusi.manajemen,
                  color: 'bg-rose-400' 
                },
                { 
                  name: 'Staf Administrasi & Umum', 
                  nominal: alokasiAdministrasi, 
                  count: headcount.administrasi, 
                  pct: distribusi.administrasi,
                  color: 'bg-slate-400' 
                }
              ].map((grp) => {
                const rataRata = grp.count > 0 ? Math.round(grp.nominal / grp.count) : 0;
                return (
                  <div key={grp.name} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${grp.color}`} />
                        <span className="font-bold text-white">{grp.name}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400">
                        {formatRupiah(grp.nominal)} ({grp.pct}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Estimasi {grp.count} orang</span>
                      <span>Rata-rata: <strong className="text-white font-mono">{formatRupiah(rataRata)} / orang</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400 italic mb-3">
              Formula ini mematuhi standar remunerasi Permendagri & Kemenkes untuk fleksibilitas BLUD Rumah Sakit Daerah.
            </p>
            {onApplyToAlokasi && (
              <button
                onClick={() => onApplyToAlokasi(totalPaguJaspel, nilaiPerPoin)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center space-x-2"
              >
                <span>Terapkan Angka Simulasi Ini ke Draft Alokasi Aktif</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
