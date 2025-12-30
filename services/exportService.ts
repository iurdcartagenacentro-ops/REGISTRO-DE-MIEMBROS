
import { Member } from '../types';

const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Universal_Church_of_the_Kingdom_of_God_Logo.svg/1024px-Universal_Church_of_the_Kingdom_of_God_Logo.svg.png';

export const exportService = {
  downloadMemberAsJPG: async (member: Member) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Tamaño A4 aproximado a 150 DPI para buena calidad de impresión
    canvas.width = 1240;
    canvas.height = 1754;

    // Fondo Blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Encabezado Rojo
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, canvas.width, 250);

    // Cargar Logo
    const loadImg = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${url}`));
        img.src = url;
      });
    };

    try {
      // Dibujar Logo
      const logo = await loadImg(LOGO_URL);
      ctx.drawImage(logo, 60, 50, 150, 150);

      // Texto Encabezado
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Inter, sans-serif';
      ctx.fillText('UNIVERSAL', 240, 130);
      ctx.font = '30px Inter, sans-serif';
      ctx.fillText('REGISTRO OFICIAL DE MIEMBROS', 245, 180);

      // Marco de la Foto
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(850, 300, 330, 330);
      
      if (member.imageUrl) {
        try {
          const profileImg = await loadImg(member.imageUrl);
          ctx.drawImage(profileImg, 855, 305, 320, 320);
        } catch (e) {
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(855, 305, 320, 320);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '30px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Sin Foto', 1015, 475);
          ctx.textAlign = 'left';
        }
      }

      // Cuerpo de Datos
      ctx.fillStyle = '#0f172a';
      const drawField = (label: string, value: string, x: number, y: number) => {
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(label.toUpperCase(), x, y);
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(value || '---', x, y + 50);
      };

      let startY = 350;
      const col1 = 80;
      const col2 = 450;

      drawField('Nombre Completo', `${member.firstName} ${member.lastName}`, col1, startY);
      drawField('Celular / Teléfono', member.phone, col1, startY + 150);
      drawField('Estado Civil', member.maritalStatus, col2, startY + 150);
      
      drawField('Dirección', member.address, col1, startY + 300);
      drawField('Barrio', member.barrio, col1, startY + 450);
      drawField('Ciudad', member.ciudad, col2, startY + 450);
      
      drawField('Departamento', member.departamento, col1, startY + 600);
      drawField('Grupo de Participación', member.group, col2, startY + 600);

      drawField('Fecha de Nacimiento', member.birthDate, col1, startY + 750);
      drawField('Fecha de Bautismo', member.baptismDate || 'No registra', col2, startY + 750);

      drawField('Iglesia', member.churchName, col1, startY + 900);
      drawField('Tiempo de Permanencia', member.churchTime, col2, startY + 900);

      // Firma
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(80, 1350, 1080, 250);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(80, 1350, 1080, 250);
      
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('FIRMA DEL MIEMBRO REGISTRADO', 100, 1385);

      if (member.signatureUrl) {
        try {
          const sigImg = await loadImg(member.signatureUrl);
          ctx.drawImage(sigImg, 100, 1400, 1000, 180);
        } catch (e) {
          console.error("Error cargando firma");
        }
      }

      // Pie de página
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(0, 1720, canvas.width, 34);
      ctx.font = 'italic 18px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(`Documento generado el ${new Date().toLocaleDateString()} - ID: ${member.id}`, canvas.width / 2, 1700);

      // Descarga
      const link = document.createElement('a');
      link.download = `Ficha_${member.firstName}_${member.lastName}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();

    } catch (error) {
      console.error("Error generando ficha:", error);
      alert("Hubo un error al generar la imagen. Asegúrate de que las fotos tengan permisos adecuados.");
    }
  }
};
