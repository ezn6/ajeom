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

    const review = await reportService.review(userId,reviewId,number,caption);
    return res.send(review);
};