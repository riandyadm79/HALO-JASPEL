import React from 'react';
import { formatRupiah } from '../utils/calculations';

interface CurrencyInputProps {
  id?: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = '0',
  className = '',
  helperText,
  min = 0,
  max,
  step = 1000
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal === '' ? 0 : parseInt(rawVal, 10);
    onChange(num);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-400 font-semibold text-xs">Rp</span>
        </div>
        <input
          type="text"
          id={id}
          inputMode="numeric"
          required={required}
          disabled={disabled}
          value={value ? new Intl.NumberFormat('id-ID').format(value) : ''}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition ${className}`}
        />
      </div>
      <div className="flex items-center justify-between mt-1 px-0.5">
        <span className="text-[11px] font-bold text-amber-400 font-mono tracking-tight">
          {formatRupiah(value || 0)}
        </span>
        {helperText && (
          <span className="text-[10px] text-slate-400">{helperText}</span>
        )}
      </div>
    </div>
  );
};
