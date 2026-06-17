/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Electron Main Process
   Multi-Layer Stealth System for Screen-Share Invisibility
   ═══════════════════════════════════════════════════════════════════ */

const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

// ─── Stealth Layer 0: Process Title Disguise ────────────────────
// Rename process title to avoid detection in task manager
app.setName('System Host Service');
if (process.platform === 'win32') {
  app.setAppUserModelId('Microsoft.Windows.SystemHost');
}

let mainWindow;
let isOverlayVisible = true;

function createWindow() {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 480,
    height: 750,
    x: screenW - 500,  // Position to right side of screen
    y: 20,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,            // Hide from Alt+Tab and taskbar
    hasShadow: false,             // No shadow = harder to detect visually
    focusable: true,
    resizable: true,
    movable: true,
    // ─── Stealth Layer 1: Exclude from capture at window creation ───
    // Setting type to 'toolbar' helps with some capture exclusion methods
    type: 'toolbar',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false  // Keep app responsive even when unfocused
    }
  });

  // ─── Stealth Layer 2: Content Protection BEFORE loading content ──
  // Must be set BEFORE the window renders any content for maximum reliability
  mainWindow.setContentProtection(true);

  // ─── Stealth Layer 3: Additional Window Flags ───────────────────
  // Exclude from the Windows "screen list" that apps like Discord enumerate
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Now load the content AFTER protection is active
  mainWindow.loadFile('index.html');

  // ─── Stealth Layer 4: Re-apply protection after page loads ──────
  // Some Windows builds reset the display affinity after initial render
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setContentProtection(true);
  });

  // Re-apply on focus changes (some capture tools re-check on focus)
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

// ─── IPC Handlers ─────────────────────────────────────────────────

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setIgnoreMouseEvents(ignore, options);
  }
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

// Handle opacity changes from the renderer
ipcMain.on('set-opacity', (event, opacity) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity);
  }
});

// Move window to a specific screen edge
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

// ─── Toggle Overlay ────────────────────────────────────────────────
function toggleOverlay() {
  if (!mainWindow) return;
  isOverlayVisible = !isOverlayVisible;

  if (isOverlayVisible) {
    mainWindow.show();
    mainWindow.setContentProtection(true); // Re-apply on show
    mainWindow.focus();
  } else {
    mainWindow.hide();
  }
}

// ─── Emergency Panic Hide ──────────────────────────────────────────
// Instantly makes the window invisible (size to 1x1, move off-screen)
function panicHide() {
  if (!mainWindow) return;
  mainWindow.hide();
  isOverlayVisible = false;
}

// ─── App Lifecycle ─────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  // ─── Global Hotkeys ──────────────────────────────────────────────
  // Ctrl+Shift+H — Toggle overlay visibility
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    toggleOverlay();
  });

  // Ctrl+Shift+P — PANIC: Emergency instant hide
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    panicHide();
  });

  // Ctrl+Shift+A — Analyze screen (sends message to renderer)
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('analyze-screen');
    }
  });

  // Alt+Left/Right — Snap window to screen edges
  globalShortcut.register('Alt+Left', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;
      if (bounds.x > screenW / 2) {
        mainWindow.setPosition(20, bounds.y);
      }
    }
  });

  globalShortcut.register('Alt+Right', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;
      const [winW] = mainWindow.getSize();
      if (bounds.x < screenW / 2) {
        mainWindow.setPosition(screenW - winW - 20, bounds.y);
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
