
import { Member } from '../types';

// Logo oficial: Corazón Rojo con Paloma Blanca
const LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KICA8cGF0aCBmaWxsPSIjOTkxYjFiIiBkPSJNMjU2IDQ2NEMyNDAgNDY0IDM3LjYgMzAyLjQgMzcuNiAxNjNDMzcuNiA4Ni40IDk3LjYgMzIgMTY4IDMyQzIxMi44IDMyIDI0Mi40IDU0LjQgMjU2IDc2LjRDIDI2OS42IDU0LjQgMjk5LjIgMzIgMzQ0IDMyQzQxNC40IDMyIDQ3NC40IDg2LjQgNDc0LjQgMTYzQzQ3NC40IDMwMi40IDI3MiA0NjQgMjU2IDQ2NFoiLz4KICA8cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNNDI0IDE1N0MzOTIgMTY1IDMzNiAxOTcgMjk2IDIyN0MyNjQgMjUxIDI1NiAyNjcgMjU2IDI2N0MyNTYgMjY3IDI0OCAyNTEgMjE2IDIyN0MxNzYgMTk3IDEyMCAxNjUgODggMTU3QzEyOCAxOTcgMTYwIDIzNyAxNjAgMjM3QzE2MCAyMzcgMTI4IDI2MSAxMzYgMjc3QzE0NCAyOTMgMTg0IDMwOSAyMDggMzI1QzIzMiAzNDkgMjU2IDM4OSAyNTYgMzg5QzI1NiAzODkgMjgwIDM0OSAzMDQgMzI1QzMyOCAzMDkgMzY4IDI5MyAzNzYgMjc3QzM4NCAyNjEgMzUyIDIzNyAzNTIgMjM3QzM1MiAyMzcgMzg0IDE5NyA0MjQgMTU3WiIvPgo8L3N2Zz4=';

export const exportService = {
  downloadMemberAsJPG: async (member: Member) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Alta calidad A4 (300 DPI aprox)
    canvas.width = 1240;
    canvas.height = 1754;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cabecera Institucional
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(0, 0, canvas.width, 300);

    const loadImg = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        if (url && !url.startsWith('data:')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Error cargando imagen`));
        img.src = url;
      });
    };

    try {
      // 1. Logo Universal
      try {
        const logo = await loadImg(LOGO_URL);
        ctx.drawImage(logo, 80, 75, 150, 150);
      } catch (e) {
        console.warn("Logo no disponible");
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 85px Inter, Arial, sans-serif';
      ctx.fillText('UNIVERSAL', 270, 160);
      ctx.font = '30px Inter, Arial, sans-serif';
      ctx.fillText('SISTEMA DE GESTIÓN DE MIEMBROS', 275, 210);

      // 2. Foto de Perfil
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 10;
      ctx.strokeRect(850, 350, 310, 310);
      
      if (member.imageUrl) {
        try {
          const profileImg = await loadImg(member.imageUrl);
          ctx.drawImage(profileImg, 855, 355, 300, 300);
        } catch (e) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(855, 355, 300, 300);
        }
      }

      // 3. Datos del Miembro
      const drawInfo = (label: string, value: string, x: number, y: number) => {
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(label.toUpperCase(), x, y);
        ctx.font = 'bold 38px Inter, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(value || 'N/A', x, y + 55);
      };

      let currentY = 400;
      const leftCol = 100;
      const rightCol = 500;

      drawInfo('Nombre Completo', `${member.firstName} ${member.lastName}`, leftCol, currentY);
      drawInfo('Teléfono / Móvil', member.phone, leftCol, currentY + 160);
      drawInfo('Estado Civil', member.maritalStatus, rightCol, currentY + 160);
      
      drawInfo('Dirección de Vivienda', member.address, leftCol, currentY + 320);
      drawInfo('Barrio', member.barrio, leftCol, currentY + 480);
      drawInfo('Ciudad / Localidad', member.ciudad, rightCol, currentY + 480);
      
      drawInfo('Grupo Pastoral', member.group, leftCol, currentY + 640);
      drawInfo('Tiempo en la Obra', member.churchTime, rightCol, currentY + 640);

      drawInfo('Fecha de Nacimiento', member.birthDate, leftCol, currentY + 800);
      drawInfo('Fecha de Bautismo', member.baptismDate || '---', rightCol, currentY + 800);

      // 4. Espacio para Firma
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(100, 1400, 1040, 220);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(100, 1400, 1040, 220);
      
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('FIRMA DEL MIEMBRO', 620, 1650);
      ctx.textAlign = 'left';

      if (member.signatureUrl) {
        try {
          const sig = await loadImg(member.signatureUrl);
          ctx.drawImage(sig, 150, 1420, 940, 180);
        } catch (e) {}
      }

      // Pie de Página
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(0, 1720, canvas.width, 34);
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(`Registro generado vía Universal App - ID: ${member.id} - Fecha: ${new Date().toLocaleDateString()}`, canvas.width / 2, 1700);

      const download = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `Universal_Ficha_${member.firstName}.jpg`;
      link.href = download;
      link.click();

    } catch (err) {
      console.error(err);
      alert("Error exportando documento.");
    }
  }
};
