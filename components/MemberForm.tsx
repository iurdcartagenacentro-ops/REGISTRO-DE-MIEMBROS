
import React, { useState, useRef, useEffect } from 'react';
import { Member, ChurchGroup, MaritalStatus } from '../types';
import { ICONS } from '../constants';
import { Camera, RefreshCw, Upload, Trash2, Check, Eraser } from 'lucide-react';

const LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KICA8cGF0aCBmaWxsPSIjOTkxYjFiIiBkPSJNMjU2IDQ2NEMyNDAgNDY0IDM3LjYgMzAyLjQgMzcuNiAxNjNDMzcuNiA4Ni40IDk3LjYgMzIgMTY4IDMyQzIxMi44IDMyIDI0Mi40IDU0LjQgMjU2IDc2LjRDIDI2OS42IDU0LjQgMjk5LjIgMzIgMzQ0IDMyQzQxNC40IDMyIDQ3NC40IDg2LjQgNDc0LjQgMTYzQzQ3NC40IDMwMi40IDI3MiA0NjQgMjU2IDQ2NFoiLz4KICA8cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNNDI0IDE1N0MzOTIgMTY1IDMzNiAxOTcgMjk2IDIyN0MyNjQgMjUxIDI1NiAyNjcgMjU2IDI2N0MyNTYgMjY3IDI0OCAyNTEgMjE2IDIyN0MxNzYgMTk3IDEyMCAxNjUgODggMTU3QzEyOCAxOTcgMTYwIDIzNyAxNjAgMjM3QzE2MCAyMzcgMTI4IDI2MSAxMzYgMjc3QzE0NCAyOTMgMTg0IDMwOSAyMDggMzI1QzIzMiAzNDkgMjU2IDM4OSAyNTYgMzg5QzI1NiAzODkgMjgwIDM0OSAzMDQgMzI1QzMyOCAzMDkgMzY4IDI5MyAzNzYgMjc3QzM4NCAyNjEgMzUyIDIzNyAzNTIgMjM3QzM1MiAyMzcgMzg0IDE5NyA0MjQgMTU3WiIvPgo8L3N2Zz4=';

interface MemberFormProps {
  onSubmit: (member: Member) => void;
  onCancel: () => void;
  initialData?: Partial<Member>;
}

