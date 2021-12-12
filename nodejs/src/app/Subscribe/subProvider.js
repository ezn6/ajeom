const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const secret_config = require("../../../config/secret");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
const winston = require('winston');
const subDao = require("./subDao");
const userDao = require("../User/userDao");
// Provider: Read 비즈니스 로직 처리

//구독탭>베스트작가
exports.subBest = async function (userId,cursor) {//밸리:완성!, 작가자체status는 쿼리에서 해결
    const connection = await pool.getConnection(async (conn) => conn);
    //1.if커서가 없으면 첫번째 페이지, dao에서 올때 가장마지막 커서 가지고 오기
    //2.hasMore:true,nextCs: 정보 res로 넘겨주기/ hasMore는 한번 dao갔다오고 또 dao가서 length>0이면 true, 아니면 false. false이면 클라에서 멈출것.

    if(cursor==undefined){
        const subBestFirst = await subDao.subBestFirst(connection, userId);
        //한명도 없을수가  없다!>더미데이터가 있으므로
        const subBestNext = await subDao.subBestNext(connection, subBestFirst[subBestFirst.length - 1].cs);
        if(subBestNext.length > 0){
            connection.release();
            //return {'best':subBestFirst, 'nextCs':subBestFirst[subBestFirst.length - 1].cs, 'hasMore':true};
            return response(baseResponse.SUCCESS,{'best':subBestFirst, 'nextCs':subBestFirst[subBestFirst.length - 1].cs, 'hasMore':true});
        } else{
            connection.release();
            //return {'best':subBestFirst, 'nextCs':subBestFirst[subBestFirst.length - 1].cs, 'hasMore':false};
            return response(baseResponse.SUCCESS,{'best':subBestFirst, 'nextCs':subBestFirst[subBestFirst.length - 1].cs, 'hasMore':false});
        }
    } else{
        const subBestNext = await subDao.subBestNext(connection, cursor);
        const subBestNext2 = await subDao.subBestNext(connection, subBestNext[subBestNext.length - 1].cs);
        if(subBestNext2.length > 0){
            connection.release();
            //return {'best':subBestNext, 'nextCs':subBestNext[subBestNext.length - 1].cs, 'hasMore':true};
            return response(baseResponse.SUCCESS,{'best':subBestNext, 'nextCs':subBestNext[subBestNext.length - 1].cs, 'hasMore':true});
        } else{
            connection.release();
            //return {'best':subBestNext, 'nextCs':subBestNext[subBestNext.length - 1].cs, 'hasMore':false};
            return response(baseResponse.SUCCESS,{'best':subBestNext, 'nextCs':subBestNext[subBestNext.length - 1].cs, 'hasMore':false});
        }
    }
};

//나의구독작가리스트
exports.subArtist = async function (userId,cursor) {//밸리:완성!, 작가자체status는 쿼리에서 해결
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:사용자가 존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    if(isUser.length < 1){
        connection.release();
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
    }
    else{
        if(cursor==undefined){
            const subArtist = await subDao.subArtist(connection, userId);
            //구독작가 한명도 없을때
            if(subArtist.length < 1){
                connection.release();
                return response(baseResponse.SUB_EMPTY);
                //return errResponse(baseResponse.SUB_EMPTY);
            }
            const subArtistNext = await subDao.subArtistNext(connection,userId, subArtist[subArtist.length - 1].cs);
            if(subArtistNext.length > 0){
                connection.release();
                // return {'sub':subArtist, 'nextCs':subArtist[subArtist.length - 1].cs, 'hasMore':true}
                return response(baseResponse.SUCCESS,{'sub':subArtist, 'nextCs':subArtist[subArtist.length - 1].cs, 'hasMore':true});
            } else{
                connection.release();
                //return {'sub':subArtist, 'nextCs':subArtist[subArtist.length - 1].cs, 'hasMore':false};
                return response(baseResponse.SUCCESS,{'sub':subArtist, 'nextCs':subArtist[subArtist.length - 1].cs, 'hasMore':false});
            }
        } else{
            const subArtistNext = await subDao.subArtistNext(connection,userId, cursor);
            const subArtistNext2 = await subDao.subArtistNext(connection,userId, subArtistNext[subArtistNext.length - 1].cs);
            if(subArtistNext2.length > 0){
                connection.release();
                // return {'sub':subArtistNext, 'nextCs':subArtistNext[subArtistNext.length - 1].cs, 'hasMore':true}
                return response(baseResponse.SUCCESS,{'sub':subArtistNext, 'nextCs':subArtistNext[subArtistNext.length - 1].cs, 'hasMore':true});
            } else{
                connection.release();
                // return {'sub':subArtistNext, 'nextCs':subArtistNext[subArtistNext.length - 1].cs, 'hasMore':false}
                return response(baseResponse.SUCCESS,{'sub':subArtistNext, 'nextCs':subArtistNext[subArtistNext.length - 1].cs, 'hasMore':false});
            }
        }
    }
};

