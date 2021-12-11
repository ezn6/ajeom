const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
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



const getUserInfo = async (url, access_token) => {
    try {
        console.log("userService - getUserInfo!");
        return await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': `Bearer ${access_token}`
            }
        }).then(res => res.json());
    }catch(e) {
        logger.info("error", e);
    }
};

//회원가입+로그인
exports.createUser = async function (access_token) {
    try {
        //1. access_token으로 사용자 id를 찾고 2.id중복확인

        const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
        const userInfo = await getUserInfo(userInfoUrl, access_token);

        // id중복확인
        const idRows = await userProvider.accountCheck(userInfo.id);//dao > selectUserAccount
        if (idRows.length > 0) {//존재하면>jwt토큰을준다/ 없으면>db에 저장 후 jwt토큰을 준다
            //console.log(`idRows정보 : ${idRows[0].userId}`);

            //토큰 생성 Service
            let token = await jwt.sign(
                {
                    userId: idRows[0].userId,
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀키
                {
                    expiresIn: "365d",
                    subject: "userInfo",
                } // 유효 기간 365일
            );

            console.log(`로그인한 회원 : ${userInfo.kakao_account.profile.nickname}`);
            return response(baseResponse.SUCCESS, {
                'userId': idRows[0].userId, 'name': userInfo.kakao_account.profile.nickname, 'jwt': token,'isMember':true});
        }
        else{
            const connection = await pool.getConnection(async (conn) => conn);
            const insertUserInfoParams = [userInfo.id,userInfo.kakao_account.profile.nickname,userInfo.kakao_account.profile.profile_image_url]
            const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);

            //토큰 생성 Service
            let token = await jwt.sign(
                {
                    Id: userInfo.id,
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀키
                {
                    expiresIn: "365d",
                    subject: "userInfo",
                } // 유효 기간 365일
            );

            connection.release();
            console.log(`추가된 회원 : ${userInfo.kakao_account.profile.nickname}`);
            return response(baseResponse.SUCCESS, {
                'id': userInfo.id, 'name': userInfo.kakao_account.profile.nickname, 'jwt': token,'isMember':false});
        }

        // 비밀번호 암호화
        // const hashedPassword = await crypto
        //     .createHash("sha512")
        //     .update(pw)
        //     .digest("hex");

        // const insertUserInfoParams = [id,hashedPassword,name,email,phone,code,road,detail,gender,birthday];
        // console.log(`data: ${JSON.stringify(insertUserInfoParams)}`)
        // const connection = await pool.getConnection(async (conn) => conn);
        //
        // const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        // console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        // connection.release();
        // return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};



//유저 분야 선택
exports.field = async function (userId,fieldId) {//밸리:
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        for(let i=0; i<fieldId.length; i++){
            console.log(`fieldId분야 : ${fieldId[i]}`);
            //밸리데이션:이미 선택된거면 넘어가도록(혹시나 로그인오류로 인한)
            const fieldResult = await userDao.field(connection,userId,fieldId[i]);

        }
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - field Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//유저 키워드 선택
exports.keyword = async function (userId,fieldId) {//밸리:이미 선택된거인지?
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        for(let i=0; i<fieldId.length; i++){

                console.log(`fieldId키워드 : ${fieldId[i]}`);
                const fieldResult = await userDao.field(connection,userId,fieldId[i]);

        }
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - keyword Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//유저 분야 수정
exports.fieldPatch = async function (userId, infield, outfield) {//밸리:
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        for(let i=0; i<outfield.length; i++){//분야 삭제
            const fieldout = await userDao.fieldout(connection,userId,outfield[i]);
        }
        //분아 추가 전에 밸리데이션 넣기(이미 있는 분야인지)
        for(let i=0; i<infield.length; i++){//분야 추가
            const fieldin = await userDao.fieldin(connection,userId,infield[i]);
        }

        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - fieldPatch Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//유저 키워드 수정
exports.kwPatch = async function (userId, inkw, outkw) {//밸리:
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }

        for(let i=0; i<outkw.length; i++){//키워드 삭제
            const kwout = await userDao.fieldout(connection,userId,outkw[i]);
        }
        //키워드 추가 전에 밸리대이션 넣기(이미 있는 키워드인지)
        for(let i=0; i<inkw.length; i++){//키워드 추가
            const kwin = await userDao.fieldin(connection,userId,inkw[i]);
        }

        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - fieldPatch Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//닉네임 수정
exports.namePatch = async function (userId, nickname) {//밸리:ok
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        else{
            //닉네임 중복제거
            const findName = await userDao.findName(connection,nickname);
            if (findName.length > 0){
                connection.release();
                return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
            }
            const namePatch = await userDao.namePatch(connection,nickname,userId);
            connection.release();
            return response(baseResponse.SUCCESS);
        }
    } catch (err) {
        logger.error(`App - namePatch Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//프로필 수정
exports.profilePatch = async function (userId, profile) {//밸리:ok
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        else{
            const profilePatch = await userDao.profilePatch(connection,profile,userId);
            connection.release();
            return response(baseResponse.SUCCESS);
        }
    } catch (err) {
        logger.error(`App - profilePatch Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//작가한마디 수정
exports.summaryPatch = async function (userId, summary) {//밸리:
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        //밸리데이션:사용자가 존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        if(isUser.length < 1){
            connection.release();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        const summaryPatch = await userDao.summaryPatch(connection,summary,userId);
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - summaryPatch Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}




// TODO: After 로그인 인증 방법 (JWT)
// exports.postSignIn = async function (id, pw) {
//     try {
//         // id 존재여부 확인
//         const idRows = await userProvider.accountCheck(id);
//         if (idRows.length < 1) return errResponse(baseResponse.USER_USERID_NOT_EXIST);
//         //const selectId = idRows[0].id
//
//         // 비밀번호 확인
//         const hashedPassword = await crypto
//             .createHash("sha512")
//             .update(pw)
//             .digest("hex");
//
//         const selectUserPasswordParams = [id, hashedPassword];
//         const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);
//
//         if(passwordRows.length < 1) {
//             return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
//         }
//
//         // 계정 상태 확인
//         const userInfoRows = await userProvider.accountCheck(id);
//
//         if (userInfoRows[0].status === 2) {
//             return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
//         } else if (userInfoRows[0].status === 3) {
//             return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
//         }
//
//         console.log(userInfoRows[0].userId) // DB의 userId
//
//         //토큰 생성 Service
//         let token = await jwt.sign(
//             {
//                 userId: userInfoRows[0].userId,
//             }, // 토큰의 내용(payload)
//             secret_config.jwtsecret, // 비밀키
//             {
//                 expiresIn: "365d",
//                 subject: "userInfo",
//             } // 유효 기간 365일
//         );
//
//         return response(baseResponse.SUCCESS, {
//             'userId': userInfoRows[0].userId, 'name': userInfoRows[0].name, 'jwt': token});
//
//     } catch (err) {
//         logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
// };




// exports.editUser = async function (id, nickname) {
//     try {
//         console.log(id)
//         const connection = await pool.getConnection(async (conn) => conn);
//         const editUserResult = await userDao.updateUserInfo(connection, id, nickname)
//         connection.release();
//
//         return response(baseResponse.SUCCESS);
//
//     } catch (err) {
//         logger.error(`App - editUser Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
// }
