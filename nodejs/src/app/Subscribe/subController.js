const jwtMiddleware = require("../../../config/jwtMiddleware");
const subProvider = require("../../app/Subscribe/subProvider");
const subService = require("../../app/Subscribe/subService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");


//구독하기
exports.subscribe = async function (req, res) {//밸리:완성!

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {artistId} = req.body;


    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (userId == artistId)
        return res.send(errResponse(baseResponse.SUBSCRIBE_WARN));//밸리데이션:자기자신구독X

    const subscribe = await subService.subscribe(userId,artistId);
    return res.send(subscribe);

};