//구독탭>최근작가
exports.subRecent = async function (userId,cursor) {//밸리:완성!,쿼리:User.status=1,grade<7
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:사용자가 존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    if(isUser.length < 1){
        connection.release();
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
    }
    else{
        if(cursor==undefined){
            const subRecent = await subDao.subRecent(connection, userId);
            //최근에 작품등록한 작가 한명도 없을때
            if(subRecent.length < 1){
                connection.release();
                return response(baseResponse.RECENT_EMPTY);//일주일 이내에 작품등록한 작가 한명도 없습니다 3018
            }

            const subRecentNext = await subDao.subRecentNext(connection, subRecent[subRecent.length - 1].cs);
            if(subRecentNext.length > 0){
                connection.release();
                //return {'sub':subRecent, 'nextCs':subRecent[subRecent.length - 1].cs, 'hasMore':true};
                return response(baseResponse.SUCCESS,{'sub':subRecent, 'nextCs':subRecent[subRecent.length - 1].cs, 'hasMore':true});
            } else{
                connection.release();
                //return {'sub':subRecent, 'nextCs':subRecent[subRecent.length - 1].cs, 'hasMore':false};
                return response(baseResponse.SUCCESS,{'sub':subRecent, 'nextCs':subRecent[subRecent.length - 1].cs, 'hasMore':false});
            }
        } else{
            const subRecentNext = await subDao.subRecentNext(connection, cursor);
            const subRecentNext2 = await subDao.subRecentNext(connection, subRecentNext[subRecentNext.length - 1].cs);
            if(subRecentNext2.length > 0){
                connection.release();
                //return {'sub':subRecentNext, 'nextCs':subRecentNext[subRecentNext.length - 1].cs, 'hasMore':true};
                return response(baseResponse.SUCCESS,{'sub':subRecentNext, 'nextCs':subRecentNext[subRecentNext.length - 1].cs, 'hasMore':true});
            } else{
                connection.release();
                //return {'sub':subRecentNext, 'nextCs':subRecentNext[subRecentNext.length - 1].cs, 'hasMore':false};
                return response(baseResponse.SUCCESS,{'sub':subRecentNext, 'nextCs':subRecentNext[subRecentNext.length - 1].cs, 'hasMore':false});
            }
        }
    }
};

//구독탭
exports.subTab = async function (userId) {//밸리:완성, 쿼리로 작품 status확인
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:사용자가 존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    if(isUser.length < 1)
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
    else{
        const subTab = await subDao.subTab(connection,userId);
        connection.release();
        return subTab;
    }
};

