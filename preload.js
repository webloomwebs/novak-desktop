// El puente entre la web y Windows: solo una cosa, avisar. Nada más pasa de un lado al otro.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('novak', {
  esEscritorio: true,
  avisar: (title, body) => ipcRenderer.send('novak:aviso', { title, body }),
});
