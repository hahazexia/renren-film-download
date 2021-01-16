import { ipcMain, app, dialog } from 'electron'
import initMainDBCURD from './mainDBCURD'
import fs from 'fs'
import path from 'path'

function mainIPC () {
    ipcMain.handle('searchFilm', async (event, arg) => {
        const mainDBCURD = await initMainDBCURD();

        let result = await mainDBCURD.searchFilm({
            keyWord: arg.keyWord,
            page: arg.page,
            limit: arg.limit
        });

        return result
    });

    ipcMain.on('exportToFile', (event, link) => {
        const downloadPath = path.resolve(app.getPath('downloads'), './renrenFilmsDownloadLinks.txt');
        console.log(downloadPath, 'downloadPath')

        dialog.showSaveDialog({
            title: '另存为下载链接到文件',
            defaultPath: downloadPath,
            buttonLabel: '保存哈哈'
        }).then(data => {
            console.log(data, 'exportToFile path')
            if (!data.canceled) {
                fs.writeFile(data.filePath, link, (err) => {
                    if (err) {
                        console.log(err, 'exportToFile fs.writeFile err')
                        dialog.showErrorBox({
                            title: '写入本地文件遇到错误！',
                            content: err.toString()
                        });
                    }
                    console.log('The file has been saved!');
                    dialog.showMessageBox({
                        type: 'info',
                        title: '导出到文件成功！',
                        message: `导出到文件成功！文件在此处：${data.filePath}`
                    });
                });
            }
        }).catch(err => {
            console.log(err, 'exportToFile err');
            dialog.showErrorBox({
                title: '另存为文件遇到错误！',
                content: err.toString()
            });
        });
    });
}

export default mainIPC
