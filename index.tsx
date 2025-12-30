
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Iniciando Aplicación Universal...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento root para montar la aplicación");
}

// Registro de Service Worker para capacidades PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usamos ruta relativa ./sw.js para mayor compatibilidad
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('Service Worker registrado correctamente:', reg.scope);
    }).catch(err => {
      console.warn('Fallo el registro del Service Worker (esto es normal en algunos entornos de desarrollo):', err);
    });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
