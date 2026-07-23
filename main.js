/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Electron Main Process
   Multi-Layer Stealth System + AI/Audio IPC Bridge
   ═══════════════════════════════════════════════════════════════════ */

// Load environment variables FIRST
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { app, BrowserWindow, globalShortcut, ipcMain, screen, desktopCapturer } = require('electron');
const path = require('path');
let cerebras = null;
try {
  cerebras = require('./services/cerebras');
} catch (e) {
  console.warn('⚠️ Cerebras service failed to load — text AI will be disabled.', e.message);
}

// ─── Single Instance Lock ──────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!isOverlayVisible) {
        mainWindow.show();
        isOverlayVisible = true;
      }
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ─── Stealth Layer 0: Process Title Disguise ────────────────────
app.setName('System Host Service');
if (process.platform === 'win32') {
  app.setAppUserModelId('Microsoft.Windows.SystemHost');
}

let mainWindow;
let isOverlayVisible = true;

// Store active AI request so we can abort it
let activeAIRequest = null;

function createWindow() {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 850,
    height: 720,
    x: screenW - 870,
    y: 20,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    resizable: true,
    movable: true,
    type: 'toolbar',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    }
  });

  // ─── Stealth: Content Protection BEFORE loading content ──────
  mainWindow.setContentProtection(true);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.loadFile('index.html');

  // Re-apply protection after page loads
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setContentProtection(true);
  });

  mainWindow.on('focus', () => {
    mainWindow.setContentProtection(true);
  });

  mainWindow.on('show', () => {
    mainWindow.setContentProtection(true);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ═══════════════════════════════════════════════════════════════════
//  IPC HANDLERS — Window Management
// ═══════════════════════════════════════════════════════════════════

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.setIgnoreMouseEvents(ignore, options);
});

ipcMain.on('minimize-app', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('toggle-window', () => {
  toggleOverlay();
});

ipcMain.on('set-opacity', (event, opacity) => {
  if (mainWindow) mainWindow.setOpacity(opacity);
});

ipcMain.on('move-to-edge', (event, edge) => {
  if (!mainWindow) return;
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const [winW, winH] = mainWindow.getSize();
  switch (edge) {
    case 'left':
      mainWindow.setPosition(20, Math.floor((screenH - winH) / 2));
      break;
    case 'right':
      mainWindow.setPosition(screenW - winW - 20, Math.floor((screenH - winH) / 2));
      break;
    case 'center':
      mainWindow.center();
      break;
  }
});

// ─── Stealth Mode: Window Resize ──────────────────────────────
ipcMain.on('set-window-size', (event, { width, height }) => {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;
  // Re-anchor to whichever edge is closer
  const centerX = bounds.x + bounds.width / 2;
  let newX;
  if (centerX > screenW / 2) {
    // Right-anchored: keep right edge in place
    newX = bounds.x + bounds.width - width;
  } else {
    // Left-anchored: keep left edge in place
    newX = bounds.x;
  }
  mainWindow.setBounds({
    x: Math.max(0, newX),
    y: bounds.y,
    width,
    height: height || bounds.height
  });
});

// ─── Stealth Mode: Click-Through (Ghost) ──────────────────────
ipcMain.on('set-clickthrough', (event, enabled) => {
  if (!mainWindow) return;
  if (enabled) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  } else {
    mainWindow.setIgnoreMouseEvents(false);
  }
});

// ═══════════════════════════════════════════════════════════════════
//  IPC HANDLERS — API Keys
// ═══════════════════════════════════════════════════════════════════

ipcMain.handle('get-api-keys', () => {
  return {
    cerebras: process.env.CEREBRAS_API_KEY || '',
    deepgram: process.env.DEEPGRAM_API_KEY || '',
    gemini:   process.env.GEMINI_API_KEY   || '',
    nvidia:   process.env.BUILD_NVIDIA_API_KEY || '',
  };
});

