import { app } from 'electron'
import { createMainWindow } from './util/windows'
import initMainDB from './util/mainDBModel'

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.whenReady().then(appInit);
}

async function appInit () {
    createMainWindow();

    await initMainDB();
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) appInit()
})
