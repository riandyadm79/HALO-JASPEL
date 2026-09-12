const fs = require('fs');
let code = fs.readFileSync('src/components/CurrencyInput.tsx', 'utf8');
code = code.replace(/interface CurrencyInputProps \{/, `interface CurrencyInputProps {
  label?: string;
  required?: boolean;
  placeholder?: string;`);
code = code.replace(/readOnly = false\n\}: CurrencyInputProps\) \{/, `readOnly = false,
  label,
  required = false,
  placeholder = "0"
}: CurrencyInputProps) {`);
code = code.replace(/placeholder="0"/, 'placeholder={placeholder}\n        required={required}');

// Wrap in label logic if provided
const returnRegex = /return \([\s\S]*?\);/;
code = code.replace(returnRegex, `return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500 sm:text-sm font-medium">Rp</span>
        </div>
        <input
          type="text"
          id={id}
          className={\`w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition \${className}\`}
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );`);

fs.writeFileSync('src/components/CurrencyInput.tsx', code);