ipcMain.handle('capture-screen', async () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const scale = primaryDisplay.scaleFactor || 1;
  const width = Math.round(primaryDisplay.bounds.width * scale);
  const height = Math.round(primaryDisplay.bounds.height * scale);

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height } // Native 1:1 screen resolution — ultra-sharp text OCR for vision AI
  });

  if (sources.length === 0) throw new Error('No screen sources found');

  // On multi-monitor setups, match the source to the primary display
  const primarySource =
    sources.find(s => String(s.display_id) === String(primaryDisplay.id)) ||
    sources[0];

  return primarySource.thumbnail.toDataURL('image/png');
});

ipcMain.handle('get-system-audio-source-id', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen']
  });
  
  if (sources.length > 0) {
    return sources[0].id;
  }
  throw new Error('No audio loopback screen source found');
});

ipcMain.handle('get-cerebras-models', async () => {
  if (!cerebras) return [];
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) return [];
  return await cerebras.getModels(apiKey);
});


// ═══════════════════════════════════════════════════════════════════
//  IPC HANDLERS — Cerebras AI (Streaming)
// ═══════════════════════════════════════════════════════════════════

ipcMain.on('ai-stream-request', (event, { question, model, context, requestId }) => {
  if (!cerebras) {
    event.sender.send('ai-stream-error', {
      requestId,
      error: 'Cerebras service failed to load. Check services/cerebras.js.'
    });
    return;
  }

  const apiKey = process.env.CEREBRAS_API_KEY;

  if (!apiKey) {
    event.sender.send('ai-stream-error', {
      requestId,
      error: 'Cerebras API key not found. Add it to .env file.'
    });
    return;
  }

  // Abort any previous active request
  if (activeAIRequest) {
    activeAIRequest.abort();
    activeAIRequest = null;
  }

  activeAIRequest = cerebras.streamCompletion(apiKey, question, {
    model: model || cerebras.DEFAULT_MODEL,
    context: context || {},
    onChunk: (chunk, fullText) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('ai-stream-chunk', { requestId, chunk, fullText });
      }
    },
    onDone: (fullText) => {
      activeAIRequest = null;
      if (!event.sender.isDestroyed()) {
        event.sender.send('ai-stream-done', { requestId, fullText });
      }
    },
    onError: (err) => {
      activeAIRequest = null;
      if (!event.sender.isDestroyed()) {
        event.sender.send('ai-stream-error', {
          requestId,
          error: err.message || 'AI request failed'
        });
      }
    },
  });
});

ipcMain.on('ai-stream-abort', () => {
  if (activeAIRequest) {
    activeAIRequest.abort();
    activeAIRequest = null;
  }
});

// ═══════════════════════════════════════════════════════════════════
//  Window Toggle & Panic
// ═══════════════════════════════════════════════════════════════════

function toggleOverlay() {
  if (!mainWindow) return;
  isOverlayVisible = !isOverlayVisible;
  if (isOverlayVisible) {
    mainWindow.show();
    mainWindow.setContentProtection(true);
    mainWindow.focus();
  } else {
    mainWindow.hide();
  }
}

function panicHide() {
  if (!mainWindow) return;
  mainWindow.hide();
  isOverlayVisible = false;
}

// ═══════════════════════════════════════════════════════════════════
//  App Lifecycle
// ═══════════════════════════════════════════════════════════════════

app.whenReady().then(() => {
  createWindow();

  // Global Hotkeys
  globalShortcut.register('CommandOrControl+Shift+H', toggleOverlay);
  globalShortcut.register('CommandOrControl+Shift+P', panicHide);

  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('analyze-screen');
    }
  });

  globalShortcut.register('CommandOrControl+Shift+G', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('cycle-stealth');
    }
  });

  globalShortcut.register('Alt+Left', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;
      if (bounds.x > screenW / 2) mainWindow.setPosition(20, bounds.y);
    }
  });

  globalShortcut.register('Alt+Right', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;
      const [winW] = mainWindow.getSize();
      if (bounds.x < screenW / 2) mainWindow.setPosition(screenW - winW - 20, bounds.y);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
