import { app } from 'electron'
import { createMainWindow } from './util/windows'

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.whenReady().then(appInit);
}

function appInit () {
    createMainWindow();
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) appInit()
})