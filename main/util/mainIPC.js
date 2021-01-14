import { ipcMain } from 'electron'
import initMainDBCURD from './mainDBCURD'

function mainIPC () {
    ipcMain.handle('searchFilm', async (event, arg) => {
        const mainDBCURD = await initMainDBCURD();

        let result = await mainDBCURD.searchFilm({
            keyWord: arg.keyWord
        });

        return result
    });
    //const result = await ipcRenderer.invoke('searchFilm', {keyWord: ''})
}

export default mainIPC
