const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const subProvider = require("./subProvider");
const subDao = require("./subDao");
const userDao = require("../User/userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

const winston = require('winston');
//const logger = winston.createLogger();
const qs = require('qs');
const fetch = require('node-fetch-npm');
// Service: Create, Update, Delete 비즈니스 로직 처리


//구독하기
exports.subscribe = async function (userId,artistId) {//밸리 완성!
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,artistId);
        const isUser2 = await userDao.existUserAccount(connection,userId);
        if((isUser.length < 1) || (isUser2.length < 1)){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        else{
            //밸리데이션: 이미 구독한사람인지 확인(status=1)
            const isSub = await subDao.existSub(connection,userId,artistId);
            if(isSub.length > 0){
                connection.release();
                return errResponse(baseResponse.SUBSCRIBE_ERROR);//이미구독한작가입니다
            }
            else{
                const subscribe = await subDao.subscribe(connection,userId,artistId);
                connection.release();
                return response(baseResponse.SUCCESS);
            }
        }
    } catch (err) {
        logger.error(`App - subscribe Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//구독취소
exports.delsub = async function (userId,artistId) {//밸리 완성!
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,artistId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        else{
            //밸리데이션:구독한사람인지 확인(status=1)
            const isSub = await subDao.existSub(connection,userId,artistId);
            //console.log(`isSub: ${JSON.stringify(isSub)}`);
            if(isSub.length < 1){
                connection.release();
                return errResponse(baseResponse.NOT_SUBSCRIBE);//구독사실이 없으므로 구취불가
            }
            else{
                const delsub = await subDao.delsub(connection,userId,artistId);
                connection.release();
                return response(baseResponse.SUCCESS);
            }
        }
    } catch (err) {
        logger.error(`App - delsub Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//구독후기작성
exports.subReview = async function (userId, artistId, caption) {//밸리:존재하는회원,존재하는작가_
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        //밸리데이션:존재하는 작가인지(status=1)
        const isUser2 = await userDao.existUserAccount(connection,artistId);
        if((isUser.length < 1) || (isUser2.length < 1)){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        else{
            const subReview = await subDao.subReview(connection,userId, artistId, caption);
            connection.release();
            return response(baseResponse.SUCCESS);
        }
    } catch (err) {
        logger.error(`App - subReview Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}