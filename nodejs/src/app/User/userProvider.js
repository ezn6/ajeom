const userDao = require("./userDao");
const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");


// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (email) {
  if (!email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0];
};

//비밀번호 일치여부 판단
exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

//id중복여부확인 및 status 확인
exports.accountCheck = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, id);
  connection.release();

  return userAccountResult;
};

//마이페이지
exports.mypage = async function (userId) {//밸리:완성,쿼리로 구독상태status=1도확인
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1)
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  else{
    const mypage = await userDao.mypage(connection, userId);
    connection.release();
    return mypage;
    //return response(baseResponse.SUCCESS,mypage);
  }
};

//내 이미지함
exports.myimg = async function (userId,cursor) {//밸리:이미지status 쿼리에서 확인, OK!
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1)
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원

  if(cursor==undefined){
    const myimg = await userDao.myimg(connection, userId);
    const myimgNext = await userDao.myimgNext(connection,userId, myimg[myimg.length - 1].cs);
    if(myimgNext.length > 0){
      connection.release();
      return {'myimg':myimg, 'nextCs':myimg[myimg.length - 1].cs, 'hasMore':true};
    } else{
      connection.release();
      return {'myimg':myimg, 'nextCs':myimg[myimg.length - 1].cs, 'hasMore':false};
    }
  } else{
    const myimgNext = await userDao.myimgNext(connection,userId, cursor);
    const myimgNext2 = await userDao.myimgNext(connection,userId, myimgNext[myimgNext.length - 1].cs);
    if(myimgNext2.length > 0){
      connection.release();
      return {'myimg':myimgNext, 'nextCs':myimgNext[myimgNext.length - 1].cs, 'hasMore':true};
    } else{
      connection.release();
      return {'myimg':myimgNext, 'nextCs':myimgNext[myimgNext.length - 1].cs, 'hasMore':false};
    }
  }
};