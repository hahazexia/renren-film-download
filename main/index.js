import { app, Menu } from 'electron'
import { createMainWindow } from './util/windows'
import mainIPC from './util/mainIPC'
// import path from 'path'
// import fs from 'fs'
// const csv = require('fast-csv');
// import initMainDBCURD from './util/mainDBCURD'

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.whenReady().then(appInit);
}

async function appInit () {
    mainIPC();
    createMainWindow();
    Menu.setApplicationMenu(null);

    // const mainDBCURD = await initMainDBCURD();
    // let n = 0;
    // fs.createReadStream(path.resolve(app.getPath('downloads'), './yyets_resource.csv'))
    // .pipe(csv.parse({ headers: false}))
    // .on('error', error => console.error(error))
    // .on('data', async row => {
    //     n++;
    //     console.log(`插入了${n}条数据`)
    //     await mainDBCURD.insertFilm({
    //         id: Number(row[0]),
    //         url: row[1],
    //         name: row[2],
    //         data: row[5],
    //     });
    // })
    // .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) appInit()
})
