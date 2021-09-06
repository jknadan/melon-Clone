const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const {deleteUserById} = require("./userController");

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
exports.getTest = async function (req, res) {
    return res.send(response(baseResponse.SUCCESS))
}


/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/users
 */
exports.postUsers = async function (req, res) {

    /**
     * Body: email, PW, name
     */
    const {email, PW, name} = req.body;

    // 빈 값 체크
    if (!email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));

    // 길이 체크
    if (email.length > 30)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));

    // 형식 체크 (by 정규표현식)
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    // 기타 등등 - 추가하기 => 이메일 말고도 패스워드 형식 이름 형식도 있을거임


    const signUpResponse = await userService.createUser(
        email,
        PW,
        name
    );

    return res.send(signUpResponse);
};

/**
 * API No. 2
 * API Name : 유저 조회 API (+ 이메일로 검색 조회)
 * [GET] /app/users
 */
exports.getUsers = async function (req, res) {

    /**
     * Query String: email
     */
    const email = req.query.email;
    console.log(email);

    if (!email) {
        // 유저 전체 조회
        const userListResult = await userProvider.retrieveUserList();
        return res.send(response(baseResponse.SUCCESS, userListResult));
    } else {
        // 유저 검색 조회
        const userListByEmail = await userProvider.retrieveUserList(email);
        return res.send(response(baseResponse.SUCCESS, userListByEmail));
    }
};

/**
 * API No. 3
 * API Name : 특정 유저 조회 API
 * [GET] /app/users/{userId}
 */
exports.getUserById = async function (req, res) {

    /**
     * Path Variable: userId
     */
    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userByUserId = await userProvider.retrieveUser(userId);
    return res.send(userByUserId);
};

// /**
//  * API No. 3 TEST
//  * API Name : 특정 유저 조회 API
//  * [GET] /app/users/{userId}
//  */
// exports.getUserById2 = async function (req, res) {
//
//     /**
//      * Path Variable: userId
//      */
//     const userId = req.params.userId;
//
//     if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
//
//     const userByUserId = await userProvider.retrieveSpeUser(userId);
//     return res.send(response(baseResponse.SUCCESS, userByUserId));
// };

/**
 * API No. 4
 * API Name : 특정 유저 회원탈퇴 API
 * [DELETE] /users/{userId}
 */

exports.deleteUserById = async function(req,res){
    /**
     * Path Variable: userId
     */

    const userId = req.params.userId;
    //userId가 없으면 비어있다고 출력
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userByUserId = await userService.deleteUser(userId);
    return res.send(response(baseResponse.SUCCESS, userByUserId));

}
/**
 * API No. 5 // 삭제.
 * API Name : 특정 유저 아이디찾기 API
 * [GET] /users/id
 */

exports.searchUserID = async function(req,res){
    /**
     * Query String: email
     */

    const email = req.query.email;
    console.log(email);

    if(!email) return res.send(errResponse(baseResponse.USER_USEREMAIL_NOT_EXIST));

    const IdResponse = await userProvider.searchUserID(email);
    console.log(IdResponse);
    return res.send(response(baseResponse.SUCCESS,IdResponse));
}

/**
 * API No. 6
 * API Name : 특정 유저 댓글 조회 API
 * [GET] /users/{userId}/Comment
 */



exports.getComment = async function(req,res) {

    /**
     * Path Variable: userId
     */

    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userCommentById = await userProvider.getComment(userId);
    return res.send(response(baseResponse.SUCCESS,userCommentById));
}
/**
 * API No. 7
 * API Name : 특정 유저 플레이리스트 조회 API
 * [GET] /users/{userId}/playlist
 */
exports.getUserPlaylist = async function(req,res){
    /**
     * Path Variable: userId
     */
    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userPlaylistByUserId = await userProvider.getUserPlaylist(userId);
    return res.send(response(baseResponse.SUCCESS,userPlaylistByUserId));
}

/**
 * API No. 8
 * API Name : 특정 유저 좋아요 조회 API
 * [GET] /users/{userId}/likes
 */

exports.getLikeMusic = async function(req,res){
    /**
     * Path Variable: userId
     */
    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userLikesByUserId = await userProvider.getLikeMusic(userId);
    return res.send(response(baseResponse.SUCCESS,userLikesByUserId));
}

/**
 * API No. 9
 * API Name : 특정 유저 최근들은 음악 조회 API
 * [GET] /users/{userId}/streaming-history
 */
exports.getStreamingHistory = async function(req,res){
    /**
     * Path Variable: userId
     */
    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userMusicHistoryByUserId = await userProvider.getMusicHistory(userId);
    return res.send(response(baseResponse.SUCCESS,userMusicHistoryByUserId));
}

/**
 * API No. 10
 * API Name : 특정 유저 이름,나이(정보) 수정 API
 * [POST] /users/{userId}/update
 */
exports.updateUserInfo = async function(req,res){
    /**
     * Path Variable: userId
     * Body: name ,age
     */

    let name = req.body.name;
    let age = req.body.age;
    // body에서 값을 1개만 가져올땐 req.body.이름 -> 이렇게 명시해야함
    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if(!name) return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY));

    if(!age){ // 나이를 입력하지 않은 경우 기본 값 가져오기
        const defaultAge = await userProvider.selectUserAge(userId);
        age = defaultAge;
    }

    const infoResponse = await userService.updateUser(name,age,userId);
    console.log(infoResponse[0])
    return res.send(response(baseResponse.SUCCESS));

};
/**
 * API No. 11
 * API Name : 특정 유저 ID수정 API
 * [POST] /users/{userId}/id
 */
exports.updateUserID = async function(req,res){
    /**
     * Path Variable: userId
     * Body: ID
     */
    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    const id = req.body.ID
    if(!id) return res.send(errResponse(baseResponse.CONTENT_EMPTY));

    const IdResponse = await userService.updateID(id,userId);
    return res.send(IdResponse);
}
/**
 * API No. 12
 * API Name : 특정 유저 팬 리스트 API
 * [POST] /users/{userId}/fan
 */
exports.getFanList = async function(req,res){
    /**
     * Path Variable: userId
     */

    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const fanList = await userProvider.getFanList(userId);
    return res.send(response(fanList));

}


//---------------------------------------------------------------------------------//

// TODO: After 로그인 인증 방법 (JWT)
// 나중으로 미루니 우선 API순서에서 배제
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
exports.login = async function (req, res) {

    const {email, PW} = req.body;

    // TODO: email, password 형식적 Validation

    const signInResponse = await userService.postSignIn(email,PW);

    return res.send(response(baseResponse.SUCCESS,signInResponse));
};


/**
 * API No. 5
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/:userId
 * path variable : userId
 * body : nickname
 */
exports.patchUsers = async function (req, res) {

    // jwt - userId, path variable :userId

    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;
    const nickname = req.body.nickname;

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!nickname) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));

        const editUserInfo = await userService.editUser(userId, nickname)
        return res.send(editUserInfo);
    }
};











/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};
