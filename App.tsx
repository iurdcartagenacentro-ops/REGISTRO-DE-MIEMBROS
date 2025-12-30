
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Member } from './types';
import { storageService } from './services/storageService';
import { exportService } from './services/exportService';
import { ICONS } from './constants';
import Dashboard from './components/Dashboard';
import MemberForm from './components/MemberForm';
import AISuggestions from './components/AISuggestions';
import { 
  Download, 
  Upload, 
  Database, 
  ShieldCheck, 
  Info, 
  Search, 
  Phone, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Printer,
  Image as ImageIcon
} from 'lucide-react';

// URL del logo oficial (Corazón con paloma)
const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Universal_Church_of_the_Kingdom_of_God_Logo.svg/1024px-Universal_Church_of_the_Kingdom_of_God_Logo.svg.png';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<'dashboard' | 'list' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const data = storageService.getMembers();
        setMembers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando miembros:", e);
        setMembers([]);
      }
    };
    loadData();
  }, []);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter(m => {
      const fullName = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
      const phone = (m.phone || '').toString();
      const group = (m.group || '').toLowerCase();
      const city = (m.ciudad || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || 
             phone.includes(query) || 
             group.includes(query) || 
             city.includes(query);
    });
  }, [members, searchQuery]);

  const handleAddMember = (member: Member) => {
    try {
      if (editingMember) {
        storageService.updateMember(member);
      } else {
        storageService.addMember(member);
      }
      setMembers(storageService.getMembers());
      setIsFormOpen(false);
      setEditingMember(undefined);
      if (selectedMember?.id === member.id) setSelectedMember(member);
    } catch (e) {
      alert("Error al guardar el miembro. Por favor intente de nuevo.");
    }
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro permanentemente?')) {
      storageService.deleteMember(id);
      setMembers(storageService.getMembers());
      if (selectedMember?.id === id) setSelectedMember(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await storageService.importData(file);
      if (success) {
        alert('Base de datos importada con éxito.');
        setMembers(storageService.getMembers());
      } else {
        alert('Error: El archivo no es válido.');
      }
    }
  };

  const SidebarItem: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-red-700 text-white shadow-xl shadow-red-200 translate-x-1' : 'text-slate-500 hover:bg-gray-100 border border-transparent font-bold uppercase text-[10px] tracking-[0.15em]'}`}>
      <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-50 border-r border-slate-200 p-6 flex flex-col hidden lg:flex shrink-0">
        <div className="flex items-center gap-4 px-1 mb-10">
          <div className="w-12 h-12 flex-shrink-0">
            <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo Universal" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[22px] font-[900] text-red-700 leading-none tracking-tighter">UNIVERSAL</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de Miembros</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem active={view === 'dashboard'} icon={ICONS.Dashboard} label="Panel de Control" onClick={() => { setView('dashboard'); setSelectedMember(null); }} />
          <SidebarItem active={view === 'list'} icon={ICONS.Users} label="Registro Miembros" onClick={() => setView('list')} />
          <SidebarItem active={view === 'settings'} icon={<Database size={20} />} label="Configuración" onClick={() => setView('settings')} />
        </nav>

        <div className="pt-6 border-t border-slate-200">
          <button onClick={() => { setEditingMember(undefined); setIsFormOpen(true); }} className="w-full bg-red-700 text-white px-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-800 transition-all shadow-xl shadow-red-100 active:scale-95">
            {ICONS.Plus} Nuevo Miembro
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex items-center justify-between z-30">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{ICONS.Search}</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre, celular o grupo..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-100/50 border border-transparent focus:bg-white focus:border-red-200 focus:ring-4 focus:ring-red-50 rounded-2xl outline-none transition-all font-medium text-sm" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
             <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700 font-black text-sm">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {view === 'dashboard' && <div className="animate-fade-in"><Dashboard members={members} /></div>}
            
            {view === 'settings' && (
              <div className="max-w-2xl animate-fade-in space-y-8">
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-red-50 text-red-700 rounded-2xl"><Database size={24} /></div>
                   <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Ajustes</h2>
                </div>
                
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-green-600" size={20} /> Copias de Seguridad
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => storageService.exportData()} className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                      <Download size={18} /> Exportar JSON
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all">
                      <Upload size={18} /> Importar JSON
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                    
                    {/* Nueva funcionalidad solicitada por el usuario */}
                    <div className="sm:col-span-2 pt-4 mt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Exportación para Impresión</p>
                      <div className="flex gap-4">
                        <button 
                          disabled={!selectedMember}
                          onClick={() => selectedMember && exportService.downloadMemberAsJPG(selectedMember)} 
                          className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedMember ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                          <ImageIcon size={18} /> {selectedMember ? `Descargar Ficha JPG (${selectedMember.firstName})` : 'Selecciona un miembro para descargar JPG'}
                        </button>
                      </div>
                      {!selectedMember && <p className="text-[10px] text-red-400 mt-2 font-bold italic">* Para descargar una ficha individual, selecciónala primero en la lista de miembros.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === 'list' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
                <div className="xl:col-span-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Registro General</h2>
                    <span className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black rounded-xl border border-slate-200 uppercase tracking-widest">
                      {filteredMembers.length} Miembros
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 border-b border-slate-200">
                        <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nombre</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Grupo</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredMembers.map(member => (
                          <tr key={member.id} onClick={() => setSelectedMember(member)} className={`group cursor-pointer hover:bg-red-50/30 transition-all ${selectedMember?.id === member.id ? 'bg-red-50/50 border-l-4 border-red-700' : ''}`}>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-red-700 overflow-hidden shadow-sm">
                                  {member.imageUrl ? <img src={member.imageUrl} className="w-full h-full object-cover" /> : (member.firstName ? member.firstName[0] : '?')}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{member.firstName} {member.lastName}</p>
                                  <p className="text-xs text-slate-400 font-medium">{member.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="px-3 py-1 bg-white text-red-700 text-[9px] font-black rounded-lg border border-red-100 shadow-sm">{member.group}</span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); setEditingMember(member); setIsFormOpen(true); }} className="p-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg border border-slate-200 transition-colors shadow-sm">{ICONS.Settings}</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id); }} className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-lg border border-slate-200 transition-colors shadow-sm">{ICONS.Close}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="xl:col-span-4 space-y-6">
                  {selectedMember ? (
                    <div className="space-y-6 animate-fade-in">
                      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-red-700"></div>
                        <div className="relative pt-4 flex flex-col items-center">
                          <div className="w-28 h-28 rounded-[2rem] bg-white p-1 shadow-xl mb-4 overflow-hidden border-4 border-white">
                            <img src={selectedMember.imageUrl || `https://picsum.photos/seed/${selectedMember.id}/200/200`} className="w-full h-full object-cover rounded-[1.5rem]" alt="Profile" />
                          </div>
                          <h3 className="text-xl font-black text-slate-900 uppercase text-center">{selectedMember.firstName} {selectedMember.lastName}</h3>
                          <span className="mt-2 px-4 py-1.5 bg-red-700 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-100">{selectedMember.group}</span>
                          
                          <div className="w-full space-y-4 text-left border-t border-slate-100 pt-6 mt-6">
                            <DetailRow icon={<Phone size={14} />} label="Celular" value={selectedMember.phone} />
                            <DetailRow icon={<MapPin size={14} />} label="Ciudad" value={selectedMember.ciudad} />
                            <DetailRow icon={<Calendar size={14} />} label="Bautismo" value={selectedMember.baptismDate || 'No registra'} />
                          </div>

                          <div className="w-full flex flex-col gap-2 mt-8">
                            <button 
                              onClick={() => exportService.downloadMemberAsJPG(selectedMember)}
                              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                            >
                              <ImageIcon size={16} /> Descargar Ficha JPG
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all">
                              <Download size={16} /> Ficha PDF
                            </button>
                          </div>
                        </div>
                      </div>
                      <AISuggestions member={selectedMember} />
                    </div>
                  ) : (
                    <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 border-dashed text-center flex flex-col items-center justify-center text-slate-300 min-h-[400px]">
                      <User size={40} className="mb-4" />
                      <p className="font-black uppercase text-[10px] tracking-widest">Selecciona un registro</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {isFormOpen && (
        <MemberForm 
          onSubmit={handleAddMember} 
          onCancel={() => setIsFormOpen(false)} 
          initialData={editingMember} 
        />
      )}
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-gray-50 border border-slate-200 flex items-center justify-center text-red-700">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-bold text-slate-800 truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

export default App;
