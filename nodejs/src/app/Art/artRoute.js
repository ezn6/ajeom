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

    //홈화면
    app.get('/app/users/:userId/home',jwtMiddleware, art.getHome);

    //옅보기
    app.get('/app/users/:userId/lookaround',jwtMiddleware, art.look);

    //내이미지함에 저장
    app.post('/app/users/:userId/myimg', jwtMiddleware, art.saveImg);

    //작품 올리기
    //app.post('/app/users/:userId/posts',jwtMiddleware, art.postArt);

    //보관함생성
    app.post('/app/users/:userId/storage',jwtMiddleware, art.postStorage);

};