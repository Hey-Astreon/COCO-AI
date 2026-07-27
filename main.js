/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Electron Main Process
   Multi-Layer Stealth System + AI/Audio IPC Bridge
   ═══════════════════════════════════════════════════════════════════ */

// Load environment variables FIRST
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { app, BrowserWindow, globalShortcut, ipcMain, screen, desktopCapturer } = require('electron');
const path = require('path');

// ─── Auto-Updater (only in packaged builds) ──────────────────
let autoUpdater = null;
if (app.isPackaged) {
  try {
    autoUpdater = require('electron-updater').autoUpdater;
    autoUpdater.autoDownload = true;      // Download update in background
    autoUpdater.autoInstallOnAppQuit = true; // Install on next restart
    autoUpdater.logger = console;
  } catch (e) {
    console.warn('⚠️ electron-updater not available:', e.message);
  }
}
let cerebras = null;
try {
  cerebras = require('./services/cerebras');
} catch (e) {
  console.warn('⚠️ Cerebras service failed to load — text AI will be disabled.', e.message);
}

let groq = null;
try {
  groq = require('./services/groq');
  console.log('✅ Groq fallback engine loaded.');
} catch (e) {
  console.warn('⚠️ Groq service failed to load — fallback AI will be disabled.', e.message);
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
let activeRequestId = null;

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
    icon: path.join(__dirname, 'assets', 'coco_logo.ico'),
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

ipcMain.on('toggle-maximize-app', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
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
    groq:     process.env.GROQ_API_KEY     || '',
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
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  const groqKey     = process.env.GROQ_API_KEY;

  // ── Helper: try Groq as silent fallback ──────────────────────
  function tryGroqFallback(reason) {
    if (!groq || !groqKey) {
      console.warn(`[AI] Groq fallback unavailable (${reason}). No fallback engine.`);
      if (!event.sender.isDestroyed()) {
        event.sender.send('ai-stream-error', { requestId, error: `Primary AI failed: ${reason}` });
      }
      return;
    }
    console.warn(`[AI] Cerebras failed (${reason}) — switching to Groq fallback silently...`);
    if (!event.sender.isDestroyed()) {
      // Notify UI with a subtle warning (not a full error)
      event.sender.send('ai-stream-fallback', { requestId, engine: 'groq', reason });
    }
    activeRequestId = requestId;

    // MID-STREAM WATCHDOG for Groq fallback — same 15s rolling timeout
    let groqMidStreamTimer = null;
    const resetGroqWatchdog = () => {
      clearTimeout(groqMidStreamTimer);
      groqMidStreamTimer = setTimeout(() => {
        if (activeAIRequest) {
          console.warn('[AI] Groq mid-stream stall detected (>15s no new chunk) — aborting.');
          try { activeAIRequest.abort(); } catch (_) {}
          activeAIRequest = null;
          activeRequestId = null;
          if (!event.sender.isDestroyed()) {
            event.sender.send('ai-stream-error', { requestId, error: 'AI stream timed out (Groq stalled for 15s). Please try again.' });
          }
        }
      }, 15000);
    };
    // Start watchdog immediately — Groq should send first chunk within 15s
    resetGroqWatchdog();

    activeAIRequest = groq.streamCompletion(groqKey, question, {
      model: groq.DEFAULT_MODEL,
      context: context || {},
      onChunk: (chunk, fullText) => {
        resetGroqWatchdog(); // Reset rolling watchdog on every Groq chunk
        if (!event.sender.isDestroyed()) {
          event.sender.send('ai-stream-chunk', { requestId, chunk, fullText });
        }
      },
      onDone: (fullText) => {
        clearTimeout(groqMidStreamTimer);
        activeAIRequest = null;
        activeRequestId = null;
        if (!event.sender.isDestroyed()) {
          event.sender.send('ai-stream-done', { requestId, fullText });
        }
      },
      onError: (err) => {
        clearTimeout(groqMidStreamTimer);
        activeAIRequest = null;
        activeRequestId = null;
        if (!event.sender.isDestroyed()) {
          event.sender.send('ai-stream-error', { requestId, error: `Both Cerebras and Groq failed: ${err.message}` });
        }
      },
    });
  }

  // ── No Cerebras? Go straight to Groq ─────────────────────────
  if (!cerebras || !cerebrasKey) {
    tryGroqFallback('Cerebras not configured');
    return;
  }

  // Only abort previous request if it has NOT started streaming yet (stuck in queue)
  if (activeAIRequest && !activeAIRequest.hasStreamedTokens) {
    if (activeRequestId && !event.sender.isDestroyed()) {
      event.sender.send('ai-stream-aborted', { requestId: activeRequestId });
    }
    try { activeAIRequest.abort(); } catch (_) {}
    activeAIRequest = null;
    activeRequestId = null;
  }

  // ── Primary: Cerebras — fallback to Groq on error or >1000ms delay ────────────
  activeRequestId = requestId;
  let receivedFirstChunk = false;

  // WATCHDOG: Fires if first chunk takes >1000ms (Cerebras latency spike → failover)
  let firstChunkTimer = setTimeout(() => {
    if (!receivedFirstChunk && activeAIRequest) {
      console.warn('[AI] Cerebras first chunk delayed >1000ms — failing over to Groq LPUs...');
      if (activeAIRequest.abort) activeAIRequest.abort();
      activeAIRequest = null;
      activeRequestId = null;
      tryGroqFallback('Cerebras response latency > 1000ms');
    }
  }, 1000);

  // MID-STREAM WATCHDOG: Fires if stream stalls silently for >15s after first chunk.
  // Prevents the UI spinner from hanging forever if Cerebras drops the connection mid-generation.
  let midStreamTimer = null;
  const resetMidStreamWatchdog = () => {
    clearTimeout(midStreamTimer);
    midStreamTimer = setTimeout(() => {
      if (activeAIRequest) {
        console.warn('[AI] Cerebras mid-stream stall detected (>15s no new chunk) — aborting.');
        try { activeAIRequest.abort(); } catch (_) {}
        activeAIRequest = null;
        activeRequestId = null;
        if (!event.sender.isDestroyed()) {
          event.sender.send('ai-stream-error', { requestId, error: 'AI stream timed out (stalled for 15s mid-response). Please try again.' });
        }
      }
    }, 15000);
  };

  const reqObj = cerebras.streamCompletion(cerebrasKey, question, {
    model: model || cerebras.DEFAULT_MODEL,
    context: context || {},
    onChunk: (chunk, fullText) => {
      receivedFirstChunk = true;
      if (reqObj) reqObj.hasStreamedTokens = true;
      clearTimeout(firstChunkTimer);
      resetMidStreamWatchdog(); // Reset rolling 15s watchdog on every chunk
      if (!event.sender.isDestroyed()) {
        event.sender.send('ai-stream-chunk', { requestId, chunk, fullText });
      }
    },
    onDone: (fullText) => {
      clearTimeout(firstChunkTimer);
      clearTimeout(midStreamTimer);
      activeAIRequest = null;
      activeRequestId = null;
      if (!event.sender.isDestroyed()) {
        event.sender.send('ai-stream-done', { requestId, fullText });
      }
    },
    onError: (err) => {
      clearTimeout(firstChunkTimer);
      clearTimeout(midStreamTimer);
      activeAIRequest = null;
      activeRequestId = null;
      // ⚡ Auto-fallback to Groq instead of showing error
      tryGroqFallback(err.message || 'unknown error');
    },
  });
  activeAIRequest = reqObj;
});

