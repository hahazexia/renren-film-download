import initMainDB from './mainDBModel'
import Sequelize from 'sequelize';

const Op = Sequelize.Op;

function mainDBCURD () {
    let searchFilm = null;

    return async function () {
        if (searchFilm) {
            return {
                searchFilm
            }
        } else {
            const {
                Renren
            } = await initMainDB();

            searchFilm = async function (arg) {
                console.log('mainDBCURD searchFilm')
                let response = null;

                try {
                    const result = await Renren.findAll({
                        raw: true,
                        where: {
                            name: {
                                [Op.or]: {
                                    [Op.like]: '%' + arg.keyWord,
                                    [Op.substring]: arg.keyWord,
                                    [Op.like]: '%' + arg.keyWord + '%',
                                }
                            }
                        }
                    });
                    console.log(result, 'searchFilm result')
                    if (result) {
                        response = result;
                    }
                } catch (err) {
                    response = null;
                    console.log('searchFilm err', err);
                }

                return response;
            }


            return {
                searchFilm
            }
        }
    }
}

const initMainDBCURD = mainDBCURD();
export default initMainDBCURD;
