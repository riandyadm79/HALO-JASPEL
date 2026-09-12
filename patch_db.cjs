const fs = require('fs');
let code = fs.readFileSync('src/components/DatabaseManager.tsx', 'utf8');
code = code.replace(/<CurrencyInput\s*label=".*?"/g, '<CurrencyInput');
fs.writeFileSync('src/components/DatabaseManager.tsx', code);
