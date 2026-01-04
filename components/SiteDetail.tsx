
import React, { useState, useEffect, useRef } from 'react';
import { Site, SiteStatus, PaymentRecord, SiteDimensions } from '../types';
import { CurrencyFormatter, NumberFormatter } from './Formatters';
import { getSiteReport } from '../services/geminiService';
import { paymentService } from '../services/supabaseService';
import { SQFT_TO_CENTS } from '../constants';

interface SiteDetailProps {
  site: Site;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Site>) => void;
  autoEdit?: boolean;
}

const SiteDetail: React.FC<SiteDetailProps> = ({ site, onClose, onDelete, onUpdate, autoEdit }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Site>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'payments'>('info');
  
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReport = async () => {
    setIsLoadingReport(true);
    const report = await getSiteReport(site);
    setAiReport(report);
    setIsLoadingReport(false);
  };

  useEffect(() => {
    fetchReport();
    setActiveTab('info');
    if (autoEdit) {
      setEditData({ ...site });
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setEditData({});
    }
  }, [site.id, autoEdit]);

  const handleStartEdit = () => {
    setEditData({ ...site });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleConfirmSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const updateField = (field: keyof Site, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Fix: Implemented handleImageUpload to handle media uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const newImageUrls = await Promise.all(filePromises);
    onUpdate({ imageUrls: [...(site.imageUrls || []), ...newImageUrls] });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fix: Implemented removeImage to handle media deletion
  const removeImage = (index: number) => {
    const newImages = [...(site.imageUrls || [])];
    newImages.splice(index, 1);
    onUpdate({ imageUrls: newImages });
  };

  const updateDimension = (dim: keyof SiteDimensions, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updatedDims = {
      ...(editData.dimensions || site.dimensions),
      [dim]: numValue
    };
    
    // Average side calculation for area estimation
    const avgWidth = (updatedDims.north + updatedDims.south) / 2;
    const avgHeight = (updatedDims.east + updatedDims.west) / 2;
    const calculatedArea = avgWidth * avgHeight;
    
    setEditData(prev => ({
      ...prev,
      dimensions: updatedDims,
      landAreaSqFt: calculatedArea
    }));
  };

  const totalPaid = (site.payments || []).reduce((sum, p) => sum + p.amount, 0);

  const currentLandArea = isEditing ? (editData.landAreaSqFt ?? site.landAreaSqFt) : site.landAreaSqFt;
  const currentLandRate = isEditing ? (editData.landCostPerSqFt ?? site.landCostPerSqFt) : site.landCostPerSqFt;
  const currentConstArea = isEditing ? (editData.constructionAreaSqFt ?? site.constructionAreaSqFt) : site.constructionAreaSqFt;
  const currentConstRate = isEditing ? (editData.constructionRatePerSqFt ?? site.constructionRatePerSqFt) : site.constructionRatePerSqFt;
  
  const landTotal = currentLandArea * currentLandRate;
  const constructionTotal = currentConstArea * currentConstRate;
  const projectedTotalValue = landTotal + constructionTotal;
  const balanceDue = projectedTotalValue - totalPaid;

  const currentDims = isEditing ? (editData.dimensions || site.dimensions) : site.dimensions;

  const getStatusBranding = (status: SiteStatus) => {
    switch(status) {
      case SiteStatus.SOLD: return 'bg-red-500 text-white ring-red-200';
      case SiteStatus.BOOKED: return 'bg-amber-500 text-white ring-amber-200';
      case SiteStatus.UNSOLD: return 'bg-emerald-500 text-white ring-emerald-200';
      default: return 'bg-slate-500 text-white ring-slate-200';
    }
  };

  return (
    <div className="bg-white lg:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 h-full flex flex-col max-w-full print:border-none print:shadow-none">
      {/* Header Section */}
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button onClick={onClose} className="lg:hidden p-2 -ml-2 hover:bg-white/10 rounded-full"><i className="fas fa-arrow-left"></i></button>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl hidden sm:flex items-center justify-center shadow-lg shrink-0"><i className="fas fa-home"></i></div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input 
                type="text" 
                value={editData.number} 
                onChange={e => updateField('number', e.target.value)}
                className="bg-slate-800 text-white font-black text-xl uppercase outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 w-full"
              />
            ) : (
              <h2 className="text-xl font-black tracking-tight uppercase truncate">Site {site.number}</h2>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4 shrink-0">
          {!isEditing ? (
            <button onClick={handleStartEdit} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white border border-white/5 flex items-center gap-2 transition-all">
              <i className="fas fa-edit text-xs"></i>
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Edit</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleConfirmSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Save</button>
              <button onClick={handleCancelEdit} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
        <button onClick={() => setActiveTab('info')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Overview</button>
        <button onClick={() => setActiveTab('media')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'media' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Media</button>
        <button onClick={() => setActiveTab('payments')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'payments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Ledger</button>
      </div>

      <div className="overflow-y-auto flex-1 bg-slate-50/50 p-6 space-y-6">
        {activeTab === 'info' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Financial Hero */}
            <section className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Projected Total Value</p>
                    <div className="text-3xl font-black"><CurrencyFormatter value={projectedTotalValue} /></div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusBranding(site.status)}`}>
                    {site.status}
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                 <div>
                   <span className="text-slate-500 text-[9px] font-black uppercase">Balance</span>
                   <p className="text-lg font-bold"><CurrencyFormatter value={balanceDue} /></p>
                 </div>
                 <div className="text-right">
                   <span className="text-slate-500 text-[9px] font-black uppercase">Collected</span>
                   <p className="text-lg font-bold text-emerald-400"><CurrencyFormatter value={totalPaid} /></p>
                 </div>
               </div>
            </section>

            {/* Financial Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Costing</h3>
              
              {/* Land Details */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Land Costing</p>
                  <div className="flex items-baseline gap-2">
                    {isEditing ? (
                      <input type="number" value={currentLandRate} onChange={e => updateField('landCostPerSqFt', parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold" />
                    ) : (
                      <span className="text-sm font-black"><CurrencyFormatter value={currentLandRate} /></span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400">/ SqFt</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Land Subtotal</p>
                  <p className="text-sm font-black text-slate-800"><CurrencyFormatter value={landTotal} /></p>
                </div>
              </div>

              {/* Construction Details */}
              <div className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Construction Costing</p>
                  <div className="flex items-baseline gap-2">
                    {isEditing ? (
                      <input type="number" value={currentConstRate} onChange={e => updateField('constructionRatePerSqFt', parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold" />
                    ) : (
                      <span className="text-sm font-black text-indigo-700"><CurrencyFormatter value={currentConstRate} /></span>
                    )}
                    <span className="text-[10px] font-bold text-indigo-300">/ SqFt</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Building Subtotal</p>
                  <p className="text-sm font-black text-indigo-800"><CurrencyFormatter value={constructionTotal} /></p>
                </div>
              </div>
            </div>

            {/* Area Metrics */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimension & Area</h3>
                <div className="flex gap-2">
                   <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                     {currentLandArea.toFixed(0)} SqFt
                   </div>
                   <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                     {(currentLandArea / SQFT_TO_CENTS).toFixed(2)} Cents
                   </div>
                </div>
              </div>

              {/* Editable Dimensions */}
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="space-y-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase">North / South (ft)</label>
                     <div className="flex gap-2">
                       <input type="number" placeholder="N" value={currentDims.north} onChange={e => updateDimension('north', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                       <input type="number" placeholder="S" value={currentDims.south} onChange={e => updateDimension('south', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                     </div>
                   </div>
                   <div className="space-y-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase">East / West (ft)</label>
                     <div className="flex gap-2">
                       <input type="number" placeholder="E" value={currentDims.east} onChange={e => updateDimension('east', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                       <input type="number" placeholder="W" value={currentDims.west} onChange={e => updateDimension('west', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                     </div>
                   </div>
                   <div className="col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                     <i className="fas fa-calculator text-amber-500"></i>
                     <p className="text-[10px] font-bold text-amber-700 italic">Area is auto-calculated based on dimension averages.</p>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {['north', 'south', 'east', 'west'].map(d => (
                    <div key={d} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase">{d}</p>
                      <p className="text-sm font-black text-slate-800">{(currentDims as any)[d]}'</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Building Area Edit */}
              <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Building Built-up Area</label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input type="number" value={currentConstArea} onChange={e => updateField('constructionAreaSqFt', parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase">SqFt</span>
                    </div>
                  ) : (
                    <span className="text-sm font-black text-indigo-800">{currentConstArea.toLocaleString()} SqFt</span>
                  )}
                </div>
              </div>
            </div>

            {aiReport && (
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-robot text-emerald-600"></i>
                  <span className="text-[10px] font-black uppercase text-emerald-600">AI Report</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{aiReport}"</p>
              </div>
            )}
          </div>
        ) : activeTab === 'media' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Assets</h3>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                    <i className="fas fa-plus"></i> Upload
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {(site.imageUrls || []).map((url, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Balance</p>
              <p className="text-4xl font-black"><CurrencyFormatter value={balanceDue} /></p>
            </div>
            
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Record New Payment</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const amountNum = parseFloat(paymentAmount);
                if (isNaN(amountNum) || amountNum <= 0) return;
                const newPayment: Omit<PaymentRecord, 'id'> = {
                  amount: amountNum,
                  date: paymentDate,
                  method: paymentMethod
                };
                const paymentId = await paymentService.create(site.id, newPayment);
                if (paymentId) {
                  setPaymentAmount('');
                  onUpdate({});
                }
              }} className="space-y-4">
                <div className="relative">
                  <i className="fas fa-indian-rupee-sign absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input required type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-4 rounded-2xl outline-none font-black text-lg" placeholder="Amount" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold" />
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold">
                    <option>Bank Transfer</option><option>Cash</option><option>Online/UPI</option><option>Cheque</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest shadow-xl">Post Payment</button>
              </form>
            </section>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <button onClick={onDelete} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-red-100">
          Archive Registry
        </button>
      </div>
    </div>
  );
};

export default SiteDetail;
