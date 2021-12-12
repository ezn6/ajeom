module.exports = function(app) {
    const sub = require('./subController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    const winston = require('winston');
    const logger = winston.createLogger();
    const qs = require('qs');
    const fetch = require('node-fetch-npm');


    //구독하기
    app.post('/app/users/:userId/subscribe',jwtMiddleware, sub.subscribe);

    //구독취소
    app.patch('/app/users/:userId/subscribe',jwtMiddleware, sub.delsub);

    //구독탭
    app.get('/app/users/:userId/subscribe',jwtMiddleware, sub.subTab);

    //구독탭>베스트작가
    app.get('/app/users/:userId/subscribe/best',jwtMiddleware, sub.subBest);

    //구독탭>최근작가
    app.get('/app/users/:userId/subscribe/recent',jwtMiddleware, sub.subRecent);

    //나의구독작가리스트
    app.get('/app/users/:userId/subscribe/list',jwtMiddleware, sub.subArtist);

    //구독 후기 작성
    app.post('/app/users/:userId/subscribe/reviews',jwtMiddleware, sub.subReview);

    //작가상세
    app.get('/app/users/:userId/artist/:artistId',jwtMiddleware, sub.ArtistDetail);

    //작가의 작품
    app.get('/app/users/:userId/artist/:artistId/artworks',jwtMiddleware, sub.artworks);

    //작가에게한마디(구독후기)
    app.get('/app/users/:userId/artist/:artistId/reviews',jwtMiddleware, sub.reviews);
}