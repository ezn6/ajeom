module.exports = function(app) {
    const rpt = require('./reportController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    const winston = require('winston');
    const logger = winston.createLogger();
    const qs = require('qs');
    const fetch = require('node-fetch-npm');


    //리뷰 신고
    app.post('/app/users/:userId/report/review/:reviewId',jwtMiddleware, rpt.review);

    //계정 신고
    app.post('/app/users/:userId/report/artist/:artistId',jwtMiddleware, rpt.userReport);

    //게시물 신고
    app.post('/app/users/:userId/report/artwork/:artId',jwtMiddleware, rpt.artReport);

}