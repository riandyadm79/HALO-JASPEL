import React, { useState, useEffect } from 'react';
import { formatRupiah } from '../utils/calculations';

interface CurrencyInputProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  id,
  className = '',
  disabled = false,
  readOnly = false,
  label,
  required = false,
  placeholder = "0"
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(formatRupiah(value).replace('Rp ', ''));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue, 10);
    
    if (isNaN(numValue)) {
      setDisplayValue('');
      onChange(0);
    } else {
      setDisplayValue(numValue.toLocaleString('id-ID'));
      onChange(numValue);
    }
  };

  return (
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
          className={`w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${className}`}
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
}
