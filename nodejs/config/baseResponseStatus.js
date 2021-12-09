module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, //

    //Request error
    SIGNUP_EMAIL_EMPTY : { "isSuccess": false, "code": 2001, "message":"이메일을 입력해주세요" },
    SIGNUP_EMAIL_LENGTH : { "isSuccess": false, "code": 2002, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNUP_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력 해주세요." },
    SIGNUP_PASSWORD_LENGTH : { "isSuccess": false, "code": 2005, "message":"비밀번호는 10자리 이상, 영문/숫자/특수문자 2개이상 조합해주세요." },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2006, "message":"닉네임을 입력 해주세요." },
    SIGNUP_NICKNAME_LENGTH : { "isSuccess": false,"code": 2007,"message":"id는 6자 이상 입력해주세요." },

    SIGNIN_EMAIL_EMPTY : { "isSuccess": false, "code": 2008, "message":"이메일을 입력해주세요" },
    SIGNIN_EMAIL_LENGTH : { "isSuccess": false, "code": 2009, "message":"이메일은 50자리 미만으로 입력해주세요." },
    SIGNIN_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2010, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNIN_PASSWORD_EMPTY : { "isSuccess": false, "code": 2011, "message": "비밀번호를 입력 해주세요." },

    USER_USERID_EMPTY : { "isSuccess": false, "code": 2012, "message": "user Id를 입력해주세요." },
    USER_USERID_NOT_EXIST : { "isSuccess": false, "code": 2013, "message": "해당 회원이 존재하지 않습니다." },

    USER_USEREMAIL_EMPTY : { "isSuccess": false, "code": 2014, "message": "이메일을 입력해주세요." },
    USER_USEREMAIL_NOT_EXIST : { "isSuccess": false, "code": 2015, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
    USER_ID_NOT_MATCH : { "isSuccess": false, "code": 2016, "message": "유저 아이디 값을 확인해주세요" },
    USER_NICKNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "변경할 닉네임 값을 입력해주세요" },

    USER_STATUS_EMPTY : { "isSuccess": false, "code": 2018, "message": "회원 상태값을 입력해주세요" },

    //@@
    USER_NAME_EMPTY : { "isSuccess": false, "code": 2019, "message": "이름을 입력해주세요" },
    USER_PHONE_EMPTY : { "isSuccess": false, "code": 2020, "message": "휴대폰 번호를 입력해주세요" },
    USER_CODE_EMPTY : { "isSuccess": false, "code": 2021, "message": "우편번호를 입력해 주세요" },
    USER_ROAD_EMPTY : { "isSuccess": false, "code": 2022, "message": "도로명 주소를 입력해 주세요" },
    USER_DETAIL_EMPTY : { "isSuccess": false, "code": 2023, "message": "상세 주소를 입력해 주세요" },
    ARTID_EMPTY : { "isSuccess": false, "code": 2024, "message": "art Id를 입력해주세요" },
    ARTIST_EMPTY : { "isSuccess": false, "code": 2025, "message": "artist id를 입력해주세요." },
    NICKNAME_LENGTH : { "isSuccess": false, "code": 2026, "message": "닉네임은 20자리 미만으로 입력해주세요" },
    CATEGORY_EMPTY : { "isSuccess": false, "code": 2027, "message": "category Id를 입력해주세요" },
    ACCESSTOKEN_EMPTY : { "isSuccess": false, "code": 2028, "message":"access 토큰을 입력해주세요." },
    SUBSCRIBE_WARN : { "isSuccess": false, "code": 2029, "message":"자기자신을 구독(취소)할수 없습니다." },
    REVIEW_LENGTH : { "isSuccess": false, "code": 2030, "message":"후기는 100자리 미만으로 입력해주세요." },
    STORAGEID_EMPTY : { "isSuccess": false, "code": 2031, "message":"storageId를 입력해주세요." },
    SUMMARY_LENGTH : { "isSuccess": false, "code": 2032, "message":"소개는 45자리 이하로 입력해주세요." },
    MYIMGID_EMPTY : { "isSuccess": false, "code": 2033, "message":"myimgId를 입력해주세요." },

    TITLE_EMPTY : { "isSuccess": false, "code": 2034, "message":"작품 제목을 입력해주세요." },
    CAPTION_EMPTY : { "isSuccess": false, "code": 2035, "message":"작품 설명을 입력해주세요." },
    ARTIMG_EMPTY : { "isSuccess": false, "code": 2036, "message":"작품 이미지를 등록해주세요." },
    PRICE_EMPTY : { "isSuccess": false, "code": 2037, "message":"작품 가격을 입력해주세요." },
    LINK_EMPTY : { "isSuccess": false, "code": 2038, "message":"링크를 입력해주세요." },
    FIELDID_EMPTY : { "isSuccess": false, "code": 2039, "message":"분야를 입력해주세요." },
    KWID_EMPTY : { "isSuccess": false, "code": 2040, "message":"키워드를 입력해주세요." },

    // Response error
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3001, "message":"중복된 이메일입니다." },
    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },

    SIGNIN_EMAIL_WRONG : { "isSuccess": false, "code": 3003, "message": "아이디가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

    //@@
    SIGNUP_REDUNDANT_ID : { "isSuccess": false, "code": 3007, "message":"중복된 id입니다." },
    DELETED_ARTWORK : { "isSuccess": false, "code": 3008, "message":"존재하지 않거나 삭제된 작품입니다." },
    SUBSCRIBE_ERROR : { "isSuccess": false, "code": 3009, "message":"이미 구독한 작가입니다." },
    USER_ERROR : { "isSuccess": false, "code": 3010, "message":"존재하지 않거나 탈퇴한 회원입니다." },
    NOT_SUBSCRIBE : { "isSuccess": false, "code": 3011, "message":"구독을 하지 않은 작가입니다." },
    SUB_EMPTY : { "isSuccess": false, "code": 3012, "message":"구독자가 없습니다." },
    EXIST_IMG : { "isSuccess": false, "code": 3013, "message":"이미지함에 존재하는 작품 입니다." },
    IMGS_EMPTY : { "isSuccess": false, "code": 3014, "message":"이미지가 없습니다." },
    STORAGE_EMPTY : { "isSuccess": false, "code": 3015, "message":"생성한 보관함이 없습니다." },//내보관함에 하나도 없을때
    ARTS_EMPTY : { "isSuccess": false, "code": 3016, "message":"작품이 없습니다." },
    SAVES_EMPTY : { "isSuccess": false, "code": 3017, "message":"저장한 옅보기가 없습니다." },
    RECENT_EMPTY : { "isSuccess": false, "code": 3018, "message":"일주일 이내에 작품등록한 작가 한명도 없습니다." },
    ARTIST_ART_EMPTY : { "isSuccess": false, "code": 3019, "message":"작가의 작품이 없습니다." },
    REVIEW_EMPTY : { "isSuccess": false, "code": 3020, "message":"작가의 후기가 없습니다." },
    STORAGE_ERROR : { "isSuccess": false, "code": 3021, "message":"존재하지 않거나 삭제된 보관함 입니다." },
    LIKES_ERROR : { "isSuccess": false, "code": 3022, "message":"이미 좋아요를 누른 보관함 입니다." },
    DEL_LIKES_ERROR : { "isSuccess": false, "code": 3023, "message":"좋아요를 누르지 않아 취소할수 없는 보관함 입니다." },
    SAVE_ERROR : { "isSuccess": false, "code": 3024, "message":"이미 저장한 보관함 입니다." },
    DEL_SAVE_ERROR : { "isSuccess": false, "code": 3025, "message":"저장하지 않아 취소할수 없는 보관함 입니다." },
    DEL_IMG_ERROR : { "isSuccess": false, "code": 3026, "message":"이미지함에 존재하지 않거나 삭제된 이미지 입니다." },
    WRONG_FIELDID : { "isSuccess": false, "code": 3027, "message":"잘못된 분야 선택입니다." },
    WRONG_KWID : { "isSuccess": false, "code": 3028, "message":"잘못된 키워드 선택입니다." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
 
 
}
