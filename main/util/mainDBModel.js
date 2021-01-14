import Sequelize from 'sequelize';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

function mainDB () {
    let Renren = null,
    sequelizeObject = null;

    return async function () {
        const Op = Sequelize.Op;
        if (sequelizeObject) {
            return {
                Renren
            }
        } else {
            const DBPath = path.resolve(app.getPath('appData'), './renrenFilmDownload/DB');
            console.log(`数据库路径在这里：${DBPath}`);


            if (!fs.existsSync(DBPath)) {
                fs.mkdirSync(DBPath, {recursive: true});
            }

            sequelizeObject = new Sequelize('mainDB', null, null, {
                dialect: 'sqlite',
                storage: path.resolve(DBPath, './mainDB.db'),
                logging: false
            });

            Renren = sequelizeObject.define('yyets_resources', {
                id: {type: Sequelize.INTEGER, primaryKey: true},
                url: {type: Sequelize.STRING},
                name: {type: Sequelize.STRING},
                time1: {type: Sequelize.INTEGER},
                time2: {type: Sequelize.STRING},
                data: {type: Sequelize.TEXT},
            });

            await Promise.all([
                Renren.sync()
            ]);

            return {
                Renren
            }
        }
    }
}

const initMainDB = mainDB();

export default initMainDB
