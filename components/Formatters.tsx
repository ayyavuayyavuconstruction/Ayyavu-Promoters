
import React from 'react';

export const CurrencyFormatter: React.FC<{ value: number }> = ({ value }) => {
  const formattedValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
  
  return <span className="font-semibold text-slate-800">{formattedValue}</span>;
};

export const NumberFormatter: React.FC<{ value: number; decimals?: number }> = ({ value, decimals = 2 }) => {
  return <span className="font-semibold text-slate-800">{value.toLocaleString('en-IN', { maximumFractionDigits: decimals })}</span>;
};
