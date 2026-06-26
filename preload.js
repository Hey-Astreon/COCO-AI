/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Preload Bridge
   Secure IPC bridge: Main ↔ Renderer for AI, Audio, and Window
   ═══════════════════════════════════════════════════════════════════ */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── Window Management ────────────────────────────────────────
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  toggleWindow: () => ipcRenderer.send('toggle-window'),
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  setOpacity: (opacity) => ipcRenderer.send('set-opacity', opacity),
  moveToEdge: (edge) => ipcRenderer.send('move-to-edge', edge),

  // ─── API Keys ─────────────────────────────────────────────────
  getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
  getCerebrasModels: () => ipcRenderer.invoke('get-cerebras-models'),


  // ─── Cerebras AI (Streaming) ──────────────────────────────────
  streamAI: (question, model, context, requestId) => {
    ipcRenderer.send('ai-stream-request', { question, model, context, requestId });
  },
  abortAI: () => {
    ipcRenderer.send('ai-stream-abort');
  },
  onAIChunk: (callback) => {
    ipcRenderer.on('ai-stream-chunk', (event, data) => callback(data));
  },
  onAIDone: (callback) => {
    ipcRenderer.on('ai-stream-done', (event, data) => callback(data));
  },
  onAIError: (callback) => {
    ipcRenderer.on('ai-stream-error', (event, data) => callback(data));
  },

  // ─── Events from Main Process ─────────────────────────────────
  onAnalyzeScreen: (callback) => {
    ipcRenderer.on('analyze-screen', () => callback());
  },

  // ─── Identify ─────────────────────────────────────────────────
  isElectron: true,
});
