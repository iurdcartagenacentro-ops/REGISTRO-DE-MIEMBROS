
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Función para ocultar la pantalla de carga una vez que React esté listo
const hideLoading = () => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento root");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Ocultamos el cargador después de un breve delay para asegurar el renderizado
  setTimeout(hideLoading, 800);
} catch (error) {
  console.error("Error crítico de inicialización:", error);
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.innerHTML = `<p style="color: red; font-weight: bold; text-align: center; padding: 20px;">
      Error al iniciar la aplicación.<br>Por favor, recarga la página.
    </p>`;
  }
}
