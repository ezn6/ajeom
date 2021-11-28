module.exports = function(app){
    const art = require('./artController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');




    //const upload = require('./multer');//multer.js
    //const img = require('./imgcontroller');//imgcontroller.js
    //app.post('/app/profile', upload.single('image'), img.uploadProfile);
    const upload = require("../../../config/multer");

    app.post('/app/profile', upload.single('image'), (req, res) => {
        console.log(req.file);
        return res.send(req.file.location)
    })
// 클라이언트에서 넘어온 파일에 대한 정보가 req.file에 FILE 객체로 저장되어 있습니다.



    //=================================================

    //홈 탭
    app.get('/app/users/:userId/home',jwtMiddleware, art.getHome);

    //옅보기 탭
    app.get('/app/users/:userId/lookaround',jwtMiddleware, art.look);

    //옅보기탭>베스트보관함
    app.get('/app/users/:userId/lookaround/best',jwtMiddleware, art.lookBest);

    //옅보기탭>최근보관함
    app.get('/app/users/:userId/lookaround/recent',jwtMiddleware, art.lookRecent);

    //내이미지함에 저장
    app.post('/app/users/:userId/myimg', jwtMiddleware, art.saveImg);

    //작품 올리기
    //app.post('/app/users/:userId/artwork',jwtMiddleware, art.postArt);

    //작품 삭제(다중삭제)
    app.patch('/app/users/:userId/artwork',jwtMiddleware, art.delArt);

    //보관함생성
    app.post('/app/users/:userId/storage',jwtMiddleware, art.postStorage);

    //보관함 탭
    app.get('/app/users/:userId/storage',jwtMiddleware, art.storage);

    //보관함 상세
    app.get('/app/users/:userId/storage/:storageId',jwtMiddleware, art.storageDetail);

};