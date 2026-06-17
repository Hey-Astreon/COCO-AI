const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  minimizeApp: () => {
    ipcRenderer.send('minimize-app');
  },
  closeApp: () => {
    ipcRenderer.send('close-app');
  },
  toggleWindow: () => {
    ipcRenderer.send('toggle-window');
  }
});
