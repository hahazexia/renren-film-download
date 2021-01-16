import { BrowserWindow } from 'electron';
import { windowConstants } from './envConstants'

function createMainWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 500,
        center: true,
        resizable: true,
        frame: true,
        hasShadow: true,
        show: false,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true
        }
    });

    global.mainWindow = mainWindow;
    mainWindow.loadURL(windowConstants.mainWindowUrl);

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools({mode: 'bottom'});
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        global.mainWindow = null;
    });

    return mainWindow;
}

export {
    createMainWindow
}
