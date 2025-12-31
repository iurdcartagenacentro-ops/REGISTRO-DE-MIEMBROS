
import { Member } from '../types';

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
    ctx.fillStyle = '#2b507d';
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
      // Branding de texto en el exportable
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 85px Inter, Arial, sans-serif';
      ctx.fillText('UNIVERSAL', 80, 160);
      ctx.font = '30px Inter, Arial, sans-serif';
      ctx.fillText('SISTEMA DE GESTIÓN DE MIEMBROS', 85, 210);

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
      ctx.fillStyle = '#2b507d';
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
