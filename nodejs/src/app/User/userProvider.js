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
  if(isUser.length < 1){
    connection.release();
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  }
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
  if(isUser.length < 1){
    connection.release();
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  }

  if(cursor==undefined){
    const myimg = await userDao.myimg(connection, userId);

    //이미지 한개도 없을때
    if(myimg.length < 1){
      connection.release();
      return response(baseResponse.IMGS_EMPTY);//이미지가 없습니다 3014
    }

    const myimgNext = await userDao.myimgNext(connection,userId, myimg[myimg.length - 1].cs);
    if(myimgNext.length > 0){
      connection.release();
      // return {'myimg':myimg, 'nextCs':myimg[myimg.length - 1].cs, 'hasMore':true};
      return response(baseResponse.SUCCESS,{'myimg':myimg, 'nextCs':myimg[myimg.length - 1].cs, 'hasMore':true});
    } else{
      connection.release();
      //return {'myimg':myimg, 'nextCs':myimg[myimg.length - 1].cs, 'hasMore':false};
      return response(baseResponse.SUCCESS,{'myimg':myimg, 'nextCs':myimg[myimg.length - 1].cs, 'hasMore':false});
    }
  } else{
    const myimgNext = await userDao.myimgNext(connection,userId, cursor);//->여기로 넘어온 이상 한개도 없진 않음
    const myimgNext2 = await userDao.myimgNext(connection,userId, myimgNext[myimgNext.length - 1].cs);//->없으면 null로 찍힌다..안걸리고 안끊김
    if(myimgNext2.length > 0){
      connection.release();
      // return {'myimg':myimgNext, 'nextCs':myimgNext[myimgNext.length - 1].cs, 'hasMore':true};
      return response(baseResponse.SUCCESS,{'myimg':myimgNext, 'nextCs':myimgNext[myimgNext.length - 1].cs, 'hasMore':true});
    } else{
      connection.release();
      // return {'myimg':myimgNext, 'nextCs':myimgNext[myimgNext.length - 1].cs, 'hasMore':false};
      return response(baseResponse.SUCCESS,{'myimg':myimgNext, 'nextCs':myimgNext[myimgNext.length - 1].cs, 'hasMore':false});
    }
  }
};

//내 보관함
exports.mystorage = async function (userId,cursor) {//밸리:이미지status 쿼리에서 확인,밸리해야할것 : 내보과함 한개도없을때
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1){
    connection.release();
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  }

  if(cursor==undefined){
    const mystorage = await userDao.mystorage(connection, userId);

    //보관함에 한개도 없을때
    if(mystorage.length < 1){
      connection.release();
      return response(baseResponse.STORAGE_EMPTY);//생성한 보관함이 없습니다 3015
    }

    const mystorageNext = await userDao.mystorageNext(connection,userId, mystorage[mystorage.length - 1].cs);
    if(mystorageNext.length > 0){
      connection.release();
      // return {'storage':mystorage, 'nextCs':mystorage[mystorage.length - 1].cs, 'hasMore':true};
      return response(baseResponse.SUCCESS,{'storage':mystorage, 'nextCs':mystorage[mystorage.length - 1].cs, 'hasMore':true});
    } else{
      connection.release();
      // return {'storage':mystorage, 'nextCs':mystorage[mystorage.length - 1].cs, 'hasMore':false};
      return response(baseResponse.SUCCESS,{'storage':mystorage, 'nextCs':mystorage[mystorage.length - 1].cs, 'hasMore':false});
    }
  } else{
    const mystorageNext = await userDao.mystorageNext(connection,userId, cursor);
    const mystorageNext2 = await userDao.mystorageNext(connection,userId, myimgNext[myimgNext.length - 1].cs);
    if(mystorageNext2.length > 0){
      connection.release();
      //return {'storage':mystorageNext, 'nextCs':mystorageNext[mystorageNext.length - 1].cs, 'hasMore':true};
      return response(baseResponse.SUCCESS,{'storage':mystorageNext, 'nextCs':mystorageNext[mystorageNext.length - 1].cs, 'hasMore':true});
    } else{
      connection.release();
      //return {'storage':mystorageNext, 'nextCs':mystorageNext[mystorageNext.length - 1].cs, 'hasMore':false};
      return response(baseResponse.SUCCESS,{'storage':mystorageNext, 'nextCs':mystorageNext[mystorageNext.length - 1].cs, 'hasMore':false});
    }
  }
};

