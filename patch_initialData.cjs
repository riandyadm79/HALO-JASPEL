const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf8');
code = code.replace(/unitKerja: /g, 'unit: ');
code = code.replace(/headerKinerja3: 'Skor Kinerja 3 \(Kedisiplinan \/ Tim\)',\n  formulaJpLangsung:/g, `headerKinerja3: 'Skor Kinerja 3 (Kedisiplinan / Tim)',\n  headerTotalPoin: 'Total Poin',\n  headerJumlahAlokasi: 'Jumlah Alokasi',\n  headerRupiahPerPoin1: 'Rp per Poin 1',\n  headerRupiahPerPoin2: 'Rp per Poin 2',\n  headerNilaiJpLangsung: 'Nilai JP Langsung',\n  formulaJpLangsung:`);
code = code.replace(/\{ id: 'p\d+', role: '([^']+)', /g, "{ id: 'p$1', roles: { $1: true }, name: 'Permission', category: 'Alokasi Jaspel', superadmin: false, perumus: false, pic: false, staf: false, description: '', ");
fs.writeFileSync('src/data/initialData.ts', code);
