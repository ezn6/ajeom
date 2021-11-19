module.exports = function(app) {
    const sub = require('./subController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    const winston = require('winston');
    const logger = winston.createLogger();
    const qs = require('qs');
    const fetch = require('node-fetch-npm');


    //구독하기
    app.post('/app/users/:userId/subscribe',jwtMiddleware, sub.subscribe);
}