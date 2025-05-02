import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as sqlite3 from 'sqlite3';
import { join } from 'path';

let win: BrowserWindow | null = null;
let db: sqlite3.Database;

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = width * 0.75;
  const windowHeight = height * 0.75;
  win = new BrowserWindow({
    x: (width - windowWidth) / 2,
    y: (height - windowHeight) / 2,
    width: windowWidth,
    height: windowHeight,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: true,
    },
    icon: join(__dirname, '/../public/icon-512x512.png'),
    show: false,
  });

  if (serve || (process.env['NODE_ENV'] || '').startsWith('dev')) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    let pathIndex = '../dist/browser/index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);

    if ((process.env['DEV_TOOLS'] || '').startsWith('true')) {
      win.webContents.openDevTools();
    } else {
      win.setMenu(null);
    }
  }

  win.once('ready-to-show', () => {
    win?.show();
  });

  win.on('closed', () => {
    win = null;
  });

  return win;
}

try {
  app.whenReady().then(() => {
    db = new sqlite3.Database(path.join(__dirname, 'sqlite.db'), (err) => {
      if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err);
      } else {
        console.log('Connexion à la base de données SQLite réussie');
      }
    });

    ipcMain.handle('executeQuery', async (event, query: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    });

    setTimeout(createWindow, 400);
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  console.error('Erreur lors du démarrage de l\'application :', e);
}
