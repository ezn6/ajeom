const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
var cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan')
const _ = require('lodash')
module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());

    //-------
    // 파일 업로드 허용
    app.use(fileUpload({
        createParentPath: true}));

// 미들 웨어 추가
    //app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(morgan('dev'));
    //-------

    // app.use(express.static(process.cwd() + '/public'));

    /* App (Android, iOS) */
    // TODO: 도메인을 추가할 경우 이곳에 Route를 추가하세요.
    require('../src/app/User/userRoute')(app);
    require('../src/app/Product/productRoute')(app);
    require('../src/app/Art/artRoute')(app);
    require('../src/app/Subscribe/subRoute')(app);
    require('../src/app/Report/reportRoute')(app);

    return app;
};