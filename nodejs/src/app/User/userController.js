const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
exports.getTest = async function (req, res) {
    return res.send(response(baseResponse.SUCCESS))
}

/**
 * API Name : 유저 생성 (회원가입) API+로그인
 * [POST] /app/users/:corporation
 */
exports.postUsers = async function (req, res) {

    const {access_token} = req.body;

    // 빈 값 체크
    if (!access_token)
        return res.send(response(baseResponse.ACCESSTOKEN_EMPTY));
    // 길이 체크
    //비밀번호형식체크
    // var pattern1 = /[0-9]/;
    // var pattern2 = /[a-zA-Z]/;
    // var pattern3 = /[~!@\#$%<>^&*]/;
    // if ((!pattern1.test(pw) || !pattern2.test(pw)) && (!pattern1.test(pw) || !pattern3.test(pw)) && (!pattern2.test(pw) || !pattern3.test(pw)) || pw.length < 10)
    //     return res.send(response(baseResponse.SIGNUP_PASSWORD_LENGTH));
    // 이메일형식 체크 (by 정규표현식)
    // if (!regexEmail.test(email))
    //     return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    const signUpResponse = await userService.createUser(
        access_token
    );

    return res.send(signUpResponse);
};


//유저 분야 선택
exports.field = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {fieldId} = req.body;//배열

    //console.log(`jwt : ${userIdFromJWT}`);

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const userByUserId = await userService.field(userId,fieldId);
    return res.send(userByUserId);

};


//유저 키워드 선택
exports.keyword = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {fieldId} = req.body;//배열

    console.log(`data: ${JSON.stringify(fieldId)}`)

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const userByUserId = await userService.keyword(userId,fieldId);
    return res.send(userByUserId);
};

//유저 분야 수정
exports.fieldPatch = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {infield, outfield} = req.body;//배열로 취소하는거, 추가하는거 둘다 받아야함

    //console.log(`data: ${JSON.stringify(fieldId)}`);

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const fieldPatch = await userService.fieldPatch(userId, infield, outfield);
    return res.send(fieldPatch);

};

//유저 키워드 수정
exports.kwPatch = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {inkw, outkw} = req.body;//배열로 취소하는거, 추가하는거 둘다 받아야함

    //console.log(`data: ${JSON.stringify(fieldId)}`);

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const kwPatch = await userService.kwPatch(userId, inkw, outkw);
    return res.send(kwPatch);

};

/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};

//닉네임 수정
exports.namePatch = async function (req, res) {//밸리:OK

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {nickname} = req.body;

    //밸리데이션:글자수제한,중복제거
    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!nickname)
        return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));
    if (nickname.length > 20)
        return res.send(errResponse(baseResponse.NICKNAME_LENGTH));

    const namePatch = await userService.namePatch(userId, nickname);
    return res.send(namePatch);
};

//닉네임 수정시 불러올 화면
exports.getName = async function (req, res) {//밸리:OK

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const getName = await userProvider.getName(userId);
    return res.send(getName);
};

//마이페이지
exports.mypage = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const mypage = await userProvider.mypage(userId);
    //return res.send(mypage);
    return res.send(response(baseResponse.SUCCESS, mypage));
};

//프로필 수정
exports.profilePatch = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {profile} = req.body;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const profilePatch = await userService.profilePatch(userId,profile);
    return res.send(profilePatch);
};

//프로필 수정시 불러올 화면
exports.getProfile = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const getProfile = await userProvider.getProfile(userId);
    return res.send(getProfile);
};

//내 이미지함
exports.myimg = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const myimg = await userProvider.myimg(userId,cursor);
    return res.send(myimg);

};

//내 보관함
exports.mystorage = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const mystorage = await userProvider.mystorage(userId,cursor);
    return res.send(mystorage);
};

//내 작품리스트
exports.myartworks = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const myartworks = await userProvider.myartworks(userId,cursor);
    return res.send(myartworks);
};

//내가 저장한 옅보기
exports.mysave = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const mysave = await userProvider.mysave(userId,cursor);
    return res.send(mysave);
};

//작가한마디 수정
exports.summaryPatch = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {summary} = req.body;

    //밸리데이션:그냥 자기소개를 입력하지 않을수도 있다(지우기)
    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    // if (!summary)
    //     return res.send(errResponse(baseResponse.SUMMARY_EMPTY));
    if (summary.length > 45)
        return res.send(errResponse(baseResponse.SUMMARY_LENGTH));//45자리 이하로

    const summaryPatch = await userService.summaryPatch(userId, summary);
    return res.send(summaryPatch);
};

//자기소개 작가한마디 수정시 불러올 화면
exports.getSummary = async function (req, res) {//밸리:OK

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const getSummary = await userProvider.getSummary(userId);
    return res.send(getSummary);
};

//마이페이지>환경설정
exports.setting = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const setting = await userProvider.setting(userId);
    return res.send(setting);
};


//아이디중복조회
// exports.getUsers = async function (req, res) {
//
//     const id = req.query.id;
//
//     if (!id)
//         return res.send(response(baseResponse.USER_USERID_EMPTY));
//
//     const searchId = await userProvider.accountCheck(id);
//     if (searchId.length >0){
//         return res.send(response(baseResponse.SIGNUP_REDUNDANT_ID));
//     } else {
//         return res.send(response(baseResponse.SUCCESS,"사용가능한 아이디입니다."));
//         //return res.send("사용가능한 아이디입니다.");
//     }
//     //return res.send(response(baseResponse.SUCCESS, searchId));
//
//     /**
//      * Query String: email
//      */
//     //const email = req.query.email;
//     // if (!email) {
//     //     // 유저 전체 조회
//     //     const userListResult = await userProvider.retrieveUserList();
//     //     return res.send(response(baseResponse.SUCCESS, userListResult));
//     // } else {
//     //     // 유저 검색 조회
//     //     const userListByEmail = await userProvider.retrieveUserList(email);
//     //     return res.send(response(baseResponse.SUCCESS, userListByEmail));
//     // }
// };

/**
 * API No. 3
 * API Name : 특정 유저 조회 API
 * [GET] /app/users/{userId}
 */
// exports.getUserById = async function (req, res) {
//
//     /**
//      * Path Variable: userId
//      */
//     const userId = req.params.userId;
//
//     if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
//
//     const userByUserId = await userProvider.retrieveUser(userId);
//     return res.send(response(baseResponse.SUCCESS, userByUserId));
// };


// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
// exports.login = async function (req, res) {
//
//     const {id, pw} = req.body;
//
//     // TODO: id, password 형식적 Validation
//     if (!id)
//         return res.send(response(baseResponse.USER_USERID_EMPTY));
//     if (!pw)
//         return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
//
//     const signInResponse = await userService.postSignIn(id, pw);
//
//     return res.send(signInResponse);
// };


/**
 * API No. 5
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/:userId
 * path variable : userId
 * body : nickname
 */
// exports.patchUsers = async function (req, res) {
//
//     // jwt - userId, path variable :userId
//
//     const userIdFromJWT = req.verifiedToken.userId
//
//     const userId = req.params.userId;
//     const nickname = req.body.nickname;
//
//     if (userIdFromJWT != userId) {
//         res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
//     } else {
//         if (!nickname) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));
//
//         const editUserInfo = await userService.editUser(userId, nickname)
//         return res.send(editUserInfo);
//     }
// };
