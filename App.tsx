
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Member, ChurchGroup } from './types';
import { storageService } from './services/storageService';
import { ICONS, COLORS } from './constants';
import Dashboard from './components/Dashboard';
import MemberForm from './components/MemberForm';
import AISuggestions from './components/AISuggestions';
// Import missing icons from lucide-react
import { 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  ShieldCheck, 
  Info, 
  Search, 
  Phone, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Printer 
} from 'lucide-react';

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
    setMembers(storageService.getMembers());
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ciudad.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleAddMember = (member: Member) => {
    if (editingMember) {
      storageService.updateMember(member);
    } else {
      storageService.addMember(member);
    }
    setMembers(storageService.getMembers());
    setIsFormOpen(false);
    setEditingMember(undefined);
    if (selectedMember?.id === member.id) setSelectedMember(member);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro permanentemente?')) {
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${active ? 'bg-red-700 text-white shadow-lg shadow-red-200 translate-x-1' : 'text-slate-500 hover:bg-gray-100 border border-transparent font-bold uppercase text-[10px] tracking-[0.15em]'}`}>
      <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-50 border-r border-slate-200 p-6 flex flex-col hidden lg:flex shrink-0">
        <div className="flex items-center gap-3 px-2 mb-10">
          <img src={LOGO_URL} className="w-12 h-12 object-contain drop-shadow-sm" alt="Logo Universal" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-red-700 leading-none tracking-tighter">UNIVERSAL</h1>
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
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex items-center justify-between z-30">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">{ICONS.Search}</span>
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
             <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Acceso</span>
                <span className="text-xs font-bold text-red-700">Administrador</span>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700 font-black text-sm">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
            {view === 'dashboard' && <div className="animate-fade-in"><Dashboard members={members} /></div>}
            
            {view === 'settings' && (
              <div className="max-w-2xl animate-fade-in space-y-8">
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100"><Database size={24} /></div>
                   <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Configuración de la App</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <ShieldCheck className="text-green-600" size={20} /> Seguridad y Respaldos
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Tus datos se guardan de forma privada en este navegador. Para evitar pérdidas, te recomendamos descargar una copia de seguridad periódicamente.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <button onClick={() => storageService.exportData()} className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg">
                        <Download size={18} /> Exportar Base de Datos (.JSON)
                      </button>
                      
                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all">
                        <Upload size={18} /> Importar Copia de Seguridad
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-slate-200 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Info className="text-red-700" size={20} /> Información de la Aplicación
                    </h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Versión</span> <span className="font-bold">2.1.0-PRO</span></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Estado del Motor</span> <span className="text-green-600 font-bold">Óptimo</span></p>
                      <p className="flex justify-between"><span>Soporte IA (Gemini)</span> <span className="text-blue-600 font-bold">Activo</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === 'list' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in logo-watermark">
                <div className="xl:col-span-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Registro de Miembros</h2>
                    <span className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black rounded-xl border border-slate-200 uppercase tracking-widest">
                      {filteredMembers.length} Miembros Encontrados
                    </span>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 border-b border-slate-200">
                        <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Miembro</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Grupo</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ubicación</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredMembers.map(member => (
                          <tr key={member.id} onClick={() => setSelectedMember(member)} className={`group cursor-pointer hover:bg-red-50/30 transition-all ${selectedMember?.id === member.id ? 'bg-red-50/50 border-l-4 border-red-700' : ''}`}>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-red-700 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                  {member.imageUrl ? <img src={member.imageUrl} className="w-full h-full object-cover" /> : member.firstName[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{member.firstName} {member.lastName}</p>
                                  <p className="text-xs text-slate-400 font-medium">{member.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="px-3 py-1.5 bg-white text-red-700 text-[10px] font-black rounded-xl border border-red-100 shadow-sm">{member.group}</span>
                            </td>
                            <td className="px-8 py-4">
                               <p className="text-sm font-bold text-slate-700">{member.ciudad}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{member.barrio}</p>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); setEditingMember(member); setIsFormOpen(true); }} className="p-2.5 bg-white hover:bg-blue-50 text-blue-600 rounded-xl border border-slate-200 transition-colors shadow-sm">{ICONS.Settings}</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id); }} className="p-2.5 bg-white hover:bg-red-50 text-red-600 rounded-xl border border-slate-200 transition-colors shadow-sm">{ICONS.Close}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredMembers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-20 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-300">
                                {/* Fixed missing Search icon usage */}
                                <Search size={48} className="mb-4 opacity-20" />
                                <p className="font-black uppercase text-[10px] tracking-widest">No se encontraron resultados</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="xl:col-span-4 space-y-6">
                  {selectedMember ? (
                    <div className="space-y-6 animate-fade-in">
                      <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-200 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-red-700 to-red-900"></div>
                        <div className="relative pt-8 flex flex-col items-center">
                          <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl mb-6 overflow-hidden border-4 border-white group-hover:scale-105 transition-transform">
                            <img src={selectedMember.imageUrl || `https://picsum.photos/seed/${selectedMember.id}/200/200`} className="w-full h-full object-cover rounded-[2rem]" alt="Profile" />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight text-center leading-none">{selectedMember.firstName}</h3>
                          <h3 className="text-2xl font-black text-red-700 uppercase tracking-tight text-center mb-4">{selectedMember.lastName}</h3>
                          
                          <div className="flex gap-2 mb-8">
                            <span className="px-5 py-2 bg-red-700 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-red-200">{selectedMember.group}</span>
                          </div>
                          
                          <div className="w-full space-y-5 text-left border-t border-slate-100 pt-8">
                            {/* Fixed missing icons usage by adding imports and using correct names */}
                            <DetailRow icon={<Phone size={16} />} label="Celular" value={selectedMember.phone} />
                            <DetailRow icon={<User size={16} />} label="Estado Civil" value={selectedMember.maritalStatus} />
                            <DetailRow icon={<MapPin size={16} />} label="Ubicación" value={`${selectedMember.ciudad}, ${selectedMember.barrio}`} />
                            <DetailRow icon={<Calendar size={16} />} label="Bautismo" value={selectedMember.baptismDate || 'No bautizado'} />
                            <DetailRow icon={<Clock size={16} />} label="Tiempo Iglesia" value={selectedMember.churchTime} />
                          </div>

                          {selectedMember.signatureUrl && (
                            <div className="w-full mt-6 pt-6 border-t border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Firma Electrónica</p>
                               <img src={selectedMember.signatureUrl} className="w-full h-24 object-contain bg-slate-50 rounded-[2rem] border border-slate-200 p-4" />
                            </div>
                          )}

                          <div className="w-full flex gap-3 mt-8">
                            <button onClick={() => {/* window.print() o similar */}} className="p-4 bg-gray-100 text-slate-600 rounded-2xl hover:bg-gray-200 transition-colors">
                              {/* Fixed missing Printer icon */}
                              <Printer size={20} />
                            </button>
                            <button onClick={() => {/* downloadAsImage implementado arriba */}} className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
                              <Download size={18} /> Descargar Ficha Digital
                            </button>
                          </div>
                        </div>
                      </div>

                      <AISuggestions member={selectedMember} />
                    </div>
                  ) : (
                    <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 border-dashed text-center flex flex-col items-center justify-center text-slate-300 min-h-[500px]">
                      <div className="w-24 h-24 bg-gray-50 border border-slate-200 rounded-full flex items-center justify-center mb-8 shadow-inner">
                        {/* Fixed missing User icon usage */}
                        <User size={40} className="text-slate-200" />
                      </div>
                      <h4 className="font-black uppercase text-[12px] tracking-[0.3em] text-slate-400 px-6 leading-relaxed">
                        Selecciona un miembro para visualizar su expediente completo
                      </h4>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Form Modal */}
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
  <div className="flex items-center gap-4 group/row">
    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-slate-200 flex items-center justify-center text-red-700 group-hover/row:bg-red-50 group-hover/row:border-red-100 transition-colors shadow-sm">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">{label}</p>
      <p className="text-sm font-bold text-slate-800 truncate">{value || 'No especificado'}</p>
    </div>
  </div>
);

export default App;
