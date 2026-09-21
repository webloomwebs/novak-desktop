// Novak para Windows: una ventana propia que carga la app y avisa con las notificaciones del
// sistema. La app vive en la web, así que se actualiza sola: no hay que reinstalar nada.
const { app, BrowserWindow, shell, Notification } = require('electron');
const path = require('node:path');

const WEB = 'https://novak-app.vercel.app';

function crearVentana() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 380,
    backgroundColor: '#FFFFFF',
    title: 'Novak',
    icon: path.join(__dirname, 'icono.ico'),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });

  win.loadURL(WEB);

  // Lo que no sea Novak se abre en el navegador de siempre, no dentro de la app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(WEB)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Sin conexión, en vez de la pantalla de error del navegador, se reintenta.
  win.webContents.on('did-fail-load', () => setTimeout(() => win.loadURL(WEB), 4000));
  return win;
}

// Una sola ventana: si se abre otra vez, se trae la que ya está.
const unica = app.requestSingleInstanceLock();
if (!unica) {
  app.quit();
} else {
  let ventana = null;
  app.on('second-instance', () => {
    if (ventana) {
      if (ventana.isMinimized()) ventana.restore();
      ventana.focus();
    }
  });

  app.whenReady().then(() => {
    app.setAppUserModelId('com.novakcompany.calendario.desktop');
    ventana = crearVentana();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) ventana = crearVentana();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}

// La app pide avisar y Windows lo enseña como cualquier otra notificación del sistema.
const { ipcMain } = require('electron');
ipcMain.on('novak:aviso', (_e, { title, body }) => {
  if (Notification.isSupported()) new Notification({ title, body }).show();
});