//작가상세
exports.ArtistDetail = async function (userId,artistId) {//밸리:작가와 유저 status, 나머지는 쿼리로 확인, 트랜잭션ok!
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        await connection.beginTransaction();//트랜잭션

        //밸리데이션:존재하는 회원인지(status=1)
        const isUser = await userDao.existUserAccount(connection,userId);
        //밸리데이션:존재하는 작가인지(status=1)
        const isUser2 = await userDao.existUserAccount(connection,artistId);
        if((isUser.length < 1) || (isUser2.length < 1)){
            //await connection.rollback();
            return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
        }
        else{
            const ArtistDetailTop = await subDao.ArtistDetailTop(connection,userId,artistId,artistId);//상단
            const ArtistDetailMid = await subDao.ArtistDetailMid(connection,artistId);//중간
            const ArtistDetailBot = await subDao.ArtistDetailBot(connection,artistId);//하단

            await connection.commit();
            //return {'top':ArtistDetailTop,'mid':ArtistDetailMid,'bot':ArtistDetailBot};
            return response(baseResponse.SUCCESS,{'top':ArtistDetailTop,'mid':ArtistDetailMid,'bot':ArtistDetailBot});

        }
    } catch (err){
        await connection.rollback();
        logger.error(`App - ArtistDetail Provider error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

//작가의 작품
exports.artworks = async function (userId,artistId,cursor) {//밸리:
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:사용자가 존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    if(isUser.length < 1){
        connection.release();
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
    }
    else{
        if(cursor==undefined){
            const artworks = await subDao.artworks(connection, artistId);

            //작가의 작품이 없을때
            if(artworks.length < 1){
                connection.release();
                return response(baseResponse.ARTIST_ART_EMPTY);//작가의 작품이 없습니다 3019
            }

            const artworksNext = await subDao.artworksNext(connection,artistId, artworks[artworks.length - 1].cs);
            if(artworksNext.length > 0){
                connection.release();
                //return {'imgs':artworks, 'nextCs':artworks[artworks.length - 1].cs, 'hasMore':true};
                return response(baseResponse.SUCCESS,{'imgs':artworks, 'nextCs':artworks[artworks.length - 1].cs, 'hasMore':true});
            } else{
                connection.release();
                //return {'imgs':artworks, 'nextCs':artworks[artworks.length - 1].cs, 'hasMore':false};
                return response(baseResponse.SUCCESS,{'imgs':artworks, 'nextCs':artworks[artworks.length - 1].cs, 'hasMore':false});
            }
        } else{
            const artworksNext = await subDao.artworksNext(connection,artistId, cursor);
            const artworksNext2 = await subDao.artworksNext(connection,artistId, artworksNext[artworksNext.length - 1].cs);
            if(artworksNext2.length > 0){
                connection.release();
                //return {'imgs':artworksNext, 'nextCs':artworksNext[artworksNext.length - 1].cs, 'hasMore':true};
                return response(baseResponse.SUCCESS,{'imgs':artworksNext, 'nextCs':artworksNext[artworksNext.length - 1].cs, 'hasMore':true});
            } else{
                connection.release();
                //return {'imgs':artworksNext, 'nextCs':artworksNext[artworksNext.length - 1].cs, 'hasMore':false};
                return response(baseResponse.SUCCESS,{'imgs':artworksNext, 'nextCs':artworksNext[artworksNext.length - 1].cs, 'hasMore':false});
            }
        }
    }
};

//작가에게한마디(구독후기)
exports.reviews = async function (userId,artistId,cursor) {//밸리:ok
    const connection = await pool.getConnection(async (conn) => conn);
    //밸리데이션:사용자가 존재하는 회원인지(status=1)
    const isUser = await userDao.existUserAccount(connection,userId);
    const isUser2 = await userDao.existUserAccount(connection,artistId);
    if((isUser.length < 1) || (isUser2.length < 1)){
        connection.release();
        return errResponse(baseResponse.USER_ERROR);//존재하지 않거나 탈퇴회원
    }
    else{
        if(cursor==undefined){
            const reviews = await subDao.reviews(connection, artistId);
            //작가에게 후기가 없을때
            if(reviews.length < 1){
                connection.release();
                return response(baseResponse.REVIEW_EMPTY);//작가의 후기가 없습니다 3020
            }

            const reviewsNext = await subDao.reviewsNext(connection,artistId, reviews[reviews.length - 1].cs);
            if(reviewsNext.length > 0){
                connection.release();
                //return {'review':reviews, 'nextCs':reviews[reviews.length - 1].cs, 'hasMore':true};
                return response(baseResponse.SUCCESS,
                    {'review':reviews, 'nextCs':reviews[reviews.length - 1].cs, 'hasMore':true});

            } else{
                connection.release();
                //return {'review':reviews, 'nextCs':reviews[reviews.length - 1].cs, 'hasMore':false};
                return response(baseResponse.SUCCESS,
                    {'review':reviews, 'nextCs':reviews[reviews.length - 1].cs, 'hasMore':false});
            }
        } else{
            const reviewsNext = await subDao.reviewsNext(connection,artistId, cursor);
            const reviewsNext2 = await subDao.reviewsNext(connection,artistId, reviewsNext[reviewsNext.length - 1].cs);
            if(reviewsNext2.length > 0){
                connection.release();
                //return {'review':reviewsNext, 'nextCs':reviewsNext[reviewsNext.length - 1].cs, 'hasMore':true};
                return response(baseResponse.SUCCESS,
                    {'review':reviewsNext, 'nextCs':reviewsNext[reviewsNext.length - 1].cs, 'hasMore':true});
            } else{
                connection.release();
                //return {'review':reviewsNext, 'nextCs':reviewsNext[reviewsNext.length - 1].cs, 'hasMore':false};
                return response(baseResponse.SUCCESS,
                    {'review':reviewsNext, 'nextCs':reviewsNext[reviewsNext.length - 1].cs, 'hasMore':false});
            }
        }
    }
};