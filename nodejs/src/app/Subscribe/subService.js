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
        //console.log(`data: ${JSON.stringify(fieldId)}`);
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        //밸리데이션: 이미 구독한사람인지 확인
        const isSub = await subDao.existSub(connection,userId,artistId);
        if(isSub.length > 0)
            return errResponse(baseResponse.SUBSCRIBE_ERROR);

        if( isUser.length > 0){
            const subscribe = await subDao.subscribe(connection,userId,artistId);
            connection.release();
            return response(baseResponse.SUCCESS);
        }
    } catch (err) {
        logger.error(`App - subscribe Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}