const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove imports of deleted components and services
code = code.replace(/import \{ RekapCetakManager \}.*\n/g, '');
code = code.replace(/import \{ ChangePasswordModal \}.*\n/g, '');
code = code.replace(/import \{ HospitalProfileModal.*\}.*\n/g, '');
code = code.replace(/import \{ LandingPage \}.*\n/g, '');
code = code.replace(/import \{ pushAllDataToSupabase.*\}.*\n/g, '');

// Add types import for HospitalProfile
code = code.replace(/import \{ formatRupiah \}/, "import { HospitalProfile, DEFAULT_HOSPITAL_PROFILE } from './types';\nimport { formatRupiah }");

// 2. Default viewMode to 'login'
code = code.replace(/useState<'landing' \| 'login' \| 'app'>\('landing'\)/, "useState<'landing' | 'login' | 'app'>('login')");

// 3. Remove LandingPage block
const landingPageRegex = /\/\/ 1\. VIEW MODE: LANDING PAGE[\s\S]*?if \(viewMode === 'landing'\) \{[\s\S]*?\}[\s\S]*?\/\/ 2\. VIEW MODE: LOGIN SCREEN/;
code = code.replace(landingPageRegex, '// 2. VIEW MODE: LOGIN SCREEN');

// 4. Remove RekapCetakManager JSX
const rekapCetakRegex = /\{\/\* TAB 0: REKAP PENERIMAAN & CETAK SEMUA TABEL \*\/\}[\s\S]*?activeTab === 'rekap_cetak' && \([\s\S]*?<RekapCetakManager[\s\S]*?\/\>[\s\S]*?\)\}/;
code = code.replace(rekapCetakRegex, '');

// 5. Remove ChangePasswordModal JSX
const changePasswordRegex = /\{\/\* 6\. Change Password Modal \*\/\}[\s\S]*?showChangePasswordModal && \([\s\S]*?<ChangePasswordModal[\s\S]*?\/\>[\s\S]*?\)\}/;
code = code.replace(changePasswordRegex, '');

// 6. Remove HospitalProfileModal JSX
const hospitalProfileRegex = /\{\/\* 6\.1 Hospital Profile Customization Modal[\s\S]*?showHospitalProfileModal && \([\s\S]*?<HospitalProfileModal[\s\S]*?\/\>[\s\S]*?\)\}/;
code = code.replace(hospitalProfileRegex, '');

// 7. Update fetchData block
const fetchDataRegex = /const res = await pullAllDataFromSupabase\(\);[\s\S]*?if \(res\.data\.hospitalProfile\) \{[\s\S]*?setHospitalProfile\(res\.data\.hospitalProfile\);[\s\S]*?\}[\s\S]*?\}/;
code = code.replace(fetchDataRegex, `const [
        { data: alokasi },
        { data: penerima },
        { data: genIdx },
        { data: cost },
        { data: revenue },
        { data: ijlData },
        { data: usr }
      ] = await Promise.all([
        supabase.from('alokasi_jaspel').select('*'),
        supabase.from('penerima_alokasi').select('*'),
        supabase.from('general_index').select('*'),
        supabase.from('cost_center').select('*'),
        supabase.from('revenue_center').select('*'),
        supabase.from('indeks_jasa_langsung').select('*'),
        supabase.from('users_rbac').select('*')
      ]);

      if (alokasi && alokasi.length > 0) setAlokasiList(alokasi);
      if (penerima && penerima.length > 0) setPenerimaList(penerima);
      if (genIdx && genIdx.length > 0) setGeneralIndexList(genIdx);
      if (cost && cost.length > 0) setCostCenterList(cost);
      if (revenue && revenue.length > 0) setRevenueCenterList(revenue);
      if (ijlData && ijlData.length > 0) setIndeksJasaList(ijlData);
      if (usr && usr.length > 0) setUsers(usr);`);

// 8. Remove the auto-push effect because pushAllDataToSupabase is deleted
const autoPushRegex = /\/\/ Auto-push to Supabase whenever changes are made & saved[\s\S]*?const timer = setTimeout\(async \(\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?\}[\s\S]*?\}, 3000\);[\s\S]*?return \(\) => clearTimeout\(timer\);[\s\S]*?\}, \[alokasiList, penerimaList, generalIndexList, costCenterList, revenueCenterList, indeksJasaList, users, hospitalProfile\]\);/;
code = code.replace(autoPushRegex, '');


fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched successfully.');
