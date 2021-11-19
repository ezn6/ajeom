const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const artDao = require("./artDao");
// Provider: Read 비즈니스 로직 처리



//홈화면
exports.getHome = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션 처리하기(존재하는 사용자인지/ status)
    //트랜잭션???
    const getHome = await artDao.getHome(connection, userId);//사용자별 분야+키워드 불러오기

    // const getArtByField = await artDao.getArtByField(connection, 16);//분야별 작품 불러오기 >16번 키워드
    // console.log(`test: ${JSON.stringify(getArtByField)}`);

    //[{"fieldId":1},{"fieldId":2},{"fieldId":3},{"fieldId":4},{"fieldId":13},{"fieldId":14},{"fieldId":15},{"fieldId":16}]
    const fieldRe = {};
    const kwRe = {};
    for(let i=0; i<getHome.length; i++){
        if(getHome[i].fieldId < 13){//분야
            const getArtByField = await artDao.getArtByField(connection, getHome[i].fieldId);
            switch (getHome[i].fieldId) {
                case 1:
                    fieldRe[1] = getArtByField;
                    break;
                case 2:
                    fieldRe[2] = getArtByField;
                    break;
                case 3:
                    fieldRe[3] = getArtByField;
                    break;
                case 4:
                    fieldRe[4] = getArtByField;
                    break;
                case 5:
                    fieldRe[5] = getArtByField;
                    break;
                case 6:
                    fieldRe[6] = getArtByField;
                    break;
                case 7:
                    fieldRe[7] = getArtByField;
                    break;
                case 8:
                    fieldRe[8] = getArtByField;
                    break;
                case 9:
                    fieldRe[9] = getArtByField;
                    break;
                case 10:
                    fieldRe[10] = getArtByField;
                    break;
                case 11:
                    fieldRe[11] = getArtByField;
                    break;
                case 12:
                    fieldRe[12] = getArtByField;
                    break;
            }
        } else {
            const getArtByField = await artDao.getArtByField(connection, getHome[i].fieldId);
            switch (getHome[i].fieldId) {
                case 13:
                    kwRe[13] = getArtByField;
                    break;
                case 14:
                    kwRe[14] = getArtByField;
                    break;
                case 15:
                    kwRe[15] = getArtByField;
                    break;
                case 16:
                    kwRe[16] = getArtByField;
                    break;
                case 17:
                    kwRe[17] = getArtByField;
                    break;
                case 18:
                    kwRe[18] = getArtByField;
                    break;
                case 19:
                    kwRe[19] = getArtByField;
                    break;
                case 20:
                    kwRe[20] = getArtByField;
                    break;
                case 21:
                    kwRe[21] = getArtByField;
                    break;
                case 22:
                    kwRe[22] = getArtByField;
                    break;
                case 23:
                    kwRe[23] = getArtByField;
                    break;
                case 24:
                    kwRe[24] = getArtByField;
                    break;
                case 25:
                    kwRe[25] = getArtByField;
                    break;
                case 26:
                    kwRe[26] = getArtByField;
                    break;
                case 27:
                    kwRe[27] = getArtByField;
                    break;
            }
        }
    }//for문end

    //최고아티스트
    const bestArtist = await artDao.bestArtist(connection, userId);
    //새로운아티스트
    const newArtist = await artDao.newArtist(connection, userId);

    connection.release();
    
    return {'field':fieldRe,'kw':kwRe, 'best':bestArtist, 'new':newArtist};
};

//옅보기 화면
exports.look = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션 처리하기(존재하는 사용자인지/ status)

    const topLook = await artDao.topLook(connection, userId);//옅보기수 top 10
    const bestHeart = await artDao.bestHeart(connection, userId);//베스트
    const latest = await artDao.latest(connection, userId);//최근
    const increase = await artDao.increase(connection, userId);//급상승

    connection.release();
    return {'top':topLook[0],'best':bestHeart, 'latest':latest, 'increase':increase};
};