const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const reportProvider = require("./reportProvider");
const reportDao = require("./reportDao");
const userDao = require("../User/userDao");
const artDao = require("../Art/artDao");
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


//후기 신고
exports.review = async function (userId,reviewId,number,caption) {//밸리:ok / 트랜잭션
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션
        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        //밸리: 존재하는 리뷰인지(status=1)
        const isReview = await reportDao.isReview(connection,reviewId);
        if(isReview.length < 1){
            connection.release();
            return errResponse(baseResponse.REVIEW_ERROR);//존재하지 않거나 삭제된 후기 입니다
        }

        const reportReview = await reportDao.reportReview(connection,userId,reviewId,number,caption);//신고
        const findReport = await reportDao.findReport(connection,reviewId);//신고할 유저찾기
        // findReport[0].userId
        const reportNumcount = await reportDao.reportNumcount(connection,findReport[0].userId);//신고수누적

        await connection.commit();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        await connection.rollback();
        logger.error(`App - review Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

//계정 신고
exports.userReport = async function (userId,artistId,number,caption) {//밸리:OK / 트랜잭션
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션
        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        const isUser2 = await userDao.existUserAccount(connection,artistId);
        if((isUser.length < 1) || (isUser2.length < 1)){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        const userReport = await reportDao.userReport(connection,userId,artistId,number,caption);//신고
        const reportNumcount = await reportDao.reportNumcount(connection,artistId);//신고수누적

        await connection.commit();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        await connection.rollback();
        logger.error(`App - userReport Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

//게시물 신고
exports.artReport = async function (userId,artId,number,caption) {//밸리: / 트랜잭션
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();//트랜잭션
        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        //밸리: 존재하는 작품인지(status=1)
        const artwork = await artDao.artwork(connection,artId);
        if(artwork.length < 1){
            connection.release();
            return errResponse(baseResponse.DELETED_ARTWORK);//존재하지 않거나 삭제된 작품입니다
        }

        const artReport = await reportDao.artReport(connection,userId,artId,number,caption);//신고
        const findArtist = await reportDao.findArtist(connection,artId);//신고할 유저찾기
        const reportNumcount = await reportDao.reportNumcount(connection,findArtist[0].userId);//신고수누적

        await connection.commit();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        await connection.rollback();
        logger.error(`App - artReport Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}