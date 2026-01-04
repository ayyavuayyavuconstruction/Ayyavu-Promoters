import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, Site, SiteStatus, CompanySettings } from './types';
import { SQFT_TO_CENTS } from './constants';
import SiteDetail from './components/SiteDetail';
import CreateSiteModal from './components/CreateSiteModal';
import CreateProjectModal from './components/CreateProjectModal';
import CompanySettingsModal from './components/CompanySettingsModal';
import ExportModal from './components/ExportModal';
import { CurrencyFormatter } from './components/Formatters';
import { getProjectOverview } from './services/geminiService';
import { projectService, companySettingsService, siteService } from './services/supabaseService';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'ESTATENEXUS',
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isEditingSelectedSite, setIsEditingSelectedSite] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SiteStatus | 'ALL'>('ALL');
  const [activeMenuSiteId, setActiveMenuSiteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [loadedProjects, loadedSettings] = await Promise.all([
      projectService.getAll(),
      companySettingsService.get()
    ]);

    setProjects(loadedProjects);
    if (loadedSettings) {
      setCompanySettings(loadedSettings);
    }

    if (loadedProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(loadedProjects[0].id);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuSiteId(null);
      setIsProjectDropdownOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === selectedProjectId) || null,
  [projects, selectedProjectId]);

  const selectedSite = useMemo(() =>
    selectedProject?.sites.find(s => s.id === selectedSiteId) || null,
  [selectedProject, selectedSiteId]);

  const projectFinancials = useMemo(() => {
    if (!selectedProject) return { totalLand: 0, totalConstruction: 0, totalProjected: 0 };

    return selectedProject.sites.reduce((acc, site) => {
      const landVal = site.landAreaSqFt * site.landCostPerSqFt;
      const constVal = site.constructionAreaSqFt * site.constructionRatePerSqFt;
      const baseVal = landVal + constVal;
      const profit = baseVal * ((site.profitMarginPercentage || 0) / 100);
      const totalVal = baseVal + profit;

      return {
        totalLand: acc.totalLand + landVal,
        totalConstruction: acc.totalConstruction + constVal,
        totalProjected: acc.totalProjected + totalVal
      };
    }, { totalLand: 0, totalConstruction: 0, totalProjected: 0 });
  }, [selectedProject]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id);
    setSelectedSiteId(null);
    setIsEditingSelectedSite(false);
    setIsProjectDropdownOpen(false);
    setAiSummary(null);
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  const handleCreateProject = async (data: Omit<Project, 'id' | 'sites'>) => {
    const newId = await projectService.create(data);
    if (newId) {
      await loadData();
      setSelectedProjectId(newId);
    }
    setIsCreateProjectModalOpen(false);
  };

  const handleUpdateProjectDetails = async (data: Omit<Project, 'id' | 'sites'>) => {
    if (!editingProject) return;
    const success = await projectService.update(editingProject.id, data);
    if (success) {
      await loadData();
    }
    setIsCreateProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleUpdateSite = useCallback(async (siteId: string, updates: Partial<Site>) => {
    const success = await siteService.update(siteId, updates);
    if (success) {
      await loadData();
    }
  }, []);

  const handleAddSite = async (newSiteData: Omit<Site, 'id'>) => {
    if (!selectedProjectId) return;
    const newId = await siteService.create(selectedProjectId, newSiteData);
    if (newId) {
      await loadData();
      setSelectedSiteId(newId);
    }
    setIsCreateModalOpen(false);
    setIsEditingSelectedSite(false);
  };

  const handleDeleteSite = useCallback(async (siteId: string) => {
    if (!confirm("Delete this site registry?")) return;
    const success = await siteService.delete(siteId);
    if (success) {
      await loadData();
      setSelectedSiteId(null);
    }
  }, []);

  const handleUpdateCompanySettings = async (settings: CompanySettings) => {
    const success = await companySettingsService.update(settings);
    if (success) {
      setCompanySettings(settings);
    }
    setIsCompanyModalOpen(false);
  };

  const fetchAiSummary = useCallback(async () => {
    if (!selectedProject) return;
    setIsLoadingSummary(true);
    const summary = await getProjectOverview(selectedProject);
    setAiSummary(summary);
    setIsLoadingSummary(false);
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) fetchAiSummary();
  }, [selectedProjectId, fetchAiSummary]);

  const filteredSites = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.sites.filter(site => {
      const matchesSearch = site.number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || site.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [selectedProject, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col print:bg-white bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl">
              <i className="fas fa-city"></i>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{companySettings.name}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsCompanyModalOpen(true)} className="p-3 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
              <i className="fas fa-cog"></i>
            </button>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsProjectDropdownOpen(!isProjectDropdownOpen); }}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all font-bold border ${isProjectDropdownOpen ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-900 text-white border-slate-900'} shadow-lg`}
              >
                <i className="fas fa-layer-group"></i>
                <span className="max-w-[150px] truncate">{selectedProject ? selectedProject.name : 'Select Project'}</span>
                <i className={`fas fa-chevron-down text-[10px] transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              {isProjectDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-200 py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-5 py-3 flex justify-between items-center border-b mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Project Hub</span>
                    <button onClick={() => { setIsCreateProjectModalOpen(true); setIsProjectDropdownOpen(false); }} className="text-indigo-600 text-[10px] font-black uppercase hover:bg-indigo-50 px-2 py-1 rounded-lg">+ Create New</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {projects.map(project => (
                      <button key={project.id} onClick={() => handleProjectSelect(project)} className={`w-full text-left px-5 py-3 hover:bg-slate-50 flex flex-col transition-colors ${selectedProjectId === project.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''}`}>
                        <span className="font-black text-sm text-slate-800">{project.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{project.location}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 no-print overflow-hidden">
        {!selectedProject ? (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <i className="fas fa-folder-open text-6xl text-slate-200 mb-6"></i>
            <h2 className="text-3xl font-black text-slate-900 mb-4">No Projects Selected</h2>
            <p className="text-slate-500 max-w-sm mb-8">Please select an existing project from the dropdown or initiate a new project to start managing sites.</p>
            <button onClick={() => setIsCreateProjectModalOpen(true)} className="px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all">START NEW PROJECT</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-4 space-y-6 overflow-y-auto pb-10 scrollbar-hide">
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                {selectedProject.imageUrls && selectedProject.imageUrls.length > 0 ? (
                  <div className="relative h-48 w-full group overflow-hidden">
                    <img src={selectedProject.imageUrls[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={selectedProject.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <button
                      onClick={() => { setEditingProject(selectedProject); setIsCreateProjectModalOpen(true); }}
                      className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                ) : (
                  <div className="h-48 bg-slate-100 flex items-center justify-center relative group">
                    <i className="fas fa-image text-4xl text-slate-200"></i>
                    <button
                      onClick={() => { setEditingProject(selectedProject); setIsCreateProjectModalOpen(true); }}
                      className="absolute inset-0 flex items-center justify-center bg-indigo-600/0 hover:bg-indigo-600/20 transition-all text-white font-black uppercase tracking-widest text-[10px] opacity-0 hover:opacity-100"
                    >
                      Add Image
                    </button>
                  </div>
                )}

                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-slate-900 leading-none mb-2 break-words">{selectedProject.name}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <i className="fas fa-map-marker-alt text-indigo-500"></i> {selectedProject.location}
                      </p>
                    </div>
                    <button onClick={() => setIsExportModalOpen(true)} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shrink-0 ml-4"><i className="fas fa-file-export"></i></button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-600 text-[10px] font-black uppercase">Active Units</span>
                      <span className="text-2xl font-black text-slate-900">{selectedProject.sites.length}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 bg-red-50 rounded-2xl text-center border border-red-100">
                        <p className="text-[8px] font-black text-red-400 uppercase mb-1">Sold</p>
                        <p className="text-2xl font-black text-red-600">{selectedProject.sites.filter(s => s.status === SiteStatus.SOLD).length}</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-2xl text-center border border-amber-100">
                        <p className="text-[8px] font-black text-amber-400 uppercase mb-1">Booked</p>
                        <p className="text-2xl font-black text-amber-600">{selectedProject.sites.filter(s => s.status === SiteStatus.BOOKED).length}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl text-center border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Open</p>
                        <p className="text-2xl font-black text-emerald-600">{selectedProject.sites.filter(s => s.status === SiteStatus.UNSOLD).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 text-white space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                    <i className="fas fa-wallet text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Project Financials</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Cumulative Portfolio Value</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Projected Total Valuation</p>
                      <div className="text-3xl font-black text-white"><CurrencyFormatter value={projectFinancials.totalProjected} /></div>
                    </div>
                    <div className="h-10 w-1 bg-indigo-500 rounded-full opacity-20"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Land Value</p>
                      <div className="text-sm font-black text-white"><CurrencyFormatter value={projectFinancials.totalLand} /></div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Construction</p>
                      <div className="text-sm font-black text-white"><CurrencyFormatter value={projectFinancials.totalConstruction} /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                {selectedSite && (
                  <SiteDetail
                    site={selectedSite}
                    onClose={() => { setSelectedSiteId(null); setIsEditingSelectedSite(false); }}
                    onDelete={() => handleDeleteSite(selectedSite.id)}
                    onUpdate={(updates) => handleUpdateSite(selectedSite.id, updates)}
                    autoEdit={isEditingSelectedSite}
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 h-full overflow-y-auto">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10 border-b border-slate-50 pb-10">
                  <div className="flex items-center gap-6">
                    <h3 className="text-3xl font-black text-slate-900">Inventory Registry</h3>
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-xl uppercase tracking-widest hover:bg-indigo-700 transition-all shrink-0">+ New Unit</button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shadow-inner shrink-0 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === 'ALL' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setStatusFilter(SiteStatus.UNSOLD)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === SiteStatus.UNSOLD ? 'bg-emerald-500 shadow-md text-white' : 'text-slate-400 hover:text-emerald-500'}`}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setStatusFilter(SiteStatus.BOOKED)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === SiteStatus.BOOKED ? 'bg-amber-500 shadow-md text-white' : 'text-slate-400 hover:text-amber-500'}`}
                      >
                        Booked
                      </button>
                      <button
                        onClick={() => setStatusFilter(SiteStatus.SOLD)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === SiteStatus.SOLD ? 'bg-red-500 shadow-md text-white' : 'text-slate-400 hover:text-red-500'}`}
                      >
                        Sold
                      </button>
                    </div>

                    <div className="relative flex-1 sm:w-64">
                      <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input
                        type="text"
                        placeholder="Search unit IDs..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-100 rounded-2xl bg-slate-50 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                  {filteredSites.length > 0 ? filteredSites.map(site => (
                    <div key={site.id} className="relative group">
                      <button
                        onClick={() => { setSelectedSiteId(site.id); setIsEditingSelectedSite(false); }}
                        className={`w-full aspect-square flex flex-col items-center justify-center p-4 rounded-[2.5rem] border-2 transition-all relative overflow-hidden ${selectedSiteId === site.id ? 'ring-8 ring-indigo-50 border-indigo-600 scale-105 z-20 shadow-2xl' : 'border-slate-50 hover:shadow-lg'} ${site.status === SiteStatus.SOLD ? 'bg-red-50 text-red-700' : site.status === SiteStatus.BOOKED ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}
                      >
                        <span className="text-[8px] font-black uppercase opacity-40 mb-1">Unit</span>
                        <span className="text-2xl font-black">{site.number}</span>
                      </button>

                      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveMenuSiteId(activeMenuSiteId === site.id ? null : site.id); }}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md text-slate-400 hover:text-indigo-600 transition-all"
                        >
                          <i className="fas fa-ellipsis-v text-xs"></i>
                        </button>
                        {activeMenuSiteId === site.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedSiteId(site.id); setIsEditingSelectedSite(false); setActiveMenuSiteId(null); }}
                              className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                            >
                              <i className="fas fa-eye text-indigo-500"></i> View Registry
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedSiteId(site.id); setIsEditingSelectedSite(true); setActiveMenuSiteId(null); }}
                              className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                            >
                              <i className="fas fa-edit text-amber-500"></i> Quick Edit
                            </button>
                            <div className="h-px bg-slate-50 my-1 mx-2"></div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSite(site.id); setActiveMenuSiteId(null); }}
                              className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                              <i className="fas fa-trash-alt"></i> Delete Site
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                        <i className="fas fa-search text-3xl"></i>
                      </div>
                      <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest">No Matches Found</h4>
                      <p className="text-slate-300 text-sm font-bold mt-2">Try adjusting your filters or search query.</p>
                      <button onClick={() => { setStatusFilter('ALL'); setSearchQuery(''); }} className="mt-6 text-indigo-600 text-xs font-black uppercase hover:underline">Clear all filters</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedSite && (
        <div className="lg:hidden fixed inset-0 z-[100] no-print">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setSelectedSiteId(null); setIsEditingSelectedSite(false); }}></div>
          <div className="absolute right-0 top-0 h-full w-[94%] bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden rounded-l-[3rem]">
            <SiteDetail
              site={selectedSite}
              onClose={() => { setSelectedSiteId(null); setIsEditingSelectedSite(false); }}
              onDelete={() => handleDeleteSite(selectedSite.id)}
              onUpdate={(updates) => handleUpdateSite(selectedSite.id, updates)}
              autoEdit={isEditingSelectedSite}
            />
          </div>
        </div>
      )}

      {isCreateModalOpen && <CreateSiteModal onClose={() => setIsCreateModalOpen(false)} onSave={handleAddSite} />}
      {isCreateProjectModalOpen && <CreateProjectModal onClose={() => { setIsCreateProjectModalOpen(false); setEditingProject(null); }} onSave={editingProject ? handleUpdateProjectDetails : handleCreateProject} editingProject={editingProject} />}
      {isCompanyModalOpen && <CompanySettingsModal settings={companySettings} onSave={handleUpdateCompanySettings} onClose={() => setIsCompanyModalOpen(false)} />}
      {isExportModalOpen && selectedProject && <ExportModal project={selectedProject} filteredSites={filteredSites} onClose={() => setIsExportModalOpen(false)} />}
    </div>
  );
};

export default App;
