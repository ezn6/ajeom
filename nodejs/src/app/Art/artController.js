const jwtMiddleware = require("../../../config/jwtMiddleware");
const artProvider = require("../../app/Art/artProvider");
const artService = require("../../app/Art/artService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const fileUpload = require('express-fileupload');

const regexEmail = require("regex-email");
const {emit} = require("nodemon");



//홈화면
exports.getHome = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    //밸리데이션
    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId){
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));}
    else{
        const getHome = await artProvider.getHome(
            userId);
        //return res.send(getHome);
        return res.send(response(baseResponse.SUCCESS, getHome));
    }
};


//작품 올리기
exports.postArt = async function (req, res) {//밸리:OK

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {title, caption, img, price, link, fieldId, kwId} = req.body;//fieldId,kwId:배열

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!title)
        return res.send(errResponse(baseResponse.TITLE_EMPTY));
    if (!caption)
        return res.send(errResponse(baseResponse.CAPTION_EMPTY));
    if (!img)
        return res.send(errResponse(baseResponse.ARTIMG_EMPTY));
    if (!price)
        return res.send(errResponse(baseResponse.PRICE_EMPTY));
    if (!link)
        return res.send(errResponse(baseResponse.LINK_EMPTY));
    if (!fieldId)
        return res.send(errResponse(baseResponse.FIELDID_EMPTY));
    if (!kwId)
        return res.send(errResponse(baseResponse.KWID_EMPTY));

    const postArt = await artService.postArt(
        userId,title, caption, img, price, link, fieldId, kwId);
    return res.send(postArt);

};

//내이미지함에 저장
exports.saveImg = async function (req, res) {//밸리 완성

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {artId} = req.body;


    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!artId)
        return res.send(errResponse(baseResponse.ARTID_EMPTY));

    const saveImg = await artService.saveImg(
        userId,artId);
    return res.send(saveImg);

};

//보관함생성
exports.postStorage = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {title,caption,share,myimgId} = req.body;//myimgId 배열


    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    //밸리데이션

    const postStorage = await artService.postStorage(
        userId,title,caption,share,myimgId);
    return res.send(postStorage);

};

//옅보기
exports.look = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const look = await artProvider.look(
        userId);
    return res.send(response(baseResponse.SUCCESS, look));

};

//작품 삭제(다중삭제)
exports.delArt = async function (req, res) {//밸리데이션 OK!

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {artId} = req.body;//artId 배열

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!artId)
        return res.send(errResponse(baseResponse.ARTID_EMPTY));

    const delArt = await artService.delArt(
        userId,artId);
    return res.send(delArt);

};

//보관함 탭
exports.storage = async function (req, res) {//밸리데이션:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const storage = await artProvider.storage(
        userId);
    return res.send(response(baseResponse.SUCCESS, storage));

};

//옅보기탭>베스트보관함 lookRecent
exports.lookBest = async function (req, res) {//밸리데이션:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const lookBest = await artProvider.lookBest(
        userId,cursor);
    return res.send(lookBest);

};

//옅보기탭>최근보관함 lookRecent
exports.lookRecent = async function (req, res) {//밸리데이션:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const lookRecent = await artProvider.lookRecent(
        userId,cursor);
    return res.send(lookRecent);

};

//보관함 상세
exports.storageDetail = async function (req, res) {//밸리데이션:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징
    const storageId = req.params.storageId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!storageId)
        return res.send(errResponse(baseResponse.STORAGEID_EMPTY));

    const storageDetail = await artProvider.storageDetail(
        userId,cursor,storageId);
    return res.send(storageDetail);

};

//작품상세페이지
exports.artDetail = async function (req, res) {//밸리데이션:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const artId = req.params.artId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!artId)
        return res.send(errResponse(baseResponse.ARTID_EMPTY));

    const artDetail = await artProvider.artDetail(
        userId,artId);
    //return res.send(response(baseResponse.SUCCESS, artDetail));
    return res.send(artDetail);
};

//보관함 삭제
exports.delStorage = async function (req, res) {//밸리데이션:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const storageId = req.params.storageId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!storageId)
        return res.send(errResponse(baseResponse.STORAGEID_EMPTY));

    const delStorage = await artService.delStorage(
        userId,storageId);
    return res.send(delStorage);
};

//보관함 좋아요
exports.likeStorage = async function (req, res) {//밸리데이션:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const storageId = req.params.storageId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!storageId)
        return res.send(errResponse(baseResponse.STORAGEID_EMPTY));

    const likeStorage = await artService.likeStorage(
        userId,storageId);
    return res.send(likeStorage);
};

//보관함 좋아요 취소
exports.delLikeStorage = async function (req, res) {//밸리데이션:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const storageId = req.params.storageId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!storageId)
        return res.send(errResponse(baseResponse.STORAGEID_EMPTY));

    const delLikeStorage = await artService.delLikeStorage(
        userId,storageId);
    return res.send(delLikeStorage);
};

//보관함 저장
exports.saveStorage = async function (req, res) {//밸리데이션:ok
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const storageId = req.params.storageId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!storageId)
        return res.send(errResponse(baseResponse.STORAGEID_EMPTY));

    const saveStorage = await artService.saveStorage(
        userId,storageId);
    return res.send(saveStorage);
};

//보관함 저장 취소
exports.delSaveStorage = async function (req, res) {//밸리데이션:ok
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const storageId = req.params.storageId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!storageId)
        return res.send(errResponse(baseResponse.STORAGEID_EMPTY));

    const delSaveStorage = await artService.delSaveStorage(
        userId,storageId);
    return res.send(delSaveStorage);
};

//내이미지함 삭제
exports.delImg = async function (req, res) {//밸리데이션:ok!
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const myimgId = req.params.myimgId;
    //console.log(`myimg id?: ${JSON.stringify(myimgId)}`);
    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!myimgId)
        return res.send(errResponse(baseResponse.MYIMGID_EMPTY));

    const delImg = await artService.delImg(
        userId,myimgId);
    return res.send(delImg);
};