const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const userDao = require("../User/userDao");
const artDao = require("./artDao");
// Provider: Read 비즈니스 로직 처리



//홈화면
exports.getHome = async function (userId) {//밸리:최고,새로운아티스트:쿼리로status=1,
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
exports.look = async function (userId) {//밸리
    const connection = await pool.getConnection(async (conn) => conn);

    const topLook = await artDao.topLook(connection, userId);//옅보기수 top 10(상단)

    connection.release();
    return topLook[0];
};

//보관함 탭
exports.storage = async function (userId) {//밸리:ok!
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    if(isUser.length < 1)
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원

    const storage = await artDao.storage(connection, userId);//내보관함 미리보기 5개 생성최근순
    const storage2 = await artDao.storage2(connection, userId,userId);//내이미지 미리보기 1개 최근
    connection.release();
    return {'storage':storage,'myimg':storage2};
};

//옅보기탭>베스트보관함
exports.lookBest = async function (userId,cursor) {//밸리:ok
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    if(isUser.length < 1)
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원

    //1.if커서가 없으면 첫번째 페이지, dao에서 올때 가장마지막 커서 가지고 오기
    //2.hasMore:true,nextCs: 정보 res로 넘겨주기/ hasMore는 한번 dao갔다오고 또 dao가서 length>0이면 true, 아니면 false. false이면 클라에서 멈출것.

    if(cursor==undefined){
        const lookBest = await artDao.lookBest(connection, userId);
        const lookBestNext = await artDao.lookBestNext(connection, lookBest[lookBest.length - 1].cs);
        if(lookBestNext.length > 0){
            connection.release();
            return {'best':lookBest, 'nextCs':lookBest[lookBest.length - 1].cs, 'hasMore':true};
        } else{
            connection.release();
            return {'best':lookBest, 'nextCs':lookBest[lookBest.length - 1].cs, 'hasMore':false};
        }
    } else{
        const lookBestNext = await artDao.lookBestNext(connection, cursor);
        const lookBestNext2 = await artDao.lookBestNext(connection, lookBestNext[lookBestNext.length - 1].cs);
        if(lookBestNext2.length > 0){
            connection.release();
            return {'best':lookBestNext, 'nextCs':lookBestNext[lookBestNext.length - 1].cs, 'hasMore':true};
        } else{
            connection.release();
            return {'best':lookBestNext, 'nextCs':lookBestNext[lookBestNext.length - 1].cs, 'hasMore':false};
        }
    }
};

//옅보기탭>최근보관함
exports.lookRecent = async function (userId,cursor) {//밸리:ok
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    if(isUser.length < 1)
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원

    //1.if커서가 없으면 첫번째 페이지, dao에서 올때 가장마지막 커서 가지고 오기
    //2.hasMore:true,nextCs: 정보 res로 넘겨주기/ hasMore는 한번 dao갔다오고 또 dao가서 length>0이면 true, 아니면 false. false이면 클라에서 멈출것.

    if(cursor==undefined){
        const lookRecent = await artDao.lookRecent(connection, userId);
        const lookRecentNext = await artDao.lookRecentNext(connection, lookRecent[lookRecent.length - 1].cs);
        if(lookRecentNext.length > 0){
            connection.release();
            return {'new':lookRecent, 'nextCs':lookRecent[lookRecent.length - 1].cs, 'hasMore':true};
        } else{
            connection.release();
            return {'new':lookRecent, 'nextCs':lookRecent[lookRecent.length - 1].cs, 'hasMore':false};
        }
    } else{
        const lookRecentNext = await artDao.lookRecentNext(connection, cursor);
        const lookRecentNext2 = await artDao.lookRecentNext(connection, lookRecentNext[lookRecentNext.length - 1].cs);
        if(lookRecentNext2.length > 0){
            connection.release();
            return {'new':lookRecentNext, 'nextCs':lookRecentNext[lookRecentNext.length - 1].cs, 'hasMore':true};
        } else{
            connection.release();
            return {'new':lookRecentNext, 'nextCs':lookRecentNext[lookRecentNext.length - 1].cs, 'hasMore':false};
        }
    }
};

//보관함 상세
exports.storageDetail = async function (userId,cursor,storageId) {//밸리:
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    if(isUser.length < 1)
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원

    const storageTop = await artDao.storageTop(connection,storageId);//보관함상세_상단정보

    if(cursor==undefined){
        const storageDetail = await artDao.storageDetail(connection, storageId);
        const storageDetailNext = await artDao.storageDetailNext(connection,storageId, storageDetail[storageDetail.length - 1].cs);
        if(storageDetailNext.length > 0){
            connection.release();
            return {'top':storageTop,
            'imgs':storageDetail, 'nextCs':storageDetail[storageDetail.length - 1].cs, 'hasMore':true};
        } else{
            connection.release();
            return {'top':storageTop,
                'imgs':storageDetail, 'nextCs':storageDetail[storageDetail.length - 1].cs, 'hasMore':false};
        }
    } else{
        const storageDetailNext = await artDao.storageDetailNext(connection,storageId, cursor);
        const storageDetailNext2 = await artDao.storageDetailNext(connection,storageId, storageDetailNext[storageDetailNext.length - 1].cs);
        if(storageDetailNext2.length > 0){
            connection.release();
            return {'imgs':storageDetailNext, 'nextCs':storageDetailNext[storageDetailNext.length - 1].cs, 'hasMore':true};
        } else{
            connection.release();
            return {'imgs':storageDetailNext, 'nextCs':storageDetailNext[storageDetailNext.length - 1].cs, 'hasMore':false};
        }
    }
};