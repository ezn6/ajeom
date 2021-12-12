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
    if (!artistId)
        return res.send(errResponse(baseResponse.ARTIST_EMPTY));
    if (userId == artistId)
        return res.send(errResponse(baseResponse.SUBSCRIBE_WARN));//밸리데이션:자기자신구독X

    const subscribe = await subService.subscribe(userId,artistId);
    return res.send(subscribe);
};

//구독취소
exports.delsub = async function (req, res) {//밸리:완성!

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {artistId} = req.body;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!artistId)
        return res.send(errResponse(baseResponse.ARTIST_EMPTY));
    if (userId == artistId)
        return res.send(errResponse(baseResponse.SUBSCRIBE_WARN));//밸리데이션:자기자신구독취소X

    const delsub = await subService.delsub(userId,artistId);
    return res.send(delsub);
};

//구독탭>베스트작가
exports.subBest = async function (req, res) {//밸리:커서 비어도됨>끝

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const subBest = await subProvider.subBest(userId,cursor);
    //return res.send(subBest);
    return res.send(subBest);
};

//나의구독작가리스트
exports.subArtist = async function (req, res) {//밸리:커서 비어도됨>끝

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const subArtist = await subProvider.subArtist(userId,cursor);
    return res.send(subArtist);
};

//구독탭>최근작가
exports.subRecent = async function (req, res) {//밸리:커서 비어도됨>끝

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const subRecent = await subProvider.subRecent(userId,cursor);
    return res.send(subRecent);
};

//구독탭
exports.subTab = async function (req, res) {//밸리:

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const subTab = await subProvider.subTab(userId);
    return res.send(response(baseResponse.SUCCESS, subTab));
};

//구독후기작성
exports.subReview = async function (req, res) {//밸리:완성

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {artistId, caption} = req.body;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!artistId)
        return res.send(errResponse(baseResponse.ARTIST_EMPTY));
    if (userId == artistId)
        return res.send(errResponse(baseResponse.SUBSCRIBE_WARN));//밸리데이션:자기자신구독후기X
    if (caption.length>100)
        return res.sened(errResponse(baseResponse.REVIEW_LENGTH));//길이체크

    const subReview = await subService.subReview(userId, artistId, caption);
    return res.send(subReview);
};

//작가상세
exports.ArtistDetail = async function (req, res) {//밸리:완성

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const artistId = req.params.artistId;

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!artistId)
        return res.send(errResponse(baseResponse.ARTIST_EMPTY));

    const ArtistDetail = await subProvider.ArtistDetail(userId,artistId);
    //return res.send(response(baseResponse.SUCCESS, ArtistDetail));
    return res.send(ArtistDetail);
};

//작가의 작품
exports.artworks = async function (req, res) {//밸리:OK

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const artistId = req.params.artistId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!artistId)
        return res.send(errResponse(baseResponse.ARTIST_EMPTY));

    const artworks = await subProvider.artworks(userId,artistId,cursor);
    return res.send(artworks);
};

//작가에게한마디(구독후기)
exports.reviews = async function (req, res) {//밸리:ok

    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const artistId = req.params.artistId;
    const cursor = req.query.cursor;//쿼리스트링-페이징

    if (!userId)
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!artistId)
        return res.send(errResponse(baseResponse.ARTIST_EMPTY));

    const reviews = await subProvider.reviews(userId,artistId,cursor);
    return res.send(reviews);
};