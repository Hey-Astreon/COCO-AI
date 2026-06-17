/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Preload Bridge
   Secure IPC bridge between Main process and Renderer UI
   ═══════════════════════════════════════════════════════════════════ */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window management
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  toggleWindow: () => ipcRenderer.send('toggle-window'),

  // Mouse events (click-through support)
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },

  // Opacity control (native window-level opacity)
  setOpacity: (opacity) => ipcRenderer.send('set-opacity', opacity),

  // Window positioning
  moveToEdge: (edge) => ipcRenderer.send('move-to-edge', edge),

  // Listen for main process events
  onAnalyzeScreen: (callback) => {
    ipcRenderer.on('analyze-screen', () => callback());
  },

  // Check if running in Electron
  isElectron: true
});
