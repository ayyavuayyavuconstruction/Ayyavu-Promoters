
import React, { useState, useRef } from 'react';
import { CompanySettings } from '../types';

interface CompanySettingsModalProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
  onClose: () => void;
}

const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [formData, setFormData] = useState<CompanySettings>({ 
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    ...settings 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("Logo file is too large. Please keep it under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-10 text-white relative">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <i className="fas fa-id-badge text-9xl"></i>
          </div>
          <h2 className="text-3xl font-black tracking-tighter">Corporate Identity</h2>
          <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Global System Branding</p>
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {/* Logo Upload */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all group overflow-hidden relative shadow-inner"
            >
              {formData.logoUrl ? (
                <img src={formData.logoUrl} className="w-full h-full object-contain p-4" alt="Logo preview" />
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-2xl text-slate-300 group-hover:text-indigo-400 transition-colors mb-2"></i>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center px-4">Upload Logo</span>
                </>
              )}
              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors"></div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <button 
              type="button" 
              onClick={() => setFormData({ ...formData, logoUrl: undefined })}
              className="mt-3 text-[9px] font-black text-red-500 uppercase hover:underline"
            >
              Reset to Default Icon
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Legal Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white font-black text-slate-800 transition-all"
                placeholder="e.g. Nexus Realty Group"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Location Details</h3>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white font-bold text-slate-800 transition-all"
                  placeholder="123 Corporate Way"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white font-bold text-slate-800 transition-all"
                    placeholder="Bangalore"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white font-bold text-slate-800 transition-all"
                    placeholder="KA"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ZIP</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={e => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white font-bold text-slate-800 transition-all"
                    placeholder="560001"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-save"></i>
              SAVE PROFILE
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySettingsModal;