//내 작품리스트
exports.myartworks = async function (userId,cursor) {//밸리:이미지status 쿼리에서 확인, OK!
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1){
    connection.release();
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  }

  if(cursor==undefined){
    const myartworks = await userDao.myartworks(connection, userId);

    //작품이 한개도 없을때
    if(myartworks.length < 1){
      connection.release();
      return response(baseResponse.ARTS_EMPTY);//작품이 없습니다 3016
    }

    const myartworksNext = await userDao.myartworksNext(connection,userId, myartworks[myartworks.length - 1].cs);
    if(myartworksNext.length > 0){
      connection.release();
      // return {'artwork':myartworks, 'nextCs':myartworks[myartworks.length - 1].cs, 'hasMore':true};
      return response(baseResponse.SUCCESS,{'artwork':myartworks, 'nextCs':myartworks[myartworks.length - 1].cs, 'hasMore':true});
    } else{
      connection.release();
      // return {'artwork':myartworks, 'nextCs':myartworks[myartworks.length - 1].cs, 'hasMore':false};
      return response(baseResponse.SUCCESS,{'artwork':myartworks, 'nextCs':myartworks[myartworks.length - 1].cs, 'hasMore':false});
    }
  } else{
    const myartworksNext = await userDao.myartworksNext(connection,userId, cursor);
    const myartworksNext2 = await userDao.myartworksNext(connection,userId, myartworksNext[myartworksNext.length - 1].cs);
    if(myartworksNext2.length > 0){
      connection.release();
      // return {'artwork':myartworksNext, 'nextCs':myartworksNext[myartworksNext.length - 1].cs, 'hasMore':true};
      return response(baseResponse.SUCCESS,{'artwork':myartworksNext, 'nextCs':myartworksNext[myartworksNext.length - 1].cs, 'hasMore':true});
    } else{
      connection.release();
      // return {'artwork':myartworksNext, 'nextCs':myartworksNext[myartworksNext.length - 1].cs, 'hasMore':false};
      return response(baseResponse.SUCCESS,{'artwork':myartworksNext, 'nextCs':myartworksNext[myartworksNext.length - 1].cs, 'hasMore':false});
    }
  }
};

//내가 저장한 옅보기
exports.mysave = async function (userId,cursor) {//밸리:이미지status 쿼리에서 확인, OK!
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1){
    connection.release();
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  }

  if(cursor==undefined){
    const mysave = await userDao.mysave(connection, userId);

    //저장한 옅보기 한개도 없을때
    if(mysave.length < 1){
      connection.release();
      return response(baseResponse.SAVES_EMPTY);//저장한 옅보기가 없습니다 3017
    }

    const mysaveNext = await userDao.mysaveNext(connection,userId, mysave[mysave.length - 1].cs);
    if(mysaveNext.length > 0){
      connection.release();
      // return {'save':mysave, 'nextCs':mysave[mysave.length - 1].cs, 'hasMore':true};
      return response(baseResponse.SUCCESS,{'save':mysave, 'nextCs':mysave[mysave.length - 1].cs, 'hasMore':true});
    } else{
      connection.release();
      // return {'save':mysave, 'nextCs':mysave[mysave.length - 1].cs, 'hasMore':false};
      return response(baseResponse.SUCCESS,{'save':mysave, 'nextCs':mysave[mysave.length - 1].cs, 'hasMore':false});
    }
  } else{
    const mysaveNext = await userDao.mysaveNext(connection,userId, cursor);
    const mysaveNext2 = await userDao.mysaveNext(connection,userId, mysaveNext[mysaveNext.length - 1].cs);
    if(mysaveNext2.length > 0){
      connection.release();
      // return {'save':mysaveNext, 'nextCs':mysaveNext[mysaveNext.length - 1].cs, 'hasMore':true};
      return response(baseResponse.SUCCESS,{'save':mysaveNext, 'nextCs':mysaveNext[mysaveNext.length - 1].cs, 'hasMore':true});
    } else{
      connection.release();
      // return {'save':mysaveNext, 'nextCs':mysaveNext[mysaveNext.length - 1].cs, 'hasMore':false};
      return response(baseResponse.SUCCESS,{'save':mysaveNext, 'nextCs':mysaveNext[mysaveNext.length - 1].cs, 'hasMore':false});
    }
  }
};

//프로필 수정시 불러올 화면
exports.getProfile = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1)
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  const getProfile = await userDao.getProfile(connection, userId);
  connection.release();

  return response(baseResponse.SUCCESS,getProfile);
};

//닉네임 수정시 불러올 화면
exports.getName = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1)
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  const getName = await userDao.getName(connection, userId);
  connection.release();

  return response(baseResponse.SUCCESS,getName);
};

//작가한마디 수정시 불러올 화면
exports.getSummary = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1)
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  const getSummary = await userDao.getSummary(connection, userId);
  connection.release();

  return response(baseResponse.SUCCESS,getSummary);
};

//마이페이지>환경설정
exports.setting = async function (userId) {//밸리:완성
  const connection = await pool.getConnection(async (conn) => conn);
  //밸리데이션:사용자가 존재하는 회원인지(status=1)
  const isUser = await userDao.existUserAccount(connection,userId);
  if(isUser.length < 1){
    connection.release();
    return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
  }
  else{
    const setting = await userDao.setting(connection, userId);
    connection.release();
    return response(baseResponse.SUCCESS,setting);
  }
};