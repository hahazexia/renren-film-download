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
}

export default mainIPC
