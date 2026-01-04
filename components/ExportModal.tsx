
import React, { useState } from 'react';
import { Project, Site, SiteStatus } from '../types';
import { SQFT_TO_CENTS } from '../constants';

interface ExportModalProps {
  project: Project;
  filteredSites: Site[];
  onClose: () => void;
}

interface ExportSettings {
  scope: 'all' | 'filtered';
  format: 'csv' | 'pdf';
  fields: {
    number: boolean;
    status: boolean;
    customer: boolean;
    facing: boolean;
    dimensions: boolean;
    area: boolean;
    financials: boolean;
  };
}

const ExportModal: React.FC<ExportModalProps> = ({ project, filteredSites, onClose }) => {
  const [settings, setSettings] = useState<ExportSettings>({
    scope: 'all',
    format: 'pdf',
    fields: {
      number: true,
      status: true,
      customer: true,
      facing: true,
      dimensions: true,
      area: true,
      financials: true,
    },
  });

  const toggleField = (field: keyof ExportSettings['fields']) => {
    setSettings(prev => ({
      ...prev,
      fields: { ...prev.fields, [field]: !prev.fields[field] }
    }));
  };

  const handleExport = () => {
    if (settings.format === 'pdf') {
      window.print();
      onClose();
      return;
    }

    const dataToExport = settings.scope === 'all' ? project.sites : filteredSites;
    
    // Header Row
    const headers: string[] = [];
    if (settings.fields.number) headers.push("Site Number");
    if (settings.fields.status) headers.push("Status");
    if (settings.fields.facing) headers.push("Facing");
    if (settings.fields.customer) {
      headers.push("Customer Name");
      headers.push("Customer Phone");
    }
    if (settings.fields.area) {
      headers.push("Area (SqFt)");
      headers.push("Area (Cents)");
    }
    if (settings.fields.dimensions) {
      headers.push("North (ft)");
      headers.push("South (ft)");
      headers.push("East (ft)");
      headers.push("West (ft)");
    }
    if (settings.fields.financials) {
      headers.push("Plot Rate/SqFt");
      headers.push("Plot Value");
      headers.push("Const Area");
      headers.push("Const Rate");
      headers.push("Const Value");
      headers.push("Base Value");
      headers.push("Profit Margin %");
      headers.push("Total Projected Value");
    }

    // Data Rows
    const rows = dataToExport.map(site => {
      const row: (string | number)[] = [];
      const landVal = site.landAreaSqFt * site.landCostPerSqFt;
      const constVal = site.constructionAreaSqFt * site.constructionRatePerSqFt;
      const baseVal = landVal + constVal;
      const profit = baseVal * ((site.profitMarginPercentage || 0) / 100);

      if (settings.fields.number) row.push(`"${site.number}"`);
      if (settings.fields.status) row.push(site.status);
      if (settings.fields.facing) row.push(site.facing);
      if (settings.fields.customer) {
        row.push(`"${site.customerName || 'N/A'}"`);
        row.push(`"${site.customerPhone || 'N/A'}"`);
      }
      if (settings.fields.area) {
        row.push(site.landAreaSqFt);
        row.push((site.landAreaSqFt / SQFT_TO_CENTS).toFixed(2));
      }
      if (settings.fields.dimensions) {
        row.push(site.dimensions.north);
        row.push(site.dimensions.south);
        row.push(site.dimensions.east);
        row.push(site.dimensions.west);
      }
      if (settings.fields.financials) {
        row.push(site.landCostPerSqFt);
        row.push(landVal);
        row.push(site.constructionAreaSqFt);
        row.push(site.constructionRatePerSqFt);
        row.push(constVal);
        row.push(baseVal);
        row.push(site.profitMarginPercentage || 0);
        row.push(baseVal + profit);
      }
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_Report_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fas fa-file-export text-8xl"></i>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight">Export Engine</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Configure Report Settings</p>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 hover:bg-white/10 p-2 rounded-full transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Format Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Output Format</h3>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
              <button onClick={() => setSettings(s => ({ ...s, format: 'pdf' }))} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${settings.format === 'pdf' ? 'bg-white shadow-lg text-indigo-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                <i className="fas fa-file-pdf"></i> PDF (Visual)
              </button>
              <button onClick={() => setSettings(s => ({ ...s, format: 'csv' }))} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${settings.format === 'csv' ? 'bg-white shadow-lg text-emerald-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                <i className="fas fa-file-csv"></i> CSV (Data)
              </button>
            </div>
          </div>

          {/* Scope Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Scope</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setSettings(s => ({ ...s, scope: 'all' }))} className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-1 items-start ${settings.scope === 'all' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                <span className={`text-sm font-black ${settings.scope === 'all' ? 'text-indigo-700' : 'text-slate-600'}`}>All Sites</span>
                <span className="text-[10px] font-bold text-slate-400">{project.sites.length} units</span>
              </button>
              <button onClick={() => setSettings(s => ({ ...s, scope: 'filtered' }))} className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-1 items-start ${settings.scope === 'filtered' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                <span className={`text-sm font-black ${settings.scope === 'filtered' ? 'text-indigo-700' : 'text-slate-600'}`}>Filtered Results</span>
                <span className="text-[10px] font-bold text-slate-400">{filteredSites.length} units</span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button onClick={handleExport} className={`flex-1 ${settings.format === 'pdf' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'} text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3`}>
              <i className={`fas ${settings.format === 'pdf' ? 'fa-download' : 'fa-file-csv'}`}></i>
              {settings.format === 'pdf' ? 'DOWNLOAD ALL AS PDF' : 'GENERATE CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
