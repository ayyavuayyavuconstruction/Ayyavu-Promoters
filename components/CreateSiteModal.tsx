
import React, { useState, useEffect } from 'react';
import { Site, SiteStatus, SiteDimensions } from '../types';
import { SQFT_TO_CENTS } from '../constants';

interface CreateSiteModalProps {
  onClose: () => void;
  onSave: (site: Omit<Site, 'id'>) => void;
}

const CreateSiteModal: React.FC<CreateSiteModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    number: '',
    status: SiteStatus.UNSOLD,
    facing: 'North',
    dimensions: { north: 30, south: 30, east: 40, west: 40 },
    landAreaSqFt: 1200,
    landCostPerSqFt: 0,
    constructionAreaSqFt: 0,
    constructionRatePerSqFt: 0,
    customerName: '',
    customerPhone: '',
    tags: [] as string[],
    imageUrls: [] as string[],
  });

  // Re-calculate land area whenever dimensions change
  useEffect(() => {
    const avgWidth = (formData.dimensions.north + formData.dimensions.south) / 2;
    const avgHeight = (formData.dimensions.east + formData.dimensions.west) / 2;
    const calculatedArea = avgWidth * avgHeight;
    setFormData(prev => ({ ...prev, landAreaSqFt: calculatedArea }));
  }, [formData.dimensions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateDimension = (dim: keyof SiteDimensions, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dim]: numValue }
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Register New Unit</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Configure Site Parameters</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Primary Details */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Identity & Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Unit Identifier</label>
                  <input required type="text" placeholder="e.g. S-401" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as SiteStatus })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none font-bold">
                      <option value={SiteStatus.UNSOLD}>Unsold</option>
                      <option value={SiteStatus.BOOKED}>Booked</option>
                      <option value={SiteStatus.SOLD}>Sold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Facing</label>
                    <select value={formData.facing} onChange={e => setFormData({ ...formData, facing: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none font-bold">
                      <option>North</option><option>South</option><option>East</option><option>West</option>
                      <option>North-East</option><option>North-West</option><option>South-East</option><option>South-West</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Measurement Box */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Dimension Registry (ft)</h3>
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-4 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase">North</label>
                    <input type="number" value={formData.dimensions.north} onChange={e => updateDimension('north', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase">South</label>
                    <input type="number" value={formData.dimensions.south} onChange={e => updateDimension('south', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase">East</label>
                    <input type="number" value={formData.dimensions.east} onChange={e => updateDimension('east', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase">West</label>
                    <input type="number" value={formData.dimensions.west} onChange={e => updateDimension('west', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Area Detail Metrics */}
            <div className="md:col-span-2 space-y-5 pt-4 border-t border-slate-100">
               <div className="flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Area & Financial Metrics</h3>
                 <div className="flex gap-2">
                   <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">{formData.landAreaSqFt.toFixed(0)} SqFt</div>
                   <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">{(formData.landAreaSqFt / SQFT_TO_CENTS).toFixed(2)} Cents</div>
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Land Rate / SqFt</label>
                    <input type="number" value={formData.landCostPerSqFt} onChange={e => setFormData({ ...formData, landCostPerSqFt: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Land Subtotal</label>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-500">
                      ₹{(formData.landAreaSqFt * formData.landCostPerSqFt).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Building Area (SqFt)</label>
                    <input type="number" value={formData.constructionAreaSqFt} onChange={e => setFormData({ ...formData, constructionAreaSqFt: parseFloat(e.target.value) || 0 })} className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Const Rate / SqFt</label>
                    <input type="number" value={formData.constructionRatePerSqFt} onChange={e => setFormData({ ...formData, constructionRatePerSqFt: parseFloat(e.target.value) || 0 })} className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 font-bold" />
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
              <i className="fas fa-save"></i> Save Registry
            </button>
            <button type="button" onClick={onClose} className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-xs">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSiteModal;
