const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const artProvider = require("./artProvider");
const artDao = require("./artDao");
const userDao = require("../User/userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리


//작품 올리기
exports.postArt = async function (userId,title, caption, img, price, link, fieldId, kwId) {//밸리:ok /트랜잭션하기
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션

        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        const params = [userId,title, caption, img, price, link];
        //작품 게시
        const postArt = await artDao.postArt(connection,params);
        //여기서 artId 찾아서 밑으로 넘기기
        const findArtId = await artDao.findArtId(connection,userId,title);
        //console.log(`artID!!!!: ${JSON.stringify(findArtId[0].artId)}`);

        //분야, 키워드 숫자 12이하, 12초과인지 확인하는 밸리 또는 flag 필요함!
        for(let i=0; i<fieldId.length; i++){//작품 분야 등록
            if(fieldId[i] > 12){
                connection.release();
                return errResponse(baseResponse.WRONG_FIELDID);//잘못된 분야 선택입니다 3027
            }
            const postArtField = await artDao.postArtField(connection,findArtId[0].artId,fieldId[i]);
        }
        for(let i=0; i<kwId.length; i++){//키워드 등록
            if(kwId[i] < 13){
                connection.release();
                return errResponse(baseResponse.WRONG_KWID);//잘못된 키워드 선택입니다 3028
            }
            const postArtField = await artDao.postArtField(connection,findArtId[0].artId,kwId[i]);
        }

        await connection.commit();
        return response(baseResponse.SUCCESS,{'artId':findArtId[0].artId});
    } catch (err) {
        await connection.rollback();
        logger.error(`App - postArt Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


//내 이미지함 저장
exports.saveImg = async function (userId,artId) {//밸리:ok
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        //밸리데이션:artwork 존재, status=1확인
        const artwork = await artDao.artwork(connection,artId);//artwork 존재, status=1확인
        if (artwork.length < 1){
            connection.release();
            return errResponse(baseResponse.DELETED_ARTWORK);//존재하지 않거나 삭제된 작품입니다.
        } else{
            //밸리: 이미 존재하는 이미지인지 확인
            const existImg = await artDao.existImg(connection,artId,userId);
            if (existImg.length > 0){
                connection.release();
                return errResponse(baseResponse.EXIST_IMG);//이미지함에 존재하는 작품 입니다.
            }
            const saveImg = await artDao.saveImg(connection,artId,userId);
            connection.release();
            return response(baseResponse.SUCCESS,{'artId':artwork[0].artId});
        }
    } catch (err) {
        logger.error(`App - saveImg Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//보관함생성
exports.postStorage = async function (userId,title,caption,share,myimgId) {//밸리: /트랜잭션하기
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션

        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        //보관함 생성
        const artwork = await artDao.postStorage(connection,userId,title,caption,share);
        //방금 만든 보관함 storageId 찾기
        const findstorageId = await artDao.findstorageId(connection,userId,title,caption);
        //내 이미지함에서 이미지 선택하고 보관함 만들기
        for(let i=0; i<myimgId.length; i++){
            //내 이미지함에 존재하는 이미지인지 확인 status=1
            const findMyImg = await artDao.findMyImg(connection,userId,myimgId[i]);
            if(findMyImg.length < 1){
                connection.release();
                return errResponse(baseResponse.DEL_IMG_ERROR);//내 이미지함에 존재하지 않는 이미지입니다 이미지함에 존재하지 않거나 삭제된 이미지 입니다 3026
            }

            const selectImg = await artDao.selectImg(connection,findstorageId[0].storageId,myimgId[i]);//INSERT INTO Bookmark
        }
        await connection.commit();
        return response(baseResponse.SUCCESS,{'created':title});

    } catch (err) {
        await connection.rollback();
        logger.error(`App - postStorage Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

//작품 다중삭제
exports.delArt = async function (userId,artId) {//artId는 배열 //밸리데이션: OK!
    try {
        //밸리데이션:존재하는작품이며 status=1인지
        //트랜잭션 적용하기
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        for(let i=0; i<artId.length; i++){
            const artwork = await artDao.artwork(connection,artId[i]);//artwork 존재, status=1확인
            if(artwork.length > 0){
                const delArt = await artDao.delArt(connection,userId,artId[i]);
            }
            else{
                connection.release();
                return errResponse(baseResponse.DELETED_ARTWORK);
            }
        }

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - delArt Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//보관함 삭제
exports.delStorage = async function (userId,storageId) {//밸리데이션:OK
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        //밸리데이션:나에게 존재하는 보관함인지(status=1)
        const myexistStorage = await artDao.myexistStorage(connection,userId,storageId);
        if (myexistStorage.length < 1){
            connection.release();
            return errResponse(baseResponse.STORAGE_ERROR);//존재하지 않거나 삭제된 보관함 입니다 3021
        }

        const delStorage = await artDao.delStorage(connection,userId,storageId);
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - delStorage Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//보관함 좋아요
exports.likeStorage = async function (userId,storageId) {//밸리데이션:ok!/ 트랜잭션
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션

        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        //밸리데이션: 그냥 존재하는 보관함인지(status=1)
        const existStorage = await artDao.existStorage(connection,storageId);
        if (existStorage.length < 1){
            connection.release();
            return errResponse(baseResponse.STORAGE_ERROR);//존재하지 않거나 삭제된 보관함 입니다 3021
        }

        //밸리데이션:이미 보관함에 좋아요 하트 눌렀는지 여부 확인 status=1
        const existLike = await artDao.existLike(connection,userId,storageId);
        if(existLike.length > 0){
            connection.release();
            return errResponse(baseResponse.LIKES_ERROR);//이미 좋아요를 누른 보관함 입니다 3022
        }

        const likeStorage = await artDao.likeStorage(connection,userId,storageId);
        const plusLike = await artDao.plusLike(connection,storageId);
        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - likeStorage Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

//보관함 좋아요 취소
exports.delLikeStorage = async function (userId,storageId) {//밸리데이션:ok!/ 트랜잭션
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션

        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        //밸리데이션: 그냥 존재하는 보관함인지(status=1)
        const existStorage = await artDao.existStorage(connection,storageId);
        if (existStorage.length < 1){
            connection.release();
            return errResponse(baseResponse.STORAGE_ERROR);//존재하지 않거나 삭제된 보관함 입니다 3021
        }

        //밸리데이션: 보관함에 좋아요 하트 눌렀는지 여부 확인 status=1
        const existLike = await artDao.existLike(connection,userId,storageId);
        if(existLike.length < 1){
            connection.release();
            return errResponse(baseResponse.DEL_LIKES_ERROR);//좋아요를 누르지 않아 취소할수 없는 보관함 입니다 3023
        }

        const delLikeStorage = await artDao.delLikeStorage(connection,userId,storageId);
        const minLike = await artDao.minLike(connection,storageId);
        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - delLikeStorage Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

//보관함 저장 옅보기 저장
exports.saveStorage = async function (userId,storageId) {//밸리데이션:ok! / 트랜잭션
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션

        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        //밸리데이션: 그냥 존재하는 보관함인지(status=1)
        const existStorage = await artDao.existStorage(connection,storageId);
        if (existStorage.length < 1){
            connection.release();
            return errResponse(baseResponse.STORAGE_ERROR);//존재하지 않거나 삭제된 보관함 입니다 3021
        }

        //밸리데이션: 보관함 이미 저장했는지 여부 확인 status=1
        const existSave = await artDao.existSave(connection,userId,storageId);
        if(existSave.length > 0){
            connection.release();
            return errResponse(baseResponse.SAVE_ERROR);//이미 저장한 보관함 입니다 3024
        }

        const saveStorage = await artDao.saveStorage(connection,userId,storageId);
        const plusSave = await artDao.plusSave(connection,storageId);
        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - saveStorage Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

//보관함 저장 취소
exports.delSaveStorage = async function (userId,storageId) {//밸리데이션:ok / 트랜잭션
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션

        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        //밸리데이션: 그냥 존재하는 보관함인지(status=1)
        const existStorage = await artDao.existStorage(connection,storageId);
        if (existStorage.length < 1){
            connection.release();
            return errResponse(baseResponse.STORAGE_ERROR);//존재하지 않거나 삭제된 보관함 입니다 3021
        }

        //밸리데이션: 보관함 저장됐는지 여부 확인 status=1
        const existSave = await artDao.existSave(connection,userId,storageId);
        if(existSave.length < 1){
            connection.release();
            return errResponse(baseResponse.DEL_SAVE_ERROR);//저장하지 않아서 취소할수가 없는 보관함 입니다 3025
        }

        const delSaveStorage = await artDao.delSaveStorage(connection,userId,storageId);
        const minSave = await artDao.minSave(connection,storageId);
        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - delSaveStorage Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

//내이미지함 삭제
exports.delImg = async function (userId,myimgId) {//밸리데이션: / 트랜잭션
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션

        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        //밸리데이션: 내이미지함에 존재하는지 status=1
        const existMyimg = await artDao.existMyimg(connection,userId,myimgId);
        if (existMyimg.length < 1){
            connection.release();
            return errResponse(baseResponse.DEL_IMG_ERROR);//이미지함에 존재하지 않거나 삭제된 이미지 입니다 3026
        }

        const delImg = await artDao.delImg(connection,userId,myimgId);//status=1
        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - delImg Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}