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
        return res.send(getHome);
    }
};


//작품 올리기
exports.postArt = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {type, title, caption, price, link, fieldId, kwId} = req.body;//fieldId,kwId배열
    //const img = req.files.uploadFile;
    //밸리데이션

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId){
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));}
    else{
        const postArt = await artService.postArt(
            userId, type, title, img, caption, price, link,fieldId,kwId);
        return res.send(postArt);
    }
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
    //밸리데이션

    const look = await artProvider.look(
        userId);
    return res.send(look);

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