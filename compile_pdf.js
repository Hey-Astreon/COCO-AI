const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  console.log('🚀 Launching Electron high-DPI rendering engine...');

  const win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 1600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  const htmlPath = path.join(__dirname, 'Coco_AI_Book.html');
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;

  console.log('📖 Loading manuscript:', fileUrl);
  await win.loadURL(fileUrl);

  // Wait 1.5 seconds for all Google Fonts (Cinzel, Inter, JetBrains Mono) to render
  await new Promise(r => setTimeout(r, 1500));

  console.log('🖨️ Rendering publication-grade PDF with vector graphics...');

  const pdfData = await win.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    landscape: false,
    preferCSSPageSize: true,
    margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });

  const outputPath = path.join(__dirname, 'Coco_AI_Engineering_Masterclass.pdf');
  fs.writeFileSync(outputPath, pdfData);

  console.log('🎉 SUCCESS! Generated Book PDF:');
  console.log('   Path: ' + outputPath);
  console.log('   Size: ' + (pdfData.length / 1024).toFixed(1) + ' KB');

  app.quit();
});