ipcMain.on('ai-stream-abort', (event) => {
  if (activeAIRequest) {
    if (activeRequestId && event.sender && !event.sender.isDestroyed()) {
      event.sender.send('ai-stream-aborted', { requestId: activeRequestId });
    }
    activeAIRequest.abort();
    activeAIRequest = null;
    activeRequestId = null;
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

  // ─── Auto-Update: Check for updates silently ───────────────
  if (autoUpdater && app.isPackaged) {
    autoUpdater.on('update-available', (info) => {
      console.log(`🆕 Update available: v${info.version}`);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('update-available', info.version);
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log(`✅ Update downloaded: v${info.version} — will install on restart`);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('update-downloaded', info.version);
      }
    });

    autoUpdater.on('error', (err) => {
      console.warn('⚠️ Auto-update error:', err.message);
    });

    // Check for updates 3 seconds after launch (non-blocking)
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        console.warn('⚠️ Update check failed:', err.message);
      });
    }, 3000);

    // Re-check every 30 minutes while app is running
    setInterval(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 30 * 60 * 1000);
  }

  // ─── IPC: Force install update now ─────────────────────────
  ipcMain.on('install-update-now', () => {
    if (autoUpdater) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  // Global Hotkeys
  globalShortcut.register('CommandOrControl+Shift+H', toggleOverlay);
  globalShortcut.register('CommandOrControl+Shift+P', panicHide);

  // Ctrl+Shift+Q = Emergency instant quit / terminate app completely
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    console.log('[System] Emergency Quit shortcut triggered (Ctrl+Shift+Q)');
    app.quit();
  });

  // Ctrl+Shift+A = Fresh single-shot analyze (always clears buffer)
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('analyze-screen-fresh');
    }
  });

  // Ctrl+Shift+S = Add screenshot to current problem (multi-screenshot mode)
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('analyze-screen-add');
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
