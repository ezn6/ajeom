const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const artProvider = require("./artProvider");
const artDao = require("./artDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리


//작품 올리기
exports.postArt = async function (userId, type, title, img, caption, price, link,fieldId,kwId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자 status
        //트랜잭션

        const params = [userId, type, title, img, caption, price, link];
        //작품 게시
        const postArt = await artDao.postArt(connection,params);
        //여기서 artId 찾아서 밑으로 넘기기
        const findArtId = await artDao.findArtId(connection,userId, type, title);
        //console.log(`artID!!!!: ${JSON.stringify(findArtId[0].artId)}`);

        for(let i=0; i<fieldId.length; i++){//작품 분야 등록
            const postArtField = await artDao.postArtField(connection,findArtId[0].artId,fieldId[i]);
        }
        for(let i=0; i<kwId.length; i++){//키워드 등록
            const postArtField = await artDao.postArtField(connection,findArtId[0].artId,kwId[i]);
        }

        connection.release();

        return response(baseResponse.SUCCESS,{'artId':findArtId[0].artId});
    } catch (err) {
        logger.error(`App - postArt Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}


//내 이미지함 저장
exports.saveImg = async function (userId,artId) {
    try {
        //밸리데이션:artwork 존재, status=1확인는 했음/ 이미 존재 하는 이미지면 저장 되면 안됨
        const connection = await pool.getConnection(async (conn) => conn);

        const artwork = await artDao.artwork(connection,artId);//artwork 존재, status=1확인
        if (artwork.length > 0){
            const saveImg = await artDao.saveImg(connection,artId,userId);
            connection.release();
            return response(baseResponse.SUCCESS,{'artId':artwork[0].artId});
        } else{
            return errResponse(baseResponse.DELETED_ARTWORK);
        }

    } catch (err) {
        logger.error(`App - saveImg Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//보관함생성
exports.postStorage = async function (userId,title,caption,share,myimgId) {
    try {
        //밸리데이션:myimgId가 내이미지함에 존재하는지?
        //트랜잭션
        const connection = await pool.getConnection(async (conn) => conn);

        //보관함 생성
        const artwork = await artDao.postStorage(connection,userId,title,caption,share);
        //보관함 storageId 찾기
        const findstorageId = await artDao.findstorageId(connection,userId,title,caption);
        //내 이미지함에서 이미지 선택하고 보관함 만들기
        for(let i=0; i<myimgId.length; i++){
            const selectImg = await artDao.selectImg(connection,findstorageId[0].storageId,myimgId[i]);
        }
        return response(baseResponse.SUCCESS,{'created':title});

    } catch (err) {
        logger.error(`App - postStorage Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}