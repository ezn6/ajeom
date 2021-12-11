module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    const winston = require('winston');
    const logger = winston.createLogger();
    const qs = require('qs');
    const fetch = require('node-fetch-npm');

    // 테스트 API
    //app.get('/app/test', user.getTest)

    //유저 생성 (회원가입) API + 로그인  //TODO:자동로그인
    app.post('/app/users/:corporation',user.postUsers);

    //유저 분야 선택
    app.post('/app/users/:userId/field',jwtMiddleware, user.field);

    //유저 분야 수정
    app.patch('/app/users/:userId/field',jwtMiddleware, user.fieldPatch);

    //유저 키워드 선택
    app.post('/app/users/:userId/keyword',jwtMiddleware, user.keyword);

    //유저 키워드 수정
    app.patch('/app/users/:userId/keyword',jwtMiddleware, user.kwPatch);

    //닉네임 수정
    app.patch('/app/users/:userId/mypage/nickname',jwtMiddleware, user.namePatch);
    //닉네임 수정시 불러올 화면
    app.get('/app/users/:userId/mypage/nickname',jwtMiddleware, user.getName);

    // 자동로그인 API (JWT 검증 및 Payload 내뱉기)/ JWT 검증 API
    app.get('/app/auto-login', jwtMiddleware, user.check);

    //마이페이지
    app.get('/app/users/:userId/mypage', jwtMiddleware, user.mypage);

    //프로필 수정
    app.patch('/app/users/:userId/mypage/profile',jwtMiddleware, user.profilePatch);
    //프로필 수정시 불러올 화면
    app.get('/app/users/:userId/mypage/profile',jwtMiddleware, user.getProfile);

    //내이미지함
    app.get('/app/users/:userId/myimg',jwtMiddleware, user.myimg);

    //내보관함
    app.get('/app/users/:userId/mystorage',jwtMiddleware, user.mystorage);

    //내 작품리스트
    app.get('/app/users/:userId/artworks',jwtMiddleware, user.myartworks);

    //내가 저장한 옅보기
    app.get('/app/users/:userId/savestorage',jwtMiddleware, user.mysave);

    //작가한마디 수정(작성)
    app.patch('/app/users/:userId/mypage/summary',jwtMiddleware, user.summaryPatch);
    //작가한마디 수정시 불러올 화면
    app.get('/app/users/:userId/mypage/summary',jwtMiddleware, user.getSummary);

    //마이페이지>환경설정
    app.get('/app/users/:userId/mypage/setting', jwtMiddleware, user.setting);




    // class Kakao {
    //     constructor(code) {
    //         this.url = 'https://kauth.kakao.com/oauth/token';
    //         this.clientID = '42bbb32e1802070408560d6ecfea7aca';
    //         this.clientSecret = 'GDbji5LwT09OEg2tiSp56pC1N1PDHzCO';
    //         this.redirectUri = 'https://dev.oliviapage.shop/app/users/kakao';
    //         //'https://dev.oliviapage.shop/app/users/kakao';
    //         //'http://localhost:8081/oauth/kakao';
    //         this.code = code;
    //
    //         // userInfo
    //         this.userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    //         //https://developers.kakao.com/docs/latest/ko/reference/rest-api-reference 참고
    //     }
    // }

//  TODO Naver

//  TODO Google

    // const getAccessToken = async (options) => {
    //     try {
    //         console.log("getAccessToken!");
    //         return await fetch(options.url, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type':'application/x-www-form-urlencoded'
    //             },
    //             body: qs.stringify({
    //                 grant_type: 'authorization_code',//특정 스트링
    //                 client_id: options.clientID,
    //                 client_secret: options.clientSecret,
    //                 redirectUri: options.redirectUri,
    //                 code: options.code,
    //             }),
    //         }).then(res => res.json());
    //     }catch(e) {
    //         logger.info("error", e);
    //     }
    // };

    // const getUserInfo = async (url, access_token) => {
    //     try {
    //         console.log("getUserInfo!");
    //         return await fetch(url, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    //                 'Authorization': `Bearer ${access_token}`
    //             }
    //         }).then(res => res.json());
    //     }catch(e) {
    //         logger.info("error", e);
    //     }
    // };

    // const getOption = (corporation, code)=> {
    //     switch(corporation){
    //         case 'kakao':
    //             return new Kakao(code);
    //             break;
    //         case 'google':
    //             // return new Google(code);
    //             break;
    //         case 'naver':
    //             // return new Naver(code);
    //             break;
    //     }
    // }

    // app.post(`/app/users/:corporation`, async (req, res) => {
    //     console.log("hello!");
    //     //const corporation = req.params.corporation;
    //     //const code = 'ftou7GTHqEAb1TAmddHABaW1QJ4Usyy5aPK7Nd5lbfkaChCRY0yN18cbpuLPTgZjpfM02worDKYAAAF9BACG6Q';//이걸 받아옴
    //     //const options = getOption(corporation, code);
    //     //const token = await getAccessToken(options);
    //     //console.log(`data: ${JSON.stringify(token.access_token)}`)
    //     const {access_token} = req.body;
    //     const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    //     const userInfo = await getUserInfo(userInfoUrl, access_token);
    //
    //     res.send(userInfo);
    // })


};




// TODO: 탈퇴하기 API