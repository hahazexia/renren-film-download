import { app, Menu } from 'electron'
import { createMainWindow } from './util/windows'
import mainIPC from './util/mainIPC'

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.whenReady().then(appInit);
}

async function appInit () {
    mainIPC();
    createMainWindow();
    Menu.setApplicationMenu(null)
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) appInit()
})
