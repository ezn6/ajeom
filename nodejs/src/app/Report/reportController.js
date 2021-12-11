const jwtMiddleware = require("../../../config/jwtMiddleware");
const reportProvider = require("../../app/Report/reportProvider");
const reportService = require("../../app/Report/reportService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");


//리뷰 신고
exports.review = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const reviewId = req.params.reviewId;
    const {number,caption} = req.body;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!number)
        return res.send(errResponse(baseResponse.NUMBER_EMPTY));
    if (!reviewId)
        return res.send(errResponse(baseResponse.REVIEWID_EMPTY));

    const review = await reportService.review(userId,reviewId,number,caption);
    return res.send(review);
};

//계정 신고
exports.userReport = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const artistId = req.params.artistId;
    const {number,caption} = req.body;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!number)
        return res.send(errResponse(baseResponse.NUMBER_EMPTY));
    if (!artistId)
        return res.send(errResponse(baseResponse.ARTIST_EMPTY));

    const userReport = await reportService.userReport(userId,artistId,number,caption);
    return res.send(userReport);
};

//게시물 신고
exports.artReport = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const artId = req.params.artId;
    const {number,caption} = req.body;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!number)
        return res.send(errResponse(baseResponse.NUMBER_EMPTY));
    if (!artId)
        return res.send(errResponse(baseResponse.ARTID_EMPTY));

    const artReport = await reportService.artReport(userId,artId,number,caption);
    return res.send(artReport);
};