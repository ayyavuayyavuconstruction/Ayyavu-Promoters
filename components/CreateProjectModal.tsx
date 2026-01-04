
import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';

interface CreateProjectModalProps {
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'sites'>) => void;
  editingProject?: Project | null;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSave, editingProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    launchDate: new Date().toISOString().split('T')[0],
    imageUrls: [] as string[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name,
        location: editingProject.location,
        launchDate: editingProject.launchDate || new Date().toISOString().split('T')[0],
        imageUrls: editingProject.imageUrls || [],
      });
    }
  }, [editingProject]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image file is too large. Please keep it under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrls: [reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fas fa-city text-8xl"></i>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight">{editingProject ? 'Edit Project' : 'New Project'}</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Configure Project Parameters</p>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 hover:bg-white/10 p-2 rounded-full transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Project Image Upload */}
            <div className="flex flex-col items-center mb-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all group overflow-hidden relative"
              >
                {formData.imageUrls.length > 0 ? (
                  <img src={formData.imageUrls[0]} className="w-full h-full object-cover" alt="Project preview" />
                ) : (
                  <>
                    <i className="fas fa-camera text-3xl text-slate-300 group-hover:text-indigo-400 transition-colors mb-2"></i>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">Upload Project Representative Image</span>
                  </>
                )}
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors"></div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              {formData.imageUrls.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, imageUrls: [] })}
                  className="mt-2 text-[9px] font-black text-red-500 uppercase hover:underline"
                >
                  Remove Image
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Identity Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Emerald Garden Residency"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Geographic Location</label>
              <input
                required
                type="text"
                placeholder="e.g. Bangalore, KA"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Launch / Start Date</label>
              <input
                required
                type="date"
                value={formData.launchDate}
                onChange={e => setFormData({ ...formData, launchDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
            >
              <i className={`fas ${editingProject ? 'fa-check' : 'fa-plus'}`}></i>
              {editingProject ? 'UPDATE REGISTRY' : 'CREATE PROJECT'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
