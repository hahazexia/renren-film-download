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
                url: {type: Sequelize.TEXT},
                name: {type: Sequelize.TEXT},
                time1: {type: Sequelize.INTEGER},
                time2: {type: Sequelize.TEXT},
                data: {type: Sequelize.TEXT},
            });

            let num = await Renren.count({
                where: {
                    id: {
                        [Op.ne]: ''
                    }
                }
            });
            console.log(num, 'num 哈哈哈')
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
