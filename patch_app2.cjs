const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const syncRegex = /\{\/\* TAB 4: SUPABASE RLS, PUSH\/PULL & STORAGE BUCKET \*\/\}[\s\S]*?activeTab === 'supabase' && \([\s\S]*?<SupabaseSyncManager[\s\S]*?\/\>[\s\S]*?\)\}/;
code = code.replace(syncRegex, '');
fs.writeFileSync('src/App.tsx', code);
