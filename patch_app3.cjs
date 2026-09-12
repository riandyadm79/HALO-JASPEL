const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// remove initial connection check effect
const connectionEffect = /\/\/ Auto-check Supabase Connection on initial app load[\s\S]*?\}, \[\]\);/;
code = code.replace(connectionEffect, '');

// fix isFetchingRef reference
code = code.replace(/isFetchingRef\.current = true;/g, '');
code = code.replace(/isFetchingRef\.current = false;/g, '');

// fix handleSeedDatabase
code = code.replace(/const result = await seedDatabase\(\);[\s\S]*?if \(result\.success\) \{/g, `await seedDatabase();\n    if (true) {`);
code = code.replace(/showToast\('Gagal sinkronisasi: ' \+ \(result\.error as Error\)\.message\);/g, `showToast('Gagal sinkronisasi');`);

// fix handlePushCloud and handlePullCloud
const pushPullRegex = /\/\/ Push Trigger Handler[\s\S]*?const handlePullCloud = async \(\) => \{[\s\S]*?\} catch \(e: any\) \{[\s\S]*?\} finally \{[\s\S]*?\}[\s\S]*?\};/g;
code = code.replace(pushPullRegex, '');

fs.writeFileSync('src/App.tsx', code);