const MemberForm: React.FC<MemberFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    barrio: initialData?.barrio || '',
    ciudad: initialData?.ciudad || '',
    departamento: initialData?.departamento || '',
    birthDate: initialData?.birthDate || '',
    baptismDate: initialData?.baptismDate || '',
    maritalStatus: initialData?.maritalStatus || MaritalStatus.SINGLE,
    churchName: initialData?.churchName || '',
    churchTime: initialData?.churchTime || '',
    group: initialData?.group || ChurchGroup.NONE,
    joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
    imageUrl: initialData?.imageUrl || '',
    signatureUrl: initialData?.signatureUrl || '',
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode, width: { ideal: 720 }, height: { ideal: 720 } } 
      })
      .then(s => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => {
        console.error("Error accessing camera:", err);
        alert("No se pudo acceder a la cámara. Asegúrese de otorgar permisos.");
        setIsCameraActive(false);
      });
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isCameraActive, facingMode]);

  useEffect(() => {
    if (initialData?.signatureUrl && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => ctx?.drawImage(img, 0, 0);
      img.src = initialData.signatureUrl;
    }
  }, [initialData]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Recorte central para foto cuadrada
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        if (facingMode === 'user') {
          ctx.translate(size, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData({ ...formData, imageUrl: dataUrl });
        setIsCameraActive(false);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (sigCanvasRef.current) {
      setFormData(prev => ({ ...prev, signatureUrl: sigCanvasRef.current!.toDataURL() }));
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !sigCanvasRef.current) return;
    const canvas = sigCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setFormData(prev => ({ ...prev, signatureUrl: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
    } as Member);
  };

  const inputClasses = "w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-300 focus:border-red-600 focus:ring-4 focus:ring-red-50 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700 shadow-sm";
  const labelClasses = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] flex flex-col">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-800 rounded-xl flex items-center justify-center overflow-hidden p-1.5 shadow-lg shadow-red-100">
              <img src={LOGO_URL} className="w-full h-full object-contain brightness-200" alt="Logo" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
              {initialData?.id ? 'Editar Perfil' : 'Registro de Miembro'}
            </h2>
          </div>
          <button onClick={onCancel} className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-800 transition-colors border border-slate-200">
            {ICONS.Close}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Sección de Foto */}
          <div className="flex flex-col items-center gap-6 pb-2">
            <div className="relative w-40 h-40 rounded-[2.5rem] bg-gray-50 overflow-hidden shadow-inner border-2 border-slate-200 group">
              {isCameraActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
              ) : formData.imageUrl ? (
                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200 bg-white">
                  <Camera size={56} strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {!isCameraActive ? (
                <>
                  <button type="button" onClick={() => setIsCameraActive(true)} className="flex items-center gap-2 px-6 py-3 bg-red-800 text-white rounded-2xl text-sm font-bold hover:bg-red-900 transition-all shadow-xl shadow-red-50">
                    <Camera size={18} /> Tomar Foto
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all">
                    <Upload size={18} /> Galería
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={takePhoto} className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg"><Check size={20} /></button>
                  <button type="button" onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="p-3 bg-white border border-slate-300 rounded-2xl"><RefreshCw size={20} /></button>
                  <button type="button" onClick={() => setIsCameraActive(false)} className="p-3 bg-red-50 text-red-600 rounded-2xl"><Trash2 size={20} /></button>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Nombre(s)</label>
              <input required className={inputClasses} value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Apellidos</label>
              <input required className={inputClasses} value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Celular / WhatsApp</label>
              <input required className={inputClasses} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Estado Civil</label>
              <select className={inputClasses} value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value as MaritalStatus })}>
                {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Dirección de Residencia</label>
            <input className={inputClasses} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClasses}>Barrio</label>
              <input className={inputClasses} value={formData.barrio} onChange={e => setFormData({ ...formData, barrio: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Ciudad</label>
              <input className={inputClasses} value={formData.ciudad} onChange={e => setFormData({ ...formData, ciudad: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Departamento</label>
              <input className={inputClasses} value={formData.departamento} onChange={e => setFormData({ ...formData, departamento: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Fecha de Nacimiento</label>
              <input type="date" required className={inputClasses} value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Fecha de Bautismo (Opcional)</label>
              <input type="date" className={inputClasses} value={formData.baptismDate} onChange={e => setFormData({ ...formData, baptismDate: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Iglesia Local</label>
              <input className={inputClasses} value={formData.churchName} onChange={e => setFormData({ ...formData, churchName: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Tiempo en la Obra</label>
              <input className={inputClasses} placeholder="Ej: 5 meses, 3 años" value={formData.churchTime} onChange={e => setFormData({ ...formData, churchTime: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Grupo Principal</label>
              <select className={inputClasses} value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value as ChurchGroup })}>
                {Object.values(ChurchGroup).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Sección de Firma */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-1">
              <label className={labelClasses}>Firma Digital</label>
              <button type="button" onClick={clearSignature} className="text-[10px] font-black text-red-600 flex items-center gap-1 hover:underline uppercase tracking-widest">
                <Eraser size={12} /> Borrar Firma
              </button>
            </div>
            <div className="bg-gray-50 border-2 border-slate-200 rounded-3xl overflow-hidden cursor-crosshair shadow-inner relative">
              <canvas 
                ref={sigCanvasRef}
                width={700}
                height={200}
                className="w-full h-[180px] touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseOut={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
              />
              {!formData.signatureUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-bold uppercase tracking-[0.3em]">
                  Firme aquí
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100 bg-white">
            <button type="button" onClick={onCancel} className="flex-1 px-8 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest">
              Descartar
            </button>
            <button type="submit" className="flex-1 px-8 py-4 rounded-2xl bg-red-800 text-white font-bold hover:bg-red-900 shadow-2xl shadow-red-100 transition-all active:scale-95 text-sm uppercase tracking-widest">
              {initialData?.id ? 'Actualizar Registro' : 'Completar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
